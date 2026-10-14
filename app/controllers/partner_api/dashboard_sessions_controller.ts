import type { HttpContext } from '@adonisjs/core/http'
import PartnerApiException from '#exceptions/partner_api_exception'
import PartnerAffiliate from '#models/partner_affiliate'
import { assertReturnUrlAllowed, createDashboardSession } from '#services/partner/dashboard_session_service'
import { rejectUnknownFields } from '#validators/partner_api'
import vine from '@vinejs/vine'

const returnValidator = vine.create(vine.object({ return_url: vine.string().url({ protocols: ['https', 'http'] }).maxLength(2048).optional() }))

export default class DashboardSessionsController {
  /** POST /v1/affiliates/:id/dashboard_sessions: a single-use link to the hosted affiliate dashboard. */
  async create(ctx: HttpContext) {
    rejectUnknownFields(ctx.request.body(), ['return_url'])
    const data = await ctx.request.validateUsing(returnValidator)
    const affiliate = ctx.params.id.startsWith('aff_')
      ? await PartnerAffiliate.query().where('public_id', ctx.params.id).where('partner_id', ctx.partner.id).where('livemode', ctx.livemode).first()
      : null
    if (!affiliate) throw new PartnerApiException('No such affiliate.', 'invalid_request_error', 'resource_missing', 404, 'id')
    if (data.return_url) assertReturnUrlAllowed(ctx.partner, data.return_url)

    const session = await createDashboardSession(ctx.partner, ctx.livemode, affiliate, data.return_url)
    return ctx.response.status(201).json({ object: 'dashboard_session', url: session.url, expires_at: Math.floor(session.expiresAt.toSeconds()) })
  }
}
