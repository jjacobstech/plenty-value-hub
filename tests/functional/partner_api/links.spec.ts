import { test } from '@japa/runner'
import Partner from '#models/partner'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerLink from '#models/partner_link'
import { api, makePartner } from '#tests/helpers/partner_api'

test.group('partner api links', (group) => {
  const created: Partner[] = []
  group.each.teardown(async () => {
    for (const partner of created.splice(0)) await partner.delete()
  })

  async function affiliateFor(secret: string, externalUserId = 'aff_user') {
    const res = await api('POST', '/v1/affiliates', secret, { external_user_id: externalUserId })
    return res.body.id as string
  }

  test('create returns 201 with a short code and url, then the same link returns 200', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const affiliate = await affiliateFor(testKey.secret)
    const body = { affiliate, product_ref: 'prod_42', destination_url: 'https://shop.example.com/p/42' }

    const first = await api('POST', '/v1/links', testKey.secret, body)
    assert.equal(first.status, 201)
    assert.match(first.body.id, /^lnk_/)
    assert.lengthOf(first.body.code, 8)
    assert.equal(first.body.url, `http://localhost:3000/r/${first.body.code}`)
    assert.equal(first.body.affiliate, affiliate)

    const again = await api('POST', '/v1/links', testKey.secret, body)
    assert.equal(again.status, 200)
    assert.equal(again.body.id, first.body.id)
  })

  test('destination host must match allowed_redirect_domains, including subdomains', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const affiliate = await affiliateFor(testKey.secret)

    const sub = await api('POST', '/v1/links', testKey.secret, { affiliate, destination_url: 'https://www.example.com/x' })
    assert.equal(sub.status, 201)

    const bad = await api('POST', '/v1/links', testKey.secret, { affiliate, product_ref: 'p2', destination_url: 'https://evil.test/x' })
    assert.equal(bad.status, 400)
    assert.equal(bad.body.error.code, 'parameter_invalid')
    assert.equal(bad.body.error.param, 'destination_url')
  })

  test('live mode requires https destinations', async ({ assert }) => {
    const { partner, liveKey } = await makePartner()
    created.push(partner)
    const affiliate = await affiliateFor(liveKey.secret)
    const res = await api('POST', '/v1/links', liveKey.secret, { affiliate, destination_url: 'http://example.com/x' })
    assert.equal(res.status, 400)
    assert.equal(res.body.error.param, 'destination_url')
  })

  test('update_destination changes the destination only when asked', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const affiliate = await affiliateFor(testKey.secret)
    const first = await api('POST', '/v1/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })

    const kept = await api('POST', '/v1/links', testKey.secret, { affiliate, destination_url: 'https://example.com/b' })
    assert.equal(kept.body.destination_url, 'https://example.com/a')

    const changed = await api('POST', '/v1/links', testKey.secret, { affiliate, destination_url: 'https://example.com/b', update_destination: true })
    assert.equal(changed.status, 200)
    assert.equal(changed.body.id, first.body.id)
    assert.equal(changed.body.destination_url, 'https://example.com/b')
  })

  test('disabled links return 422 link_disabled on create, and disable is idempotent', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const affiliate = await affiliateFor(testKey.secret)
    const link = await api('POST', '/v1/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })

    const disabled = await api('POST', `/v1/links/${link.body.id}/disable`, testKey.secret)
    assert.equal(disabled.body.status, 'disabled')
    const again = await api('POST', `/v1/links/${link.body.id}/disable`, testKey.secret)
    assert.equal(again.body.status, 'disabled')

    const blocked = await api('POST', '/v1/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })
    assert.equal(blocked.status, 422)
    assert.equal(blocked.body.error.code, 'link_disabled')
  })

  test('a suspended affiliate cannot get new links (422 affiliate_not_active)', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const affiliate = await affiliateFor(testKey.secret)
    await api('PATCH', `/v1/affiliates/${affiliate}`, testKey.secret, { status: 'suspended' })
    const res = await api('POST', '/v1/links', testKey.secret, { affiliate, destination_url: 'https://example.com/a' })
    assert.equal(res.status, 422)
    assert.equal(res.body.error.code, 'affiliate_not_active')
  })

  test("another partner's affiliate or link is a 400 or 404, never usable", async ({ assert }) => {
    const a = await makePartner()
    const b = await makePartner()
    created.push(a.partner, b.partner)
    const theirs = await affiliateFor(a.testKey.secret, 'theirs')

    const borrowed = await api('POST', '/v1/links', b.testKey.secret, { affiliate: theirs, destination_url: 'https://example.com/a' })
    assert.equal(borrowed.status, 400)
    assert.equal(borrowed.body.error.param, 'affiliate')

    const link = await api('POST', '/v1/links', a.testKey.secret, { affiliate: theirs, destination_url: 'https://example.com/a' })
    const read = await api('GET', `/v1/links/${link.body.id}`, b.testKey.secret)
    assert.equal(read.status, 404)
    const disable = await api('POST', `/v1/links/${link.body.id}/disable`, b.testKey.secret)
    assert.equal(disable.status, 404)
    assert.isNull(await PartnerLink.query().where('public_id', link.body.id).whereNull('partner_id').first())
  })

  test('list filters by affiliate and product', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const affiliate = await affiliateFor(testKey.secret)
    await api('POST', '/v1/links', testKey.secret, { affiliate, product_ref: 'p1', destination_url: 'https://example.com/1' })
    await api('POST', '/v1/links', testKey.secret, { affiliate, product_ref: 'p2', destination_url: 'https://example.com/2' })
    const byProduct = await api('GET', '/v1/links?product_ref=p2', testKey.secret)
    assert.lengthOf(byProduct.body.data, 1)
    const byAffiliate = await api('GET', `/v1/links?affiliate=${affiliate}`, testKey.secret)
    assert.lengthOf(byAffiliate.body.data, 2)
    const count = await PartnerAffiliate.query().where('partner_id', partner.id).count('* as total')
    assert.equal(Number(count[0].$extras.total), 1)
  })
})
