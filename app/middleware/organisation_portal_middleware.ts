import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type Organisation from '#models/organisation'
import OrganisationMember from '#models/organisation_member'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    portal: { membership: OrganisationMember; organisation: Organisation; livemode: boolean }
  }
}

/**
 * Loads the organisation the signed-in user is working on. Users who are not members of any organisation,
 * or of the one in session, get a 404 so their existence is not revealed.
 */
export default class OrganisationPortalMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const userId = ctx.auth.user!.id
    const chosen = ctx.session.get('organisation_id') as number | undefined
    let membership = chosen
      ? await OrganisationMember.query().where('user_id', userId).where('organisation_id', chosen).preload('organisation').first()
      : null
    membership ??= await OrganisationMember.query().where('user_id', userId).preload('organisation').orderBy('id', 'asc').first()
    if (!membership) throw new Exception('Not found', { status: 404 })

    ctx.portal = {
      membership,
      organisation: membership.organisation,
      livemode: ctx.session.get('organisation_mode') === 'live',
    }
    return next()
  }
}
