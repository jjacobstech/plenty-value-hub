import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { Queue } from 'bullmq'
import Partner from '#models/partner'
import PartnerClick from '#models/partner_click'
import PartnerCommission from '#models/partner_commission'
import PartnerLink from '#models/partner_link'
import PartnerProgram from '#models/partner_program'
import { approveDueCommissions } from '#services/partner/commission_service'
import { PARTNER_QUEUE, queueConnection, startWorker } from '#services/partner/jobs'
import { BASE, api, eventually, makePartner } from '#tests/helpers/partner_api'

/** Creates an affiliate and link, and returns them with the link's database id. */
async function setupLink(secret: string) {
  const affiliate = (await api('POST', '/v1/affiliates', secret, { external_user_id: `c_${Math.random()}` })).body
  const link = (await api('POST', '/v1/links', secret, { affiliate: affiliate.id, product_ref: `p_${Math.random()}`, destination_url: 'https://shop.example.com/p' })).body
  return { affiliate, link, dbId: (await PartnerLink.findByOrFail('public_id', link.id)).id }
}

async function visit(code: string, ua: string) {
  const res = await fetch(`${BASE}/r/${code}`, { redirect: 'manual', headers: { 'user-agent': ua } })
  const clickId = new URL(res.headers.get('location')!).searchParams.get('pv_click_id')!
  await eventually(() => PartnerClick.query().where('public_id', clickId).first())
  return clickId
}

