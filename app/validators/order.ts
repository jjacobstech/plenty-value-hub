import vine from '@vinejs/vine'

export const processOrderValidator = vine.create({
  productId: vine.number().positive(),
  affiliateLinkCode: vine.string().trim().optional(),
  paymentMethod: vine.string().trim().optional(),
  shippingDetails: vine
    .object({
      address: vine.string().trim().optional(),
      city: vine.string().trim().optional(),
      state: vine.string().trim().optional(),
      country: vine.string().trim().optional(),
      postalCode: vine.string().trim().optional(),
      phone: vine.string().trim().optional(),
    })
    .optional(),
})

export const updateOrderValidator = vine.create({
  status: vine.enum(['pending', 'completed', 'refunded', 'cancelled'] as const),
})
