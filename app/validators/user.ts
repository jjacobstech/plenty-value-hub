import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const registerStep1Validator = vine.create({
  role: vine.enum(['vendor', 'affiliate', 'consumer'] as const),
})

export const registerStep2Validator = vine.create({
  businessName: vine.string().trim().minLength(2).maxLength(255),
  country: vine.string().trim().minLength(2).maxLength(100),
  phone: vine.string().trim().minLength(5).maxLength(20),
  businessType: vine.enum(['individual', 'business'] as const),
  heardAbout: vine.string().trim().maxLength(255).optional(),
})

export const registerStep3Validator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(255),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password(),
}).validateAs(async (value) => {
  if (value.password !== value.passwordConfirmation) {
    throw new Error('Passwords do not match')
  }
  return value
})

export const verifyOtpValidator = vine.create({
  otpCode: vine.string().length(6).regex(/^\d+$/),
})

export const forgotPasswordValidator = vine.create({
  email: email(),
})

export const resetPasswordValidator = vine.create({
  token: vine.string().notEmpty(),
  password: password(),
  passwordConfirmation: password(),
}).validateAs(async (value) => {
  if (value.password !== value.passwordConfirmation) {
    throw new Error('Passwords do not match')
  }
  return value
})

export const loginValidator = vine.create({
  email: email(),
  password: password(),
})

export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
  role: vine.enum(['vendor', 'affiliate', 'consumer'] as const).optional(),
})
