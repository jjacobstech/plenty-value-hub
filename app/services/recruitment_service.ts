import AffiliateProfile from '#models/affiliate_profile'
import ReferralCode from '#models/referral_code'
import AffiliateReferral from '#models/affiliate_referral'
import RecruitmentCampaign from '#models/recruitment_campaign'
import AffiliateTier from '#models/affiliate_tier'
import TierPromotion from '#models/tier_promotion'
import AffiliateReward from '#models/affiliate_reward'
import RecruitmentMetric from '#models/recruitment_metric'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

interface CreateAffiliateProfileData {
  userId: number
  recruitmentSource: 'organic' | 'referral' | 'campaign' | 'admin_invited' | 'partnership'
  bio?: string
  specializations?: string[]
  targetAudiences?: string[]
}

export default class RecruitmentService {
  /**
   * Create a new affiliate profile
   */
  static async createAffiliateProfile(data: CreateAffiliateProfileData): Promise<AffiliateProfile> {
    const existingProfile = await AffiliateProfile.query().where('user_id', data.userId).first()
    if (existingProfile) {
      throw new Error('Affiliate profile already exists for this user')
    }

    const profile = await AffiliateProfile.create({
      userId: data.userId,
      affiliateTier: 'bronze',
      recruitmentSource: data.recruitmentSource,
      bio: data.bio || null,
      specializations: data.specializations || null,
      targetAudiences: data.targetAudiences || null,
      isApproved: false,
      isVerified: false,
      isSuspended: false,
    })

    await this.initializeMetrics(profile.id)

    return profile
  }

  /**
   * Generate a referral code for an affiliate
   */
  static async generateReferralCode(
    affiliateId: number,
    description?: string,
    maxUses?: number,
    expiresAt?: DateTime,
    codeType: 'personal' | 'campaign' | 'seasonal' | 'promotional' = 'personal'
  ): Promise<ReferralCode> {
    const affiliate = await AffiliateProfile.find(affiliateId)
    if (!affiliate) {
      throw new Error('Affiliate not found')
    }

    const code = `AFF${affiliateId}_${uuidv4().substring(0, 8).toUpperCase()}`

    const referralCode = await ReferralCode.create({
      affiliateId,
      code,
      description: description || null,
      maxUses: maxUses || null,
      codeType,
      isActive: true,
      startedAt: DateTime.now(),
      expiresAt: expiresAt || null,
    })

    return referralCode
  }

  /**
   * Process a referral when a user signs up with a referral code
   */
  static async processReferral(
    referralCode: string,
    referredUserId: number
  ): Promise<AffiliateReferral> {
    const codeRecord = await ReferralCode.query().where('code', referralCode).first()
    if (!codeRecord) {
      throw new Error('Invalid referral code')
    }

    if (!codeRecord.isActive) {
      throw new Error('Referral code is not active')
    }

    if (codeRecord.maxUses && codeRecord.currentUses >= codeRecord.maxUses) {
      throw new Error('Referral code usage limit reached')
    }

    if (codeRecord.expiresAt && codeRecord.expiresAt < DateTime.now()) {
      throw new Error('Referral code has expired')
    }

    const referral = await AffiliateReferral.create({
      affiliateId: codeRecord.affiliateId,
      referredUserId,
      referralCodeId: codeRecord.id,
      referralStatus: 'pending',
      activatedAt: DateTime.now(),
    })

    await codeRecord.merge({
      currentUses: codeRecord.currentUses + 1,
    }).save()

    return referral
  }

  /**
   * Activate a referral when the referred user makes their first purchase
   */
  static async activateReferral(referralId: number): Promise<AffiliateReferral> {
    const referral = await AffiliateReferral.find(referralId)
    if (!referral) {
      throw new Error('Referral not found')
    }

    await referral.merge({
      referralStatus: 'active',
      activatedAt: DateTime.now(),
    }).save()

    const profile = await AffiliateProfile.find(referral.affiliateId)
    if (profile) {
      await profile.merge({
        totalReferrals: profile.totalReferrals + 1,
        activeReferrals: profile.activeReferrals + 1,
      }).save()

      await this.updateMetrics(profile.id)
    }

    return referral
  }

  /**
   * Deactivate a referral if the referred user becomes inactive
   */
  static async deactivateReferral(referralId: number): Promise<AffiliateReferral> {
    const referral = await AffiliateReferral.find(referralId)
    if (!referral) {
      throw new Error('Referral not found')
    }

    await referral.merge({
      referralStatus: 'inactive',
      inactiveAt: DateTime.now(),
    }).save()

    const profile = await AffiliateProfile.find(referral.affiliateId)
    if (profile) {
      await profile.merge({
        activeReferrals: Math.max(0, profile.activeReferrals - 1),
      }).save()

      await this.updateMetrics(profile.id)
    }

    return referral
  }

  /**
   * Check and auto-promote affiliate if they meet tier requirements
   */
  static async checkAndPromote(affiliateId: number): Promise<TierPromotion | null> {
    const profile = await AffiliateProfile.find(affiliateId)
    if (!profile || profile.isSuspended) {
      return null
    }

    const metrics = await RecruitmentMetric.query().where('affiliate_id', affiliateId).first()
    if (!metrics) {
      return null
    }

    const tiers = await AffiliateTier.query().where('is_active', true).orderBy('id', 'asc')

    for (const tier of tiers) {
      if (profile.affiliateTier === tier.tierLevel) {
        continue
      }

      const meetsRequirements =
        profile.totalEarnings >= tier.monthlyEarningThreshold &&
        profile.activeReferrals >= tier.minimumActiveReferrals &&
        profile.averageConversionRate >= tier.conversionRateMinimum

      if (meetsRequirements) {
        const promotion = await TierPromotion.create({
          affiliateId,
          fromTier: profile.affiliateTier,
          toTier: tier.tierLevel,
          promotionReason: 'Automatic promotion based on performance metrics',
          isAutomatic: true,
          isApproved: true,
        })

        await profile.merge({
          affiliateTier: tier.tierLevel,
        }).save()

        return promotion
      }
    }

    return null
  }

