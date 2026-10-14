import type { HttpContext } from '@adonisjs/core/http'
import { parseGroupBy, parseWindow, statsResponse } from '#services/partner/stats_service'

export default class StatsController {
  /** GET /v1/stats/summary: program-wide totals, optionally grouped. */
  async summary({ request, response, partner, livemode }: HttpContext) {
    const { from, to } = parseWindow(request.input('from'), request.input('to'))
    const groupBy = parseGroupBy(request.input('group_by'), ['none', 'day', 'product', 'campaign', 'affiliate'])
    const body = await statsResponse({ partnerId: partner.id, livemode, from, to }, groupBy, true)
    return response.json(body)
  }
}
