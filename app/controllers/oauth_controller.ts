import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

function dashboardForRole(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'vendor') return '/vendor'
  if (role === 'affiliate') return '/affiliate'
  return '/marketplace'
}

const VALID_ROLES = ['vendor', 'affiliate'] as const
type Role = (typeof VALID_ROLES)[number]

export default class OauthController {
  async redirectToGoogle({ ally, request, session }: HttpContext) {
    const role = request.input('role')
    const source = request.input('source', role ? 'signup' : 'login')

    session.put('oauth_source', source)
    if (VALID_ROLES.includes(role)) {
      session.put('oauth_role', role as Role)
    }

    return ally.use('google').redirect()
  }

  async handleGoogleCallback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')

    if (google.accessDenied()) {
      return response.redirect('/auth/login?error=access_denied')
    }

    if (google.stateMisMatch()) {
      return response.redirect('/auth/login?error=state_mismatch')
    }

    if (google.hasError()) {
      return response.redirect('/auth/login?error=oauth_error')
    }

    try {
      const googleUser = await google.user()

      if (!googleUser.email) {
        session.flash('error', 'Google did not provide an email address')
        return response.redirect('/auth/login')
      }

      let user = await User.findBy('email', googleUser.email)
      const source = session.get('oauth_source', 'login')

      if (!user) {
        if (source === 'login') {
          session.forget('oauth_source')
          session.forget('oauth_role')
          session.flash('error', 'No account found with that Google address. Please sign up first.')
          return response.redirect('/auth/signup')
        }

        const role: Role = session.get('oauth_role') ?? 'affiliate'
        user = await User.create({
          email: googleUser.email,
          fullName: googleUser.name || undefined,
          password: Math.random().toString(36).slice(-15),
          role,
        })
      }

      session.forget('oauth_source')
      session.forget('oauth_role')

      await auth.use('web').login(user)
      return response.redirect(dashboardForRole(user.role))
    } catch (error) {
      console.log('Oauth Failed:', error)
      session.flash('error', 'Failed to authenticate with Google')
      return response.redirect('/auth/login')
    }
  }
}
