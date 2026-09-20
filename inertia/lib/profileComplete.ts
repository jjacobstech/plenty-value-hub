/**
 * profileComplete.ts
 *
 * Determines whether a vendor or affiliate has completed their profile.
 * Used both on the frontend (banners, guards) and can be mirrored server-side
 * when computing the `profileComplete` flag passed via Inertia props.
 *
 * A "complete" profile requires the minimum viable set of fields so the
 * platform can operate correctly (display the user publicly + process payouts).
 */

export type ProfileRole = 'vendor' | 'affiliate'

export interface ProfileCompletenessResult {
  /** True when all required fields are filled. */
  complete: boolean
  /** Human-readable list of missing fields, for display in the banner. */
  missing: string[]
}

/**
 * Vendor required fields:
 *  - businessName  (displayed on product listings)
 *  - businessDescription (shown on store page)
 *  - phone
 *  - payoutMethod + at least one valid payout detail
 */
function checkVendor(user: Record<string, any>): ProfileCompletenessResult {
  const missing: string[] = []

  if (!user.businessName?.trim()) missing.push('Business name')
  if (!user.businessDescription?.trim()) missing.push('Business description')
  if (!user.phone?.trim()) missing.push('Phone number')

  const hasPayoutDetail =
    (user.payoutBankName && user.payoutAccountNumber && user.payoutAccountName) ||
    (user.payoutMobileProvider && user.payoutMobileNumber) ||
    user.payoutEmail?.trim() ||
    user.payoutAccountId?.trim()

  if (!user.payoutMethod || !hasPayoutDetail) missing.push('Payout information')

  return { complete: missing.length === 0, missing }
}

/**
 * Affiliate required fields:
 *  - niche          (needed to match with products)
 *  - marketingChannels
 *  - phone
 *  - payoutMethod + at least one valid payout detail
 */
function checkAffiliate(user: Record<string, any>): ProfileCompletenessResult {
  const missing: string[] = []

  if (!user.niche?.trim()) missing.push('Niche / audience')
  if (!user.marketingChannels?.trim()) missing.push('Marketing channels')
  if (!user.phone?.trim()) missing.push('Phone number')

  const hasPayoutDetail =
    (user.payoutBankName && user.payoutAccountNumber && user.payoutAccountName) ||
    (user.payoutMobileProvider && user.payoutMobileNumber) ||
    user.payoutEmail?.trim() ||
    user.payoutAccountId?.trim()

  if (!user.payoutMethod || !hasPayoutDetail) missing.push('Payout information')

  return { complete: missing.length === 0, missing }
}

/**
 * Main entry point.
 * Pass the serialized user object and their role.
 */
export function getProfileCompleteness(
  user: Record<string, any>,
  role: ProfileRole
): ProfileCompletenessResult {
  if (role === 'vendor') return checkVendor(user)
  if (role === 'affiliate') return checkAffiliate(user)
  return { complete: true, missing: [] }
}

/**
 * Convenience boolean — mirrors what the backend flag `profileComplete` returns.
 */
export function isProfileComplete(user: Record<string, any>, role: ProfileRole): boolean {
  return getProfileCompleteness(user, role).complete
}
