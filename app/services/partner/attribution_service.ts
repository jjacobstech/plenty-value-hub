import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import PartnerApiException from '#exceptions/partner_api_exception'
import type Partner from '#models/partner'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerClick from '#models/partner_click'
import PartnerEvent from '#models/partner_event'
import PartnerLink from '#models/partner_link'
import type PartnerProgram from '#models/partner_program'
import { publicId } from '#services/partner/public_id'
import { createCommission, reverseForEvent } from '#services/partner/commission_service'

// Fraud heuristics: small partner-local limits, not the marketplace FraudDetectionService.
const MAX_AFFILIATE_EVENTS_PER_HOUR = 50
const MAX_VISITOR_EVENTS_PER_DAY = 5

type Attribution = {
  status: 'attributed' | 'unattributed' | 'rejected'
  reason: string | null
  affiliate: PartnerAffiliate | null
  link: PartnerLink | null
  click: PartnerClick | null
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
  partner: Partner,
  livemode: boolean,
  program: PartnerProgram,
  input: EventInput,
  occurredAt: DateTime
): Promise<Attribution> {
  const scope = (q: any) => q.where('partner_id', partner.id).where('livemode', livemode)
  let click: PartnerClick | null = null
  let link: PartnerLink | null = null
  let affiliate: PartnerAffiliate | null = null

  if (input.click_id) {
    click = await scope(PartnerClick.query({ client: trx })).where('public_id', input.click_id).first()
    if (!click) return none('no_click')
    const ageSeconds = occurredAt.toSeconds() - click.clickedAt.toSeconds()
    if (ageSeconds > program.attributionWindowDays * 86400) return { ...none('outside_window') }
    link = await PartnerLink.query({ client: trx }).where('id', click.linkId).first()
    affiliate = await PartnerAffiliate.query({ client: trx }).where('id', click.affiliateId).first()
  } else if (input.link_id) {
    link = await scope(PartnerLink.query({ client: trx })).where('public_id', input.link_id).first()
    if (!link) return none('no_click')
    affiliate = await PartnerAffiliate.query({ client: trx }).where('id', link.affiliateId).first()
  } else if (input.affiliate_id) {
    affiliate = await scope(PartnerAffiliate.query({ client: trx })).where('public_id', input.affiliate_id).first()
    if (!affiliate) return none('no_click')
  } else {
    return none('no_click')
  }

  // first_click: the referred customer keeps the click that first brought them in.
  if (program.attributionModel === 'first_click' && input.referred_external_user_id) {
    const first = await scope(PartnerEvent.query({ client: trx }))
      .where('referred_external_user_id', input.referred_external_user_id)
      .where('status', 'attributed')
      .whereNotNull('click_id')
      .orderBy('occurred_at', 'asc')
      .orderBy('id', 'asc')
      .first()
    if (first?.clickId) {
      click = await PartnerClick.query({ client: trx }).where('id', first.clickId).first()
      if (click) {
        link = await PartnerLink.query({ client: trx }).where('id', click.linkId).first()
        affiliate = await PartnerAffiliate.query({ client: trx }).where('id', click.affiliateId).first()
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
  const recent = await scope(PartnerEvent.query({ client: trx }))
    .where('affiliate_id', affiliate.id)
    .where('status', 'attributed')
    .where('occurred_at', '>', hourAgo)
    .count('* as total')
  if (Number(recent[0].$extras.total) >= MAX_AFFILIATE_EVENTS_PER_HOUR) {
    return { ...result, status: 'rejected', reason: 'fraud_suspected' }
  }
  if (click) {
    const dayAgo = occurredAt.minus({ days: 1 }).toSQL()!
    const sameVisitor = await PartnerEvent.query({ client: trx })
      .join('partner_clicks', 'partner_clicks.id', 'partner_events.click_id')
      .where('partner_clicks.visitor_hash', click.visitorHash)
      .where('partner_events.partner_id', partner.id)
      .where('partner_events.livemode', livemode)
      .where('partner_events.status', 'attributed')
      .where('partner_events.occurred_at', '>', dayAgo)
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
export async function recordEvent(partner: Partner, livemode: boolean, program: PartnerProgram, input: EventInput) {
  const scope = (q: any) => q.where('partner_id', partner.id).where('livemode', livemode)

  // Step 1: dedupe on the partner's event_id.
  const existing = await scope(PartnerEvent.query()).where('external_event_id', input.event_id).first()
  if (existing) return { event: existing, created: false }

  // Step 2: type must be allowed for this program. Rejected types are never stored.
  if (!program.allowedEventTypes.includes(input.type)) {
    throw new PartnerApiException(`Event type ${input.type} is not allowed for this program.`, 'invalid_request_error', 'event_type_not_allowed', 400, 'type')
  }
  // Percent commissions need the amount and currency to compute the commission.
  if (program.commissionMode === 'percent' && (input.amount === undefined || !input.currency)) {
    throw new PartnerApiException('amount and currency are required for percent commissions.', 'invalid_request_error', 'parameter_missing', 400, 'amount')
  }

  const occurredAt = input.occurred_at ? DateTime.fromSeconds(input.occurred_at) : DateTime.now()

  return db.transaction(async (trx) => {
    // Insert first so a concurrent duplicate loses here, not after a second attribution run.
    const inserted = await trx.rawQuery(
      `insert into partner_events (public_id, partner_id, livemode, external_event_id, type, status, occurred_at, metadata, created_at, updated_at)
       values (?, ?, ?, ?, ?, 'unattributed', ?, ?::jsonb, now(), now())
       on conflict (partner_id, livemode, external_event_id) do nothing returning id`,
      [publicId('evt_'), partner.id, livemode, input.event_id, input.type, occurredAt.toJSDate(), JSON.stringify(input.metadata ?? {})]
    )
    if (inserted.rows.length === 0) {
      const winner = await scope(PartnerEvent.query({ client: trx })).where('external_event_id', input.event_id).firstOrFail()
      return { event: winner, created: false }
    }

    const event = await PartnerEvent.findOrFail(inserted.rows[0].id, { client: trx })
    const attribution = await resolve(trx, partner, livemode, program, input, occurredAt)

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
    if (attribution.status === 'attributed' && attribution.affiliate) {
      await createCommission(trx, event, attribution.affiliate, program, occurredAt)
    }
    return { event, created: true }
  })
}

/** Reverses an attributed event. Repeating it is harmless; other states are a 422. */
export async function reverseEvent(event: PartnerEvent, reason: string | undefined): Promise<PartnerEvent> {
  if (event.status === 'reversed') return event
  if (event.status !== 'attributed') {
    throw new PartnerApiException(`An event that is ${event.status} cannot be reversed.`, 'invalid_request_error', 'invalid_state_transition', 422)
  }
  event.status = 'reversed'
  event.reason = 'reversed_by_partner'
  if (reason) event.metadata = { ...event.metadata, reversal_reason: reason }
  return db.transaction(async (trx) => {
    await event.useTransaction(trx).save()
    await reverseForEvent(event.id, 'reversed_by_partner', trx)
    return event
  })
}
