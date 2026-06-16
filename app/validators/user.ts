import vine from '@vinejs/vine'

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
  email: vine.string().email().maxLength(254).unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).maxLength(32).confirmed({ confirmationField: 'passwordConfirmation' }),
  passwordConfirmation: vine.string().minLength(8).maxLength(32),
})

export const verifyOtpValidator = vine.create({
  otpCode: vine.string().minLength(6).maxLength(6).regex(/^\d+$/),
})

export const forgotPasswordValidator = vine.create({
  email: vine.string().email().maxLength(254),
})

export const resetPasswordValidator = vine.create({
  token: vine.string().notEmpty(),
  password: vine.string().minLength(8).maxLength(32).confirmed({ confirmationField: 'passwordConfirmation' }),
  passwordConfirmation: vine.string().minLength(8).maxLength(32),
})

export const loginValidator = vine.create({
  email: vine.string().email().maxLength(254),
  password: vine.string().minLength(8).maxLength(32),
})

export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: vine.string().email().maxLength(254).unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).maxLength(32).confirmed({
    confirmationField: 'passwordConfirmation',
  }),
  passwordConfirmation: vine.string().minLength(8).maxLength(32),
  role: vine.enum(['vendor', 'affiliate', 'consumer'] as const).optional(),
})
