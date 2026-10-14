import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Partner from '#models/partner'
import PartnerClick from '#models/partner_click'
import PartnerEvent from '#models/partner_event'
import PartnerProgram from '#models/partner_program'
import PartnerLink from '#models/partner_link'
import { BASE, api, eventually, makePartner } from '#tests/helpers/partner_api'

const UA = { 'user-agent': 'Mozilla/5.0 Firefox/120.0' }

/** Creates an affiliate and an active link, and returns their public ids. */
async function setupLink(secret: string, externalUserId = `aff_${Math.random()}`, productRef = `p_${Math.random()}`) {
  const affiliate = (await api('POST', '/v1/affiliates', secret, { external_user_id: externalUserId })).body
  const link = (await api('POST', '/v1/links', secret, { affiliate: affiliate.id, product_ref: productRef, destination_url: 'https://shop.example.com/p' })).body
  const dbId = (await PartnerLink.findByOrFail('public_id', link.id)).id
  return { affiliate, link, dbId }
}

/** Visits the link like a friend and returns the click id from the redirect, once the click row exists. */
async function visit(code: string, headers: Record<string, string> = UA) {
  const res = await fetch(`${BASE}/r/${code}`, { redirect: 'manual', headers })
  const clickId = new URL(res.headers.get('location')!).searchParams.get('pv_click_id')!
  await eventually(() => PartnerClick.query().where('public_id', clickId).first())
  return clickId
}

