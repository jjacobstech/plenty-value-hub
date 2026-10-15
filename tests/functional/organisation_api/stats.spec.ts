import { test } from '@japa/runner'
import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationClick from '#models/organisation_click'
import OrganisationCommission from '#models/organisation_commission'
import OrganisationEvent from '#models/organisation_event'
import OrganisationLink from '#models/organisation_link'
import { publicId } from '#services/organisation/public_id'
import { api, makeOrganisation } from '#tests/helpers/organisation_api'

// Window: 2026-10-01 00:00 UTC (inclusive) to 2026-10-03 00:00 UTC (exclusive).
const FROM = DateTime.fromISO('2026-10-01T00:00:00Z')
const TO = DateTime.fromISO('2026-10-03T00:00:00Z')
const at = (iso: string) => DateTime.fromISO(iso, { zone: 'utc' })
const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

/**
 * Seeds a fixed dataset (hand-computed numbers are in the assertions below).
 * Affiliates A and B. Links LA (product p1, campaign c1, A) and LB (product p2, campaign c1, B).
 */
async function seed(organisationId: number) {
  const a = await OrganisationAffiliate.create({ publicId: publicId('aff_'), organisationId, livemode: false, externalUserId: 'stats_a', status: 'active', metadata: {} })
  const b = await OrganisationAffiliate.create({ publicId: publicId('aff_'), organisationId, livemode: false, externalUserId: 'stats_b', status: 'active', metadata: {} })
  const la = await OrganisationLink.create({ publicId: publicId('lnk_'), organisationId, livemode: false, affiliateId: a.id, code: `sa${crypto.randomUUID().slice(0, 6)}`, productRef: 'p1', campaignRef: 'c1', destinationUrl: 'https://shop.example.com/a', status: 'active', metadata: {} })
  const lb = await OrganisationLink.create({ publicId: publicId('lnk_'), organisationId, livemode: false, affiliateId: b.id, code: `sb${crypto.randomUUID().slice(0, 6)}`, productRef: 'p2', campaignRef: 'c1', destinationUrl: 'https://shop.example.com/b', status: 'active', metadata: {} })

  const click = async (affiliate: OrganisationAffiliate, link: OrganisationLink, when: string, unique: boolean) => {
    const c = await OrganisationClick.create({ publicId: publicId('clk_'), organisationId, livemode: false, linkId: link.id, affiliateId: affiliate.id, productRef: link.productRef, campaignRef: link.campaignRef, visitorHash: hash(`${Math.random()}`), isUnique: unique, utm: {}, clickedAt: at(when) })
    return c
  }
  // Clicks: A has 3 on day 1 (2 unique) and 1 on day 2 (unique). B has 2 on day 2 (both unique).
  await click(a, la, '2026-10-01T09:00:00Z', true)
  await click(a, la, '2026-10-01T10:00:00Z', true)
  await click(a, la, '2026-10-01T11:00:00Z', false)
  await click(a, la, '2026-10-02T09:00:00Z', true)
  await click(b, lb, '2026-10-02T10:00:00Z', true)
  await click(b, lb, '2026-10-02T11:00:00Z', true)
  // Outside the window: must not count.
  await click(a, la, '2026-09-30T23:59:00Z', true)

  const event = async (affiliate: OrganisationAffiliate, link: OrganisationLink, when: string, status: 'attributed' | 'reversed' | 'rejected') =>
    OrganisationEvent.create({ publicId: publicId('evt_'), organisationId, livemode: false, externalEventId: `e_${crypto.randomUUID()}`, type: 'registration', affiliateId: affiliate.id, linkId: link.id, status, occurredAt: at(when), metadata: {} })
  const e1 = await event(a, la, '2026-10-01T12:00:00Z', 'attributed')
  const e2 = await event(a, la, '2026-10-01T13:00:00Z', 'attributed')
  const e3 = await event(a, la, '2026-10-02T12:00:00Z', 'attributed')
  await event(a, la, '2026-10-01T14:00:00Z', 'reversed')
  await event(a, la, '2026-10-02T14:00:00Z', 'rejected')
  const e6 = await event(b, lb, '2026-10-02T13:00:00Z', 'reversed')
  const e7 = await event(b, lb, '2026-10-02T14:00:00Z', 'attributed')

  const commission = async (ev: OrganisationEvent, affiliate: OrganisationAffiliate, amount: number, currency: string, status: 'pending' | 'approved' | 'reversed', createdAt: string, paid = false) => {
    const c = await OrganisationCommission.create({ publicId: publicId('com_'), organisationId, livemode: false, eventId: ev.id, affiliateId: affiliate.id, affiliateExternalUserId: affiliate.externalUserId, amount, currency, status, holdUntil: at('2026-10-20T00:00:00Z'), paidAt: paid ? at(createdAt) : null })
    await OrganisationCommission.query().where('id', c.id).update({ created_at: at(createdAt).toSQL() })
    return c
  }
  await commission(e1, a, 100, 'USD', 'pending', '2026-10-01T12:00:00Z')
  await commission(e2, a, 150, 'USD', 'approved', '2026-10-01T13:00:00Z')
  await commission(e3, a, 200, 'USD', 'approved', '2026-10-02T12:00:00Z', true)
  await commission(e6, b, 50, 'USD', 'reversed', '2026-10-02T13:00:00Z')
  await commission(e7, b, 80, 'EUR', 'pending', '2026-10-02T14:00:00Z')
}

