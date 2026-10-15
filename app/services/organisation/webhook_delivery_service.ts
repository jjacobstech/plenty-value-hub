import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import { logJsonError } from '#services/json_logger'
import OrganisationMember from '#models/organisation_member'
import OrganisationWebhookDelivery from '#models/organisation_webhook_delivery'
import OrganisationWebhookEndpoint from '#models/organisation_webhook_endpoint'
import { signatureHeader } from '#services/organisation/webhook_signer'
import { signingSecrets } from '#services/organisation/webhook_emitter'

/** Minutes to wait before retry 1, 2, 3 ... (SPEC §9). One first attempt plus eight retries. */
export const RETRY_MINUTES = [1, 5, 30, 120, 300, 600, 1440, 1440]
/** An endpoint that has failed continuously for this long is disabled and its owners are emailed. */
export const DISABLE_AFTER_HOURS = 72
const TIMEOUT_MS = 10_000

/** The time of the next attempt after `attempts` attempts have been made, or null when retries are used up. */
export function nextRetryAt(attempts: number, now: DateTime): DateTime | null {
  const minutes = RETRY_MINUTES[attempts - 1]
  return minutes === undefined ? null : now.plus({ minutes })
}

async function emailOwners(endpoint: OrganisationWebhookEndpoint) {
  const owners = await OrganisationMember.query().where('organisation_id', endpoint.organisationId).where('role', 'owner').preload('user')
  for (const owner of owners) {
    try {
      await mail.send((message) => {
        message
          .to(owner.user.email)
          .subject('A Plenty Value webhook endpoint was disabled')
          .text(`The webhook endpoint ${endpoint.publicId} (${endpoint.url}) failed for 3 days and was disabled. Fix the endpoint in the developer portal, then enable it again.`)
      })
    } catch (error) {
      logJsonError({ event: 'organisation_webhook_owner_email_failed', message: 'Could not email a webhook owner', error, context: { endpointId: endpoint.publicId } })
    }
  }
}

async function recordFailure(endpoint: OrganisationWebhookEndpoint, now: DateTime) {
  if (!endpoint.failingSince) {
    endpoint.failingSince = now
    await endpoint.save()
    return
  }
  if (endpoint.status === 'enabled' && now.diff(endpoint.failingSince, 'hours').hours >= DISABLE_AFTER_HOURS) {
    endpoint.status = 'disabled'
    await endpoint.save()
    await emailOwners(endpoint)
  }
}

/** Sends one delivery. A 2xx response is success. Anything else, or no response, schedules a retry. */
async function attempt(delivery: OrganisationWebhookDelivery, now: DateTime) {
  const endpoint = delivery.endpoint
  if (endpoint.status !== 'enabled') {
    delivery.status = 'failed'
    delivery.responseBodyExcerpt = 'endpoint disabled'
    delivery.nextAttemptAt = null
    await delivery.save()
    return
  }

  const body = JSON.stringify(delivery.event.payload)
  const header = signatureHeader(signingSecrets(endpoint, now), body, Math.floor(now.toSeconds()))
  const started = Date.now()
  let status: number | null = null
  let excerpt: string
  try {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'pv-signature': header },
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    status = res.status
    excerpt = (await res.text()).slice(0, 1000)
  } catch (error: any) {
    excerpt = error?.name === 'TimeoutError' ? 'timeout' : 'connection error'
  }

  delivery.attempt += 1
  delivery.responseStatus = status
  delivery.responseBodyExcerpt = excerpt
  delivery.durationMs = Date.now() - started

  if (status !== null && status >= 200 && status < 300) {
    delivery.status = 'succeeded'
    delivery.deliveredAt = now
    delivery.nextAttemptAt = null
    if (endpoint.failingSince) {
      endpoint.failingSince = null
      await endpoint.save()
    }
  } else {
    const next = nextRetryAt(delivery.attempt, now)
    delivery.status = next ? 'pending' : 'failed'
    delivery.nextAttemptAt = next
    await recordFailure(endpoint, now)
  }
  await delivery.save()
}

/** Attempts every delivery that is due. Returns how many were attempted. */
export async function deliverDue(now: DateTime = DateTime.now(), limit = 50): Promise<number> {
  const due = await OrganisationWebhookDelivery.query()
    .where('status', 'pending')
    .where('next_attempt_at', '<=', now.toSQL()!)
    .preload('event')
    .preload('endpoint')
    .orderBy('next_attempt_at', 'asc')
    .limit(limit)
  for (const delivery of due) {
    await attempt(delivery, now)
  }
  return due.length
}

/** Re-queues a delivery now, for the portal's "resend" button. Only failed or finished deliveries are re-sent. */
export async function resend(delivery: OrganisationWebhookDelivery, now = DateTime.now()) {
  delivery.status = 'pending'
  delivery.attempt = 0
  delivery.nextAttemptAt = now
  await delivery.save()
  return delivery
}