test.group('partner api events', (group) => {
  const created: Partner[] = []
  group.each.teardown(async () => {
    for (const partner of created.splice(0)) await partner.delete()
  })

  test('an event with a click is attributed to the click affiliate and link', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { affiliate, link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code)
    const res = await api('POST', '/v1/events', testKey.secret, { event_id: 'reg_1', type: 'registration', click_id: clickId, referred_external_user_id: 'friend_1' })
    assert.equal(res.status, 201)
    assert.equal(res.body.status, 'attributed')
    assert.isNull(res.body.reason)
    assert.equal(res.body.affiliate, affiliate.id)
    assert.equal(res.body.link, link.id)
    assert.equal(res.body.click, clickId)
    assert.equal(res.body.event_id, 'reg_1')
  })

  test('the same event_id returns the original event with 200', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code)
    const first = await api('POST', '/v1/events', testKey.secret, { event_id: 'dup_1', type: 'registration', click_id: clickId })
    const again = await api('POST', '/v1/events', testKey.secret, { event_id: 'dup_1', type: 'registration', click_id: clickId })
    assert.equal(first.status, 201)
    assert.equal(again.status, 200)
    assert.equal(again.body.id, first.body.id)
    assert.lengthOf(await PartnerEvent.query().where('external_event_id', 'dup_1'), 1)
  })

  test('a type outside allowed_event_types is 400 and stores nothing', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const res = await api('POST', '/v1/events', testKey.secret, { event_id: 'bad_type', type: 'purchase' })
    assert.equal(res.status, 400)
    assert.equal(res.body.error.code, 'event_type_not_allowed')
    assert.lengthOf(await PartnerEvent.query().where('external_event_id', 'bad_type'), 0)
  })

  test('no hint, or an unknown click, is unattributed with reason no_click', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const none = await api('POST', '/v1/events', testKey.secret, { event_id: 'nc_1', type: 'registration' })
    assert.equal(none.status, 201)
    assert.equal(none.body.status, 'unattributed')
    assert.equal(none.body.reason, 'no_click')

    const unknown = await api('POST', '/v1/events', testKey.secret, { event_id: 'nc_2', type: 'registration', click_id: 'clk_doesnotexist000000' })
    assert.equal(unknown.body.reason, 'no_click')
  })

  test('the attribution window includes exactly N days and excludes N days plus one second', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link } = await setupLink(testKey.secret)
    const now = DateTime.now()

    const inClick = await visit(link.code, { ...UA, 'user-agent': 'Mozilla/5.0 Edg/120.0 window-in' })
    await PartnerClick.query().where('public_id', inClick).update({ clicked_at: now.minus({ days: 30 }).toSQL() })
    const inside = await api('POST', '/v1/events', testKey.secret, { event_id: 'win_in', type: 'registration', click_id: inClick, occurred_at: Math.floor(now.toSeconds()) })
    assert.equal(inside.body.status, 'attributed')

    const outClick = await visit(link.code, { ...UA, 'user-agent': 'Mozilla/5.0 Chrome/120.0 window-out' })
    await PartnerClick.query().where('public_id', outClick).update({ clicked_at: now.minus({ days: 30, seconds: 1 }).toSQL() })
    const outside = await api('POST', '/v1/events', testKey.secret, { event_id: 'win_out', type: 'registration', click_id: outClick, occurred_at: Math.floor(now.toSeconds()) })
    assert.equal(outside.body.status, 'unattributed')
    assert.equal(outside.body.reason, 'outside_window')
  })

  test('a self-referral is rejected', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link } = await setupLink(testKey.secret, 'same_person')
    const clickId = await visit(link.code)
    const res = await api('POST', '/v1/events', testKey.secret, { event_id: 'self_1', type: 'registration', click_id: clickId, referred_external_user_id: 'same_person' })
    assert.equal(res.body.status, 'rejected')
    assert.equal(res.body.reason, 'self_referral')
  })

  test('a suspended affiliate is rejected with affiliate_suspended', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { affiliate, link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code)
    await api('PATCH', `/v1/affiliates/${affiliate.id}`, testKey.secret, { status: 'suspended' })
    const res = await api('POST', '/v1/events', testKey.secret, { event_id: 'sus_1', type: 'registration', click_id: clickId })
    assert.equal(res.body.status, 'rejected')
    assert.equal(res.body.reason, 'affiliate_suspended')
  })

  test('a disabled link rejects its events with link_disabled', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code)
    await api('POST', `/v1/links/${link.id}/disable`, testKey.secret)
    const res = await api('POST', '/v1/events', testKey.secret, { event_id: 'dis_1', type: 'registration', click_id: clickId })
    assert.equal(res.body.reason, 'link_disabled')
  })

  test('first_click credits the affiliate of the referred customer first click', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).update({ attribution_model: 'first_click' })
    const a = await setupLink(testKey.secret, 'aff_first')
    const b = await setupLink(testKey.secret, 'aff_second')
    const clickA = await visit(a.link.code, { 'user-agent': 'Mozilla/5.0 Firefox/121.0 first-a' })
    const clickB = await visit(b.link.code, { 'user-agent': 'Mozilla/5.0 Firefox/121.0 first-b' })

    await api('POST', '/v1/events', testKey.secret, { event_id: 'fc_1', type: 'registration', click_id: clickA, referred_external_user_id: 'customer_9' })
    const later = await api('POST', '/v1/events', testKey.secret, { event_id: 'fc_2', type: 'registration', click_id: clickB, referred_external_user_id: 'customer_9' })
    assert.equal(later.body.affiliate, a.affiliate.id)
  })

  test('percent commission programs need amount and currency', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).update({ commission_mode: 'percent', commission_percent_bps: 1000 })
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code)
    const res = await api('POST', '/v1/events', testKey.secret, { event_id: 'pct_1', type: 'registration', click_id: clickId })
    assert.equal(res.status, 400)
    assert.equal(res.body.error.code, 'parameter_missing')
  })

  test('the 6th conversion from one visitor in a day is rejected as fraud_suspected', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link } = await setupLink(testKey.secret)
    const reasons: string[] = []
    for (let i = 0; i < 6; i++) {
      const clickId = await visit(link.code, { 'user-agent': 'Mozilla/5.0 Chrome/122.0 same-visitor' })
      const res = await api('POST', '/v1/events', testKey.secret, { event_id: `visitor_${i}`, type: 'registration', click_id: clickId })
      reasons.push(res.body.reason ?? res.body.status)
    }
    assert.deepEqual(reasons.slice(0, 5), ['attributed', 'attributed', 'attributed', 'attributed', 'attributed'])
    assert.equal(reasons[5], 'fraud_suspected')
  })

  test("another partner's click cannot be used", async ({ assert }) => {
    const a = await makePartner()
    const b = await makePartner()
    created.push(a.partner, b.partner)
    const { link } = await setupLink(a.testKey.secret)
    const clickId = await visit(link.code)
    const res = await api('POST', '/v1/events', b.testKey.secret, { event_id: 'cross_1', type: 'registration', click_id: clickId })
    assert.equal(res.body.status, 'unattributed')
    assert.equal(res.body.reason, 'no_click')

    const mine = await api('POST', '/v1/events', a.testKey.secret, { event_id: 'cross_2', type: 'registration', click_id: clickId })
    const read = await api('GET', `/v1/events/${mine.body.id}`, b.testKey.secret)
    assert.equal(read.status, 404)
  })

  test('reverse changes an attributed event to reversed, once; other states are 422', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code)
    const ev = await api('POST', '/v1/events', testKey.secret, { event_id: 'rev_1', type: 'registration', click_id: clickId })
    const reversed = await api('POST', `/v1/events/${ev.body.id}/reverse`, testKey.secret, { reason: 'refund' })
    assert.equal(reversed.status, 200)
    assert.equal(reversed.body.status, 'reversed')
    assert.equal(reversed.body.reason, 'reversed_by_partner')
    const again = await api('POST', `/v1/events/${ev.body.id}/reverse`, testKey.secret)
    assert.equal(again.status, 200)

    const unattributed = await api('POST', '/v1/events', testKey.secret, { event_id: 'rev_2', type: 'registration' })
    const bad = await api('POST', `/v1/events/${unattributed.body.id}/reverse`, testKey.secret)
    assert.equal(bad.status, 422)
    assert.equal(bad.body.error.code, 'invalid_state_transition')
  })

  test('two click-style hints in one request are 400', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const { affiliate, link } = await setupLink(testKey.secret)
    const res = await api('POST', '/v1/events', testKey.secret, { event_id: 'two_hints', type: 'registration', link_id: link.id, affiliate_id: affiliate.id })
    assert.equal(res.status, 400)
    assert.equal(res.body.error.code, 'parameter_invalid')
  })
})