test.group('organisation api stats', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
  })

  test('summary totals over the window match the hand-computed numbers', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await seed(organisation.id)
    const res = await api('GET', `/api/v1/organisations/stats/summary?from=${FROM.toSeconds()}&to=${TO.toSeconds()}`, testKey.secret)
    assert.equal(res.status, 200)
    assert.equal(res.body.object, 'stats')
    const t = res.body.totals
    assert.equal(t.clicks, 6)
    assert.equal(t.unique_clicks, 5)
    assert.equal(t.conversions, 4)
    assert.equal(t.conversion_rate, 0.8)
    assert.equal(t.active_affiliates, 2)
    // Pending has two currencies (USD 100 and EUR 80), so the amount is not summed.
    assert.deepEqual(t.commissions.pending, { count: 2, amount: null, currency: null })
    assert.deepEqual(t.commissions.approved, { count: 1, amount: 150, currency: 'USD' })
    assert.deepEqual(t.commissions.paid, { count: 1, amount: 200, currency: 'USD' })
    assert.deepEqual(t.commissions.reversed, { count: 1, amount: 50, currency: 'USD' })
  })

  test('group_by=day splits the window into the two days', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await seed(organisation.id)
    const res = await api('GET', `/api/v1/organisations/stats/summary?from=${FROM.toSeconds()}&to=${TO.toSeconds()}&group_by=day`, testKey.secret)
    const [d1, d2] = res.body.groups
    assert.equal(d1.key, '2026-10-01')
    assert.equal(d1.clicks, 3)
    assert.equal(d1.unique_clicks, 2)
    assert.equal(d1.conversions, 2)
    assert.equal(d1.conversion_rate, 1)
    assert.deepEqual(d1.commissions.pending, { count: 1, amount: 100, currency: 'USD' })
    assert.deepEqual(d1.commissions.approved, { count: 1, amount: 150, currency: 'USD' })
    assert.equal(d2.key, '2026-10-02')
    assert.equal(d2.clicks, 3)
    assert.equal(d2.unique_clicks, 3)
    assert.equal(d2.conversions, 2)
    assert.equal(d2.conversion_rate, 0.6667)
    assert.deepEqual(d2.commissions.pending, { count: 1, amount: 80, currency: 'EUR' })
    assert.deepEqual(d2.commissions.paid, { count: 1, amount: 200, currency: 'USD' })
    assert.deepEqual(d2.commissions.reversed, { count: 1, amount: 50, currency: 'USD' })
  })

  test('group_by=product and affiliate split the same totals by key', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await seed(organisation.id)
    const byProduct = await api('GET', `/api/v1/organisations/stats/summary?from=${FROM.toSeconds()}&to=${TO.toSeconds()}&group_by=product`, testKey.secret)
    const p1 = byProduct.body.groups.find((g: any) => g.key === 'p1')
    const p2 = byProduct.body.groups.find((g: any) => g.key === 'p2')
    assert.equal(p1.clicks, 4)
    assert.equal(p1.unique_clicks, 3)
    assert.equal(p1.conversions, 3)
    assert.equal(p1.conversion_rate, 1)
    assert.equal(p2.clicks, 2)
    assert.equal(p2.conversions, 1)
    assert.equal(p2.conversion_rate, 0.5)
    assert.deepEqual(p2.commissions.reversed, { count: 1, amount: 50, currency: 'USD' })

    const byAffiliate = await api('GET', `/api/v1/organisations/stats/summary?from=${FROM.toSeconds()}&to=${TO.toSeconds()}&group_by=affiliate`, testKey.secret)
    assert.lengthOf(byAffiliate.body.groups, 2)
  })

  test("an affiliate's stats only count that affiliate", async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await seed(organisation.id)
    const affiliates = await OrganisationAffiliate.query().where('organisation_id', organisation.id).orderBy('id', 'asc')
    const a = affiliates[0]
    const res = await api('GET', `/api/v1/organisations/affiliates/${a.publicId}/stats?from=${FROM.toSeconds()}&to=${TO.toSeconds()}`, testKey.secret)
    assert.equal(res.status, 200)
    assert.equal(res.body.totals.clicks, 4)
    assert.equal(res.body.totals.unique_clicks, 3)
    assert.equal(res.body.totals.conversions, 3)
    assert.equal(res.body.totals.conversion_rate, 1)
    assert.deepEqual(res.body.totals.commissions.pending, { count: 1, amount: 100, currency: 'USD' })
    assert.isUndefined(res.body.totals.active_affiliates)
  })

  test('a window with no data returns zeros, and the default window is the last 30 days', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const empty = await api('GET', `/api/v1/organisations/stats/summary?from=${FROM.toSeconds()}&to=${TO.toSeconds()}`, testKey.secret)
    assert.equal(empty.body.totals.clicks, 0)
    assert.equal(empty.body.totals.conversion_rate, 0)
    assert.equal(empty.body.totals.commissions.pending.count, 0)
    const defaults = await api('GET', '/api/v1/organisations/stats/summary', testKey.secret)
    assert.equal(defaults.body.to - defaults.body.from, 30 * 86400)
  })

  test('bad windows and group_by values are 400', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const backwards = await api('GET', `/api/v1/organisations/stats/summary?from=${TO.toSeconds()}&to=${FROM.toSeconds()}`, testKey.secret)
    assert.equal(backwards.status, 400)
    const tooLong = await api('GET', `/api/v1/organisations/stats/summary?from=${FROM.toSeconds() - 400 * 86400}&to=${TO.toSeconds()}`, testKey.secret)
    assert.equal(tooLong.status, 400)
    assert.equal(tooLong.body.error.param, 'from')
    const badGroup = await api('GET', `/api/v1/organisations/stats/summary?group_by=colour`, testKey.secret)
    assert.equal(badGroup.status, 400)
    assert.equal(badGroup.body.error.param, 'group_by')
  })

  test("another organisation's affiliate stats are 404, and stats never mix organisations", async ({ assert }) => {
    const a = await makeOrganisation()
    const b = await makeOrganisation()
    created.push(a.organisation, b.organisation)
    await seed(a.organisation.id)
    const theirs = await OrganisationAffiliate.query().where('organisation_id', a.organisation.id).firstOrFail()
    const cross = await api('GET', `/api/v1/organisations/affiliates/${theirs.publicId}/stats`, b.testKey.secret)
    assert.equal(cross.status, 404)
    const mine = await api('GET', `/api/v1/organisations/stats/summary?from=${FROM.toSeconds()}&to=${TO.toSeconds()}`, b.testKey.secret)
    assert.equal(mine.body.totals.clicks, 0)
  })
})
