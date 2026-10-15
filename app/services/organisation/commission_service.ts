import { Decimal } from 'decimal.js'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import OrganisationCommission from '#models/organisation_commission'
import OrganisationEvent from '#models/organisation_event'
import type OrganisationAffiliate from '#models/organisation_affiliate'
import type OrganisationProgram from '#models/organisation_program'
import { publicId } from '#services/organisation/public_id'
import { commissionToApi } from '#services/organisation/serialize'
import { emit } from '#services/organisation/webhook_emitter'

const TRANSITIONS: Record<OrganisationCommission['status'], OrganisationCommission['status'][]> = {
  pending: ['approved', 'rejected', 'reversed'],
  approved: ['reversed'],
  rejected: [],
  reversed: [],
}

/**
 * Commission for an attributed event, or null when the program pays none. Percent commissions use
 * integer minor units and round half-up (SPEC §2, rule 5).
 */
export function calculateCommission(program: OrganisationProgram, eventAmount: number | null, eventCurrency: string | null) {
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
  event: OrganisationEvent,
  affiliate: OrganisationAffiliate,
  program: OrganisationProgram,
  occurredAt: DateTime
): Promise<OrganisationCommission | null> {
  const amounts = calculateCommission(program, event.amount, event.currency)
  if (!amounts) return null
  return OrganisationCommission.create(
    {
      publicId: publicId('com_'),
      organisationId: event.organisationId,
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
  commission: OrganisationCommission,
  to: OrganisationCommission['status'],
  fields: { reason?: string } = {},
  trx?: TransactionClientContract
): Promise<OrganisationCommission> {
  if (!TRANSITIONS[commission.status].includes(to)) {
    throw new OrganisationApiException(`A ${commission.status} commission cannot move to ${to}.`, 'invalid_request_error', 'invalid_state_transition', 422)
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
  const commission = await OrganisationCommission.query({ client: trx }).where('event_id', eventId).first()
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
  const due = await OrganisationCommission.query()
    .select('organisation_commissions.*')
    .preload('event')
    .preload('affiliate')
    .join('organisation_programs', (join) => {
      join.on('organisation_programs.organisation_id', '=', 'organisation_commissions.organisation_id').andOn('organisation_programs.livemode', '=', 'organisation_commissions.livemode')
    })
    .where('organisation_commissions.status', 'pending')
    .where('organisation_commissions.hold_until', '<=', now.toSQL()!)
    .where('organisation_programs.auto_approve_after_hold', true)
  for (const commission of due) {
    await db.transaction(async (trx) => {
      commission.status = 'approved'
      commission.approvedAt = now
      await commission.useTransaction(trx).save()
      await emit(trx, commission.organisationId, commission.livemode, 'commission.approved', commissionToApi(commission))
    })
  }
  return due.length
}
