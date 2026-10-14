import { test } from '@japa/runner'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Partner from '#models/partner'
import PartnerClick from '#models/partner_click'
import PartnerDelivery from '#models/partner_webhook_delivery'
import PartnerIdempotencyKey from '#models/partner_idempotency_key'
import PartnerLink from '#models/partner_link'
import PartnerProgram from '#models/partner_program'
import PartnerWebhookEvent from '#models/partner_webhook_event'
import { prune } from '#services/partner/maintenance'
import { DISABLE_AFTER_HOURS, RETRY_MINUTES, deliverDue, nextRetryAt } from '#services/partner/webhook_delivery_service'
import { createEndpoint, emit, rotateSecret, signingSecrets } from '#services/partner/webhook_emitter'
import { signatureHeader, verifySignature } from '#services/partner/webhook_signer'
import { BASE, api, eventually, makePartner } from '#tests/helpers/partner_api'

type Received = { body: string; signature: string; path: string }

/** A local webhook receiver. `status` is what it answers with. */
async function receiver(status = () => 200) {
  const received: Received[] = []
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      received.push({ body, signature: String(req.headers['pv-signature'] ?? ''), path: req.url ?? '' })
      res.statusCode = status()
      res.end('received')
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  const port = (server.address() as AddressInfo).port
  return { received, url: `http://127.0.0.1:${port}/hook`, close: () => new Promise<void>((resolve) => server.close(() => resolve())) }
}

async function setupCommission(secret: string, partnerId: number) {
  await PartnerProgram.query().where('partner_id', partnerId).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 250, commission_currency: 'USD' })
  const affiliate = (await api('POST', '/v1/affiliates', secret, { external_user_id: `w_${Math.random()}` })).body
  const link = (await api('POST', '/v1/links', secret, { affiliate: affiliate.id, product_ref: `w_${Math.random()}`, destination_url: 'https://shop.example.com/p' })).body
  const res = await fetch(`${BASE}/r/${link.code}`, { redirect: 'manual', headers: { 'user-agent': `Mozilla/5.0 Opera/100 ${Math.random()}` } })
  const clickId = new URL(res.headers.get('location')!).searchParams.get('pv_click_id')!
  await eventually(() => PartnerClick.query().where('public_id', clickId).first())
  const ev = await api('POST', '/v1/events', secret, { event_id: `w_${Math.random()}`, type: 'registration', click_id: clickId })
  return { commissionId: ev.body.commission as string, affiliateId: affiliate.id as string, linkDbId: (await PartnerLink.findByOrFail('public_id', link.id)).id }
}

