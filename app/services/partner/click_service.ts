import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import PartnerClick from '#models/partner_click'
import PartnerLink from '#models/partner_link'
import Partner from '#models/partner'
import PartnerAffiliate from '#models/partner_affiliate'
import limiter from '@adonisjs/limiter/services/main'
import { errors as limiterErrors } from '@adonisjs/limiter'
import env from '#start/env'

const BOT_PATTERN = /bot|crawler|spider|preview|facebookexternalhit|slackbot|whatsapp|telegram|curl|wget|headless|python-requests/i

export function isBot(userAgent: string): boolean {
  return BOT_PATTERN.test(userAgent)
}

/** Coarse browser family for reporting. Never the full user agent. */
export function userAgentFamily(userAgent: string): string {
  const families: [RegExp, string][] = [
    [/edg\//i, 'Edge'],
    [/firefox/i, 'Firefox'],
    [/chrome|chromium/i, 'Chrome'],
    [/safari/i, 'Safari'],
  ]
  return families.find(([pattern]) => pattern.test(userAgent))?.[1] ?? 'Other'
}

/**
 * Visitor hash = sha256(ip | user agent | daily salt). The daily salt is derived from APP_KEY and
 * the UTC date, so hashes cannot be linked across days and the raw IP is never stored.
 */
export function visitorHash(ip: string, userAgent: string, now: DateTime): string {
  const salt = crypto.createHash('sha256').update(`${env.get('APP_KEY')}:${now.toUTC().toISODate()}`).digest('hex')
  return crypto.createHash('sha256').update(`${ip}|${userAgent}|${salt}`).digest('hex')
}

/** Returns true if the visitor is under the per-hash redirect limit (60/min). Over the limit, the click is not counted. */
export async function withinVisitorLimit(hash: string): Promise<boolean> {
  try {
    await limiter.use({ requests: 60, duration: '1 min' }).consume(`redirect:${hash}`)
    return true
  } catch (error) {
    if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) return false
    throw error
  }
}

/** Writes one click row. A click counts as unique when this visitor did not click the link within the dedupe window. */
export async function recordClick(input: {
  partner: Partner
  link: PartnerLink
  affiliate: PartnerAffiliate
  clickIdPublic: string
  hash: string
  referrer: string | null
  utm: Record<string, string>
  userAgent: string
  now: DateTime
  dedupeMinutes: number
}) {
  const since = input.now.minus({ minutes: input.dedupeMinutes })
  // Two clicks from one visitor on one link are serialized, so only the first counts as unique.
  return db.transaction(async (trx) => {
    await trx.rawQuery('select pg_advisory_xact_lock(hashtext(?))', [`${input.link.id}:${input.hash}`])
    const repeat = await PartnerClick.query({ client: trx })
      .where('link_id', input.link.id)
      .where('visitor_hash', input.hash)
      .where('clicked_at', '>', since.toSQL()!)
      .first()

    return PartnerClick.create(
      {
        publicId: input.clickIdPublic,
        partnerId: input.partner.id,
        livemode: input.link.livemode,
        linkId: input.link.id,
        affiliateId: input.affiliate.id,
        productRef: input.link.productRef,
        campaignRef: input.link.campaignRef,
        visitorHash: input.hash,
        isUnique: !repeat,
        referrer: input.referrer,
        utm: input.utm,
        userAgentFamily: userAgentFamily(input.userAgent),
        clickedAt: input.now,
      },
      { client: trx }
    )
  })
}
