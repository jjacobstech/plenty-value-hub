import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

function dashboardForRole(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'vendor') return '/vendor'
  if (role === 'affiliate') return '/affiliate'
  return '/'
}

export default class OauthController {
  async redirectToGoogle({ ally, response }: HttpContext) {
    return ally.use('google').redirect()
  }

  async handleGoogleCallback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')

    // If the user denied the request
    if (google.accessDenied()) {
      return response.redirect('/auth/login?error=access_denied')
    }

    // If something went wrong
    if (google.stateMisMatch()) {
      return response.redirect('/auth/login?error=state_mismatch')
    }

    // Let's verify the user exists or create them
    try {
      const googleUser = await google.user()

      // Find user by Google email
      let user = await User.findBy('email', googleUser.email)

      if (!user) {
        // Create new user from Google profile
        user = await User.create({
          email: googleUser.email,
          fullName: googleUser.name || undefined,
          password: Math.random().toString(36).slice(-15), // Random password for OAuth users
          role: 'consumer', // Default role for new OAuth users
        })
      }

      // Log the user in
      await auth.use('web').login(user)

      // Redirect to dashboard based on role
      return response.redirect(dashboardForRole(user.role ?? 'consumer'))
    } catch (error) {
      session.flash('error', 'Failed to authenticate with Google')
      return response.redirect('/auth/login')
    }
  }
}
