import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PartnerEvent from '#models/partner_event'
import { totalsFor } from '#services/partner/stats_service'

export default class OverviewController {
  /** The portal home: 30-day totals and the latest events for the current mode. */
  async show({ inertia, portal }: HttpContext) {
    const { partner, livemode, membership } = portal
    const to = DateTime.now()
    const from = to.minus({ days: 30 })
    const { totals } = await totalsFor({ partnerId: partner.id, livemode, from, to })
    const recent = await PartnerEvent.query().where('partner_id', partner.id).where('livemode', livemode).orderBy('id', 'desc').limit(5)

    return inertia.render('partner/Overview', {
      partner: { publicId: partner.publicId, name: partner.name, status: partner.status },
      role: membership.role,
      livemode,
      totals,
      recentEvents: recent.map((e) => ({ id: e.publicId, type: e.type, status: e.status, reason: e.reason, occurredAt: e.occurredAt.toISO() })),
    })
  }

  /** Switches between test and live data. Stored in the session, not the database. */
  async setMode({ request, session, response }: HttpContext) {
    session.put('partner_mode', request.input('mode') === 'live' ? 'live' : 'test')
    return response.redirect().back()
  }
}
