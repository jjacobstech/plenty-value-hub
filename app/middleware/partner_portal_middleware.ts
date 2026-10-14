import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type Partner from '#models/partner'
import PartnerMember from '#models/partner_member'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    portal: { membership: PartnerMember; partner: Partner; livemode: boolean }
  }
}

/**
 * Loads the partner the signed-in user is working on. Users who are not members of any partner,
 * or of the one in session, get a 404 so their existence is not revealed.
 */
export default class PartnerPortalMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const userId = ctx.auth.user!.id
    const chosen = ctx.session.get('partner_id') as number | undefined
    let membership = chosen
      ? await PartnerMember.query().where('user_id', userId).where('partner_id', chosen).preload('partner').first()
      : null
    membership ??= await PartnerMember.query().where('user_id', userId).preload('partner').orderBy('id', 'asc').first()
    if (!membership) throw new Exception('Not found', { status: 404 })

    ctx.portal = {
      membership,
      partner: membership.partner,
      livemode: ctx.session.get('partner_mode') === 'live',
    }
    return next()
  }
}
