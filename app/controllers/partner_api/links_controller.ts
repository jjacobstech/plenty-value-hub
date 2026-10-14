import type { HttpContext } from '@adonisjs/core/http'
import PartnerApiException from '#exceptions/partner_api_exception'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerLink from '#models/partner_link'
import db from '@adonisjs/lucid/services/db'
import { emit } from '#services/partner/webhook_emitter'
import { cursorPage, parseLimit } from '#services/partner/pagination'
import { assertDestinationAllowed, createOrGetLink } from '#services/partner/link_service'
import { linkToApi } from '#services/partner/serialize'
import { createLinkValidator, rejectUnknownFields } from '#validators/partner_api'

const CREATE_FIELDS = ['affiliate', 'product_ref', 'campaign_ref', 'destination_url', 'update_destination', 'metadata']


export default class LinksController {
  /** Loads a link in the caller's partner and mode. Anything else is a 404, never a 403. */
  private async findOwn({ partner, livemode }: HttpContext, id: string): Promise<PartnerLink> {
    const link = id.startsWith('lnk_')
      ? await PartnerLink.query()
          .where('public_id', id)
          .where('partner_id', partner.id)
          .where('livemode', livemode)
          .preload('affiliate')
          .first()
      : null
    if (!link) throw new PartnerApiException('No such link.', 'invalid_request_error', 'resource_missing', 404, 'id')
    return link
  }

  /** POST /v1/links: create or get for an affiliate, product and campaign. */
  async create({ request, response, partner, livemode }: HttpContext) {
    rejectUnknownFields(request.body(), CREATE_FIELDS)
    const data = await request.validateUsing(createLinkValidator)

    if (data.metadata && Object.keys(data.metadata).length > 20) {
      throw new PartnerApiException('metadata can have at most 20 keys.', 'invalid_request_error', 'parameter_invalid', 400, 'metadata')
    }
    assertDestinationAllowed(partner, data.destination_url, livemode)

    const affiliate = data.affiliate.startsWith('aff_')
      ? await PartnerAffiliate.query()
          .where('public_id', data.affiliate)
          .where('partner_id', partner.id)
          .where('livemode', livemode)
          .first()
      : null
    if (!affiliate) {
      throw new PartnerApiException('No such affiliate.', 'invalid_request_error', 'parameter_invalid', 400, 'affiliate')
    }
    if (affiliate.status !== 'active') {
      throw new PartnerApiException('The affiliate is not active.', 'invalid_request_error', 'affiliate_not_active', 422, 'affiliate')
    }

    const link = await db.transaction(async (trx) => {
      const result = await createOrGetLink({
        trx,
        partner,
        livemode,
        affiliate,
        productRef: data.product_ref ?? null,
        campaignRef: data.campaign_ref ?? null,
        destinationUrl: data.destination_url,
        updateDestination: data.update_destination ?? false,
        metadata: data.metadata ?? {},
      })
      await result.link.useTransaction(trx).load('affiliate')
      if (result.created) await emit(trx, partner.id, livemode, 'link.created', linkToApi(result.link))
      return result
    })
    return response.status(link.created ? 201 : 200).json(linkToApi(link.link))
  }

  /** GET /v1/links */
  async index({ request, response, partner, livemode }: HttpContext) {
    const limit = parseLimit(request.input('limit'))
    let query = PartnerLink.query().where('partner_id', partner.id).where('livemode', livemode).preload('affiliate')
    if (request.input('product_ref')) query = query.where('product_ref', request.input('product_ref'))
    if (request.input('campaign_ref')) query = query.where('campaign_ref', request.input('campaign_ref'))
    if (request.input('affiliate')) {
      const affiliate = await PartnerAffiliate.query()
        .where('public_id', String(request.input('affiliate')))
        .where('partner_id', partner.id)
        .where('livemode', livemode)
        .first()
      query = query.where('affiliate_id', affiliate?.id ?? 0)
    }
    const page = await cursorPage<PartnerLink>(query, limit, request.input('starting_after'))
    return response.json({ ...page, data: page.data.map(linkToApi) })
  }

  /** GET /v1/links/:id */
  async show(ctx: HttpContext) {
    return ctx.response.json(linkToApi(await this.findOwn(ctx, ctx.params.id)))
  }

  /** POST /v1/links/:id/disable: the redirect stops working for this link. Repeating it is harmless. */
  async disable(ctx: HttpContext) {
    const link = await this.findOwn(ctx, ctx.params.id)
    if (link.status !== 'disabled') {
      link.status = 'disabled'
      await link.save()
    }
    return ctx.response.json(linkToApi(link))
  }
}
