import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import PartnerWebhookDelivery from '#models/partner_webhook_delivery'
import PartnerWebhookEndpoint from '#models/partner_webhook_endpoint'
import { requireCan } from '#services/partner/portal_guard'
import { resend as requeue } from '#services/partner/webhook_delivery_service'
import { createEndpoint, emit, rotateSecret } from '#services/partner/webhook_emitter'
import { endpointValidator } from '#validators/partner_portal'

function endpointRows(endpoints: PartnerWebhookEndpoint[]) {
  return endpoints.map((e) => ({
    id: e.publicId,
    url: e.url,
    description: e.description,
    status: e.status,
    events: e.enabledEvents,
    failingSince: e.failingSince?.toISO() ?? null,
  }))
}

async function page(ctx: HttpContext, extra: { newSecret?: string | null } = {}) {
  const { partner, livemode, membership } = ctx.portal
  const endpoints = await PartnerWebhookEndpoint.query().where('partner_id', partner.id).where('livemode', livemode).orderBy('id', 'desc')
  const endpointIds = endpoints.map((e) => e.id)
  const deliveries = await PartnerWebhookDelivery.query()
    .whereIn('endpoint_id', endpointIds.length ? endpointIds : [0])
    .preload('event')
    .preload('endpoint')
    .orderBy('id', 'desc')
    .limit(50)
  return ctx.inertia.render('partner/Webhooks', {
    endpoints: endpointRows(endpoints),
    deliveries: deliveries.map((d) => ({
      id: d.id,
      endpoint: d.endpoint.publicId,
      type: d.event.type,
      status: d.status,
      attempt: d.attempt,
      responseStatus: d.responseStatus,
      excerpt: d.responseBodyExcerpt,
      nextAttemptAt: d.nextAttemptAt?.toISO() ?? null,
    })),
    role: membership.role,
    livemode,
    newSecret: extra.newSecret ?? null,
  })
}

export default class WebhooksController {
  async index(ctx: HttpContext) {
    return page(ctx)
  }

  async store(ctx: HttpContext) {
    requireCan(ctx, 'manage_webhooks')
    const data = await ctx.request.validateUsing(endpointValidator)
    const events = data.events ? data.events.split(',').map((e) => e.trim()).filter(Boolean) : ['*']
    const { secret } = await createEndpoint({
      partnerId: ctx.portal.partner.id,
      livemode: ctx.portal.livemode,
      url: data.url,
      enabledEvents: events,
      description: data.description,
    })
    return page(ctx, { newSecret: secret })
  }

  /** Rotates the signing secret. The old one keeps signing for 24 hours. */
  async rotate(ctx: HttpContext) {
    requireCan(ctx, 'manage_webhooks')
    const endpoint = await this.findOwn(ctx)
    const secret = await rotateSecret(endpoint)
    return page(ctx, { newSecret: secret })
  }

  async setStatus(ctx: HttpContext, status: 'enabled' | 'disabled') {
    requireCan(ctx, 'manage_webhooks')
    const endpoint = await this.findOwn(ctx)
    endpoint.status = status
    if (status === 'enabled') endpoint.failingSince = null
    await endpoint.save()
    return ctx.response.redirect().back()
  }

  enable(ctx: HttpContext) {
    return this.setStatus(ctx, 'enabled')
  }

  disable(ctx: HttpContext) {
    return this.setStatus(ctx, 'disabled')
  }

  /** Sends a test event to every enabled endpoint that subscribes to everything. */
  async test(ctx: HttpContext) {
    requireCan(ctx, 'manage_webhooks')
    await db.transaction((trx) => emit(trx, ctx.portal.partner.id, ctx.portal.livemode, 'test.ping', { message: 'Test event from the Plenty Value developer portal' }))
    return ctx.response.redirect().back()
  }

  async resend(ctx: HttpContext) {
    requireCan(ctx, 'manage_webhooks')
    const delivery = await PartnerWebhookDelivery.query()
      .where('id', ctx.params.id)
      .whereHas('endpoint', (q) => q.where('partner_id', ctx.portal.partner.id).where('livemode', ctx.portal.livemode))
      .firstOrFail()
    await requeue(delivery)
    return ctx.response.redirect().back()
  }

  private async findOwn(ctx: HttpContext) {
    return PartnerWebhookEndpoint.query()
      .where('public_id', ctx.params.id)
      .where('partner_id', ctx.portal.partner.id)
      .where('livemode', ctx.portal.livemode)
      .firstOrFail()
  }
}
