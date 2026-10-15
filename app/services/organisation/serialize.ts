import type OrganisationAffiliate from '#models/organisation_affiliate'
import type OrganisationEvent from '#models/organisation_event'
import type OrganisationCommission from '#models/organisation_commission'
import type OrganisationLink from '#models/organisation_link'
import { linkUrl } from '#services/organisation/link_service'

/** Affiliate as the API returns it (openapi `Affiliate`). Never exposes numeric ids. */
export function affiliateToApi(affiliate: OrganisationAffiliate) {
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
export function eventToApi(event: OrganisationEvent) {
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
    commission: event.commission?.publicId ?? null,
    referred_external_user_id: event.referredExternalUserId,
    amount: event.amount,
    currency: event.currency,
    metadata: event.metadata ?? {},
    livemode: event.livemode,
    occurred_at: Math.floor(event.occurredAt.toSeconds()),
    created: Math.floor(event.createdAt.toSeconds()),
  }
}

/** Commission as the API returns it (openapi `Commission`). Preload `event` for its public id. */
export function commissionToApi(commission: OrganisationCommission) {
  return {
    object: 'commission',
    id: commission.publicId,
    event: commission.event?.publicId ?? null,
    affiliate: commission.affiliate?.publicId ?? null,
    affiliate_external_user_id: commission.affiliateExternalUserId,
    amount: commission.amount,
    currency: commission.currency,
    status: commission.status,
    hold_until: Math.floor(commission.holdUntil.toSeconds()),
    approved_at: commission.approvedAt ? Math.floor(commission.approvedAt.toSeconds()) : null,
    rejected_at: commission.rejectedAt ? Math.floor(commission.rejectedAt.toSeconds()) : null,
    reversed_at: commission.reversedAt ? Math.floor(commission.reversedAt.toSeconds()) : null,
    paid_at: commission.paidAt ? Math.floor(commission.paidAt.toSeconds()) : null,
    payout_reference: commission.payoutReference,
    reason: commission.reason,
    livemode: commission.livemode,
    created: Math.floor(commission.createdAt.toSeconds()),
  }
}

export function linkToApi(link: OrganisationLink) {
  return {
    object: 'link',
    id: link.publicId,
    affiliate: link.affiliate?.publicId ?? null,
    code: link.code,
    url: linkUrl(link),
    product_ref: link.productRef,
    campaign_ref: link.campaignRef,
    destination_url: link.destinationUrl,
    status: link.status,
    metadata: link.metadata ?? {},
    livemode: link.livemode,
    created: Math.floor(link.createdAt.toSeconds()),
  }
}
