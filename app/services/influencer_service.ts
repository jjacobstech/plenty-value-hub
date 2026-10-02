import InfluencerProfile from '#models/influencer_profile'
import CollaborationAgreement from '#models/collaboration_agreement'
import InfluencerContent from '#models/influencer_content'
import VendorConversion from '#models/vendor_conversion'
import CommissionLedger from '#models/commission_ledger'
import { DateTime } from 'luxon'

export interface InfluencerStats {
  totalEarnings: number
  totalConversions: number
  totalClicks: number
  activeCollaborations: number
  pendingCollaborations: number
  conversionRate: number
  engagementRate: number
  topPerformingContent: Array<{
    id: number
    title: string
    platform: string
    views: number
    conversions: number
    revenue: number
  }>
}

export interface CollaborationMetrics {
  totalEarned: number
  totalConversions: number
  conversionRate: number
  avgOrderValue: number
  performanceVsTarget: number
  bonusEarned: number
}

export default class InfluencerService {
  /**
   * Create an influencer profile
   */
  static async createProfile(affiliateId: number, data: any): Promise<InfluencerProfile> {
    return InfluencerProfile.create({
      affiliateId,
      displayName: data.displayName,
      bio: data.bio,
      profileImageUrl: data.profileImageUrl,
      category: data.category,
      niche: data.niche,
      followerCount: data.followerCount || 0,
      engagementRate: data.engagementRate || 0,
      platforms: JSON.stringify(data.platforms || {}),
      platformFollowers: JSON.stringify(data.platformFollowers || {}),
      verificationStatus: 'pending',
      email: data.email,
      phone: data.phone,
      website: data.website,
      countryCode: data.countryCode,
      bannerImageUrl: data.bannerImageUrl,
    })
  }

  /**
   * Get influencer profile with stats
   */
  static async getProfileWithStats(influencerId: number): Promise<{
    profile: InfluencerProfile
    stats: InfluencerStats
  }> {
    const profile = await InfluencerProfile.findOrFail(influencerId)

    const stats = await this.getInfluencerStats(influencerId)

    return { profile, stats }
  }

  /**
   * Get influencer statistics
   */
  static async getInfluencerStats(influencerId: number): Promise<InfluencerStats> {
    const profile = await InfluencerProfile.find(influencerId)
    if (!profile) {
      throw new Error('Influencer not found')
    }

    // Get conversions and commissions
    const conversions = await VendorConversion.query()
      .where('affiliate_id', profile.affiliateId)
      .select('*')

    const commissions = await CommissionLedger.query()
      .where('affiliate_id', profile.affiliateId)
      .select('*')

    const totalEarnings = commissions.reduce((sum, c) => sum + (c.amount || 0), 0)
    const totalConversions = conversions.length

    // Get content metrics
    const content = await InfluencerContent.query()
      .where('influencer_id', influencerId)
      .where('status', 'published')
      .select('*')

    const totalClicks = content.reduce((sum, c) => sum + (c.clicks || 0), 0)
    const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0)
    const totalEngagement = content.reduce((sum, c) => sum + (c.likes || 0) + (c.comments || 0) + (c.shares || 0), 0)

    // Get collaborations
    const allCollaborations = await CollaborationAgreement.query()
      .where('influencer_id', influencerId)
      .select('*')

    const activeCollaborations = allCollaborations.filter((c) => c.status === 'active').length
    const pendingCollaborations = allCollaborations.filter((c) => c.status === 'proposed').length

