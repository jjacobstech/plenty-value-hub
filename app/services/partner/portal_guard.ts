import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import { can, type PartnerAction } from '#services/partner/permissions'

/** Throws 403 unless the member's role allows the action. */
export function requireCan(ctx: HttpContext, action: PartnerAction) {
  if (!can(ctx.portal.membership.role, action)) {
    throw new Exception('Your role in this partner does not allow this action.', { status: 403 })
  }
}
