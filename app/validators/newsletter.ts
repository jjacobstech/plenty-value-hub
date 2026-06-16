import vine from '@vinejs/vine'

export const subscribeNewsletterValidator = vine.create({
  email: vine.string().email().maxLength(254),
  name: vine.string().trim().maxLength(255).optional(),
  interests: vine.array(vine.string().trim()).optional(),
  source: vine.string().trim().maxLength(100).optional(),
})

export const unsubscribeValidator = vine.create({
  email: vine.string().email().maxLength(254),
})
