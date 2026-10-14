import vine from '@vinejs/vine'

const EVENT_TYPE = vine.string().trim().minLength(1).maxLength(64)

export const keyValidator = vine.create(vine.object({ name: vine.string().trim().minLength(1).maxLength(120) }))

export const endpointValidator = vine.create(
  vine.object({
    url: vine.string().url({ protocols: ['https', 'http'] }).maxLength(2048),
    events: vine.string().trim().maxLength(1000).optional(),
    description: vine.string().trim().maxLength(255).optional(),
  })
)

export const programValidator = vine.create(
  vine.object({
    attribution_window_days: vine.number().min(1).max(366).withoutDecimals(),
    attribution_model: vine.enum(['last_click', 'first_click'] as const),
    allowed_event_types: vine.string().trim().minLength(1).maxLength(500),
    commission_mode: vine.enum(['none', 'flat', 'percent'] as const),
    commission_flat_amount: vine.number().min(0).withoutDecimals().nullable().optional(),
    commission_percent_bps: vine.number().min(0).max(10000).withoutDecimals().nullable().optional(),
    commission_currency: vine.string().trim().regex(/^[A-Za-z]{3}$/).nullable().optional(),
    commission_hold_days: vine.number().min(0).max(365).withoutDecimals(),
    auto_approve_after_hold: vine.boolean(),
    self_referral_blocked: vine.boolean(),
    dedupe_unique_click_minutes: vine.number().min(0).max(1440).withoutDecimals(),
    allowed_redirect_domains: vine.string().trim().maxLength(1000),
    click_id_param: vine.string().trim().regex(/^[a-z_][a-z0-9_]{0,40}$/),
  })
)

export const inviteValidator = vine.create(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    role: vine.enum(['admin', 'developer', 'viewer'] as const),
  })
)

export const reasonValidator = vine.create(vine.object({ reason: vine.string().trim().maxLength(255).optional() }))

export const eventTypeValidator = vine.create(vine.object({ type: EVENT_TYPE }))

export const partnerCreateValidator = vine.create(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    owner_email: vine.string().email().normalizeEmail(),
    domains: vine.string().trim().maxLength(1000).optional(),
  })
)
