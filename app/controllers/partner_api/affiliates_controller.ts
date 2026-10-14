import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import PartnerApiException from '#exceptions/partner_api_exception'
import PartnerAffiliate from '#models/partner_affiliate'
import { publicId } from '#services/partner/public_id'
import { affiliateToApi } from '#services/partner/serialize'
import { emit } from '#services/partner/webhook_emitter'
import { cursorPage, parseLimit } from '#services/partner/pagination'
import { createAffiliateValidator, rejectUnknownFields, updateAffiliateValidator } from '#validators/partner_api'

const CREATE_FIELDS = ['external_user_id', 'email', 'display_name', 'metadata']
const UPDATE_FIELDS = ['status', 'email', 'display_name', 'metadata']

const MAX_METADATA_KEYS = 20

function assertMetadataSize(metadata: Record<string, string> | null | undefined) {
  if (metadata && Object.keys(metadata).length > MAX_METADATA_KEYS) {
    throw new PartnerApiException(`metadata can have at most ${MAX_METADATA_KEYS} keys.`, 'invalid_request_error', 'parameter_invalid', 400, 'metadata')
  }
}

export default class AffiliatesController {
  /** Loads an affiliate in the caller's partner and mode. Anything else is a 404, never a 403. */
  private async findOwn({ partner, livemode }: HttpContext, id: string): Promise<PartnerAffiliate> {
    const affiliate = id.startsWith('aff_')
      ? await PartnerAffiliate.query()
          .where('public_id', id)
          .where('partner_id', partner.id)
          .where('livemode', livemode)
          .first()
      : null
    if (!affiliate) {
      throw new PartnerApiException('No such affiliate.', 'invalid_request_error', 'resource_missing', 404, 'id')
    }
    return affiliate
  }

  /** POST /v1/affiliates: create or get by external_user_id. 201 when created, 200 when it existed. */
  async create({ request, response, partner, livemode }: HttpContext) {
    rejectUnknownFields(request.body(), CREATE_FIELDS)
    const data = await request.validateUsing(createAffiliateValidator)
    assertMetadataSize(data.metadata)

    return db.transaction(async (trx) => {
      // One statement, so concurrent creates for the same external_user_id produce one row.
      // The bindings cast is needed because the driver typing rejects null values.
      const bindings = [publicId('aff_'), partner.id, livemode, data.external_user_id, data.email ?? null, data.display_name ?? null, JSON.stringify(data.metadata ?? {})] as any[]
      const inserted = await trx.rawQuery(
        `insert into partner_affiliates (public_id, partner_id, livemode, external_user_id, status, email, display_name, metadata, created_at, updated_at)
         values (?, ?, ?, ?, 'active', ?, ?, ?::jsonb, now(), now())
         on conflict (partner_id, livemode, external_user_id) do nothing returning id`,
        bindings
      )

      if (inserted.rows.length > 0) {
        const affiliate = await PartnerAffiliate.query({ client: trx }).where('id', inserted.rows[0].id).firstOrFail()
        await emit(trx, partner.id, livemode, 'affiliate.created', affiliateToApi(affiliate))
        return response.status(201).json(affiliateToApi(affiliate))
      }

      const existing = await PartnerAffiliate.query({ client: trx })
        .where('partner_id', partner.id)
        .where('livemode', livemode)
        .where('external_user_id', data.external_user_id)
        .firstOrFail()
      return response.status(200).json(affiliateToApi(existing))
    })
  }

  /** GET /v1/affiliates: cursor-paginated list with optional external_user_id and status filters. */
  async index({ request, response, partner, livemode }: HttpContext) {
    const limit = parseLimit(request.input('limit'))
    let query = PartnerAffiliate.query().where('partner_id', partner.id).where('livemode', livemode)
    if (request.input('external_user_id')) query = query.where('external_user_id', request.input('external_user_id'))
    if (request.input('status')) query = query.where('status', request.input('status'))

    const page = await cursorPage<PartnerAffiliate>(query, limit, request.input('starting_after'))
    return response.json({ ...page, data: page.data.map(affiliateToApi) })
  }

  /** GET /v1/affiliates/:id */
  async show(ctx: HttpContext) {
    const affiliate = await this.findOwn(ctx, ctx.params.id)
    return ctx.response.json(affiliateToApi(affiliate))
  }

  /** PATCH /v1/affiliates/:id: status, display fields and metadata. Omitted fields are unchanged. */
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
      await emit(trx, ctx.partner.id, ctx.livemode, 'affiliate.updated', affiliateToApi(affiliate))
    })

    return ctx.response.json(affiliateToApi(affiliate))
  }
}
