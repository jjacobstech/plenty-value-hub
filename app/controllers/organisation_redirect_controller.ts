import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationLink from '#models/organisation_link'
import OrganisationProgram from '#models/organisation_program'
import { logJsonError } from '#services/json_logger'
import { publicId } from '#services/organisation/public_id'
import { isBot, recordClick, visitorHash, withinVisitorLimit } from '#services/organisation/click_service'

const NOT_FOUND_PAGE = '<!doctype html><meta charset="utf-8"><title>Link not found</title><h1>This link is not available.</h1>'

/**
 * GET /r/:code: public, no key. Redirects to the organisation's destination with the click id added.
 * It never returns a 500 and never blocks the redirect. Click recording happens after the response.
 */
export default class OrganisationRedirectController {
  async show({ params, request, response }: HttpContext) {
    try {
      const link = await OrganisationLink.query().where('code', params.code).first()
      if (!link) return response.status(404).type('html').send(NOT_FOUND_PAGE)
      if (link.status !== 'active') {
        // A disabled link goes to the organisation's fallback URL when it has one. Suspended organisations get nothing.
        const organisation = await Organisation.find(link.organisationId)
        if (organisation?.fallbackUrl && organisation.status !== 'suspended') return response.redirect().withQs(false).toPath(organisation.fallbackUrl)
        return response.status(404).type('html').send(NOT_FOUND_PAGE)
      }

      const [organisation, affiliate, program] = await Promise.all([
        Organisation.find(link.organisationId),
        OrganisationAffiliate.find(link.affiliateId),
        OrganisationProgram.query().where('organisation_id', link.organisationId).where('livemode', link.livemode).first(),
      ])
      if (!organisation || organisation.status === 'suspended' || !affiliate || !program) {
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
      destination.searchParams.delete(organisation.clickIdParam)
      destination.searchParams.set(organisation.clickIdParam, clickIdPublic)

      // The app forwards query strings on every redirect; this URL already carries its own.
      response.redirect().withQs(false).toPath(destination.toString())

      // Record after responding. Bots and over-limit visitors are redirected but not counted.
      void (async () => {
        if (isBot(userAgent) || !(await withinVisitorLimit(hash))) return
        await recordClick({
          organisation,
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
      })().catch((error) => logJsonError({ event: 'organisation_click_failed', message: 'Organisation click not recorded', error, context: { linkId: link.publicId } }))
    } catch (error) {
      logJsonError({ event: 'organisation_redirect_failed', message: 'Organisation redirect failed', error })
      return response.status(404).type('html').send(NOT_FOUND_PAGE)
    }
  }
}
