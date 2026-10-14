import type PartnerAffiliate from '#models/partner_affiliate'

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
