import { test } from '@japa/runner'
import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import Partner from '#models/partner'
import PartnerClick from '#models/partner_click'
import PartnerDashboardSession from '#models/partner_dashboard_session'
import { BASE, api, eventually, makePartner } from '#tests/helpers/partner_api'

const tokenOf = (url: string) => url.split('/a/session/')[1]

/** Creates an affiliate with one link. */
async function affiliateWithLink(secret: string, name: string) {
  const affiliate = (await api('POST', '/v1/affiliates', secret, { external_user_id: name, display_name: name })).body
  const link = (await api('POST', '/v1/links', secret, { affiliate: affiliate.id, product_ref: `p_${name}`, destination_url: 'https://shop.example.com/x' })).body
  return { affiliate, link }
}

/** Visits a link once so there is one click. */
async function visit(code: string, ua: string) {
  const res = await fetch(`${BASE}/r/${code}`, { redirect: 'manual', headers: { 'user-agent': ua } })
  const clickId = new URL(res.headers.get('location')!).searchParams.get('pv_click_id')!
  await eventually(() => PartnerClick.query().where('public_id', clickId).first())
}

/** Redeems a session link and returns the cookie header to use on /a. */
async function redeem(url: string) {
  const res = await fetch(`${BASE}/a/session/${tokenOf(url)}`, { redirect: 'manual' })
  const setCookie = res.headers.getSetCookie().find((c) => c.startsWith('pv_aff_dashboard=')) ?? ''
  return { status: res.status, location: res.headers.get('location'), setCookie, cookie: setCookie.split(';')[0] }
}

async function dashboard(cookie?: string) {
  const res = await fetch(`${BASE}/a`, { redirect: 'manual', headers: cookie ? { cookie } : {} })
  const html = await res.text()
  const match = /data-page="([^"]*)"/.exec(html)
  const decoded = match
    ? match[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    : null
  return { status: res.status, json: decoded ? JSON.parse(decoded) : null }
}

test.group('partner affiliate dashboard', (group) => {
  const created: Partner[] = []
  group.each.teardown(async () => {
    for (const partner of created.splice(0)) await partner.delete()
  })

  test('a session link is single-use, sets a /a cookie, and shows the affiliate page', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { affiliate } = await affiliateWithLink(testKey.secret, 'dash_one')
    const session = await api('POST', `/v1/affiliates/${affiliate.id}/dashboard_sessions`, testKey.secret, {})
    assert.equal(session.status, 201)
    assert.match(session.body.id, /^dss_[0-9A-Za-z]{20}$/)
    assert.match(session.body.url, /\/a\/session\/[0-9A-Za-z]{43}$/)
    assert.isAbove(session.body.expires_at, Math.floor(DateTime.now().toSeconds()))

    const first = await redeem(session.body.url)
    assert.equal(first.status, 302)
    assert.equal(first.location, '/a')
    assert.include(first.setCookie.toLowerCase(), 'path=/a')
    assert.include(first.setCookie.toLowerCase(), 'httponly')

    const page = await dashboard(first.cookie)
    assert.equal(page.status, 200)
    assert.equal(page.json.component, 'partner/AffiliateDashboard')
    assert.equal(page.json.props.partnerName, partner.name)
    assert.equal(page.json.props.affiliateName, 'dash_one')

    const again = await redeem(session.body.url)
    assert.equal(again.status, 410)
  })

  test('an expired session link cannot be redeemed', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { affiliate } = await affiliateWithLink(testKey.secret, 'dash_expired')
    const session = await api('POST', `/v1/affiliates/${affiliate.id}/dashboard_sessions`, testKey.secret, {})
    const hash = crypto.createHash('sha256').update(tokenOf(session.body.url)).digest('hex')
    const row = await PartnerDashboardSession.findByOrFail('token_hash', hash)
    row.expiresAt = DateTime.now().minus({ minutes: 1 })
    await row.save()
    const res = await redeem(session.body.url)
    assert.equal(res.status, 410)
  })

  test('the dashboard refuses requests without the cookie', async ({ assert }) => {
    const res = await dashboard()
    assert.equal(res.status, 410)
  })

  test('return_url must be on an allowed domain, and the page offers Back to it', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { affiliate } = await affiliateWithLink(testKey.secret, 'dash_return')
    const refused = await api('POST', `/v1/affiliates/${affiliate.id}/dashboard_sessions`, testKey.secret, { return_url: 'https://evil.test/back' })
    assert.equal(refused.status, 400)
    assert.equal(refused.body.error.param, 'return_url')

    const ok = await api('POST', `/v1/affiliates/${affiliate.id}/dashboard_sessions`, testKey.secret, { return_url: 'https://example.com/account' })
    assert.equal(ok.status, 201)
    const cookie = (await redeem(ok.body.url)).cookie
    const page = await dashboard(cookie)
    assert.equal(page.json.props.returnUrl, 'https://example.com/account')
  })

  test('an affiliate sees only their own numbers', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const a = await affiliateWithLink(testKey.secret, 'dash_a')
    const b = await affiliateWithLink(testKey.secret, 'dash_b')
    await visit(b.link.code, 'Mozilla/5.0 Firefox/131.0 dash-b-visit')

    const sessionA = await api('POST', `/v1/affiliates/${a.affiliate.id}/dashboard_sessions`, testKey.secret, {})
    const pageA = await dashboard((await redeem(sessionA.body.url)).cookie)
    assert.equal(pageA.json.props.totals.clicks, 0)
    assert.lengthOf(pageA.json.props.links, 1)
    assert.equal(pageA.json.props.links[0].id, a.link.id)

    const sessionB = await api('POST', `/v1/affiliates/${b.affiliate.id}/dashboard_sessions`, testKey.secret, {})
    const pageB = await dashboard((await redeem(sessionB.body.url)).cookie)
    assert.equal(pageB.json.props.totals.clicks, 1)
  })

  test("another partner's affiliate cannot get a session, and a suspended partner's dashboard closes", async ({ assert }) => {
    const a = await makePartner()
    const b = await makePartner()
    created.push(a.partner, b.partner)
    const { affiliate } = await affiliateWithLink(a.testKey.secret, 'dash_cross')
    const cross = await api('POST', `/v1/affiliates/${affiliate.id}/dashboard_sessions`, b.testKey.secret, {})
    assert.equal(cross.status, 404)

    const session = await api('POST', `/v1/affiliates/${affiliate.id}/dashboard_sessions`, a.testKey.secret, {})
    const cookie = (await redeem(session.body.url)).cookie
    a.partner.status = 'suspended'
    await a.partner.save()
    const closed = await dashboard(cookie)
    assert.equal(closed.status, 404)
  })
})
