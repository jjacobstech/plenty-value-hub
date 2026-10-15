import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { Queue } from 'bullmq'
import Organisation from '#models/organisation'
import OrganisationClick from '#models/organisation_click'
import OrganisationCommission from '#models/organisation_commission'
import OrganisationLink from '#models/organisation_link'
import OrganisationProgram from '#models/organisation_program'
import { approveDueCommissions } from '#services/organisation/commission_service'
import { ORGANISATION_QUEUE, queueConnection, startWorker } from '#services/organisation/jobs'
import { BASE, api, eventually, makeOrganisation } from '#tests/helpers/organisation_api'

/** Creates an affiliate and link, and returns them with the link's database id. */
async function setupLink(secret: string) {
  const affiliate = (await api('POST', '/api/v1/organisations/affiliates', secret, { external_user_id: `c_${Math.random()}` })).body
  const link = (await api('POST', '/api/v1/organisations/links', secret, { affiliate: affiliate.id, product_ref: `p_${Math.random()}`, destination_url: 'https://shop.example.com/p' })).body
  return { affiliate, link, dbId: (await OrganisationLink.findByOrFail('public_id', link.id)).id }
}

async function visit(code: string, ua: string) {
  const res = await fetch(`${BASE}/r/${code}`, { redirect: 'manual', headers: { 'user-agent': ua } })
  const clickId = new URL(res.headers.get('location')!).searchParams.get('pv_click_id')!
  await eventually(() => OrganisationClick.query().where('public_id', clickId).first())
  return clickId
}

