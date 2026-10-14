import type PartnerAffiliate from '#models/partner_affiliate'
import type PartnerEvent from '#models/partner_event'

/** Affiliate as the API returns it (openapi `Affiliate`). Never exposes numeric ids. */
export function affiliateToApi(affiliate: PartnerAffiliate) {
  return {
    object: 'affiliate',
    id: affiliate.publicId,
    external_user_id: affiliate.externalUserId,
    status: affiliate.status,
    email: affiliate.email,
    display_name: affiliate.displayName,
    metadata: affiliate.metadata ?? {},
    livemode: affiliate.livemode,
    created: Math.floor(affiliate.createdAt.toSeconds()),
  }
}

/** Event as the API returns it (openapi `Event`). Preload click, affiliate and link to get their public ids. */
export function eventToApi(event: PartnerEvent) {
  return {
    object: 'event',
    id: event.publicId,
    event_id: event.externalEventId,
    type: event.type,
    status: event.status,
    reason: event.reason,
    affiliate: event.affiliate?.publicId ?? null,
    link: event.link?.publicId ?? null,
    click: event.click?.publicId ?? null,
    commission: null,
    referred_external_user_id: event.referredExternalUserId,
    amount: event.amount,
    currency: event.currency,
    metadata: event.metadata ?? {},
    livemode: event.livemode,
    occurred_at: Math.floor(event.occurredAt.toSeconds()),
    created: Math.floor(event.createdAt.toSeconds()),
  }
}
