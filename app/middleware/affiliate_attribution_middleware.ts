import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import AffiliateLink from '#models/affiliate_link'

export default class AffiliateAttributionMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response, auth } = ctx

    // Check for referral identifier in query parameters
    const refCode = String(request.input('ref') || request.input('aff') || '').trim()

    if (refCode) {
      try {
        const link = await AffiliateLink.findBy('linkCode', refCode)

        // Validate link exists and is active
        if (link && link.status === 'active') {
          const authUser = auth?.use('web')?.user

          // Self-referral check: block if logged in user is the affiliate
          const isSelfReferral = authUser && authUser.id === link.affiliateId

          if (!isSelfReferral) {
            // Track click counter
            link.clicks = (link.clicks || 0) + 1
            await link.save()

            const cookiePayload = JSON.stringify({
              affiliateId: link.affiliateId,
              linkId: link.id,
              linkCode: link.linkCode,
              productId: link.productId,
            })

            // 30 days attribution window
            const maxAgeInSeconds = 30 * 24 * 60 * 60

            // 1. HTTP-only secure cookie (source of truth for server-side reads)
            response.cookie('pv_aff_attr', cookiePayload, {
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              maxAge: maxAgeInSeconds,
            })

            // 2. Client-accessible cookie for localStorage fallback
            response.cookie('pv_ref_code', link.linkCode, {
              httpOnly: false,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              maxAge: maxAgeInSeconds,
            })
          }
        }
      } catch (err) {
        // Silently catch error to not disrupt normal request flow
        console.error('[AffiliateAttributionMiddleware] Error tracking referral:', err)
      }
    }

    return next()
  }
}
