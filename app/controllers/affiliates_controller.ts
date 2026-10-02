import AffiliateProfile from '#models/affiliate_profile'
import ReferralCode from '#models/referral_code'
import AffiliateReferral from '#models/affiliate_referral'
import AffiliateReward from '#models/affiliate_reward'
import RecruitmentCampaign from '#models/recruitment_campaign'
import RecruitmentService from '#services/recruitment_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AffiliatesController {
  /**
   * Create an affiliate profile
   */
  async createProfile({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const { recruitmentSource, bio, specializations, targetAudiences } = request.all()

    try {
      const profile = await RecruitmentService.createAffiliateProfile({
        userId: user.id,
        recruitmentSource,
        bio,
        specializations,
        targetAudiences,
      })

      return response.json({
        success: true,
        data: profile,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create affiliate profile',
      })
    }
  }

  /**
   * Get affiliate profile
   */
  async getProfile({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const profile = await AffiliateProfile.query()
      .where('user_id', user.id)
      .preload('referralCodes')
      .first()

    if (!profile) {
      return response.status(404).json({ error: 'Affiliate profile not found' })
    }

    return response.json({
      success: true,
      data: profile,
    })
  }

  /**
   * Update affiliate profile
   */
  async updateProfile({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const { bio, specializations, targetAudiences } = request.all()

    const profile = await AffiliateProfile.query().where('user_id', user.id).first()

    if (!profile) {
      return response.status(404).json({ error: 'Affiliate profile not found' })
    }

    await profile.merge({
      bio: bio || profile.bio,
      specializations: specializations || profile.specializations,
      targetAudiences: targetAudiences || profile.targetAudiences,
    }).save()

    return response.json({
      success: true,
      data: profile,
    })
  }

  /**
   * Generate a referral code
   */
  async generateReferralCode({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const { description, maxUses, expiresAt, codeType } = request.all()

    try {
      const profile = await AffiliateProfile.query().where('user_id', user.id).first()

      if (!profile) {
        return response.status(404).json({ error: 'Affiliate profile not found' })
      }

      const { DateTime } = await import('luxon')
      const referralCode = await RecruitmentService.generateReferralCode(
        profile.id,
        description,
        maxUses,
        expiresAt ? DateTime.fromISO(expiresAt) : undefined,
        codeType || 'personal'
      )

      return response.json({
        success: true,
        data: referralCode,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to generate referral code',
      })
    }
  }

  /**
   * Get affiliate's referral codes
   */
  async getReferralCodes({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const profile = await AffiliateProfile.query().where('user_id', user.id).first()

    if (!profile) {
      return response.status(404).json({ error: 'Affiliate profile not found' })
    }

    const codes = await ReferralCode.query().where('affiliate_id', profile.id).orderBy('created_at', 'desc')

    return response.json({
      success: true,
      data: codes,
    })
  }

  /**
   * Get referral code performance
   */
  async getReferralCodePerformance({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const codeId = request.param('id')

    const code = await ReferralCode.find(codeId)

    if (!code) {
      return response.status(404).json({ error: 'Referral code not found' })
    }

    const profile = await AffiliateProfile.query().where('user_id', user.id).first()

    if (!profile || code.affiliateId !== profile.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const referrals = await AffiliateReferral.query().where('referral_code_id', code.id)

    return response.json({
      success: true,
      data: {
        code,
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter((r) => r.referralStatus === 'active').length,
        totalEarnings: referrals.reduce((sum, r) => sum + (r.earnedCommission || 0), 0),
        conversionRate: referrals.length > 0 ? (referrals.filter((r) => r.referralStatus === 'converted').length / referrals.length) * 100 : 0,
      },
    })
  }

  /**
   * Get affiliate's referrals
   */
  async getReferrals({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const profile = await AffiliateProfile.query().where('user_id', user.id).first()

    if (!profile) {
      return response.status(404).json({ error: 'Affiliate profile not found' })
    }

    const referrals = await AffiliateReferral.query()
      .where('affiliate_id', profile.id)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: referrals.all(),
      paging: {
        total: referrals.total,
        perPage: referrals.perPage,
        currentPage: referrals.currentPage,
        lastPage: referrals.lastPage,
      },
    })
  }

  /**
   * Get affiliate's rewards
   */
  async getRewards({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const profile = await AffiliateProfile.query().where('user_id', user.id).first()

    if (!profile) {
      return response.status(404).json({ error: 'Affiliate profile not found' })
    }

    const rewards = await AffiliateReward.query()
      .where('affiliate_id', profile.id)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: rewards.all(),
      paging: {
        total: rewards.total,
        perPage: rewards.perPage,
        currentPage: rewards.currentPage,
        lastPage: rewards.lastPage,
      },
    })
  }

  /**
   * Claim a reward
   */
  async claimReward({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const rewardId = request.param('id')

    const reward = await AffiliateReward.find(rewardId)

    if (!reward) {
      return response.status(404).json({ error: 'Reward not found' })
    }

    const profile = await AffiliateProfile.query().where('user_id', user.id).first()

    if (!profile || reward.affiliateId !== profile.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const updatedReward = await RecruitmentService.claimReward(Number(rewardId))

      return response.json({
        success: true,
        data: updatedReward,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to claim reward',
      })
    }
  }

  /**
   * Get top performers (public)
   */
  async getTopPerformers({ request, response }: HttpContext) {
    const limit = request.input('limit', 10)

    const topPerformers = await RecruitmentService.getTopPerformers(limit)

    return response.json({
      success: true,
      data: topPerformers,
    })
  }

  /**
   * Get affiliates by tier (public)
   */
  async getAffiliatesByTier({ request, response }: HttpContext) {
    const tier = request.param('tier')
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    if (!['bronze', 'silver', 'gold', 'platinum'].includes(tier)) {
      return response.status(400).json({ error: 'Invalid tier' })
    }

    const affiliates = await RecruitmentService.getAffiliatesByTier(
      tier as 'bronze' | 'silver' | 'gold' | 'platinum',
      page,
      limit
    )

    return response.json({
      success: true,
      data: affiliates.all(),
      paging: {
        total: affiliates.total,
        perPage: affiliates.perPage,
        currentPage: affiliates.currentPage,
        lastPage: affiliates.lastPage,
      },
    })
  }

  /**
   * Create a recruitment campaign (admin only)
   */
  async createCampaign({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const { name, campaignType, description, targetAffiliates, bonusCommissionRate } = request.all()

    try {
      const campaign = await RecruitmentService.createCampaign(
        user.id,
        name,
        campaignType,
        description,
        targetAffiliates,
        bonusCommissionRate
      )

      return response.json({
        success: true,
        data: campaign,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      })
    }
  }

  /**
   * Launch a campaign (admin only)
   */
  async launchCampaign({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const campaignId = request.param('id')

    try {
      const campaign = await RecruitmentService.launchCampaign(Number(campaignId))

      return response.json({
        success: true,
        data: campaign,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to launch campaign',
      })
    }
  }

  /**
   * Complete a campaign (admin only)
   */
  async completeCampaign({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const campaignId = request.param('id')

    try {
      const campaign = await RecruitmentService.completeCampaign(Number(campaignId))

      return response.json({
        success: true,
        data: campaign,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to complete campaign',
      })
    }
  }

  /**
   * List campaigns (admin only)
   */
  async listCampaigns({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')

    let query = RecruitmentCampaign.query()

    if (status) {
      query = query.where('status', status)
    }

    const campaigns = await query.orderBy('created_at', 'desc').paginate(page, limit)

    return response.json({
      success: true,
      data: campaigns.all(),
      paging: {
        total: campaigns.total,
        perPage: campaigns.perPage,
        currentPage: campaigns.currentPage,
        lastPage: campaigns.lastPage,
      },
    })
  }
}
