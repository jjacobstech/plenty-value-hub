import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'

export default class AdminAuthController {
  /** Smart entry point: dashboard if logged in, login page otherwise */
  async entry({ auth, response }: HttpContext) {
    await auth.use('web').check()
    if (auth.use('web').isAuthenticated && auth.use('web').user?.role === 'admin') {
      return response.redirect('/admin')
    }
    return response.redirect('/admin/auth/login')
  }

  async loginPage({ inertia, auth, response }: HttpContext) {
    await auth.use('web').check()
    if (auth.use('web').isAuthenticated && auth.use('web').user?.role === 'admin') {
      return response.redirect('/admin')
    }
    const adminExists = !!(await User.query().where('role', 'admin').first())
    return inertia.render('admin/AdminLogin', { adminExists })
  }

  /** First-time admin setup — singleAdmin middleware blocks if admin already exists */
  async redirectToGoogleSetup({ ally, session }: HttpContext) {
    session.put('admin_oauth_source', 'setup')
    return ally.use('googleAdmin').redirect()
  }

  /** Returning admin login */
  async redirectToGoogleLogin({ ally, session }: HttpContext) {
    session.put('admin_oauth_source', 'login')
    return ally.use('googleAdmin').redirect()
  }

  /** Callback for /admin/auth/google/callback — used exclusively by the googleAdmin provider */
  async handleGoogleCallback({ ally, auth, session, response }: HttpContext) {
    const google = ally.use('googleAdmin')

    if (google.accessDenied()) {
      session.flash('error', 'Google sign-in was cancelled.')
      return response.redirect('/admin/auth/login')
    }

    if (google.stateMisMatch()) {
      session.flash('error', 'Authentication state mismatch. Please try again.')
      return response.redirect('/admin/auth/login')
    }

    if (google.hasError()) {
      session.flash('error', 'Google authentication failed. Please try again.')
      return response.redirect('/admin/auth/login')
    }

    let googleUser: Awaited<ReturnType<typeof google.user>>
    try {
      googleUser = await google.user()
    } catch {
      session.flash('error', 'Google authentication failed. Please try again.')
      return response.redirect('/admin/auth/login')
    }

    if (!googleUser.email) {
      session.flash('error', 'Google did not provide an email address.')
      return response.redirect('/admin/auth/login')
    }

    const source = session.pull('admin_oauth_source', 'login') as 'setup' | 'login'

    if (source === 'setup') {
      // Middleware should have blocked this, but double-check
      const adminExists = await User.query().where('role', 'admin').first()
      if (adminExists) {
        session.flash('error', 'An admin account already exists. Only one admin is allowed.')
        return response.redirect('/admin/auth/login')
      }

      const existingUser = await User.findBy('email', googleUser.email)
      if (existingUser) {
        session.flash('error', 'That Google account is already registered under a different role.')
        return response.redirect('/admin/auth/login')
      }

      const admin = await User.create({
        email: googleUser.email,
        fullName: googleUser.name ?? undefined,
        role: 'admin',
        // Unguessable password — OAuth is the only login path for admin
        password: randomBytes(32).toString('hex'),
        emailVerifiedAt: DateTime.now(),
      })

      await auth.use('web').login(admin)
      return response.redirect('/admin')
    }

    // source === 'login'
    const user = await User.findBy('email', googleUser.email)
    if (!user || user.role !== 'admin') {
      session.flash('error', 'That Google account does not have admin access.')
      return response.redirect('/admin/auth/login')
    }

    await auth.use('web').login(user)
    return response.redirect('/admin')
  }
}
