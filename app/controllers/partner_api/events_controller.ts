import type { HttpContext } from '@adonisjs/core/http'
import PartnerApiException from '#exceptions/partner_api_exception'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerEvent from '#models/partner_event'
import PartnerProgram from '#models/partner_program'
import { recordEvent, reverseEvent } from '#services/partner/attribution_service'
import { cursorPage, parseLimit } from '#services/partner/pagination'
import { eventToApi } from '#services/partner/serialize'
import { createEventValidator, rejectUnknownFields, reverseEventValidator } from '#validators/partner_api'
import { DateTime } from 'luxon'

const CREATE_FIELDS = ['event_id', 'type', 'click_id', 'link_id', 'affiliate_id', 'referred_external_user_id', 'amount', 'currency', 'occurred_at', 'metadata']

export default class EventsController {
  private async findOwn({ partner, livemode }: HttpContext, id: string): Promise<PartnerEvent> {
    const event = id.startsWith('evt_')
      ? await PartnerEvent.query()
          .where('public_id', id)
          .where('partner_id', partner.id)
          .where('livemode', livemode)
          .preload('click')
          .preload('affiliate')
          .preload('link')
          .first()
      : null
    if (!event) throw new PartnerApiException('No such event.', 'invalid_request_error', 'resource_missing', 404, 'id')
    return event
  }

  /** POST /v1/events */
  async create({ request, response, partner, livemode }: HttpContext) {
    rejectUnknownFields(request.body(), CREATE_FIELDS)
    const data = await request.validateUsing(createEventValidator)

    const hints = [data.click_id, data.link_id, data.affiliate_id].filter(Boolean)
    if (hints.length > 1) {
      throw new PartnerApiException('Send only one of click_id, link_id or affiliate_id.', 'invalid_request_error', 'parameter_invalid', 400, 'click_id')
    }
    if (data.metadata && Object.keys(data.metadata).length > 20) {
      throw new PartnerApiException('metadata can have at most 20 keys.', 'invalid_request_error', 'parameter_invalid', 400, 'metadata')
    }

    const program = await PartnerProgram.query().where('partner_id', partner.id).where('livemode', livemode).firstOrFail()
    const { event, created } = await recordEvent(partner, livemode, program, data)
    await event.load('click')
    await event.load('affiliate')
    await event.load('link')
    return response.status(created ? 201 : 200).json(eventToApi(event))
  }

  /** GET /v1/events */
  async index({ request, response, partner, livemode }: HttpContext) {
    const limit = parseLimit(request.input('limit'))
    let query = PartnerEvent.query()
      .where('partner_id', partner.id)
      .where('livemode', livemode)
      .preload('click')
      .preload('affiliate')
      .preload('link')
    if (request.input('status')) query = query.where('status', request.input('status'))
    if (request.input('type')) query = query.where('type', request.input('type'))
    if (request.input('from')) query = query.where('occurred_at', '>=', DateTime.fromSeconds(Number(request.input('from'))).toSQL()!)
    if (request.input('to')) query = query.where('occurred_at', '<=', DateTime.fromSeconds(Number(request.input('to'))).toSQL()!)
    if (request.input('affiliate')) {
      const affiliate = await PartnerAffiliate.query()
        .where('public_id', String(request.input('affiliate')))
        .where('partner_id', partner.id)
        .where('livemode', livemode)
        .first()
      query = query.where('affiliate_id', affiliate?.id ?? 0)
    }
    const page = await cursorPage<PartnerEvent>(query, limit, request.input('starting_after'))
    return response.json({ ...page, data: page.data.map(eventToApi) })
  }

  /** GET /v1/events/:id */
  async show(ctx: HttpContext) {
    return ctx.response.json(eventToApi(await this.findOwn(ctx, ctx.params.id)))
  }

  /** POST /v1/events/:id/reverse */
  async reverse(ctx: HttpContext) {
    const event = await this.findOwn(ctx, ctx.params.id)
    const data = await ctx.request.validateUsing(reverseEventValidator)
    const reversed = await reverseEvent(event, data.reason)
    return ctx.response.json(eventToApi(reversed))
  }
}
