import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PartnerApiException from '#exceptions/partner_api_exception'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerCommission from '#models/partner_commission'
import db from '@adonisjs/lucid/services/db'
import { transition } from '#services/partner/commission_service'
import { cursorPage, parseLimit } from '#services/partner/pagination'
import { commissionToApi } from '#services/partner/serialize'
import { emit } from '#services/partner/webhook_emitter'
import { markPaidValidator, rejectCommissionValidator, rejectUnknownFields } from '#validators/partner_api'

export default class CommissionsController {
  private async findOwn({ partner, livemode }: HttpContext, id: string): Promise<PartnerCommission> {
    const commission = id.startsWith('com_')
      ? await PartnerCommission.query()
          .where('public_id', id)
          .where('partner_id', partner.id)
          .where('livemode', livemode)
          .preload('event')
          .preload('affiliate')
          .first()
      : null
    if (!commission) throw new PartnerApiException('No such commission.', 'invalid_request_error', 'resource_missing', 404, 'id')
    return commission
  }

  /** Moves a commission to a new state and writes the matching event to the outbox, in one transaction. */
  private async move(ctx: HttpContext, to: 'approved' | 'rejected', fields: { reason?: string } = {}) {
    const commission = await this.findOwn(ctx, ctx.params.id)
    return db.transaction(async (trx) => {
      await transition(commission, to, fields, trx)
      await emit(trx, commission.partnerId, commission.livemode, `commission.${to}`, commissionToApi(commission))
      return commission
    })
  }

  /** GET /v1/commissions */
  async index({ request, response, partner, livemode }: HttpContext) {
    const limit = parseLimit(request.input('limit'))
    let query = PartnerCommission.query()
      .where('partner_id', partner.id)
      .where('livemode', livemode)
      .preload('event')
      .preload('affiliate')
    if (request.input('status')) query = query.where('status', request.input('status'))
    if (request.input('from')) query = query.where('created_at', '>=', DateTime.fromSeconds(Number(request.input('from'))).toSQL()!)
    if (request.input('to')) query = query.where('created_at', '<=', DateTime.fromSeconds(Number(request.input('to'))).toSQL()!)
    if (request.input('affiliate')) {
      const affiliate = await PartnerAffiliate.query()
        .where('public_id', String(request.input('affiliate')))
        .where('partner_id', partner.id)
        .where('livemode', livemode)
        .first()
      query = query.where('affiliate_id', affiliate?.id ?? 0)
    }
    const page = await cursorPage<PartnerCommission>(query, limit, request.input('starting_after'))
    return response.json({ ...page, data: page.data.map(commissionToApi) })
  }

  /** GET /v1/commissions/:id */
  async show(ctx: HttpContext) {
    return ctx.response.json(commissionToApi(await this.findOwn(ctx, ctx.params.id)))
  }

  /** POST /v1/commissions/:id/approve: approve a pending commission before its hold ends. */
  async approve(ctx: HttpContext) {
    const commission = await this.move(ctx, 'approved')
    return ctx.response.json(commissionToApi(commission))
  }

  /** POST /v1/commissions/:id/reject */
  async reject(ctx: HttpContext) {
    rejectUnknownFields(ctx.request.body(), ['reason'])
    const data = await ctx.request.validateUsing(rejectCommissionValidator)
    const commission = await this.move(ctx, 'rejected', { reason: data.reason })
    return ctx.response.json(commissionToApi(commission))
  }

  /**
   * POST /v1/commissions/:id/mark_paid: records the partner's own payout reference. Informational;
   * Plenty Value never moves money. Repeating the same reference is harmless.
   */
  async markPaid(ctx: HttpContext) {
    rejectUnknownFields(ctx.request.body(), ['payout_reference'])
    const data = await ctx.request.validateUsing(markPaidValidator)
    const commission = await this.findOwn(ctx, ctx.params.id)

    if (commission.paidAt) {
      if (commission.payoutReference === data.payout_reference) return ctx.response.json(commissionToApi(commission))
      throw new PartnerApiException('This commission is already marked paid.', 'invalid_request_error', 'invalid_state_transition', 422)
    }
    if (commission.status !== 'approved') {
      throw new PartnerApiException('Only approved commissions can be marked paid.', 'invalid_request_error', 'invalid_state_transition', 422)
    }
    commission.paidAt = DateTime.now()
    commission.payoutReference = data.payout_reference
    await db.transaction(async (trx) => {
      await commission.useTransaction(trx).save()
      await emit(trx, commission.partnerId, commission.livemode, 'commission.paid', commissionToApi(commission))
    })
    return ctx.response.json(commissionToApi(commission))
  }
}
