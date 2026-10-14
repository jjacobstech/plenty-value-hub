import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Partner from '#models/partner'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerCommission from '#models/partner_commission'
import PartnerLink from '#models/partner_link'
import { linkUrl } from '#services/partner/link_service'
import { DASHBOARD_COOKIE, DASHBOARD_COOKIE_HOURS, findUsableSession } from '#services/partner/dashboard_session_service'
import { computeStats, totalsFor } from '#services/partner/stats_service'

const EXPIRED_PAGE =
  '<!doctype html><meta charset="utf-8"><title>Link expired</title><h1>This dashboard link has expired or was already used.</h1><p>Ask for a new link.</p>'

type DashboardCookie = { affiliateId: number; partnerId: number; livemode: boolean; returnUrl: string | null; until: number }

/**
 * The hosted affiliate dashboard. A single-use link (/a/session/:token) sets a cookie scoped to
 * /a; /a then shows that affiliate's data only, read-only.
 */
export default class PartnerAffiliateDashboardController {
  /** GET /a/session/:token: redeems the link once, sets the cookie, and redirects to /a. */
  async redeem({ params, response }: HttpContext) {
    const session = await findUsableSession(params.token)
    if (!session) return response.status(410).type('html').send(EXPIRED_PAGE)

    session.redeemedAt = DateTime.now()
    await session.save()

    const cookie: DashboardCookie = {
      affiliateId: session.affiliateId,
      partnerId: session.partnerId,
      livemode: session.livemode,
      returnUrl: session.returnUrl,
      until: DateTime.now().plus({ hours: DASHBOARD_COOKIE_HOURS }).toMillis(),
    }
    response.cookie(DASHBOARD_COOKIE, JSON.stringify(cookie), {
      path: '/a',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: DASHBOARD_COOKIE_HOURS * 3600,
    })
    return response.redirect('/a')
  }

  /** GET /a: the read-only dashboard for the affiliate in the cookie. */
  async show({ request, response, inertia }: HttpContext) {
    const raw = request.cookie(DASHBOARD_COOKIE)
    let cookie: DashboardCookie | null = null
    try {
      cookie = raw ? (JSON.parse(raw) as DashboardCookie) : null
    } catch {
      cookie = null
    }
    if (!cookie || cookie.until < Date.now()) return response.status(410).type('html').send(EXPIRED_PAGE)

    const partner = await Partner.find(cookie.partnerId)
    const affiliate = await PartnerAffiliate.find(cookie.affiliateId)
    if (!partner || partner.status === 'suspended' || !affiliate || affiliate.partnerId !== partner.id) {
      return response.status(404).type('html').send(EXPIRED_PAGE)
    }

    const to = DateTime.now()
    const from = to.minus({ days: 30 })
    const scope = { partnerId: partner.id, livemode: cookie.livemode, from, to, affiliateId: affiliate.id }
    const { totals } = await totalsFor(scope)
    const daily = await computeStats(scope, 'day')
    const links = await PartnerLink.query().where('affiliate_id', affiliate.id).where('partner_id', partner.id).where('livemode', cookie.livemode).orderBy('id', 'desc').limit(50)
    const commissions = await PartnerCommission.query().where('affiliate_id', affiliate.id).where('partner_id', partner.id).where('livemode', cookie.livemode).orderBy('id', 'desc').limit(50)

    return inertia.render('partner/AffiliateDashboard', {
      partnerName: partner.name,
      affiliateName: affiliate.displayName ?? 'Affiliate',
      livemode: cookie.livemode,
      returnUrl: cookie.returnUrl,
      totals,
      series: daily.rows.map((r) => ({ day: r.key, clicks: r.totals.clicks, conversions: r.totals.conversions })),
      links: links.map((l) => ({ id: l.publicId, url: linkUrl(l), productRef: l.productRef, campaignRef: l.campaignRef, status: l.status })),
      commissions: commissions.map((c) => ({ id: c.publicId, amount: c.amount, currency: c.currency, status: c.status, created: c.createdAt.toISO() })),
    })
  }
}
