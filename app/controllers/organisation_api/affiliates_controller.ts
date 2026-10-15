import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import OrganisationAffiliate from '#models/organisation_affiliate'
import { publicId } from '#services/organisation/public_id'
import { affiliateToApi } from '#services/organisation/serialize'
import { emit } from '#services/organisation/webhook_emitter'
import { parseGroupBy, parseWindow, statsResponse } from '#services/organisation/stats_service'
import { cursorPage, parseLimit } from '#services/organisation/pagination'
import { createAffiliateValidator, rejectUnknownFields, updateAffiliateValidator } from '#validators/organisation_api'

const CREATE_FIELDS = ['external_user_id', 'email', 'display_name', 'metadata']
const UPDATE_FIELDS = ['status', 'email', 'display_name', 'metadata']

const MAX_METADATA_KEYS = 20

function assertMetadataSize(metadata: Record<string, string> | null | undefined) {
  if (metadata && Object.keys(metadata).length > MAX_METADATA_KEYS) {
    throw new OrganisationApiException(`metadata can have at most ${MAX_METADATA_KEYS} keys.`, 'invalid_request_error', 'parameter_invalid', 400, 'metadata')
  }
}

export default class AffiliatesController {
  /** Loads an affiliate in the caller's organisation and mode. Anything else is a 404, never a 403. */
  private async findOwn({ organisation, livemode }: HttpContext, id: string): Promise<OrganisationAffiliate> {
    const affiliate = id.startsWith('aff_')
      ? await OrganisationAffiliate.query()
          .where('public_id', id)
          .where('organisation_id', organisation.id)
          .where('livemode', livemode)
          .first()
      : null
    if (!affiliate) {
      throw new OrganisationApiException('No such affiliate.', 'invalid_request_error', 'resource_missing', 404, 'id')
    }
    return affiliate
  }

  /** POST /api/v1/organisations/affiliates: create or get by external_user_id. 201 when created, 200 when it existed. */
  async create({ request, response, organisation, livemode }: HttpContext) {
    rejectUnknownFields(request.body(), CREATE_FIELDS)
    const data = await request.validateUsing(createAffiliateValidator)
    assertMetadataSize(data.metadata)

    return db.transaction(async (trx) => {
      // One statement, so concurrent creates for the same external_user_id produce one row.
      // The bindings cast is needed because the driver typing rejects null values.
      const bindings = [publicId('aff_'), organisation.id, livemode, data.external_user_id, data.email ?? null, data.display_name ?? null, JSON.stringify(data.metadata ?? {})] as any[]
      const inserted = await trx.rawQuery(
        `insert into organisation_affiliates (public_id, organisation_id, livemode, external_user_id, status, email, display_name, metadata, created_at, updated_at)
         values (?, ?, ?, ?, 'active', ?, ?, ?::jsonb, now(), now())
         on conflict (organisation_id, livemode, external_user_id) do nothing returning id`,
        bindings
      )

      if (inserted.rows.length > 0) {
        const affiliate = await OrganisationAffiliate.query({ client: trx }).where('id', inserted.rows[0].id).firstOrFail()
        await emit(trx, organisation.id, livemode, 'affiliate.created', affiliateToApi(affiliate))
        return response.status(201).json(affiliateToApi(affiliate))
      }

      const existing = await OrganisationAffiliate.query({ client: trx })
        .where('organisation_id', organisation.id)
        .where('livemode', livemode)
        .where('external_user_id', data.external_user_id)
        .firstOrFail()
      return response.status(200).json(affiliateToApi(existing))
    })
  }

  /** GET /api/v1/organisations/affiliates: cursor-paginated list with optional external_user_id and status filters. */
  async index({ request, response, organisation, livemode }: HttpContext) {
    const limit = parseLimit(request.input('limit'))
    let query = OrganisationAffiliate.query().where('organisation_id', organisation.id).where('livemode', livemode)
    if (request.input('external_user_id')) query = query.where('external_user_id', request.input('external_user_id'))
    if (request.input('status')) query = query.where('status', request.input('status'))

    const page = await cursorPage<OrganisationAffiliate>(query, limit, request.input('starting_after'))
    return response.json({ ...page, data: page.data.map(affiliateToApi) })
  }

  /** GET /api/v1/organisations/affiliates/:id */
  async show(ctx: HttpContext) {
    const affiliate = await this.findOwn(ctx, ctx.params.id)
    return ctx.response.json(affiliateToApi(affiliate))
  }

  /** PATCH /api/v1/organisations/affiliates/:id: status, display fields and metadata. Omitted fields are unchanged. */
  async update(ctx: HttpContext) {
    const affiliate = await this.findOwn(ctx, ctx.params.id)
    rejectUnknownFields(ctx.request.body(), UPDATE_FIELDS)
    const data = await ctx.request.validateUsing(updateAffiliateValidator)
    assertMetadataSize(data.metadata)

    if (data.status !== undefined) affiliate.status = data.status
    if (data.email !== undefined) affiliate.email = data.email ?? null
    if (data.display_name !== undefined) affiliate.displayName = data.display_name ?? null
    if (data.metadata !== undefined) affiliate.metadata = data.metadata ?? {}
    await db.transaction(async (trx) => {
      await affiliate.useTransaction(trx).save()
      await emit(trx, ctx.organisation.id, ctx.livemode, 'affiliate.updated', affiliateToApi(affiliate))
    })

    return ctx.response.json(affiliateToApi(affiliate))
  }

  /** GET /api/v1/organisations/affiliates/:id/stats: one affiliate's totals, optionally grouped by day, product or campaign. */
  async stats(ctx: HttpContext) {
    const affiliate = await this.findOwn(ctx, ctx.params.id)
    const { from, to } = parseWindow(ctx.request.input('from'), ctx.request.input('to'))
    const groupBy = parseGroupBy(ctx.request.input('group_by'), ['none', 'day', 'product', 'campaign'])
    const body = await statsResponse({ organisationId: ctx.organisation.id, livemode: ctx.livemode, from, to, affiliateId: affiliate.id }, groupBy, false)
    return ctx.response.json(body)
  }
}
