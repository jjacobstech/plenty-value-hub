import vine from '@vinejs/vine'

export const requestPayoutValidator = vine.create({
  amount: vine.number().min(1),
})

export const updatePayoutValidator = vine.create({
  status: vine.enum(['approved', 'paid', 'rejected'] as const),
  adminNotes: vine.string().trim().maxLength(500).optional(),
})
