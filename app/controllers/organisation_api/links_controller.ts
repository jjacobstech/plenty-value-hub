import type { HttpContext } from '@adonisjs/core/http'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationLink from '#models/organisation_link'
import db from '@adonisjs/lucid/services/db'
import { emit } from '#services/organisation/webhook_emitter'
import { cursorPage, parseLimit } from '#services/organisation/pagination'
import { assertDestinationAllowed, createOrGetLink } from '#services/organisation/link_service'
import { linkToApi } from '#services/organisation/serialize'
import { createLinkValidator, rejectUnknownFields } from '#validators/organisation_api'

const CREATE_FIELDS = ['affiliate', 'product_ref', 'campaign_ref', 'destination_url', 'update_destination', 'metadata']


export default class LinksController {
  /** Loads a link in the caller's organisation and mode. Anything else is a 404, never a 403. */
  private async findOwn({ organisation, livemode }: HttpContext, id: string): Promise<OrganisationLink> {
    const link = id.startsWith('lnk_')
      ? await OrganisationLink.query()
          .where('public_id', id)
          .where('organisation_id', organisation.id)
          .where('livemode', livemode)
          .preload('affiliate')
          .first()
      : null
    if (!link) throw new OrganisationApiException('No such link.', 'invalid_request_error', 'resource_missing', 404, 'id')
    return link
  }

  /** POST /api/v1/organisations/links: create or get for an affiliate, product and campaign. */
  async create({ request, response, organisation, livemode }: HttpContext) {
    rejectUnknownFields(request.body(), CREATE_FIELDS)
    const data = await request.validateUsing(createLinkValidator)

    if (data.metadata && Object.keys(data.metadata).length > 20) {
      throw new OrganisationApiException('metadata can have at most 20 keys.', 'invalid_request_error', 'parameter_invalid', 400, 'metadata')
    }
    assertDestinationAllowed(organisation, data.destination_url, livemode)

    const affiliate = data.affiliate.startsWith('aff_')
      ? await OrganisationAffiliate.query()
          .where('public_id', data.affiliate)
          .where('organisation_id', organisation.id)
          .where('livemode', livemode)
          .first()
      : null
    if (!affiliate) {
      throw new OrganisationApiException('No such affiliate.', 'invalid_request_error', 'parameter_invalid', 400, 'affiliate')
    }
    if (affiliate.status !== 'active') {
      throw new OrganisationApiException('The affiliate is not active.', 'invalid_request_error', 'affiliate_not_active', 422, 'affiliate')
    }

    const link = await db.transaction(async (trx) => {
      const result = await createOrGetLink({
        trx,
        organisation,
        livemode,
        affiliate,
        productRef: data.product_ref ?? null,
        campaignRef: data.campaign_ref ?? null,
        destinationUrl: data.destination_url,
        updateDestination: data.update_destination ?? false,
        metadata: data.metadata ?? {},
      })
      await result.link.useTransaction(trx).load('affiliate')
      if (result.created) await emit(trx, organisation.id, livemode, 'link.created', linkToApi(result.link))
      return result
    })
    return response.status(link.created ? 201 : 200).json(linkToApi(link.link))
  }

  /** GET /api/v1/organisations/links */
  async index({ request, response, organisation, livemode }: HttpContext) {
    const limit = parseLimit(request.input('limit'))
    let query = OrganisationLink.query().where('organisation_id', organisation.id).where('livemode', livemode).preload('affiliate')
    if (request.input('product_ref')) query = query.where('product_ref', request.input('product_ref'))
    if (request.input('campaign_ref')) query = query.where('campaign_ref', request.input('campaign_ref'))
    if (request.input('affiliate')) {
      const affiliate = await OrganisationAffiliate.query()
        .where('public_id', String(request.input('affiliate')))
        .where('organisation_id', organisation.id)
        .where('livemode', livemode)
        .first()
      query = query.where('affiliate_id', affiliate?.id ?? 0)
    }
    const page = await cursorPage<OrganisationLink>(query, limit, request.input('starting_after'))
    return response.json({ ...page, data: page.data.map(linkToApi) })
  }

  /** GET /api/v1/organisations/links/:id */
  async show(ctx: HttpContext) {
    return ctx.response.json(linkToApi(await this.findOwn(ctx, ctx.params.id)))
  }

  /** POST /api/v1/organisations/links/:id/disable: the redirect stops working for this link. Repeating it is harmless. */
  async disable(ctx: HttpContext) {
    const link = await this.findOwn(ctx, ctx.params.id)
    if (link.status !== 'disabled') {
      link.status = 'disabled'
      await link.save()
    }
    return ctx.response.json(linkToApi(link))
  }
}
