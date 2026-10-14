import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import { customAlphabet } from 'nanoid'
import env from '#start/env'
import PartnerApiException from '#exceptions/partner_api_exception'
import type Partner from '#models/partner'
import type PartnerAffiliate from '#models/partner_affiliate'
import PartnerDashboardSession from '#models/partner_dashboard_session'
import { publicId } from '#services/partner/public_id'

const LINK_TTL_MINUTES = 5
export const DASHBOARD_COOKIE = 'pv_aff_dashboard'
export const DASHBOARD_COOKIE_HOURS = 12
const token52 = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 43)

/** The app's own base URL. The dashboard is served here, so no separate env var is needed. */
export function appBase(): string {
  return env.get('APP_URL').replace(/\/+$/, '')
}

/** A return_url must point at one of the partner's allowed domains, like a destination does. */
export function assertReturnUrlAllowed(partner: Partner, returnUrl: string) {
  const url = new URL(returnUrl)
  const allowed = partner.allowedRedirectDomains.some((d) => url.hostname === d || url.hostname.endsWith(`.${d}`))
  if (!allowed) {
    throw new PartnerApiException('return_url host is not in allowed_redirect_domains', 'invalid_request_error', 'parameter_invalid', 400, 'return_url')
  }
}

/** Creates a single-use link that is valid for 5 minutes. Only its hash is stored. */
export async function createDashboardSession(partner: Partner, livemode: boolean, affiliate: PartnerAffiliate, returnUrl?: string) {
  const token = token52()
  const expiresAt = DateTime.now().plus({ minutes: LINK_TTL_MINUTES })
  const id = publicId('dss_')
  await PartnerDashboardSession.create({
    publicId: id,
    partnerId: partner.id,
    livemode,
    affiliateId: affiliate.id,
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    expiresAt,
    returnUrl: returnUrl ?? null,
  })
  return { id, url: `${appBase()}/a/session/${token}`, expiresAt }
}

/** Finds the session for a token. Returns null for unknown tokens, expired ones and used ones. */
export async function findUsableSession(token: string): Promise<PartnerDashboardSession | null> {
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const session = await PartnerDashboardSession.query().where('token_hash', hash).preload('affiliate').first()
  if (!session || session.redeemedAt || session.expiresAt < DateTime.now()) return null
  return session
}
