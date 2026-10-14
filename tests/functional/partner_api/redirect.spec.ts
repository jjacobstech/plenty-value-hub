import { test } from '@japa/runner'
import Partner from '#models/partner'
import PartnerClick from '#models/partner_click'
import PartnerLink from '#models/partner_link'
import { BASE, api, eventually, makePartner } from '#tests/helpers/partner_api'

async function createLink(secret: string, destination = 'https://shop.example.com/p/1') {
  const affiliate = (await api('POST', '/v1/affiliates', secret, { external_user_id: `u_${Math.random()}` })).body.id
  const link = await api('POST', '/v1/links', secret, { affiliate, product_ref: `p_${Math.random()}`, destination_url: destination })
  const dbId = (await PartnerLink.findByOrFail('public_id', link.body.id)).id
  return { affiliate, link: link.body, dbId }
}

// Redirects must not follow the destination; we only check the Location header.
async function get(path: string, headers: Record<string, string> = {}) {
  return fetch(`${BASE}${path}`, { redirect: 'manual', headers })
}

test.group('partner redirect', (group) => {
  const created: Partner[] = []
  group.each.teardown(async () => {
    for (const partner of created.splice(0)) await partner.delete()
  })

  test('302 to the destination with the click id, keeping the query string and UTM values', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
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
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link, dbId } = await createLink(testKey.secret)
    await get(`/r/${link.code}`, { 'user-agent': 'Mozilla/5.0 Chrome/120.0' })
    const click = await eventually(() => PartnerClick.query().where('link_id', dbId).first())
    assert.isNotNull(click)
    assert.isTrue(click!.isUnique)
    assert.match(click!.visitorHash, /^[0-9a-f]{64}$/)
    assert.notInclude(click!.visitorHash, '127.0.0.1')
    assert.equal(click!.userAgentFamily, 'Chrome')
  })

  test('repeat clicks from one visitor count as raw but not unique', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link, dbId } = await createLink(testKey.secret)
    const ua = { 'user-agent': 'Mozilla/5.0 Safari/17.0' }
    await get(`/r/${link.code}`, ua)
    await get(`/r/${link.code}`, ua)
    const clicks = await eventually(async () => {
      const rows = await PartnerClick.query().where('link_id', dbId).orderBy('id', 'asc')
      return rows.length === 2 ? rows : null
    })
    assert.isNotNull(clicks)
    assert.deepEqual(clicks!.map((c) => c.isUnique), [true, false])
  })

  test('bots are redirected but not counted', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link, dbId } = await createLink(testKey.secret)
    const res = await get(`/r/${link.code}`, { 'user-agent': 'facebookexternalhit/1.1' })
    assert.equal(res.status, 302)
    await new Promise((resolve) => setTimeout(resolve, 300))
    assert.lengthOf(await PartnerClick.query().where('link_id', dbId), 0)
  })

  test('unknown codes and disabled links return a plain 404 page', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link, dbId } = await createLink(testKey.secret)
    const unknown = await get('/r/doesnotexist')
    assert.equal(unknown.status, 404)
    assert.include(await unknown.text(), 'not available')

    await api('POST', `/v1/links/${link.id}/disable`, testKey.secret)
    const disabled = await get(`/r/${link.code}`)
    assert.equal(disabled.status, 404)
  })

  test('a suspended affiliate still redirects', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { affiliate, link } = await createLink(testKey.secret)
    await api('PATCH', `/v1/affiliates/${affiliate}`, testKey.secret, { status: 'suspended' })
    const res = await get(`/r/${link.code}`)
    assert.equal(res.status, 302)
  })

  test('a suspended partner no longer redirects', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link, dbId } = await createLink(testKey.secret)
    partner.status = 'suspended'
    await partner.save()
    const res = await get(`/r/${link.code}`)
    assert.equal(res.status, 404)
  })
})
