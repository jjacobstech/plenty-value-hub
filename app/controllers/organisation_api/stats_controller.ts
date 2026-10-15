import type { HttpContext } from '@adonisjs/core/http'
import { parseGroupBy, parseWindow, statsResponse } from '#services/organisation/stats_service'

export default class StatsController {
  /** GET /api/v1/organisations/stats/summary: program-wide totals, optionally grouped. */
  async summary({ request, response, organisation, livemode }: HttpContext) {
    const { from, to } = parseWindow(request.input('from'), request.input('to'))
    const groupBy = parseGroupBy(request.input('group_by'), ['none', 'day', 'product', 'campaign', 'affiliate'])
    const body = await statsResponse({ organisationId: organisation.id, livemode, from, to }, groupBy, true)
    return response.json(body)
  }
}
