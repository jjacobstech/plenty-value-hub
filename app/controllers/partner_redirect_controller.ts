import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Partner from '#models/partner'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerLink from '#models/partner_link'
import PartnerProgram from '#models/partner_program'
import { logJsonError } from '#services/json_logger'
import { publicId } from '#services/partner/public_id'
import { isBot, recordClick, visitorHash, withinVisitorLimit } from '#services/partner/click_service'

const NOT_FOUND_PAGE = '<!doctype html><meta charset="utf-8"><title>Link not found</title><h1>This link is not available.</h1>'

/**
 * GET /r/:code: public, no key. Redirects to the partner's destination with the click id added.
 * It never returns a 500 and never blocks the redirect. Click recording happens after the response.
 */
export default class PartnerRedirectController {
  async show({ params, request, response }: HttpContext) {
    try {
      const link = await PartnerLink.query().where('code', params.code).first()
      if (!link || link.status !== 'active') return response.status(404).type('html').send(NOT_FOUND_PAGE)

      const [partner, affiliate, program] = await Promise.all([
        Partner.find(link.partnerId),
        PartnerAffiliate.find(link.affiliateId),
        PartnerProgram.query().where('partner_id', link.partnerId).where('livemode', link.livemode).first(),
      ])
      if (!partner || partner.status === 'suspended' || !affiliate || !program) {
        return response.status(404).type('html').send(NOT_FOUND_PAGE)
      }

      const now = DateTime.now()
      const userAgent = request.header('user-agent') ?? ''
      const hash = visitorHash(request.ip(), userAgent, now)
      const clickIdPublic = publicId('clk_')

      // Forward the incoming query string (UTM and others), then add the click id.
      const destination = new URL(link.destinationUrl)
      const incoming = request.qs()
      const utm: Record<string, string> = {}
      for (const [key, value] of Object.entries(incoming)) {
        for (const v of Array.isArray(value) ? value : [value]) destination.searchParams.append(key, String(v))
        if (key.startsWith('utm_')) utm[key] = String(Array.isArray(value) ? value[0] : value)
      }
      destination.searchParams.delete(partner.clickIdParam)
      destination.searchParams.set(partner.clickIdParam, clickIdPublic)

      response.redirect(destination.toString())

      // Record after responding. Bots and over-limit visitors are redirected but not counted.
      void (async () => {
        if (isBot(userAgent) || !(await withinVisitorLimit(hash))) return
        await recordClick({
          partner,
          link,
          affiliate,
          clickIdPublic,
          hash,
          referrer: request.header('referer')?.slice(0, 2000) ?? null,
          utm,
          userAgent,
          now,
          dedupeMinutes: program.dedupeUniqueClickMinutes,
        })
      })().catch((error) => logJsonError({ event: 'partner_click_failed', message: 'Partner click not recorded', error, context: { linkId: link.publicId } }))
    } catch (error) {
      logJsonError({ event: 'partner_redirect_failed', message: 'Partner redirect failed', error })
      return response.status(404).type('html').send(NOT_FOUND_PAGE)
    }
  }
}
