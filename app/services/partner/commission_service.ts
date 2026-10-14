import { Decimal } from 'decimal.js'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import PartnerApiException from '#exceptions/partner_api_exception'
import PartnerCommission from '#models/partner_commission'
import PartnerEvent from '#models/partner_event'
import type PartnerAffiliate from '#models/partner_affiliate'
import type PartnerProgram from '#models/partner_program'
import { publicId } from '#services/partner/public_id'
import { commissionToApi } from '#services/partner/serialize'
import { emit } from '#services/partner/webhook_emitter'

const TRANSITIONS: Record<PartnerCommission['status'], PartnerCommission['status'][]> = {
  pending: ['approved', 'rejected', 'reversed'],
  approved: ['reversed'],
  rejected: [],
  reversed: [],
}

/**
 * Commission for an attributed event, or null when the program pays none. Percent commissions use
 * integer minor units and round half-up (SPEC §2, rule 5).
 */
export function calculateCommission(program: PartnerProgram, eventAmount: number | null, eventCurrency: string | null) {
  if (program.commissionMode === 'flat' && program.commissionFlatAmount !== null) {
    const currency = program.commissionCurrency ?? eventCurrency
    return currency ? { amount: program.commissionFlatAmount, currency } : null
  }
  if (program.commissionMode === 'percent' && program.commissionPercentBps !== null && eventAmount !== null && eventCurrency) {
    const amount = new Decimal(eventAmount).times(program.commissionPercentBps).div(10000).toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    return { amount: amount.toNumber(), currency: eventCurrency }
  }
  return null
}

/** Creates the pending commission for an attributed event, inside the caller's transaction. */
export async function createCommission(
  trx: TransactionClientContract,
  event: PartnerEvent,
  affiliate: PartnerAffiliate,
  program: PartnerProgram,
  occurredAt: DateTime
): Promise<PartnerCommission | null> {
  const amounts = calculateCommission(program, event.amount, event.currency)
  if (!amounts) return null
  return PartnerCommission.create(
    {
      publicId: publicId('com_'),
      partnerId: event.partnerId,
      livemode: event.livemode,
      eventId: event.id,
      affiliateId: affiliate.id,
      affiliateExternalUserId: affiliate.externalUserId,
      amount: amounts.amount,
      currency: amounts.currency,
      status: 'pending',
      holdUntil: occurredAt.plus({ days: program.commissionHoldDays }),
    },
    { client: trx }
  )
}

/** Moves a commission to a new state, or fails with 422 invalid_state_transition. */
export async function transition(
  commission: PartnerCommission,
  to: PartnerCommission['status'],
  fields: { reason?: string } = {},
  trx?: TransactionClientContract
): Promise<PartnerCommission> {
  if (!TRANSITIONS[commission.status].includes(to)) {
    throw new PartnerApiException(`A ${commission.status} commission cannot move to ${to}.`, 'invalid_request_error', 'invalid_state_transition', 422)
  }
  const now = DateTime.now()
  commission.status = to
  if (to === 'approved') commission.approvedAt = now
  if (to === 'rejected') commission.rejectedAt = now
  if (to === 'reversed') commission.reversedAt = now
  if (fields.reason !== undefined) commission.reason = fields.reason
  if (trx) commission.useTransaction(trx)
  await commission.save()
  return commission
}

/** A reversed event reverses its commission whatever state the commission is in (SPEC §8). */
export async function reverseForEvent(eventId: number, reason: string, trx?: TransactionClientContract) {
  const commission = await PartnerCommission.query({ client: trx }).where('event_id', eventId).first()
  if (!commission || commission.status === 'reversed') return { commission, changed: false }
  commission.status = 'reversed'
  commission.reversedAt = DateTime.now()
  commission.reason = reason
  if (trx) commission.useTransaction(trx)
  await commission.save()
  return { commission, changed: true }
}

/** Auto-approves pending commissions whose hold has ended, for programs that allow it. Returns how many. */
export async function approveDueCommissions(now: DateTime = DateTime.now()): Promise<number> {
  const due = await PartnerCommission.query()
    .select('partner_commissions.*')
    .preload('event')
    .preload('affiliate')
    .join('partner_programs', (join) => {
      join.on('partner_programs.partner_id', '=', 'partner_commissions.partner_id').andOn('partner_programs.livemode', '=', 'partner_commissions.livemode')
    })
    .where('partner_commissions.status', 'pending')
    .where('partner_commissions.hold_until', '<=', now.toSQL()!)
    .where('partner_programs.auto_approve_after_hold', true)
  for (const commission of due) {
    await db.transaction(async (trx) => {
      commission.status = 'approved'
      commission.approvedAt = now
      await commission.useTransaction(trx).save()
      await emit(trx, commission.partnerId, commission.livemode, 'commission.approved', commissionToApi(commission))
    })
  }
  return due.length
}
