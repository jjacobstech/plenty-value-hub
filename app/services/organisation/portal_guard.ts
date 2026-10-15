import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import { can, type OrganisationAction } from '#services/organisation/permissions'

/** Throws 403 unless the member's role allows the action. */
export function requireCan(ctx: HttpContext, action: OrganisationAction) {
  if (!can(ctx.portal.membership.role, action)) {
    throw new Exception('Your role in this organisation does not allow this action.', { status: 403 })
  }
}
