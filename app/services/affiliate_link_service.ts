import { randomUUID } from 'crypto'
import AffiliateLink from '#models/affiliate_link'
import Click from '#models/click'
import Conversion from '#models/conversion'
import { DateTime } from 'luxon'

interface CreateLinkData {
  affiliateId: number
  campaignId: number
  customAlias?: string
  description?: string
  expiresAt?: DateTime
}

export default class AffiliateLinkService {
  /**
   * Generate unique slug for URL
   */
  static generateSlug(customAlias?: string): string {
    if (customAlias) {
      return customAlias.toLowerCase().replace(/\s+/g, '-')
    }
    return randomUUID().substring(0, 12)
  }

  /**
   * Generate unique click ID
   */
  static generateClickId(): string {
    return `clk_${randomUUID().replace(/-/g, '').substring(0, 20)}`
  }

  /**
   * Generate unique conversion ID
   */
  static generateConversionId(): string {
    return `conv_${randomUUID().replace(/-/g, '').substring(0, 20)}`
  }

  /**
   * Create affiliate link
   */
  static async createLink(data: CreateLinkData): Promise<AffiliateLink> {
    const slug = this.generateSlug(data.customAlias)
    const token = randomUUID()

    const link = await AffiliateLink.create({
      affiliateId: data.affiliateId,
      campaignId: data.campaignId,
      slug,
      token,
      customAlias: data.customAlias || null,
      description: data.description || null,
      expiresAt: data.expiresAt || null,
    })

    return link
  }

  /**
   * Get affiliate links
   */
  static async getAffiliateLinks(affiliateId: number, campaignId?: number) {
    let query = AffiliateLink.query().where('affiliate_id', affiliateId)

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    return query.orderBy('created_at', 'desc')
  }

  /**
   * Get link by slug
   */
  static async getLinkBySlug(slug: string) {
    return AffiliateLink.query()
      .where('slug', slug)
      .where('is_active', true)
      .first()
  }

  /**
   * Get link by token
   */
  static async getLinkByToken(token: string) {
    return AffiliateLink.query()
      .where('token', token)
      .where('is_active', true)
      .first()
  }

  /**
   * Record a click
   */
  static async recordClick(
    affiliateLinkId: number,
    affiliateId: number,
    campaignId: number,
    metadata?: {
      userAgent?: string
      ipAddress?: string
      referrer?: string
      deviceType?: string
      browser?: string
      os?: string
      country?: string
      city?: string
    }
  ): Promise<Click> {
    const clickId = this.generateClickId()

    const click = await Click.create({
      clickId,
      affiliateLinkId,
      affiliateId,
      campaignId,
      userAgent: metadata?.userAgent || null,
      ipAddress: metadata?.ipAddress || null,
      referrer: metadata?.referrer || null,
      deviceType: metadata?.deviceType || null,
      browser: metadata?.browser || null,
      os: metadata?.os || null,
      country: metadata?.country || null,
      city: metadata?.city || null,
      clickedAt: DateTime.now(),
    })

    await AffiliateLink.query()
      .where('id', affiliateLinkId)
      .increment('total_clicks', 1)

    return click
  }

  /**
   * Record a conversion
   */
  static async recordConversion(
    clickId: string,
    affiliateLinkId: number,
    affiliateId: number,
    campaignId: number,
    orderValue?: number,
    externalOrderId?: string,
    externalConversionId?: string
  ): Promise<Conversion> {
    const conversionId = this.generateConversionId()

    const click = await Click.query()
      .where('click_id', clickId)
      .first()

    const conversion = await Conversion.create({
      conversionId,
      clickId: click?.id || null,
      affiliateLinkId,
      affiliateId,
      campaignId,
      orderValue: orderValue || null,
      externalOrderId: externalOrderId || null,
      externalConversionId: externalConversionId || null,
      status: 'pending',
      convertedAt: DateTime.now(),
    })

    return conversion
  }

