import { test } from '@japa/runner'
import Organisation from '#models/organisation'
import OrganisationClick from '#models/organisation_click'
import OrganisationLink from '#models/organisation_link'
import { BASE, api, eventually, makeOrganisation } from '#tests/helpers/organisation_api'

async function createLink(secret: string, destination = 'https://shop.example.com/p/1') {
  const affiliate = (await api('POST', '/api/v1/organisations/affiliates', secret, { external_user_id: `u_${Math.random()}` })).body.id
  const link = await api('POST', '/api/v1/organisations/links', secret, { affiliate, product_ref: `p_${Math.random()}`, destination_url: destination })
  const dbId = (await OrganisationLink.findByOrFail('public_id', link.body.id)).id
  return { affiliate, link: link.body, dbId }
}

// Redirects must not follow the destination; we only check the Location header.
async function get(path: string, headers: Record<string, string> = {}) {
  return fetch(`${BASE}${path}`, { redirect: 'manual', headers })
}

test.group('organisation redirect', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
  })

  test('302 to the destination with the click id, keeping the query string and UTM values', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { link } = await createLink(testKey.secret, 'https://shop.example.com/p/1?existing=yes')
    const res = await get(`/r/${link.code}?utm_source=newsletter&ref_note=abc`, { 'user-agent': 'Mozilla/5.0 Firefox/120.0' })
    assert.equal(res.status, 302)
    const location = new URL(res.headers.get('location')!)
    assert.equal(location.origin + location.pathname, 'https://shop.example.com/p/1')
    assert.equal(location.searchParams.get('existing'), 'yes')
    assert.equal(location.searchParams.get('utm_source'), 'newsletter')
    assert.match(location.searchParams.get('pv_click_id')!, /^clk_/)
  })

  test('a click is recorded with a hashed visitor, not the raw IP', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { link, dbId } = await createLink(testKey.secret)
    await get(`/r/${link.code}`, { 'user-agent': 'Mozilla/5.0 Chrome/120.0' })
    const click = await eventually(() => OrganisationClick.query().where('link_id', dbId).first())
    assert.isNotNull(click)
    assert.isTrue(click!.isUnique)
    assert.match(click!.visitorHash, /^[0-9a-f]{64}$/)
    assert.notInclude(click!.visitorHash, '127.0.0.1')
    assert.equal(click!.userAgentFamily, 'Chrome')
  })

  test('repeat clicks from one visitor count as raw but not unique', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { link, dbId } = await createLink(testKey.secret)
    const ua = { 'user-agent': 'Mozilla/5.0 Safari/17.0' }
    await get(`/r/${link.code}`, ua)
    await get(`/r/${link.code}`, ua)
    const clicks = await eventually(async () => {
      const rows = await OrganisationClick.query().where('link_id', dbId).orderBy('id', 'asc')
      return rows.length === 2 ? rows : null
    })
    assert.isNotNull(clicks)
    // Both requests may run at once, so either one can be the unique click. Exactly one must be.
    assert.deepEqual(clicks!.map((c) => c.isUnique).sort(), [false, true])
  })

  test('bots are redirected but not counted', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { link, dbId } = await createLink(testKey.secret)
    const res = await get(`/r/${link.code}`, { 'user-agent': 'facebookexternalhit/1.1' })
    assert.equal(res.status, 302)
    await new Promise((resolve) => setTimeout(resolve, 300))
    assert.lengthOf(await OrganisationClick.query().where('link_id', dbId), 0)
  })

  test('unknown codes and disabled links return a plain 404 page', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { link } = await createLink(testKey.secret)
    const unknown = await get('/r/doesnotexist')
    assert.equal(unknown.status, 404)
    assert.include(await unknown.text(), 'not available')

    await api('POST', `/api/v1/organisations/links/${link.id}/disable`, testKey.secret)
    const disabled = await get(`/r/${link.code}`)
    assert.equal(disabled.status, 404)
  })

  test('a suspended affiliate still redirects', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { affiliate, link } = await createLink(testKey.secret)
    await api('PATCH', `/api/v1/organisations/affiliates/${affiliate}`, testKey.secret, { status: 'suspended' })
    const res = await get(`/r/${link.code}`)
    assert.equal(res.status, 302)
  })

  test('a suspended organisation no longer redirects', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { link } = await createLink(testKey.secret)
    organisation.status = 'suspended'
    await organisation.save()
    const res = await get(`/r/${link.code}`)
    assert.equal(res.status, 404)
  })
})
