import vine from '@vinejs/vine'
import PartnerApiException from '#exceptions/partner_api_exception'

const metadata = vine.record(vine.string().maxLength(500))

export const createAffiliateValidator = vine.create(
  vine.object({
    external_user_id: vine.string().trim().minLength(1).maxLength(191),
    email: vine.string().email().optional(),
    display_name: vine.string().trim().maxLength(120).optional(),
    metadata: metadata.optional(),
  })
)

export const updateAffiliateValidator = vine.create(
  vine.object({
    status: vine.enum(['active', 'suspended', 'closed'] as const).optional(),
    email: vine.string().email().nullable().optional(),
    display_name: vine.string().trim().maxLength(120).nullable().optional(),
    metadata: metadata.nullable().optional(),
  })
)

/** VineJS drops unknown fields; the partner API rejects them (SPEC §6, parameter_unknown). */
export function rejectUnknownFields(body: Record<string, unknown>, allowed: readonly string[]) {
  const unknown = Object.keys(body ?? {}).find((key) => !allowed.includes(key))
  if (unknown) {
    throw new PartnerApiException(`Unknown field: ${unknown}.`, 'invalid_request_error', 'parameter_unknown', 400, unknown)
  }
}

export const createLinkValidator = vine.create(
  vine.object({
    affiliate: vine.string().trim().minLength(1).maxLength(64),
    product_ref: vine.string().trim().maxLength(191).optional(),
    campaign_ref: vine.string().trim().maxLength(191).optional(),
    destination_url: vine.string().url({ protocols: ['http', 'https'] }).maxLength(2048),
    update_destination: vine.boolean().optional(),
    metadata: metadata.optional(),
  })
)

export const createEventValidator = vine.create(
  vine.object({
    event_id: vine.string().trim().minLength(1).maxLength(191),
    type: vine.string().trim().minLength(1).maxLength(64),
    click_id: vine.string().trim().maxLength(64).optional(),
    link_id: vine.string().trim().maxLength(64).optional(),
    affiliate_id: vine.string().trim().maxLength(64).optional(),
    referred_external_user_id: vine.string().trim().maxLength(191).optional(),
    amount: vine.number().min(0).withoutDecimals().optional(),
    currency: vine.string().trim().minLength(3).maxLength(3).optional(),
    occurred_at: vine.number().min(0).withoutDecimals().optional(),
    metadata: metadata.optional(),
  })
)

export const reverseEventValidator = vine.create(
  vine.object({
    reason: vine.string().trim().maxLength(255).optional(),
  })
)
