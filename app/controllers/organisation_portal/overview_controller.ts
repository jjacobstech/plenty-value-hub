import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import OrganisationEvent from '#models/organisation_event'
import { totalsFor } from '#services/organisation/stats_service'

export default class OverviewController {
  /** The portal home: 30-day totals and the latest events for the current mode. */
  async show({ inertia, portal }: HttpContext) {
    const { organisation, livemode, membership } = portal
    const to = DateTime.now()
    const from = to.minus({ days: 30 })
    const { totals } = await totalsFor({ organisationId: organisation.id, livemode, from, to })
    const recent = await OrganisationEvent.query().where('organisation_id', organisation.id).where('livemode', livemode).orderBy('id', 'desc').limit(5)

    return inertia.render('organisation/Overview', {
      organisation: { publicId: organisation.publicId, name: organisation.name, status: organisation.status },
      role: membership.role,
      livemode,
      totals,
      recentEvents: recent.map((e) => ({ id: e.publicId, type: e.type, status: e.status, reason: e.reason, occurredAt: e.occurredAt.toISO() ?? '' })),
    })
  }

  /** Switches between test and live data. Stored in the session, not the database. */
  async setMode({ request, session, response }: HttpContext) {
    session.put('organisation_mode', request.input('mode') === 'live' ? 'live' : 'test')
    return response.redirect().back()
  }
}