test.group('partner webhooks', (group) => {
  const created: Partner[] = []
  group.each.teardown(async () => {
    for (const partner of created.splice(0)) await partner.delete()
  })

  test('signature round trip verifies and tampering or stale timestamps fail', async ({ assert }) => {
    const secret = 'whsec_testsecret000000000000000000000'
    const body = JSON.stringify({ id: 'whevt_1', type: 'commission.approved' })
    const now = 1792000000
    const header = signatureHeader([secret], body, now)
    assert.isTrue(verifySignature(body, header, secret, 300, now))
    assert.isFalse(verifySignature(body + ' ', header, secret, 300, now))
    assert.isFalse(verifySignature(body, header, 'whsec_wrongsecret0000000000000000000', 300, now))
    assert.isFalse(verifySignature(body, header, secret, 300, now + 301))
  })

  test('rotation signs with both secrets for 24 hours, then only the new one', async ({ assert }) => {
    const { partner } = await makePartner()
    created.push(partner)
    const { endpoint, secret } = await createEndpoint({ partnerId: partner.id, livemode: false, url: 'http://127.0.0.1:9/x' })
    assert.lengthOf(signingSecrets(endpoint), 1)
    const next = await rotateSecret(endpoint)
    const during = signingSecrets(endpoint)
    assert.lengthOf(during, 2)
    assert.include(during, secret)
    assert.include(during, next)
    const later = signingSecrets(endpoint, DateTime.now().plus({ hours: 25 }))
    assert.deepEqual(later, [next])
  })

  test('a 2xx response marks the delivery succeeded, with a verifiable signature', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const hook = await receiver()
    try {
      const { endpoint, secret } = await createEndpoint({ partnerId: partner.id, livemode: false, url: hook.url })
      await api('POST', '/v1/affiliates', testKey.secret, { external_user_id: 'hooked' })
      await deliverDue()
      assert.lengthOf(hook.received, 1)
      const got = hook.received[0]
      assert.isTrue(verifySignature(got.body, got.signature, secret))
      const envelope = JSON.parse(got.body)
      assert.equal(envelope.type, 'affiliate.created')
      assert.equal(envelope.api_version, '2026-10-01')
      assert.equal(envelope.data.object.external_user_id, 'hooked')
      const delivery = await PartnerDelivery.query().where('endpoint_id', endpoint.id).firstOrFail()
      assert.equal(delivery.status, 'succeeded')
      assert.equal(delivery.responseStatus, 200)
    } finally {
      await hook.close()
    }
  })

  test('a failing response schedules the first retry one minute later', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const hook = await receiver(() => 500)
    try {
      const { endpoint } = await createEndpoint({ partnerId: partner.id, livemode: false, url: hook.url })
      await api('POST', '/v1/affiliates', testKey.secret, { external_user_id: 'fails' })
      const before = DateTime.now()
      await deliverDue()
      const delivery = await PartnerDelivery.query().where('endpoint_id', endpoint.id).firstOrFail()
      assert.equal(delivery.status, 'pending')
      assert.equal(delivery.attempt, 1)
      assert.equal(delivery.responseStatus, 500)
      const wait = delivery.nextAttemptAt!.diff(before, 'minutes').minutes
      assert.approximately(wait, 1, 0.5)
    } finally {
      await hook.close()
    }
  })

  test('retry schedule is 1m, 5m, 30m, 2h, 5h, 10h, 24h, 24h, then no more', async ({ assert }) => {
    const now = DateTime.fromISO('2026-10-14T10:00:00Z')
    assert.deepEqual(RETRY_MINUTES, [1, 5, 30, 120, 300, 600, 1440, 1440])
    assert.equal(nextRetryAt(1, now)!.toISO(), now.plus({ minutes: 1 }).toISO())
    assert.equal(nextRetryAt(8, now)!.toISO(), now.plus({ minutes: 1440 }).toISO())
    assert.isNull(nextRetryAt(9, now))
  })

  test('an endpoint failing for 3 days is disabled', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const hook = await receiver(() => 500)
    try {
      const { endpoint } = await createEndpoint({ partnerId: partner.id, livemode: false, url: hook.url })
      endpoint.failingSince = DateTime.now().minus({ hours: DISABLE_AFTER_HOURS + 1 })
      await endpoint.save()
      await api('POST', '/v1/affiliates', testKey.secret, { external_user_id: 'disable_me' })
      await deliverDue()
      await endpoint.refresh()
      assert.equal(endpoint.status, 'disabled')
    } finally {
      await hook.close()
    }
  })

  test('the outbox row is rolled back with the state change', async ({ assert }) => {
    const { partner } = await makePartner()
    created.push(partner)
    await createEndpoint({ partnerId: partner.id, livemode: false, url: 'http://127.0.0.1:9/x' })
    try {
      await db.transaction(async (trx) => {
        await emit(trx, partner.id, false, 'affiliate.created', { id: 'aff_rolled' })
        throw new Error('roll back')
      })
    } catch (error) {
      assert.equal((error as Error).message, 'roll back')
    }
    assert.lengthOf(await PartnerWebhookEvent.query().where('partner_id', partner.id), 0)
  })

  test('endpoints only get the event types they subscribed to', async ({ assert }) => {
    const { partner } = await makePartner()
    created.push(partner)
    const onlyCommissions = await createEndpoint({ partnerId: partner.id, livemode: false, url: 'http://127.0.0.1:9/a', enabledEvents: ['commission.approved'] })
    const everything = await createEndpoint({ partnerId: partner.id, livemode: false, url: 'http://127.0.0.1:9/b' })
    await db.transaction((trx) => emit(trx, partner.id, false, 'affiliate.created', {}))
    assert.lengthOf(await PartnerDelivery.query().where('endpoint_id', onlyCommissions.endpoint.id), 0)
    assert.lengthOf(await PartnerDelivery.query().where('endpoint_id', everything.endpoint.id), 1)
  })

  test('live endpoints must use https', async ({ assert }) => {
    const { partner } = await makePartner()
    created.push(partner)
    try {
      await createEndpoint({ partnerId: partner.id, livemode: true, url: 'http://example.com/hook' })
      assert.fail('should have thrown')
    } catch (error) {
      assert.equal((error as { code?: string }).code, 'parameter_invalid')
    }
  })

  test('approving a commission sends commission.approved to the endpoint', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const hook = await receiver()
    try {
      await createEndpoint({ partnerId: partner.id, livemode: false, url: hook.url, enabledEvents: ['commission.approved'] })
      const { commissionId } = await setupCommission(testKey.secret, partner.id)
      await api('POST', `/v1/commissions/${commissionId}/approve`, testKey.secret)
      await deliverDue()
      assert.lengthOf(hook.received, 1)
      const envelope = JSON.parse(hook.received[0].body)
      assert.equal(envelope.type, 'commission.approved')
      assert.equal(envelope.data.object.id, commissionId)
      assert.equal(envelope.data.object.status, 'approved')
    } finally {
      await hook.close()
    }
  })

  test('prune removes idempotency keys past 24 hours and deliveries older than 30 days', async ({ assert }) => {
    const { partner } = await makePartner()
    created.push(partner)
    const { endpoint } = await createEndpoint({ partnerId: partner.id, livemode: false, url: 'http://127.0.0.1:9/p' })
    await db.transaction((trx) => emit(trx, partner.id, false, 'affiliate.created', {}))
    const oldKey = await PartnerIdempotencyKey.create({
      partnerId: partner.id,
      livemode: false,
      key: 'old-key',
      requestMethod: 'POST',
      requestPath: '/v1/affiliates',
      requestHash: 'x'.repeat(64),
      expiresAt: DateTime.now().minus({ hours: 1 }),
    })
    const oldDelivery = await PartnerDelivery.query().where('endpoint_id', endpoint.id).firstOrFail()
    await oldDelivery.merge({ createdAt: DateTime.now().minus({ days: 31 }) }).save()

    await prune()
    assert.isNull(await PartnerIdempotencyKey.find(oldKey.id))
    assert.isNull(await PartnerDelivery.find(oldDelivery.id))
  })
})
