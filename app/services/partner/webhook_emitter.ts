import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import PartnerApiException from '#exceptions/partner_api_exception'
import PartnerWebhookDelivery from '#models/partner_webhook_delivery'
import PartnerWebhookEndpoint from '#models/partner_webhook_endpoint'
import PartnerWebhookEvent from '#models/partner_webhook_event'
import { encrypt, decrypt } from '#services/encryption_service'
import { publicId } from '#services/partner/public_id'
import { generateSecret } from '#services/partner/webhook_signer'

export const API_VERSION = '2026-10-01'
const ROTATION_OVERLAP_HOURS = 24

/**
 * Outbox write. Call with the transaction of the state change, so the event exists only if the
 * change commits. One delivery row is queued per enabled endpoint that wants this event type.
 */
export async function emit(trx: TransactionClientContract, partnerId: number, livemode: boolean, type: string, object: unknown) {
  const now = DateTime.now()
  const outboxId = publicId('whevt_')
  const payload = { id: outboxId, type, livemode, created: Math.floor(now.toSeconds()), api_version: API_VERSION, data: { object } }

  const event = await PartnerWebhookEvent.create(
    { publicId: outboxId, partnerId, livemode, type, payload },
    { client: trx }
  )
  const endpoints = await PartnerWebhookEndpoint.query({ client: trx })
    .where('partner_id', partnerId)
    .where('livemode', livemode)
    .where('status', 'enabled')
  for (const endpoint of endpoints) {
    if (!endpoint.enabledEvents.includes('*') && !endpoint.enabledEvents.includes(type)) continue
    await PartnerWebhookDelivery.create(
      { webhookEventId: event.id, endpointId: endpoint.id, attempt: 0, status: 'pending', nextAttemptAt: now },
      { client: trx }
    )
  }
}

/** Creates an endpoint. The signing secret is returned once; only its encrypted form is stored. */
export async function createEndpoint(input: {
  partnerId: number
  livemode: boolean
  url: string
  enabledEvents?: string[]
  description?: string
}): Promise<{ endpoint: PartnerWebhookEndpoint; secret: string }> {
  const url = new URL(input.url)
  if (input.livemode && url.protocol !== 'https:') {
    throw new PartnerApiException('Webhook URLs must use https in live mode.', 'invalid_request_error', 'parameter_invalid', 400, 'url')
  }
  const secret = generateSecret()
  const endpoint = await PartnerWebhookEndpoint.create({
    publicId: publicId('we_'),
    partnerId: input.partnerId,
    livemode: input.livemode,
    url: input.url,
    secretEncrypted: encrypt(secret),
    enabledEvents: input.enabledEvents ?? ['*'],
    status: 'enabled',
    description: input.description ?? null,
  })
  return { endpoint, secret }
}

/** Rotates the signing secret. The old one still signs for 24 hours so partners can switch over. */
export async function rotateSecret(endpoint: PartnerWebhookEndpoint, now = DateTime.now()) {
  const secret = generateSecret()
  endpoint.previousSecretEncrypted = endpoint.secretEncrypted
  endpoint.previousSecretExpiresAt = now.plus({ hours: ROTATION_OVERLAP_HOURS })
  endpoint.secretEncrypted = encrypt(secret)
  await endpoint.save()
  return secret
}

/** The secrets to sign with right now: the current one, plus the previous one during the overlap. */
export function signingSecrets(endpoint: PartnerWebhookEndpoint, now = DateTime.now()): string[] {
  const secrets = [decrypt(endpoint.secretEncrypted)]
  if (endpoint.previousSecretEncrypted && endpoint.previousSecretExpiresAt && endpoint.previousSecretExpiresAt > now) {
    secrets.push(decrypt(endpoint.previousSecretEncrypted))
  }
  return secrets
}
