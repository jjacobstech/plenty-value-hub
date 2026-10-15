import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import type Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationClick from '#models/organisation_click'
import OrganisationEvent from '#models/organisation_event'
import OrganisationLink from '#models/organisation_link'
import type OrganisationProgram from '#models/organisation_program'
import type OrganisationCommission from '#models/organisation_commission'
import { publicId } from '#services/organisation/public_id'
import { createCommission, reverseForEvent } from '#services/organisation/commission_service'
import { commissionToApi, eventToApi } from '#services/organisation/serialize'
import { emit } from '#services/organisation/webhook_emitter'

// Fraud heuristics: small organisation-local limits, not the marketplace FraudDetectionService.
const MAX_AFFILIATE_EVENTS_PER_HOUR = 50
const MAX_VISITOR_EVENTS_PER_DAY = 5

type Attribution = {
  status: 'attributed' | 'unattributed' | 'rejected'
  reason: string | null
  affiliate: OrganisationAffiliate | null
  link: OrganisationLink | null
  click: OrganisationClick | null
}

const none = (reason: string): Attribution => ({ status: 'unattributed', reason, affiliate: null, link: null, click: null })

export type EventInput = {
  event_id: string
  type: string
  click_id?: string
  link_id?: string
  affiliate_id?: string
  referred_external_user_id?: string
  amount?: number
  currency?: string
  occurred_at?: number
  metadata?: Record<string, string>
}

/** Step 3 of SPEC §8: find the click, link or affiliate the event belongs to, and the window check. */
async function resolve(
  trx: TransactionClientContract,
  organisation: Organisation,
  livemode: boolean,
  program: OrganisationProgram,
  input: EventInput,
  occurredAt: DateTime
): Promise<Attribution> {
  const scope = (q: any) => q.where('organisation_id', organisation.id).where('livemode', livemode)
  let click: OrganisationClick | null = null
  let link: OrganisationLink | null = null
  let affiliate: OrganisationAffiliate | null = null

  if (input.click_id) {
    click = await scope(OrganisationClick.query({ client: trx })).where('public_id', input.click_id).first()
    if (!click) return none('no_click')
    const ageSeconds = occurredAt.toSeconds() - click.clickedAt.toSeconds()
    if (ageSeconds > program.attributionWindowDays * 86400) return { ...none('outside_window') }
    link = await OrganisationLink.query({ client: trx }).where('id', click.linkId).first()
    affiliate = await OrganisationAffiliate.query({ client: trx }).where('id', click.affiliateId).first()
  } else if (input.link_id) {
    link = await scope(OrganisationLink.query({ client: trx })).where('public_id', input.link_id).first()
    if (!link) return none('no_click')
    affiliate = await OrganisationAffiliate.query({ client: trx }).where('id', link.affiliateId).first()
  } else if (input.affiliate_id) {
    affiliate = await scope(OrganisationAffiliate.query({ client: trx })).where('public_id', input.affiliate_id).first()
    if (!affiliate) return none('no_click')
  } else {
    return none('no_click')
  }

  // first_click: the referred customer keeps the click that first brought them in.
  if (program.attributionModel === 'first_click' && input.referred_external_user_id) {
    const first = await scope(OrganisationEvent.query({ client: trx }))
      .where('referred_external_user_id', input.referred_external_user_id)
      .where('status', 'attributed')
      .whereNotNull('click_id')
      .orderBy('occurred_at', 'asc')
      .orderBy('id', 'asc')
      .first()
    if (first?.clickId) {
      click = await OrganisationClick.query({ client: trx }).where('id', first.clickId).first()
      if (click) {
        link = await OrganisationLink.query({ client: trx }).where('id', click.linkId).first()
        affiliate = await OrganisationAffiliate.query({ client: trx }).where('id', click.affiliateId).first()
      }
    }
  }

  if (!affiliate) return none('no_click')
  const result = { status: 'attributed' as const, reason: null, affiliate, link, click }

  if (affiliate.status !== 'active') return { ...result, status: 'rejected', reason: 'affiliate_suspended' }
  if (link?.status === 'disabled') return { ...result, status: 'rejected', reason: 'link_disabled' }
  if (program.selfReferralBlocked && input.referred_external_user_id === affiliate.externalUserId) {
    return { ...result, status: 'rejected', reason: 'self_referral' }
  }

  const hourAgo = occurredAt.minus({ hours: 1 }).toSQL()!
  const recent = await scope(OrganisationEvent.query({ client: trx }))
    .where('affiliate_id', affiliate.id)
    .where('status', 'attributed')
    .where('occurred_at', '>', hourAgo)
    .count('* as total')
  if (Number(recent[0].$extras.total) >= MAX_AFFILIATE_EVENTS_PER_HOUR) {
    return { ...result, status: 'rejected', reason: 'fraud_suspected' }
  }
  if (click) {
    const dayAgo = occurredAt.minus({ days: 1 }).toSQL()!
    const sameVisitor = await OrganisationEvent.query({ client: trx })
      .join('organisation_clicks', 'organisation_clicks.id', 'organisation_events.click_id')
      .where('organisation_clicks.visitor_hash', click.visitorHash)
      .where('organisation_events.organisation_id', organisation.id)
      .where('organisation_events.livemode', livemode)
      .where('organisation_events.status', 'attributed')
      .where('organisation_events.occurred_at', '>', dayAgo)
      .count('* as total')
    if (Number(sameVisitor[0].$extras.total) >= MAX_VISITOR_EVENTS_PER_DAY) {
      return { ...result, status: 'rejected', reason: 'fraud_suspected' }
    }
  }

  return result
}

