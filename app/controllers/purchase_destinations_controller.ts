import PurchaseDestination from '#models/purchase_destination'
import Campaign from '#models/campaign'
import AffiliateLink from '#models/affiliate_link'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

export default class PurchaseDestinationsController {
  /**
   * Configure external purchase destination for a campaign
   * Vendors can set up where customers will be redirected to complete purchases
   */
  async configureCampaignDestination({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.campaignId)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const {
      purchase_destination_url,
      purchase_destination_type,
      webhook_url,
      integration_config,
    } = request.only([
      'purchase_destination_url',
      'purchase_destination_type',
      'webhook_url',
      'integration_config',
    ])

    // Validate that the URL is properly formatted
    if (purchase_destination_url) {
      try {
        new URL(purchase_destination_url)
      } catch {
        return response.status(400).json({ error: 'Invalid purchase destination URL' })
      }
    }

    // Generate webhook secret for security
    const webhookSecret = webhook_url ? crypto.randomBytes(32).toString('hex') : null

    campaign.purchaseDestinationUrl = purchase_destination_url
    campaign.purchaseDestinationType = purchase_destination_type || 'external_url'
    campaign.webhookUrl = webhook_url
    campaign.webhookSecret = webhookSecret
    campaign.externalIntegrationConfig = integration_config

    await campaign.save()

    return response.json({
      success: true,
      message: 'Purchase destination configured',
      data: {
        id: campaign.id,
        purchaseDestinationUrl: campaign.purchaseDestinationUrl,
        purchaseDestinationType: campaign.purchaseDestinationType,
        webhookSecret: webhookSecret, // Only returned on initial setup
      },
    })
  }

  /**
   * Generate a redirect link for an affiliate
   * This link captures affiliate info and redirects to vendor's external checkout
   */
  async generateRedirectLink({ params, request, response }: HttpContext) {
    const campaignId = Number(params.campaignId)
    const affiliateLinkId = request.input('affiliate_link_id')
    const customerEmail = request.input('customer_email')

    const campaign = await Campaign.query()
      .where('id', campaignId)
      .where('status', 'active')
      .first()

    if (!campaign) {
      return response.status(404).json({ error: 'Campaign not found or inactive' })
    }

    if (!campaign.purchaseDestinationUrl) {
      return response.status(400).json({ error: 'Campaign does not have external purchase destination configured' })
    }

    let affiliateLink: AffiliateLink | null = null
    if (affiliateLinkId) {
      affiliateLink = await AffiliateLink.find(affiliateLinkId)
      if (!affiliateLink || affiliateLink.campaignId !== campaignId) {
        return response.status(400).json({ error: 'Invalid affiliate link' })
      }
    }

    const destination = await PurchaseDestination.create({
      campaignId,
      affiliateLinkId: affiliateLink?.id,
      affiliateId: affiliateLink?.affiliateId,
      destinationUrl: campaign.purchaseDestinationUrl,
      status: 'pending',
      customerEmail,
      expiresAt: DateTime.now().plus({ days: 30 }),
    })

    // Generate redirect URL
    const redirectUrl = `/api/purchase-destinations/${destination.redirectToken}/redirect`

    return response.json({
      success: true,
      message: 'Redirect link generated',
      data: {
        id: destination.id,
        redirectUrl,
        expiresAt: destination.expiresAt,
      },
    })
  }

