import type { HttpContext } from '@adonisjs/core/http'
import OrganisationApiKey from '#models/organisation_api_key'
import ApiKeyService from '#services/organisation/api_key_service'
import { requireCan } from '#services/organisation/portal_guard'
import { keyValidator } from '#validators/organisation_portal'
import { DateTime } from 'luxon'

function keyRows(keys: OrganisationApiKey[]) {
  return keys.map((k) => ({
    id: k.publicId,
    name: k.name,
    prefix: k.prefix,
    last4: k.last4,
    created: k.createdAt.toISO() ?? '',
    lastUsedAt: k.lastUsedAt?.toISO() ?? null,
    revokedAt: k.revokedAt?.toISO() ?? null,
  }))
}

export default class KeysController {
  async index({ inertia, portal }: HttpContext) {
    const keys = await OrganisationApiKey.query().where('organisation_id', portal.organisation.id).where('livemode', portal.livemode).orderBy('id', 'desc')
    return inertia.render('organisation/Keys', { keys: keyRows(keys), livemode: portal.livemode, role: portal.membership.role, newSecret: null })
  }

  /** Creates a key. The secret is shown in this response only. */
  async store(ctx: HttpContext) {
    requireCan(ctx, 'manage_keys')
    const data = await ctx.request.validateUsing(keyValidator)
    const { secret } = await ApiKeyService.create(ctx.portal.organisation.id, ctx.portal.livemode, data.name)
    const keys = await OrganisationApiKey.query().where('organisation_id', ctx.portal.organisation.id).where('livemode', ctx.portal.livemode).orderBy('id', 'desc')
    return ctx.inertia.render('organisation/Keys', {
      keys: keyRows(keys),
      livemode: ctx.portal.livemode,
      role: ctx.portal.membership.role,
      newSecret: secret,
    })
  }

  async revoke(ctx: HttpContext) {
    requireCan(ctx, 'manage_keys')
    const key = await OrganisationApiKey.query()
      .where('public_id', ctx.params.id)
      .where('organisation_id', ctx.portal.organisation.id)
      .where('livemode', ctx.portal.livemode)
      .firstOrFail()
    if (!key.revokedAt) {
      key.revokedAt = DateTime.now()
      await key.save()
    }
    return ctx.response.redirect().back()
  }
}
