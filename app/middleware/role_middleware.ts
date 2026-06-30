import { type HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'

export default class RoleMiddleware {
  handle(ctx: HttpContext, next: () => Promise<void>, roles: string[]) {
    const user = ctx.auth.user

    if (!user) {
      throw new Exception('Not authenticated', { status: 401 })
    }

    if (!roles.includes(user.role)) {
      throw new Exception('You do not have permission to access this resource', { status: 403 })
    }

    return next()
  }
}