  /**
   * Get click attribution within window
   */
  static async findClickInAttributionWindow(
    affiliateId: number,
    campaignId: number,
    attributionWindowDays: number,
    beforeTimestamp: DateTime
  ) {
    const windowStart = beforeTimestamp.minus({ days: attributionWindowDays })

    return Click.query()
      .where('affiliate_id', affiliateId)
      .where('campaign_id', campaignId)
      .where('clicked_at', '>=', windowStart.toSQL())
      .where('clicked_at', '<=', beforeTimestamp.toSQL())
      .orderBy('clicked_at', 'desc')
      .first()
  }

  /**
   * Approve conversion
   */
  static async approveConversion(
    conversionId: number,
    adminId: number,
    commissionAmount?: number
  ): Promise<Conversion> {
    const conversion = await Conversion.find(conversionId)
    if (!conversion) {
      throw new Error('Conversion not found')
    }

    if (conversion.status !== 'pending') {
      throw new Error('Only pending conversions can be approved')
    }

    await conversion
      .merge({
        status: 'approved',
        approvedAt: DateTime.now(),
        approvedByAdminId: adminId,
        commissionAmount: commissionAmount || null,
      })
      .save()

    await AffiliateLink.query()
      .where('id', conversion.affiliateLinkId)
      .increment('total_conversions', 1)

    if (commissionAmount) {
      await AffiliateLink.query()
        .where('id', conversion.affiliateLinkId)
        .increment('total_earnings', commissionAmount)
    }

    return conversion
  }

  /**
   * Reject conversion
   */
  static async rejectConversion(
    conversionId: number,
    adminId: number,
    reason: string
  ): Promise<Conversion> {
    const conversion = await Conversion.find(conversionId)
    if (!conversion) {
      throw new Error('Conversion not found')
    }

    if (conversion.status !== 'pending') {
      throw new Error('Only pending conversions can be rejected')
    }

    await conversion
      .merge({
        status: 'rejected',
        rejectedAt: DateTime.now(),
        rejectionReason: reason,
      })
      .save()

    return conversion
  }

  /**
   * Reverse conversion
   */
  static async reverseConversion(conversionId: number, reason: string): Promise<Conversion> {
    const conversion = await Conversion.find(conversionId)
    if (!conversion) {
      throw new Error('Conversion not found')
    }

    if (conversion.status !== 'approved') {
      throw new Error('Only approved conversions can be reversed')
    }

    const link = await AffiliateLink.find(conversion.affiliateLinkId)
    if (!link) {
      throw new Error('Affiliate link not found')
    }

    await conversion
      .merge({
        status: 'reversed',
        reversedAt: DateTime.now(),
      })
      .save()

    await link.merge({
      totalConversions: Math.max(0, link.totalConversions - 1),
      totalEarnings: Math.max(0, link.totalEarnings - (conversion.commissionAmount || 0)),
    }).save()

    return conversion
  }

  /**
   * Disable affiliate link
   */
  static async disableLink(linkId: number): Promise<AffiliateLink> {
    const link = await AffiliateLink.find(linkId)
    if (!link) {
      throw new Error('Link not found')
    }

    await link.merge({ isActive: false }).save()
    return link
  }

  /**
   * Get link performance metrics
   */
  static async getLinkMetrics(linkId: number) {
    const link = await AffiliateLink.find(linkId)
    if (!link) {
      throw new Error('Link not found')
    }

    const conversions = await Conversion.query()
      .where('affiliate_link_id', linkId)
      .where('status', 'approved')

    const conversionRate = link.totalClicks > 0 
      ? (link.totalConversions / link.totalClicks) * 100 
      : 0

    return {
      linkId: link.id,
      totalClicks: link.totalClicks,
      totalConversions: link.totalConversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalEarnings: link.totalEarnings,
      avgOrderValue: link.totalConversions > 0 
        ? link.totalEarnings / link.totalConversions 
        : 0,
    }
  }
}