/**
 * Records an event (SPEC §8, steps 1 to 4). Returns the stored event, and created=false when the
 * event_id was already recorded. Commission creation (step 5) is added in M5.
 */
export async function recordEvent(organisation: Organisation, livemode: boolean, program: OrganisationProgram, input: EventInput) {
  const scope = (q: any) => q.where('organisation_id', organisation.id).where('livemode', livemode)

  // Step 1: dedupe on the organisation's event_id.
  const existing = await scope(OrganisationEvent.query()).where('external_event_id', input.event_id).first()
  if (existing) return { event: existing, created: false }

  // Step 2: type must be allowed for this program. Rejected types are never stored.
  if (!program.allowedEventTypes.includes(input.type)) {
    throw new OrganisationApiException(`Event type ${input.type} is not allowed for this program.`, 'invalid_request_error', 'event_type_not_allowed', 400, 'type')
  }
  // Percent commissions need the amount and currency to compute the commission.
  if (program.commissionMode === 'percent' && (input.amount === undefined || !input.currency)) {
    throw new OrganisationApiException('amount and currency are required for percent commissions.', 'invalid_request_error', 'parameter_missing', 400, 'amount')
  }

  const occurredAt = input.occurred_at ? DateTime.fromSeconds(input.occurred_at) : DateTime.now()

  return db.transaction(async (trx) => {
    // Insert first so a concurrent duplicate loses here, not after a second attribution run.
    const inserted = await trx.rawQuery(
      `insert into organisation_events (public_id, organisation_id, livemode, external_event_id, type, status, occurred_at, metadata, created_at, updated_at)
       values (?, ?, ?, ?, ?, 'unattributed', ?, ?::jsonb, now(), now())
       on conflict (organisation_id, livemode, external_event_id) do nothing returning id`,
      [publicId('evt_'), organisation.id, livemode, input.event_id, input.type, occurredAt.toJSDate(), JSON.stringify(input.metadata ?? {})]
    )
    if (inserted.rows.length === 0) {
      const winner = await scope(OrganisationEvent.query({ client: trx })).where('external_event_id', input.event_id).firstOrFail()
      return { event: winner, created: false }
    }

    const event = await OrganisationEvent.findOrFail(inserted.rows[0].id, { client: trx })
    const attribution = await resolve(trx, organisation, livemode, program, input, occurredAt)

    event.status = attribution.status
    event.reason = attribution.reason
    event.clickId = attribution.click?.id ?? null
    event.affiliateId = attribution.affiliate?.id ?? null
    event.linkId = attribution.link?.id ?? null
    event.referredExternalUserId = input.referred_external_user_id ?? null
    event.amount = input.amount ?? null
    event.currency = input.currency ?? null
    await event.useTransaction(trx).save()
    // Step 5: attributed events earn a pending commission when the program pays one.
    let commission: OrganisationCommission | null = null
    if (attribution.status === 'attributed' && attribution.affiliate) {
      commission = await createCommission(trx, event, attribution.affiliate, program, occurredAt)
    }

    // Step 6: the outbox gets the conversion, and the commission if there is one.
    const local = event.useTransaction(trx)
    await local.load('click')
    await local.load('affiliate')
    await local.load('link')
    await local.load('commission')
    await emit(trx, organisation.id, livemode, `conversion.${event.status}`, eventToApi(event))
    if (commission) {
      await commission.useTransaction(trx).load('event')
      await commission.load('affiliate')
      await emit(trx, organisation.id, livemode, 'commission.created', commissionToApi(commission))
    }
    return { event, created: true }
  })
}

/** Reverses an attributed event. Repeating it is harmless; other states are a 422. */
export async function reverseEvent(event: OrganisationEvent, reason: string | undefined): Promise<OrganisationEvent> {
  if (event.status === 'reversed') return event
  if (event.status !== 'attributed') {
    throw new OrganisationApiException(`An event that is ${event.status} cannot be reversed.`, 'invalid_request_error', 'invalid_state_transition', 422)
  }
  event.status = 'reversed'
  event.reason = 'reversed_by_organisation'
  if (reason) event.metadata = { ...event.metadata, reversal_reason: reason }
  return db.transaction(async (trx) => {
    await event.useTransaction(trx).save()
    const { commission, changed } = await reverseForEvent(event.id, 'reversed_by_organisation', trx)
    const local = event.useTransaction(trx)
    await local.load('click')
    await local.load('affiliate')
    await local.load('link')
    await local.load('commission')
    await emit(trx, event.organisationId, event.livemode, 'conversion.reversed', eventToApi(event))
    if (changed && commission) {
      await commission.useTransaction(trx).load('event')
      await commission.load('affiliate')
      await emit(trx, event.organisationId, event.livemode, 'commission.reversed', commissionToApi(commission))
    }
    return event
  })
}
