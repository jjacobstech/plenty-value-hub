import User from '#models/user'
import { OtpService } from '#services/otp_service'
import {
  registerStep1Validator,
  registerStep2Validator,
  registerStep3Validator,
  verifyOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  loginValidator,
  signupValidator,
} from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'

function dashboardForRole(role: string) {
  if (role === 'vendor') return '/vendor'
  if (role === 'affiliate') return '/affiliate'
  return '/marketplace'
}

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async registerStep1({ request, response, session }: HttpContext) {
    const { role } = await request.validateUsing(registerStep1Validator)
    session.put('signup_role', role)

    if (role === 'vendor') {
      return response.json({ success: true, nextStep: 2 })
    }
    return response.json({ success: true, nextStep: 3 })
  }

  async registerStep2({ request, response, session }: HttpContext) {
    const kyc = await request.validateUsing(registerStep2Validator)
    session.put('signup_kyc', kyc)
    return response.json({ success: true, nextStep: 3 })
  }

  async registerStep3({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(registerStep3Validator)

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.status(400).json({ error: 'Email already registered' })
    }

    const role = session.get('signup_role', 'consumer')
    const kyc = session.get('signup_kyc', {})

    const otpService = new OtpService()
    const otpCode = otpService.generate()

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role,
      otpCode,
      otpExpiresAt: otpService.getExpiryTime(),
      ...kyc,
    })

    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Verify Your Email - Plenty Value')
        .htmlView('emails/otp_verification', { user, otpCode })
    })

    session.forget('signup_role')
    session.forget('signup_kyc')
    session.put('pending_verification_email', user.email)

    return response.json({
      success: true,
      message: 'OTP sent to your email',
      email: user.email,
    })
  }

  async verifyOtp({ request, response, session, auth }: HttpContext) {
    const { otpCode } = await request.validateUsing(verifyOtpValidator)
    const email = session.get('pending_verification_email')

    if (!email) {
      return response.redirect('/auth/signup')
    }

    const user = await User.findBy('email', email)
    if (!user) {
      return response.redirect('/auth/signup')
    }

    const otpService = new OtpService()
    if (otpService.isExpired(user.otpExpiresAt)) {
      session.flash('errors', { otpCode: 'Code has expired. Request a new one.' })
      return response.redirect('/auth/verify-email')
    }

    if (user.otpCode !== otpCode) {
      session.flash('errors', { otpCode: 'Invalid code. Please try again.' })
      return response.redirect('/auth/verify-email')
    }

    user.otpCode = null
    user.otpExpiresAt = null
    user.emailVerifiedAt = DateTime.now()
    await user.save()

    session.forget('pending_verification_email')
    await auth.use('web').login(user)

    await mail.send((message) => {
      message
        .to(user.email)
        .subject(
          `Welcome to Plenty Value — ${user.role === 'vendor' ? 'Start Selling Today!' : user.role === 'affiliate' ? 'Your Affiliate Journey Starts Now!' : ''}`
        )
        .htmlView('emails/welcome', { user, appUrl: process.env.APP_URL })
    })

    return response.redirect(dashboardForRole(user.role))
  }

  async resendOtp({ response, session }: HttpContext) {
    const email = session.get('pending_verification_email')

    if (!email) {
      return response.redirect('/auth/signup')
    }

    const user = await User.findBy('email', email)
    if (!user) {
      return response.redirect('/auth/signup')
    }

    const otpService = new OtpService()
    const otpCode = otpService.generate()

    user.otpCode = otpCode
    user.otpExpiresAt = otpService.getExpiryTime()
    await user.save()

    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Verify Your Email - Plenty Value')
        .htmlView('emails/otp_verification', { user, otpCode })
    })

    session.flash('success', 'A new verification code has been sent to your email')
    return response.redirect('/auth/verify-email')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    let user: User
    try {
      user = await User.verifyCredentials(email, password)
    } catch {
      session.flash('errors', { email: 'Invalid email or password' })
      return response.redirect().back()
    }

    if (!user.emailVerifiedAt) {
      const otpService = new OtpService()
      const otpCode = otpService.generate()
      user.otpCode = otpCode
      user.otpExpiresAt = otpService.getExpiryTime()
      await user.save()

      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Verify Your Email - Plenty Value')
          .htmlView('emails/otp_verification', { user, otpCode })
      })

      session.put('pending_verification_email', user.email)
      return response.redirect('/auth/verify-email')
    }

    await auth.use('web').login(user)
    return response.redirect(dashboardForRole(user.role))
  }

  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    const user = await User.findBy('email', email)
    if (!user) {
      return response.json({
        success: true,
        message: 'If that email exists, we sent a password reset link',
      })
    }

    const token = randomBytes(32).toString('hex')
    user.resetToken = createHash('sha256').update(token).digest('hex')
    user.resetTokenExpiresAt = DateTime.now().plus({ hours: 1 })
    await user.save()

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Reset Your Password - Plenty Value')
        .htmlView('emails/forgot_password', { user, resetUrl })
    })

    return response.json({ success: true, message: 'Password reset link sent to your email' })
  }

  async resetPassword({ request, response, auth }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    const hashedToken = createHash('sha256').update(token).digest('hex')
    const user = await User.query()
      .where('reset_token', hashedToken)
      .where('reset_token_expires_at', '>', new Date())
      .first()

    if (!user) {
      return response.status(400).json({ error: 'Invalid or expired reset token' })
    }

    user.password = password
    user.resetToken = null
    user.resetTokenExpiresAt = null
    await user.save()

    await auth.use('web').login(user)

    return response.json({
      success: true,
      message: 'Password reset successfully',
      redirect: dashboardForRole(user.role),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const {
      role,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      passwordConfirmation: _passwordConfirmation,
      ...payload
    } = await request.validateUsing(signupValidator)

    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      session.flash('errors', { email: 'This email is already registered' })
      return response.redirect().back()
    }

    const otpService = new OtpService()
    const otpCode = otpService.generate()

    const user = await User.create({
      ...payload,
      role: role ?? 'consumer',
      otpCode,
      otpExpiresAt: otpService.getExpiryTime(),
    })

    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Verify Your Email - Plenty Value')
        .htmlView('emails/otp_verification', { user, otpCode })
    })

    session.put('pending_verification_email', user.email)
    return response.redirect('/auth/verify-email')
  }
}
