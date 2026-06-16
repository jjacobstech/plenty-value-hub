import vine from '@vinejs/vine'

export const processOrderValidator = vine.create({
  productId: vine.number().positive(),
  affiliateLinkCode: vine.string().trim().optional(),
})

export const updateOrderValidator = vine.create({
  status: vine.enum(['pending', 'completed', 'refunded', 'cancelled'] as const),
})
