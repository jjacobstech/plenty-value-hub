import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import OrganisationWebhookDelivery from '#models/organisation_webhook_delivery'
import OrganisationWebhookEndpoint from '#models/organisation_webhook_endpoint'
import OrganisationWebhookEvent from '#models/organisation_webhook_event'
import { encrypt, decrypt } from '#services/encryption_service'
import { publicId } from '#services/organisation/public_id'
import { generateSecret } from '#services/organisation/webhook_signer'

export const API_VERSION = '2026-10-01'
const ROTATION_OVERLAP_HOURS = 24

/**
 * Outbox write. Call with the transaction of the state change, so the event exists only if the
 * change commits. One delivery row is queued per enabled endpoint that wants this event type.
 */
export async function emit(trx: TransactionClientContract, organisationId: number, livemode: boolean, type: string, object: unknown) {
  const now = DateTime.now()
  const outboxId = publicId('whevt_')
  const payload = { id: outboxId, type, livemode, created: Math.floor(now.toSeconds()), api_version: API_VERSION, data: { object } }

  const event = await OrganisationWebhookEvent.create(
    { publicId: outboxId, organisationId, livemode, type, payload },
    { client: trx }
  )
  const endpoints = await OrganisationWebhookEndpoint.query({ client: trx })
    .where('organisation_id', organisationId)
    .where('livemode', livemode)
    .where('status', 'enabled')
  for (const endpoint of endpoints) {
    if (!endpoint.enabledEvents.includes('*') && !endpoint.enabledEvents.includes(type)) continue
    await OrganisationWebhookDelivery.create(
      { publicId: publicId('whd_'), webhookEventId: event.id, endpointId: endpoint.id, attempt: 0, status: 'pending', nextAttemptAt: now },
      { client: trx }
    )
  }
}

/** Creates an endpoint. The signing secret is returned once; only its encrypted form is stored. */
export async function createEndpoint(input: {
  organisationId: number
  livemode: boolean
  url: string
  enabledEvents?: string[]
  description?: string
}): Promise<{ endpoint: OrganisationWebhookEndpoint; secret: string }> {
  const url = new URL(input.url)
  if (input.livemode && url.protocol !== 'https:') {
    throw new OrganisationApiException('Webhook URLs must use https in live mode.', 'invalid_request_error', 'parameter_invalid', 400, 'url')
  }
  const secret = generateSecret()
  const endpoint = await OrganisationWebhookEndpoint.create({
    publicId: publicId('we_'),
    organisationId: input.organisationId,
    livemode: input.livemode,
    url: input.url,
    secretEncrypted: encrypt(secret),
    enabledEvents: input.enabledEvents ?? ['*'],
    status: 'enabled',
    description: input.description ?? null,
  })
  return { endpoint, secret }
}

/** Rotates the signing secret. The old one still signs for 24 hours so organisations can switch over. */
export async function rotateSecret(endpoint: OrganisationWebhookEndpoint, now = DateTime.now()) {
  const secret = generateSecret()
  endpoint.previousSecretEncrypted = endpoint.secretEncrypted
  endpoint.previousSecretExpiresAt = now.plus({ hours: ROTATION_OVERLAP_HOURS })
  endpoint.secretEncrypted = encrypt(secret)
  await endpoint.save()
  return secret
}

/** The secrets to sign with right now: the current one, plus the previous one during the overlap. */
export function signingSecrets(endpoint: OrganisationWebhookEndpoint, now = DateTime.now()): string[] {
  const secrets = [decrypt(endpoint.secretEncrypted)]
  if (endpoint.previousSecretEncrypted && endpoint.previousSecretExpiresAt && endpoint.previousSecretExpiresAt > now) {
    secrets.push(decrypt(endpoint.previousSecretEncrypted))
  }
  return secrets
}
