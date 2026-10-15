import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import env from '#start/env'
import { customAlphabet } from 'nanoid'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import type Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationLink from '#models/organisation_link'
import { publicId } from '#services/organisation/public_id'

// No look-alike characters (0, O, 1, l, I) so codes can be read aloud.
const codeAlphabet = customAlphabet('23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ', 8)

/** Base of the public redirect, e.g. https://go.example.com. Falls back to APP_URL. */
export function redirectBase(): string {
  return (env.get('PUBLIC_REDIRECT_BASE_URL') ?? env.get('APP_URL')).replace(/\/+$/, '')
}

export function linkUrl(link: OrganisationLink): string {
  return `${redirectBase()}/r/${link.code}`
}

/** A destination is allowed when its host equals an allowed domain or is a subdomain of one. */
export function assertDestinationAllowed(organisation: Organisation, destinationUrl: string, livemode: boolean) {
  const url = new URL(destinationUrl)
  if (livemode && url.protocol !== 'https:') {
    throw new OrganisationApiException('destination_url must use https in live mode.', 'invalid_request_error', 'parameter_invalid', 400, 'destination_url')
  }
  const allowed = organisation.allowedRedirectDomains.some(
    (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
  )
  if (!allowed) {
    throw new OrganisationApiException('destination_url host is not in allowed_redirect_domains', 'invalid_request_error', 'parameter_invalid', 400, 'destination_url')
  }
}

/** Creates the link, or returns the existing one for the same affiliate, product and campaign. */
export async function createOrGetLink(input: {
  trx?: TransactionClientContract
  organisation: Organisation
  livemode: boolean
  affiliate: OrganisationAffiliate
  productRef: string | null
  campaignRef: string | null
  destinationUrl: string
  updateDestination: boolean
  metadata: Record<string, string>
}): Promise<{ link: OrganisationLink; created: boolean }> {
  const { organisation, livemode, affiliate, productRef, campaignRef, destinationUrl, trx } = input
  const client = trx ?? db

  const existing = await OrganisationLink.query({ client: trx })
    .where('organisation_id', organisation.id)
    .where('livemode', livemode)
    .where('affiliate_id', affiliate.id)
    .whereRaw("coalesce(product_ref, '') = ?", [productRef ?? ''])
    .whereRaw("coalesce(campaign_ref, '') = ?", [campaignRef ?? ''])
    .first()

  if (existing) {
    if (existing.status === 'disabled') {
      throw new OrganisationApiException('This link is disabled.', 'invalid_request_error', 'link_disabled', 422)
    }
    if (input.updateDestination && existing.destinationUrl !== destinationUrl) {
      existing.destinationUrl = destinationUrl
      await existing.save()
    }
    return { link: existing, created: false }
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const inserted = await client.rawQuery(
        `insert into organisation_links (public_id, organisation_id, livemode, affiliate_id, code, product_ref, campaign_ref, destination_url, status, metadata, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?::jsonb, now(), now())
         on conflict (organisation_id, livemode, affiliate_id, (coalesce(product_ref, '')), (coalesce(campaign_ref, '')))
         do nothing returning id`,
        [publicId('lnk_'), organisation.id, livemode, affiliate.id, codeAlphabet(), productRef, campaignRef, destinationUrl, JSON.stringify(input.metadata)]
      )
      if (inserted.rows.length > 0) {
        return { link: await OrganisationLink.query({ client: trx }).where('id', inserted.rows[0].id).firstOrFail(), created: true }
      }
      // A concurrent request created the same link first.
      const winner = await OrganisationLink.query({ client: trx })
        .where('organisation_id', organisation.id)
        .where('livemode', livemode)
        .where('affiliate_id', affiliate.id)
        .whereRaw("coalesce(product_ref, '') = ?", [productRef ?? ''])
        .whereRaw("coalesce(campaign_ref, '') = ?", [campaignRef ?? ''])
        .firstOrFail()
      return { link: winner, created: false }
    } catch (error: any) {
      // Code collision: the unique code index rejected it, so try another code.
      if (error?.code === '23505' && String(error.constraint).includes('code')) continue
      throw error
    }
  }
  throw new Error('Could not generate a unique link code')
}
