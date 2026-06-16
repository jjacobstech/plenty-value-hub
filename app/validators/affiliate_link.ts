import vine from '@vinejs/vine'

export const createAffiliateLinkValidator = vine.create({
  productId: vine.number().positive(),
  subId: vine.string().trim().maxLength(100).optional(),
  campaignName: vine.string().trim().maxLength(255).optional(),
})

export const updateAffiliateLinkValidator = vine.create({
  status: vine.enum(['active', 'paused', 'expired'] as const),
})

export const trackClickValidator = vine.create({
  linkCode: vine.string().trim().minLength(1),
})
