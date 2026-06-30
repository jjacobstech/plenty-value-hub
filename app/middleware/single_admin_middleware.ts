import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Blocks the route if an admin account already exists.
 * Apply this to any route that should only be reachable during first-time admin setup.
 */
export default class SingleAdminMiddleware {
  async handle({ response }: HttpContext, next: () => Promise<void>) {
    const adminExists = await User.query().where('role', 'admin').first()

    if (adminExists) {
      return response.redirect('/admin/auth/login?error=admin_exists')
    }

    return next()
  }
}
