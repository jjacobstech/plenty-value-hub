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
