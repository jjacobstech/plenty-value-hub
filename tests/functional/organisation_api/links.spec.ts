import { test } from '@japa/runner'
import Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationLink from '#models/organisation_link'
import { api, makeOrganisation } from '#tests/helpers/organisation_api'

test.group('organisation api links', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
  })

  async function affiliateFor(secret: string, externalUserId = 'aff_user') {
    const res = await api('POST', '/api/v1/organisations/affiliates', secret, { external_user_id: externalUserId })
    return res.body.id as string
  }

  test('create returns 201 with a short code and url, then the same link returns 200', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const affiliate = await affiliateFor(testKey.secret)
    const body = { affiliate, product_ref: 'prod_42', destination_url: 'https://shop.example.com/p/42' }

    const first = await api('POST', '/api/v1/organisations/links', testKey.secret, body)
    assert.equal(first.status, 201)
    assert.match(first.body.id, /^lnk_/)
    assert.lengthOf(first.body.code, 8)
    assert.equal(first.body.url, `http://localhost:3000/r/${first.body.code}`)
    assert.equal(first.body.affiliate, affiliate)

    const again = await api('POST', '/api/v1/organisations/links', testKey.secret, body)
    assert.equal(again.status, 200)
    assert.equal(again.body.id, first.body.id)
  })

  test('destination host must match allowed_redirect_domains, including subdomains', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const affiliate = await affiliateFor(testKey.secret)

    const sub = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, destination_url: 'https://www.example.com/x' })
    assert.equal(sub.status, 201)

    const bad = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, product_ref: 'p2', destination_url: 'https://evil.test/x' })
    assert.equal(bad.status, 400)
    assert.equal(bad.body.error.code, 'parameter_invalid')
    assert.equal(bad.body.error.param, 'destination_url')
  })

  test('live mode requires https destinations', async ({ assert }) => {
    const { organisation, liveKey } = await makeOrganisation()
    created.push(organisation)
    const affiliate = await affiliateFor(liveKey.secret)
    const res = await api('POST', '/api/v1/organisations/links', liveKey.secret, { affiliate, destination_url: 'http://example.com/x' })
    assert.equal(res.status, 400)
    assert.equal(res.body.error.param, 'destination_url')
  })

  test('update_destination changes the destination only when asked', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const affiliate = await affiliateFor(testKey.secret)
    const first = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })

    const kept = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, destination_url: 'https://example.com/b' })
    assert.equal(kept.body.destination_url, 'https://example.com/a')

    const changed = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, destination_url: 'https://example.com/b', update_destination: true })
    assert.equal(changed.status, 200)
    assert.equal(changed.body.id, first.body.id)
    assert.equal(changed.body.destination_url, 'https://example.com/b')
  })

  test('disabled links return 422 link_disabled on create, and disable is idempotent', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const affiliate = await affiliateFor(testKey.secret)
    const link = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })

    const disabled = await api('POST', `/api/v1/organisations/links/${link.body.id}/disable`, testKey.secret)
    assert.equal(disabled.body.status, 'disabled')
    const again = await api('POST', `/api/v1/organisations/links/${link.body.id}/disable`, testKey.secret)
    assert.equal(again.body.status, 'disabled')

    const blocked = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })
    assert.equal(blocked.status, 422)
    assert.equal(blocked.body.error.code, 'link_disabled')
  })

  test('a suspended affiliate cannot get new links (422 affiliate_not_active)', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const affiliate = await affiliateFor(testKey.secret)
    await api('PATCH', `/api/v1/organisations/affiliates/${affiliate}`, testKey.secret, { status: 'suspended' })
    const res = await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })
    assert.equal(res.status, 422)
    assert.equal(res.body.error.code, 'affiliate_not_active')
  })

  test("another organisation's affiliate or link is a 400 or 404, never usable", async ({ assert }) => {
    const a = await makeOrganisation()
    const b = await makeOrganisation()
    created.push(a.organisation, b.organisation)
    const theirs = await affiliateFor(a.testKey.secret, 'theirs')

    const borrowed = await api('POST', '/api/v1/organisations/links', b.testKey.secret, { affiliate: theirs, destination_url: 'https://example.com/a' })
    assert.equal(borrowed.status, 400)
    assert.equal(borrowed.body.error.param, 'affiliate')

    const link = await api('POST', '/api/v1/organisations/links', a.testKey.secret, { affiliate: theirs, destination_url: 'https://example.com/a' })
    const read = await api('GET', `/api/v1/organisations/links/${link.body.id}`, b.testKey.secret)
    assert.equal(read.status, 404)
    const disable = await api('POST', `/api/v1/organisations/links/${link.body.id}/disable`, b.testKey.secret)
    assert.equal(disable.status, 404)
    assert.isNull(await OrganisationLink.query().where('public_id', link.body.id).whereNull('organisation_id').first())
  })

  test('list filters by affiliate and product', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const affiliate = await affiliateFor(testKey.secret)
    await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, product_ref: 'p1', destination_url: 'https://example.com/1' })
    await api('POST', '/api/v1/organisations/links', testKey.secret, { affiliate, product_ref: 'p2', destination_url: 'https://example.com/2' })
    const byProduct = await api('GET', '/api/v1/organisations/links?product_ref=p2', testKey.secret)
    assert.lengthOf(byProduct.body.data, 1)
    const byAffiliate = await api('GET', `/api/v1/organisations/links?affiliate=${affiliate}`, testKey.secret)
    assert.lengthOf(byAffiliate.body.data, 2)
    const count = await OrganisationAffiliate.query().where('organisation_id', organisation.id).count('* as total')
    assert.equal(Number(count[0].$extras.total), 1)
  })
})