  /**
   * Award a reward to an affiliate
   */
  static async awardReward(
    affiliateId: number,
    rewardType: 'performance_bonus' | 'referral_bonus' | 'achievement' | 'milestone' | 'promotional',
    rewardName: string,
    rewardAmount: number,
    description?: string
  ): Promise<AffiliateReward> {
    const affiliate = await AffiliateProfile.find(affiliateId)
    if (!affiliate) {
      throw new Error('Affiliate not found')
    }

    const reward = await AffiliateReward.create({
      affiliateId,
      rewardType,
      rewardName,
      rewardAmount,
      description: description || null,
      status: 'awarded',
      earnedAt: DateTime.now(),
      awardedAt: DateTime.now(),
    })

    return reward
  }

  /**
   * Claim a reward
   */
  static async claimReward(rewardId: number): Promise<AffiliateReward> {
    const reward = await AffiliateReward.find(rewardId)
    if (!reward) {
      throw new Error('Reward not found')
    }

    if (reward.status !== 'awarded') {
      throw new Error('Reward cannot be claimed in current status')
    }

    await reward.merge({
      status: 'claimed',
      claimedAt: DateTime.now(),
    }).save()

    return reward
  }

  /**
   * Create a recruitment campaign
   */
  static async createCampaign(
    adminId: number,
    name: string,
    campaignType: 'mass_invite' | 'tier_promotion' | 'seasonal' | 'performance_based',
    description?: string,
    targetAffiliates?: number,
    bonusCommissionRate?: number
  ): Promise<RecruitmentCampaign> {
    const campaign = await RecruitmentCampaign.create({
      adminId,
      name,
      campaignType,
      description: description || null,
      status: 'planning',
      targetAffiliates: targetAffiliates || null,
      bonusCommissionRate: bonusCommissionRate || null,
    })

    return campaign
  }

  /**
   * Launch a recruitment campaign
   */
  static async launchCampaign(campaignId: number): Promise<RecruitmentCampaign> {
    const campaign = await RecruitmentCampaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    await campaign.merge({
      status: 'active',
      startedAt: DateTime.now(),
    }).save()

    return campaign
  }

  /**
   * Complete a campaign
   */
  static async completeCampaign(campaignId: number): Promise<RecruitmentCampaign> {
    const campaign = await RecruitmentCampaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    await campaign.merge({
      status: 'completed',
      endedAt: DateTime.now(),
    }).save()

    return campaign
  }

  /**
   * Get affiliate profile with metrics
   */
  static async getAffiliateProfile(userId: number) {
    const profile = await AffiliateProfile.query()
      .where('user_id', userId)
      .preload('referralCodes')
      .preload('referrals')
      .first()

    let metrics = null
    if (profile) {
      metrics = await RecruitmentMetric.query().where('affiliate_id', profile.id).first()
    }

    return {
      profile,
      metrics,
    }
  }

  /**
   * Get top performers
   */
  static async getTopPerformers(limit = 10) {
    return AffiliateProfile.query()
      .where('is_approved', true)
      .orderBy('total_earnings', 'desc')
      .limit(limit)
  }

  /**
   * Get affiliates by tier
   */
  static async getAffiliatesByTier(tier: 'bronze' | 'silver' | 'gold' | 'platinum', page = 1, limit = 20) {
    return AffiliateProfile.query()
      .where('affiliate_tier', tier)
      .where('is_approved', true)
      .orderBy('total_earnings', 'desc')
      .paginate(page, limit)
  }

  /**
   * Initialize metrics for a new affiliate
   */
  private static async initializeMetrics(affiliateId: number): Promise<void> {
    await RecruitmentMetric.create({
      affiliateId,
      totalRecruited: 0,
      activeRecruited: 0,
      inactiveRecruited: 0,
      totalReferralEarnings: 0,
      averageReferralEarnings: 0,
      conversionRate: 0,
      topPerformerCount: 0,
      retentionRate: 0,
      lastCalculatedAt: DateTime.now(),
    })
  }

  /**
   * Update metrics for an affiliate
   */
  private static async updateMetrics(affiliateId: number): Promise<void> {
    const profile = await AffiliateProfile.find(affiliateId)
    if (!profile) return

    const referrals = await AffiliateReferral.query().where('affiliate_id', affiliateId)
    const activeReferrals = referrals.filter((r) => r.referralStatus === 'active').length
    const totalEarnings = referrals.reduce((sum, r) => sum + (r.earnedCommission || 0), 0)
    const avgEarnings = referrals.length > 0 ? totalEarnings / referrals.length : 0
    const conversionRate = referrals.length > 0 ? (referrals.filter((r) => r.referralStatus === 'converted').length / referrals.length) * 100 : 0

    const metrics = await RecruitmentMetric.query().where('affiliate_id', affiliateId).first()
    if (metrics) {
      await metrics.merge({
        totalRecruited: referrals.length,
        activeRecruited: activeReferrals,
        inactiveRecruited: referrals.filter((r) => r.referralStatus === 'inactive').length,
        totalReferralEarnings: totalEarnings,
        averageReferralEarnings: avgEarnings,
        conversionRate,
        lastCalculatedAt: DateTime.now(),
      }).save()
    }
  }
}
