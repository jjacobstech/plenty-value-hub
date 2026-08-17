import vine from '@vinejs/vine'

export const initializePaymentValidator = vine.create({
  productId: vine.number().positive(),
  paymentProvider: vine
    .enum(['manual', 'stripe', 'paystack', 'flutterwave', 'paypal'] as const)
    .optional(),
  affiliateLinkCode: vine.string().trim().optional(),
  callbackUrl: vine.string().trim().optional(),
  email: vine.string().email().optional(),
})

export const verifyPaymentValidator = vine.create({
  reference: vine.string().trim(),
  provider: vine.enum(['stripe', 'paystack', 'flutterwave', 'paypal'] as const),
})

export const paymentSettingsValidator = vine.create({
  activeProvider: vine
    .enum(['manual', 'stripe', 'paystack', 'flutterwave', 'paypal'] as const)
    .optional(),
  providers: vine
    .array(
      vine.object({
        key: vine.string().trim(),
        name: vine.string().trim().optional(),
        label: vine.string().trim().optional(),
        enabled: vine.boolean().optional(),
        publicKey: vine.string().trim().optional().nullable(),
        secretKey: vine.string().trim().optional().nullable(),
        webhookSecret: vine.string().trim().optional().nullable(),
        description: vine.string().trim().optional().nullable(),
      })
    )
    .optional(),
})