    // Top performing content
    const topContent = content
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        title: c.title,
        platform: c.platform,
        views: c.views,
        conversions: c.conversions,
        revenue: c.revenue,
      }))

    return {
      totalEarnings,
      totalConversions,
      totalClicks,
      activeCollaborations,
      pendingCollaborations,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      engagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
      topPerformingContent: topContent,
    }
  }

  /**
   * Propose a collaboration agreement
   */
  static async proposeCollaboration(
    influencerId: number,
    campaignId: number,
    vendorId: number,
    data: any,
    proposedBy: number
  ): Promise<CollaborationAgreement> {
    const startDate = DateTime.fromISO(data.startDate)

    return CollaborationAgreement.create({
      influencerId,
      campaignId,
      vendorId,
      title: data.title,
      description: data.description,
      status: 'proposed',
      commissionStructure: JSON.stringify(data.commissionStructure),
      baseCommissionRate: data.baseCommissionRate,
      bonusStructure: data.bonusStructure ? JSON.stringify(data.bonusStructure) : null,
      performanceTargets: data.performanceTargets ? JSON.stringify(data.performanceTargets) : null,
      exclusivityClause: data.exclusivityClause || false,
      exclusiveCategories: data.exclusiveCategories
        ? JSON.stringify(data.exclusiveCategories)
        : null,
      contentRequirements: data.contentRequirements
        ? JSON.stringify(data.contentRequirements)
        : null,
      paymentTerms: data.paymentTerms || 'monthly',
      minimumPayout: data.minimumPayout || 0,
      startDate,
      endDate: data.endDate ? DateTime.fromISO(data.endDate) : null,
      autoRenewal: data.autoRenewal || false,
      renewalTermDays: data.renewalTermDays,
      proposedBy,
      proposedAt: DateTime.now(),
    })
  }

  /**
   * Accept collaboration agreement
   */
  static async acceptCollaboration(agreementId: number, acceptedBy: number): Promise<CollaborationAgreement> {
    const agreement = await CollaborationAgreement.findOrFail(agreementId)

    agreement.status = 'active'
    agreement.acceptedAt = DateTime.now()
    agreement.acceptedBy = acceptedBy

    await agreement.save()

    return agreement
  }

  /**
   * Get collaboration metrics
   */
  static async getCollaborationMetrics(agreementId: number): Promise<CollaborationMetrics> {
    const agreement = await CollaborationAgreement.findOrFail(agreementId)

    // Get conversions for this collaboration
    const conversions = await VendorConversion.query()
      .where('campaign_id', agreement.campaignId)
      .select('*')

    const totalEarned = agreement.totalEarnings
    const totalConversions = conversions.length
    const totalRevenue = conversions.reduce((sum, c) => sum + (c.amount || 0), 0)
    const avgOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0

    // Check performance targets
    let performanceVsTarget = 100
    if (agreement.performanceTargets) {
      const targets = JSON.parse(agreement.performanceTargets)
      if (targets.minimumConversions && totalConversions < targets.minimumConversions) {
        performanceVsTarget = (totalConversions / targets.minimumConversions) * 100
      }
    }

    // Calculate bonus earned
    let bonusEarned = 0
    if (agreement.bonusStructure) {
      const bonuses = JSON.parse(agreement.bonusStructure)
      if (bonuses.conversionBonus && totalConversions >= bonuses.conversionThreshold) {
        bonusEarned += bonuses.conversionBonus
      }
      if (bonuses.revenueBonus && totalRevenue >= bonuses.revenueThreshold) {
        bonusEarned += bonuses.revenueBonus
      }
    }

    return {
      totalEarned,
      totalConversions,
      conversionRate: totalRevenue > 0 ? (totalConversions / totalRevenue) * 100 : 0,
      avgOrderValue,
      performanceVsTarget,
      bonusEarned,
    }
  }

  /**
   * Create influencer content
   */
  static async createContent(influencerId: number, data: any): Promise<InfluencerContent> {
    return InfluencerContent.create({
      influencerId,
      campaignId: data.campaignId,
      title: data.title,
      description: data.description,
      contentType: data.contentType,
      platform: data.platform,
      contentUrl: data.contentUrl,
      thumbnailUrl: data.thumbnailUrl,
      affiliateLink: data.affiliateLink,
      status: data.status || 'draft',
      hashtags: data.hashtags ? JSON.stringify(data.hashtags) : null,
      mentions: data.mentions ? JSON.stringify(data.mentions) : null,
      linkedProducts: data.linkedProducts ? JSON.stringify(data.linkedProducts) : null,
      mediaAssets: data.mediaAssets ? JSON.stringify(data.mediaAssets) : null,
    })
  }

  /**
   * Get influencer content with analytics
   */
  static async getContentAnalytics(contentId: number) {
    const content = await InfluencerContent.findOrFail(contentId)

    return {
      id: content.id,
      title: content.title,
      platform: content.platform,
      contentType: content.contentType,
      publishedAt: content.publishedAt,
      metrics: {
        views: content.views,
        likes: content.likes,
        comments: content.comments,
        shares: content.shares,
        engagementRate: content.engagementRate,
        clicks: content.clicks,
        conversions: content.conversions,
        revenue: content.revenue,
      },
      performance: {
        viewsPerDay: content.publishedAt
          ? content.views / DateTime.now().diff(content.publishedAt, 'days').as('days')
          : 0,
        conversionRate: content.clicks > 0 ? (content.conversions / content.clicks) * 100 : 0,
        revenuePerClick: content.clicks > 0 ? content.revenue / content.clicks : 0,
      },
    }
  }

  /**
   * Get influencer's content performance
   */
  static async getContentPerformance(
    influencerId: number,
    startDate?: DateTime,
    endDate?: DateTime
  ) {
    let query = InfluencerContent.query().where('influencer_id', influencerId)

    if (startDate && endDate) {
      const startSql = startDate.toSQL()
      const endSql = endDate.toSQL()
      if (startSql && endSql) {
        query = query.where('published_at', '>=', startSql).where('published_at', '<=', endSql)
      }
    }

    const content = await query.select('*')

    const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0)
    const totalClicks = content.reduce((sum, c) => sum + (c.clicks || 0), 0)
    const totalConversions = content.reduce((sum, c) => sum + (c.conversions || 0), 0)
    const totalRevenue = content.reduce((sum, c) => sum + (c.revenue || 0), 0)
    const avgEngagement = content.length > 0 ? content.reduce((sum, c) => sum + c.engagementRate, 0) / content.length : 0

    const byPlatform: Record<string, any> = {}
    content.forEach((c) => {
      if (!byPlatform[c.platform]) {
        byPlatform[c.platform] = { count: 0, views: 0, clicks: 0, conversions: 0, revenue: 0 }
      }
      byPlatform[c.platform].count++
      byPlatform[c.platform].views += c.views
      byPlatform[c.platform].clicks += c.clicks
      byPlatform[c.platform].conversions += c.conversions
      byPlatform[c.platform].revenue += c.revenue
    })

    return {
      totalContent: content.length,
      totalViews,
      totalClicks,
      totalConversions,
      totalRevenue,
      avgEngagement,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      byPlatform,
      topContent: content
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 10)
        .map((c) => ({
          id: c.id,
          title: c.title,
          platform: c.platform,
          views: c.views,
          conversions: c.conversions,
          revenue: c.revenue,
        })),
    }
  }

  /**
   * Verify influencer profile
   */
  static async verifyProfile(influencerId: number, approvedBy: number): Promise<InfluencerProfile> {
    const profile = await InfluencerProfile.findOrFail(influencerId)

    profile.verificationStatus = 'verified'
    profile.isApproved = true
    profile.approvedAt = DateTime.now()
    profile.approvedBy = approvedBy

    await profile.save()

    return profile
  }

  /**
   * Reject influencer profile
   */
  static async rejectProfile(
    influencerId: number,
    reason: string
  ): Promise<InfluencerProfile> {
    const profile = await InfluencerProfile.findOrFail(influencerId)

    profile.verificationStatus = 'suspended'
    profile.rejectionReason = reason
    profile.isApproved = false

    await profile.save()

    return profile
  }

  /**
   * Update influencer metrics
   */
  static async updateMetrics(influencerId: number, metrics: any): Promise<void> {
    const profile = await InfluencerProfile.findOrFail(influencerId)

    if (metrics.followerCount !== undefined) {
      profile.followerCount = metrics.followerCount
    }
    if (metrics.engagementRate !== undefined) {
      profile.engagementRate = metrics.engagementRate
    }
    if (metrics.revenue30Days !== undefined) {
      profile.revenue30Days = metrics.revenue30Days
    }
    if (metrics.revenue90Days !== undefined) {
      profile.revenue90Days = metrics.revenue90Days
    }
    if (metrics.totalRevenue !== undefined) {
      profile.totalRevenue = metrics.totalRevenue
    }
    if (metrics.conversionRate !== undefined) {
      profile.conversionRate = metrics.conversionRate
    }

    await profile.save()
  }
}
