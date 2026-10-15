import { test } from '@japa/runner'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Organisation from '#models/organisation'
import OrganisationClick from '#models/organisation_click'
import OrganisationDelivery from '#models/organisation_webhook_delivery'
import OrganisationIdempotencyKey from '#models/organisation_idempotency_key'
import OrganisationLink from '#models/organisation_link'
import OrganisationProgram from '#models/organisation_program'
import OrganisationWebhookEvent from '#models/organisation_webhook_event'
import { prune } from '#services/organisation/maintenance'
import { DISABLE_AFTER_HOURS, RETRY_MINUTES, deliverDue, nextRetryAt } from '#services/organisation/webhook_delivery_service'
import { createEndpoint, emit, rotateSecret, signingSecrets } from '#services/organisation/webhook_emitter'
import { signatureHeader, verifySignature } from '#services/organisation/webhook_signer'
import { BASE, api, eventually, makeOrganisation } from '#tests/helpers/organisation_api'

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

async function setupCommission(secret: string, organisationId: number) {
  await OrganisationProgram.query().where('organisation_id', organisationId).where('livemode', false).update({ commission_mode: 'flat', commission_flat_amount: 250, commission_currency: 'USD' })
  const affiliate = (await api('POST', '/api/v1/organisations/affiliates', secret, { external_user_id: `w_${Math.random()}` })).body
  const link = (await api('POST', '/api/v1/organisations/links', secret, { affiliate: affiliate.id, product_ref: `w_${Math.random()}`, destination_url: 'https://shop.example.com/p' })).body
  const res = await fetch(`${BASE}/r/${link.code}`, { redirect: 'manual', headers: { 'user-agent': `Mozilla/5.0 Opera/100 ${Math.random()}` } })
  const clickId = new URL(res.headers.get('location')!).searchParams.get('pv_click_id')!
  await eventually(() => OrganisationClick.query().where('public_id', clickId).first())
  const ev = await api('POST', '/api/v1/organisations/events', secret, { event_id: `w_${Math.random()}`, type: 'registration', click_id: clickId })
  return { commissionId: ev.body.commission as string, affiliateId: affiliate.id as string, linkDbId: (await OrganisationLink.findByOrFail('public_id', link.id)).id }
}

test.group('organisation webhooks', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
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
    const { organisation } = await makeOrganisation()
    created.push(organisation)
    const { endpoint, secret } = await createEndpoint({ organisationId: organisation.id, livemode: false, url: 'http://127.0.0.1:9/x' })
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
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const hook = await receiver()
    try {
      const { endpoint, secret } = await createEndpoint({ organisationId: organisation.id, livemode: false, url: hook.url })
      await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'hooked' })
      await deliverDue()
      assert.lengthOf(hook.received, 1)
      const got = hook.received[0]
      assert.isTrue(verifySignature(got.body, got.signature, secret))
      const envelope = JSON.parse(got.body)
      assert.equal(envelope.type, 'affiliate.created')
      assert.equal(envelope.api_version, '2026-10-01')
      assert.equal(envelope.data.object.external_user_id, 'hooked')
      const delivery = await OrganisationDelivery.query().where('endpoint_id', endpoint.id).firstOrFail()
      assert.equal(delivery.status, 'succeeded')
      assert.equal(delivery.responseStatus, 200)
    } finally {
      await hook.close()
    }
  })

  test('a failing response schedules the first retry one minute later', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const hook = await receiver(() => 500)
    try {
      const { endpoint } = await createEndpoint({ organisationId: organisation.id, livemode: false, url: hook.url })
      await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'fails' })
      const before = DateTime.now()
      await deliverDue()
      const delivery = await OrganisationDelivery.query().where('endpoint_id', endpoint.id).firstOrFail()
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
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const hook = await receiver(() => 500)
    try {
      const { endpoint } = await createEndpoint({ organisationId: organisation.id, livemode: false, url: hook.url })
      endpoint.failingSince = DateTime.now().minus({ hours: DISABLE_AFTER_HOURS + 1 })
      await endpoint.save()
      await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'disable_me' })
      await deliverDue()
      await endpoint.refresh()
      assert.equal(endpoint.status, 'disabled')
    } finally {
      await hook.close()
    }
  })

  test('the outbox row is rolled back with the state change', async ({ assert }) => {
    const { organisation } = await makeOrganisation()
    created.push(organisation)
    await createEndpoint({ organisationId: organisation.id, livemode: false, url: 'http://127.0.0.1:9/x' })
    try {
      await db.transaction(async (trx) => {
        await emit(trx, organisation.id, false, 'affiliate.created', { id: 'aff_rolled' })
        throw new Error('roll back')
      })
    } catch (error) {
      assert.equal((error as Error).message, 'roll back')
    }
    assert.lengthOf(await OrganisationWebhookEvent.query().where('organisation_id', organisation.id), 0)
  })

  test('endpoints only get the event types they subscribed to', async ({ assert }) => {
    const { organisation } = await makeOrganisation()
    created.push(organisation)
    const onlyCommissions = await createEndpoint({ organisationId: organisation.id, livemode: false, url: 'http://127.0.0.1:9/a', enabledEvents: ['commission.approved'] })
    const everything = await createEndpoint({ organisationId: organisation.id, livemode: false, url: 'http://127.0.0.1:9/b' })
    await db.transaction((trx) => emit(trx, organisation.id, false, 'affiliate.created', {}))
    assert.lengthOf(await OrganisationDelivery.query().where('endpoint_id', onlyCommissions.endpoint.id), 0)
    assert.lengthOf(await OrganisationDelivery.query().where('endpoint_id', everything.endpoint.id), 1)
  })

  test('live endpoints must use https', async ({ assert }) => {
    const { organisation } = await makeOrganisation()
    created.push(organisation)
    try {
      await createEndpoint({ organisationId: organisation.id, livemode: true, url: 'http://example.com/hook' })
      assert.fail('should have thrown')
    } catch (error) {
      assert.equal((error as { code?: string }).code, 'parameter_invalid')
    }
  })

  test('approving a commission sends commission.approved to the endpoint', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const hook = await receiver()
    try {
      await createEndpoint({ organisationId: organisation.id, livemode: false, url: hook.url, enabledEvents: ['commission.approved'] })
      const { commissionId } = await setupCommission(testKey.secret, organisation.id)
      await api('POST', `/api/v1/organisations/commissions/${commissionId}/approve`, testKey.secret)
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
    const { organisation } = await makeOrganisation()
    created.push(organisation)
    const { endpoint } = await createEndpoint({ organisationId: organisation.id, livemode: false, url: 'http://127.0.0.1:9/p' })
    await db.transaction((trx) => emit(trx, organisation.id, false, 'affiliate.created', {}))
    const oldKey = await OrganisationIdempotencyKey.create({
      organisationId: organisation.id,
      livemode: false,
      key: 'old-key',
      requestMethod: 'POST',
      requestPath: '/api/v1/organisations/affiliates',
      requestHash: 'x'.repeat(64),
      expiresAt: DateTime.now().minus({ hours: 1 }),
    })
    const oldDelivery = await OrganisationDelivery.query().where('endpoint_id', endpoint.id).firstOrFail()
    await oldDelivery.merge({ createdAt: DateTime.now().minus({ days: 31 }) }).save()

    await prune()
    assert.isNull(await OrganisationIdempotencyKey.find(oldKey.id))
    assert.isNull(await OrganisationDelivery.find(oldDelivery.id))
  })
})