test.group('partner api commissions', (group) => {
  const created: Partner[] = []
  group.each.teardown(async () => {
    for (const partner of created.splice(0)) await partner.delete()
  })

  test('percent commissions round half-up in minor units, with a hold period', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).where('livemode', false).update({ commission_mode: 'percent', commission_percent_bps: 1000 })
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code, 'Mozilla/5.0 Firefox/130.0 percent')
    const ev = await api('POST', '/v1/events', testKey.secret, { event_id: 'pct_ok', type: 'registration', click_id: clickId, amount: 1235, currency: 'GBP' })
    assert.equal(ev.status, 201)
    assert.match(ev.body.commission, /^com_/)

    const com = (await api('GET', `/v1/commissions/${ev.body.commission}`, testKey.secret)).body
    assert.equal(com.amount, 124)
    assert.equal(com.currency, 'GBP')
    assert.equal(com.status, 'pending')
    assert.equal(com.event, ev.body.id)
    assert.equal(com.affiliate_external_user_id.startsWith('c_'), true)
    const holdDays = (com.hold_until - ev.body.occurred_at) / 86400
    assert.approximately(holdDays, 14, 0.01)
  })

  test('flat commissions use the program amount and currency', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 500, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code, 'Mozilla/5.0 Firefox/130.0 flat')
    const ev = await api('POST', '/v1/events', testKey.secret, { event_id: 'flat_ok', type: 'registration', click_id: clickId })
    const com = (await api('GET', `/v1/commissions/${ev.body.commission}`, testKey.secret)).body
    assert.equal(com.amount, 500)
    assert.equal(com.currency, 'USD')
  })

  test('approve, reject and the state machine (422 for illegal moves)', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/v1/events', testKey.secret, { event_id: 'sm_1', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 sm1') })
    const id = ev.body.commission

    const approved = await api('POST', `/v1/commissions/${id}/approve`, testKey.secret)
    assert.equal(approved.body.status, 'approved')
    assert.isNotNull(approved.body.approved_at)

    const rejectApproved = await api('POST', `/v1/commissions/${id}/reject`, testKey.secret, { reason: 'late' })
    assert.equal(rejectApproved.status, 422)
    assert.equal(rejectApproved.body.error.code, 'invalid_state_transition')

    const ev2 = await api('POST', '/v1/events', testKey.secret, { event_id: 'sm_2', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 sm2') })
    const rejected = await api('POST', `/v1/commissions/${ev2.body.commission}/reject`, testKey.secret, { reason: 'fraud review' })
    assert.equal(rejected.body.status, 'rejected')
    assert.equal(rejected.body.reason, 'fraud review')
  })

  test('mark_paid needs an approved commission and records the partner reference once', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/v1/events', testKey.secret, { event_id: 'paid_1', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 paid') })
    const id = ev.body.commission

    const early = await api('POST', `/v1/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_1' })
    assert.equal(early.status, 422)

    await api('POST', `/v1/commissions/${id}/approve`, testKey.secret)
    const paid = await api('POST', `/v1/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_1' })
    assert.equal(paid.status, 200)
    assert.equal(paid.body.status, 'approved')
    assert.equal(paid.body.payout_reference, 'po_1')
    assert.isNotNull(paid.body.paid_at)

    const again = await api('POST', `/v1/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_1' })
    assert.equal(again.status, 200)
    const other = await api('POST', `/v1/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_2' })
    assert.equal(other.status, 422)
  })

  test('reversing an event reverses its approved commission', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/v1/events', testKey.secret, { event_id: 'rv_c', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 rvc') })
    await api('POST', `/v1/commissions/${ev.body.commission}/approve`, testKey.secret)
    await api('POST', `/v1/events/${ev.body.id}/reverse`, testKey.secret)
    const com = (await api('GET', `/v1/commissions/${ev.body.commission}`, testKey.secret)).body
    assert.equal(com.status, 'reversed')
    assert.isNotNull(com.reversed_at)
  })

  test("another partner's commission is a 404", async ({ assert }) => {
    const a = await makePartner()
    const b = await makePartner()
    created.push(a.partner, b.partner)
    await PartnerProgram.query().where('partner_id', a.partner.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(a.testKey.secret)
    const ev = await api('POST', '/v1/events', a.testKey.secret, { event_id: 'iso_c', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 iso') })
    const res = await api('GET', `/v1/commissions/${ev.body.commission}`, b.testKey.secret)
    assert.equal(res.status, 404)
  })

  test('auto-approval approves due commissions only for programs that allow it', async ({ assert }) => {
    const auto = await makePartner()
    const manual = await makePartner()
    created.push(auto.partner, manual.partner)
    await PartnerProgram.query().where('partner_id', manual.partner.id).where('livemode', false).update({ auto_approve_after_hold: false })
    for (const p of [auto, manual]) {
      await PartnerProgram.query().where('partner_id', p.partner.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
      const { link } = await setupLink(p.testKey.secret)
      const ev = await api('POST', '/v1/events', p.testKey.secret, { event_id: `auto_${p.partner.id}`, type: 'registration', click_id: await visit(link.code, `Mozilla/5.0 Firefox/130.0 auto${p.partner.id}`) })
      await PartnerCommission.query().where('public_id', ev.body.commission).update({ hold_until: DateTime.now().minus({ days: 1 }).toSQL() })
    }
    await approveDueCommissions()
    const autoCom = await PartnerCommission.query().where('partner_id', auto.partner.id).firstOrFail()
    const manualCom = await PartnerCommission.query().where('partner_id', manual.partner.id).firstOrFail()
    assert.equal(autoCom.status, 'approved')
    assert.equal(manualCom.status, 'pending')
  })

  test('the BullMQ worker runs the approval job end to end', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    await PartnerProgram.query().where('partner_id', partner.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/v1/events', testKey.secret, { event_id: 'bull_1', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 bull') })
    await PartnerCommission.query().where('public_id', ev.body.commission).update({ hold_until: DateTime.now().minus({ hours: 1 }).toSQL() })

    const worker = startWorker()
    const queue = new Queue(PARTNER_QUEUE, { connection: queueConnection() })
    try {
      const job = await queue.add('approve-commissions', {})
      const state = await eventually(async () => {
        const s = await job.getState()
        return s === 'completed' || s === 'failed' ? s : null
      })
      assert.equal(state, 'completed')
    } finally {
      await worker.close()
      await queue.close()
    }
    const com = await PartnerCommission.query().where('public_id', ev.body.commission).firstOrFail()
    assert.equal(com.status, 'approved')
  })
})
