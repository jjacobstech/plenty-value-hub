import { HttpContext } from '@adonisjs/core/http'
import { ForbiddenException } from '@adonisjs/core/exceptions'

export default class RoleMiddleware {
  handle(ctx: HttpContext, next: () => Promise<void>, roles: string[]) {
    const user = ctx.auth.user

    if (!user) {
      throw new ForbiddenException('Not authenticated')
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource')
    }

    return next()
  }
}