test.group('organisation api commissions', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
  })

  test('percent commissions round half-up in minor units, with a hold period', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await OrganisationProgram.query().where('organisation_id', organisation.id).where('livemode', false).update({ commission_mode: 'percent', commission_percent_bps: 1000 })
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code, 'Mozilla/5.0 Firefox/130.0 percent')
    const ev = await api('POST', '/api/v1/organisations/events', testKey.secret, { event_id: 'pct_ok', type: 'registration', click_id: clickId, amount: 1235, currency: 'GBP' })
    assert.equal(ev.status, 201)
    assert.match(ev.body.commission, /^com_/)

    const com = (await api('GET', `/api/v1/organisations/commissions/${ev.body.commission}`, testKey.secret)).body
    assert.equal(com.amount, 124)
    assert.equal(com.currency, 'GBP')
    assert.equal(com.status, 'pending')
    assert.equal(com.event, ev.body.id)
    assert.equal(com.affiliate_external_user_id.startsWith('c_'), true)
    const holdDays = (com.hold_until - ev.body.occurred_at) / 86400
    assert.approximately(holdDays, 14, 0.01)
  })

  test('flat commissions use the program amount and currency', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await OrganisationProgram.query().where('organisation_id', organisation.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 500, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const clickId = await visit(link.code, 'Mozilla/5.0 Firefox/130.0 flat')
    const ev = await api('POST', '/api/v1/organisations/events', testKey.secret, { event_id: 'flat_ok', type: 'registration', click_id: clickId })
    const com = (await api('GET', `/api/v1/organisations/commissions/${ev.body.commission}`, testKey.secret)).body
    assert.equal(com.amount, 500)
    assert.equal(com.currency, 'USD')
  })

  test('approve, reject and the state machine (422 for illegal moves)', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await OrganisationProgram.query().where('organisation_id', organisation.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/api/v1/organisations/events', testKey.secret, { event_id: 'sm_1', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 sm1') })
    const id = ev.body.commission

    const approved = await api('POST', `/api/v1/organisations/commissions/${id}/approve`, testKey.secret)
    assert.equal(approved.body.status, 'approved')
    assert.isNotNull(approved.body.approved_at)

    const rejectApproved = await api('POST', `/api/v1/organisations/commissions/${id}/reject`, testKey.secret, { reason: 'late' })
    assert.equal(rejectApproved.status, 422)
    assert.equal(rejectApproved.body.error.code, 'invalid_state_transition')

    const ev2 = await api('POST', '/api/v1/organisations/events', testKey.secret, { event_id: 'sm_2', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 sm2') })
    const rejected = await api('POST', `/api/v1/organisations/commissions/${ev2.body.commission}/reject`, testKey.secret, { reason: 'fraud review' })
    assert.equal(rejected.body.status, 'rejected')
    assert.equal(rejected.body.reason, 'fraud review')
  })

  test('mark_paid needs an approved commission and records the organisation reference once', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await OrganisationProgram.query().where('organisation_id', organisation.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/api/v1/organisations/events', testKey.secret, { event_id: 'paid_1', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 paid') })
    const id = ev.body.commission

    const early = await api('POST', `/api/v1/organisations/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_1' })
    assert.equal(early.status, 422)

    await api('POST', `/api/v1/organisations/commissions/${id}/approve`, testKey.secret)
    const paid = await api('POST', `/api/v1/organisations/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_1' })
    assert.equal(paid.status, 200)
    assert.equal(paid.body.status, 'approved')
    assert.equal(paid.body.payout_reference, 'po_1')
    assert.isNotNull(paid.body.paid_at)

    const again = await api('POST', `/api/v1/organisations/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_1' })
    assert.equal(again.status, 200)
    const other = await api('POST', `/api/v1/organisations/commissions/${id}/mark_paid`, testKey.secret, { payout_reference: 'po_2' })
    assert.equal(other.status, 422)
  })

  test('reversing an event reverses its approved commission', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await OrganisationProgram.query().where('organisation_id', organisation.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/api/v1/organisations/events', testKey.secret, { event_id: 'rv_c', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 rvc') })
    await api('POST', `/api/v1/organisations/commissions/${ev.body.commission}/approve`, testKey.secret)
    await api('POST', `/api/v1/organisations/events/${ev.body.id}/reverse`, testKey.secret)
    const com = (await api('GET', `/api/v1/organisations/commissions/${ev.body.commission}`, testKey.secret)).body
    assert.equal(com.status, 'reversed')
    assert.isNotNull(com.reversed_at)
  })

  test("another organisation's commission is a 404", async ({ assert }) => {
    const a = await makeOrganisation()
    const b = await makeOrganisation()
    created.push(a.organisation, b.organisation)
    await OrganisationProgram.query().where('organisation_id', a.organisation.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(a.testKey.secret)
    const ev = await api('POST', '/api/v1/organisations/events', a.testKey.secret, { event_id: 'iso_c', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 iso') })
    const res = await api('GET', `/api/v1/organisations/commissions/${ev.body.commission}`, b.testKey.secret)
    assert.equal(res.status, 404)
  })

  test('auto-approval approves due commissions only for programs that allow it', async ({ assert }) => {
    const auto = await makeOrganisation()
    const manual = await makeOrganisation()
    created.push(auto.organisation, manual.organisation)
    await OrganisationProgram.query().where('organisation_id', manual.organisation.id).where('livemode', false).update({ auto_approve_after_hold: false })
    for (const p of [auto, manual]) {
      await OrganisationProgram.query().where('organisation_id', p.organisation.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
      const { link } = await setupLink(p.testKey.secret)
      const ev = await api('POST', '/api/v1/organisations/events', p.testKey.secret, { event_id: `auto_${p.organisation.id}`, type: 'registration', click_id: await visit(link.code, `Mozilla/5.0 Firefox/130.0 auto${p.organisation.id}`) })
      await OrganisationCommission.query().where('public_id', ev.body.commission).update({ hold_until: DateTime.now().minus({ days: 1 }).toSQL() })
    }
    await approveDueCommissions()
    const autoCom = await OrganisationCommission.query().where('organisation_id', auto.organisation.id).firstOrFail()
    const manualCom = await OrganisationCommission.query().where('organisation_id', manual.organisation.id).firstOrFail()
    assert.equal(autoCom.status, 'approved')
    assert.equal(manualCom.status, 'pending')
  })

  test('the BullMQ worker runs the approval job end to end', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await OrganisationProgram.query().where('organisation_id', organisation.id).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 100, commission_currency: 'USD' })
    const { link } = await setupLink(testKey.secret)
    const ev = await api('POST', '/api/v1/organisations/events', testKey.secret, { event_id: 'bull_1', type: 'registration', click_id: await visit(link.code, 'Mozilla/5.0 Firefox/130.0 bull') })
    await OrganisationCommission.query().where('public_id', ev.body.commission).update({ hold_until: DateTime.now().minus({ hours: 1 }).toSQL() })

    const worker = startWorker()
    const queue = new Queue(ORGANISATION_QUEUE, { connection: queueConnection() })
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
    const com = await OrganisationCommission.query().where('public_id', ev.body.commission).firstOrFail()
    assert.equal(com.status, 'approved')
  })
})