  /**
   * Handle the actual redirect to external vendor
   * This endpoint tracks the redirect and sends customer to vendor checkout
   */
  async handleRedirect({ params, response }: HttpContext) {
    const { token } = params

    const destination = await PurchaseDestination.query()
      .where('redirect_token', token)
      .where('status', '!=', 'converted')
      .first()

    if (!destination) {
      return response.status(404).json({ error: 'Redirect not found or already converted' })
    }

    if (destination.isExpired()) {
      destination.status = 'expired'
      await destination.save()
      return response.status(410).json({ error: 'Redirect link has expired' })
    }

    // Mark as redirected
    destination.markAsRedirected()
    await destination.save()

    // Update campaign redirect count
    const campaign = await Campaign.find(destination.campaignId)
    if (campaign) {
      campaign.totalRedirects = (campaign.totalRedirects || 0) + 1
      await campaign.save()
    }

    // Redirect to external destination
    // Add tracking parameters to the destination URL
    const url = new URL(destination.destinationUrl)
    url.searchParams.append('plenty_value_token', destination.redirectToken)
    url.searchParams.append('affiliate_id', destination.affiliateId?.toString() || '')
    url.searchParams.append('campaign_id', destination.campaignId?.toString() || '')

    return response.redirect(url.toString())
  }

  /**
   * Webhook endpoint for external vendors to report conversions
   * Vendors call this endpoint to confirm a purchase was completed
   */
  async recordConversion({ params, request, response }: HttpContext) {
    const { campaignId } = params
    const { redirect_token, order_id, amount, metadata } = request.all()

    // Find the destination record
    const destination = await PurchaseDestination.query()
      .where('redirect_token', redirect_token)
      .where('campaign_id', campaignId)
      .first()

    if (!destination) {
      return response.status(404).json({ error: 'Invalid redirect token' })
    }

    // Check if already converted
    if (destination.isConverted()) {
      return response.status(400).json({ error: 'Conversion already recorded' })
    }

    // Mark as converted
    destination.markAsConverted(order_id, amount)
    destination.metadata = metadata
    await destination.save()

    // Update campaign conversion count
    const campaign = await Campaign.find(campaignId)
    if (campaign) {
      campaign.totalExternalConversions = (campaign.totalExternalConversions || 0) + 1

      // Update conversion rate
      if (campaign.totalRedirects > 0) {
        campaign.conversionRate = Number(
          ((campaign.totalExternalConversions / campaign.totalRedirects) * 100).toFixed(2)
        )
      }

      // Update commission total
      const currentPaid = Number(campaign.totalCommissionPaid as any) || 0
      const newAmount = currentPaid + Number(amount || 0)
      campaign.totalCommissionPaid = newAmount as any
      await campaign.save()
    }

    // If there's an affiliate link, create an order record
    if (destination.affiliateLinkId) {
      const affiliateLink = await AffiliateLink.find(destination.affiliateLinkId)
      if (affiliateLink) {
        affiliateLink.conversions = (affiliateLink.conversions || 0) + 1
        affiliateLink.revenue = (Number(affiliateLink.revenue as any) || 0) + Number(amount || 0) as any
        await affiliateLink.save()
      }
    }

    return response.json({
      success: true,
      message: 'Conversion recorded',
      data: {
        id: destination.id,
        status: destination.status,
      },
    })
  }

  /**
   * Verify webhook signature
   * Vendors should send requests with HMAC signature for security
   */
  verifyWebhookSignature(signature: string, payload: string, secret: string): boolean {
    const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
  }

  /**
   * Get purchase destination statistics
   * Shows how many redirects and conversions for a campaign
   */
  async getStats({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.campaignId)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const destinations = await PurchaseDestination.query().where('campaign_id', campaign.id)

    const converted = destinations.filter((d) => d.status === 'converted')
    const redirects = destinations.filter((d) => d.status === 'redirected' || d.status === 'converted')
    const pending = destinations.filter((d) => d.status === 'pending')
    const expired = destinations.filter((d) => d.status === 'expired')

    const totalAmount = converted.reduce((sum, d) => sum + (d.externalAmount || 0), 0)

    return response.json({
      success: true,
      data: {
        redirects: redirects.length,
        conversions: converted.length,
        pending: pending.length,
        expired: expired.length,
        conversionRate: redirects.length > 0 ? ((converted.length / redirects.length) * 100).toFixed(2) : '0',
        totalAmount,
      },
    })
  }
}
