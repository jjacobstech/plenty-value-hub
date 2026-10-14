import type { HttpContext } from '@adonisjs/core/http'
import PartnerApiKey from '#models/partner_api_key'
import ApiKeyService from '#services/partner/api_key_service'
import { requireCan } from '#services/partner/portal_guard'
import { keyValidator } from '#validators/partner_portal'
import { DateTime } from 'luxon'

function keyRows(keys: PartnerApiKey[]) {
  return keys.map((k) => ({
    id: k.publicId,
    name: k.name,
    prefix: k.prefix,
    last4: k.last4,
    created: k.createdAt.toISO(),
    lastUsedAt: k.lastUsedAt?.toISO() ?? null,
    revokedAt: k.revokedAt?.toISO() ?? null,
  }))
}

export default class KeysController {
  async index({ inertia, portal }: HttpContext) {
    const keys = await PartnerApiKey.query().where('partner_id', portal.partner.id).where('livemode', portal.livemode).orderBy('id', 'desc')
    return inertia.render('partner/Keys', { keys: keyRows(keys), livemode: portal.livemode, role: portal.membership.role, newSecret: null })
  }

  /** Creates a key. The secret is shown in this response only. */
  async store(ctx: HttpContext) {
    requireCan(ctx, 'manage_keys')
    const data = await ctx.request.validateUsing(keyValidator)
    const { secret } = await ApiKeyService.create(ctx.portal.partner.id, ctx.portal.livemode, data.name)
    const keys = await PartnerApiKey.query().where('partner_id', ctx.portal.partner.id).where('livemode', ctx.portal.livemode).orderBy('id', 'desc')
    return ctx.inertia.render('partner/Keys', {
      keys: keyRows(keys),
      livemode: ctx.portal.livemode,
      role: ctx.portal.membership.role,
      newSecret: secret,
    })
  }

  async revoke(ctx: HttpContext) {
    requireCan(ctx, 'manage_keys')
    const key = await PartnerApiKey.query()
      .where('public_id', ctx.params.id)
      .where('partner_id', ctx.portal.partner.id)
      .where('livemode', ctx.portal.livemode)
      .firstOrFail()
    if (!key.revokedAt) {
      key.revokedAt = DateTime.now()
      await key.save()
    }
    return ctx.response.redirect().back()
  }
}
