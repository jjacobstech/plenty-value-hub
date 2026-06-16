import vine from '@vinejs/vine'

export const createReviewValidator = vine.create({
  productId: vine.number().positive(),
  rating: vine.number().min(1).max(5),
  title: vine.string().trim().minLength(3).maxLength(255),
  content: vine.string().trim().minLength(10).maxLength(5000),
  pros: vine.array(vine.string().trim()).optional(),
  cons: vine.array(vine.string().trim()).optional(),
})

export const updateReviewValidator = vine.create({
  status: vine.enum(['pending', 'approved', 'rejected'] as const),
})
