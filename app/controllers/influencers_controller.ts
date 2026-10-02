import InfluencerProfile from '#models/influencer_profile'
import CollaborationAgreement from '#models/collaboration_agreement'
import InfluencerContent from '#models/influencer_content'
import InfluencerService from '#services/influencer_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class InfluencersController {
  /**
   * Create influencer profile
   * POST /api/influencers/profile
   */
  async createProfile({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'affiliate') {
      return response.status(403).json({ error: 'Only affiliates can create influencer profiles' })
    }

    const data = request.all()

    try {
      const profile = await InfluencerService.createProfile(user.id, data)
      return response.status(201).json({
        success: true,
        message: 'Influencer profile created',
        data: profile.serialize(),
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create profile',
      })
    }
  }

  /**
   * Get influencer profile
   * GET /api/influencers/profile
   */
  async getProfile({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const { stats } = await InfluencerService.getProfileWithStats(profile.id)

      return response.json({
        success: true,
        data: {
          ...profile.serialize(),
          stats,
        },
      })
    } catch {
      return response.status(404).json({
        error: 'Profile not found',
      })
    }
  }

  /**
   * Update influencer profile
   * PUT /api/influencers/profile
   */
  async updateProfile({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()

      const data = request.all()
      profile.displayName = data.displayName || profile.displayName
      profile.bio = data.bio !== undefined ? data.bio : profile.bio
      profile.profileImageUrl = data.profileImageUrl !== undefined ? data.profileImageUrl : profile.profileImageUrl
      profile.category = data.category || profile.category
      profile.niche = data.niche !== undefined ? data.niche : profile.niche
      profile.followerCount = data.followerCount ?? profile.followerCount
      profile.engagementRate = data.engagementRate ?? profile.engagementRate
      profile.website = data.website !== undefined ? data.website : profile.website
      profile.email = data.email !== undefined ? data.email : profile.email
      profile.phone = data.phone !== undefined ? data.phone : profile.phone
      profile.bannerImageUrl = data.bannerImageUrl !== undefined ? data.bannerImageUrl : profile.bannerImageUrl

      if (data.platforms) {
        profile.platforms = JSON.stringify(data.platforms)
      }
      if (data.platformFollowers) {
        profile.platformFollowers = JSON.stringify(data.platformFollowers)
      }

      await profile.save()

      return response.json({
        success: true,
        message: 'Profile updated',
        data: profile.serialize(),
      })
    } catch {
      return response.status(404).json({
        error: 'Profile not found',
      })
    }
  }

  /**
   * Get influencer stats
   * GET /api/influencers/stats
   */
  async getStats({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const stats = await InfluencerService.getInfluencerStats(profile.id)

      return response.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      return response.status(404).json({
        error: 'Profile not found or error calculating stats',
      })
    }
  }

  /**
   * List collaboration proposals
   * GET /api/influencers/collaborations
   */
  async listCollaborations({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()

      let query = CollaborationAgreement.query().where('influencer_id', profile.id)

      if (status) {
        query = query.where('status', status)
      }

      const collaborations = await query
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      return response.json({
        success: true,
        data: collaborations.all(),
        pagination: {
          total: collaborations.total,
          perPage: collaborations.perPage,
          currentPage: collaborations.currentPage,
          lastPage: collaborations.lastPage,
        },
      })
    } catch {
      return response.status(404).json({ error: 'Profile not found' })
    }
  }

  /**
   * Get collaboration details
   * GET /api/influencers/collaborations/:id
   */
  async getCollaboration({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const collaboration = await CollaborationAgreement.findOrFail(params.id)

      if (collaboration.influencerId !== profile.id) {
        return response.status(403).json({ error: 'Unauthorized' })
      }

      const metrics = await InfluencerService.getCollaborationMetrics(collaboration.id)

      return response.json({
        success: true,
        data: {
          ...collaboration.serialize(),
          metrics,
        },
      })
    } catch {
      return response.status(404).json({ error: 'Collaboration not found' })
    }
  }

  /**
   * Accept collaboration proposal
   * POST /api/influencers/collaborations/:id/accept
   */
  async acceptCollaboration({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const collaboration = await CollaborationAgreement.findOrFail(params.id)

      if (collaboration.influencerId !== profile.id) {
        return response.status(403).json({ error: 'Unauthorized' })
      }

      if (collaboration.status !== 'proposed') {
        return response.status(400).json({ error: 'Can only accept proposed collaborations' })
      }

      const updated = await InfluencerService.acceptCollaboration(collaboration.id, user.id)

      return response.json({
        success: true,
        message: 'Collaboration accepted',
        data: updated.serialize(),
      })
    } catch {
      return response.status(404).json({ error: 'Collaboration not found' })
    }
  }

  /**
   * Create content
   * POST /api/influencers/content
   */
  async createContent({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const data = request.all()

      const content = await InfluencerService.createContent(profile.id, data)

      return response.status(201).json({
        success: true,
        message: 'Content created',
        data: content.serialize(),
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create content',
      })
    }
  }

  /**
   * List influencer content
   * GET /api/influencers/content
   */
  async listContent({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const platform = request.input('platform')

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()

      let query = InfluencerContent.query().where('influencer_id', profile.id)

      if (status) {
        query = query.where('status', status)
      }
      if (platform) {
        query = query.where('platform', platform)
      }

      const content = await query
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      return response.json({
        success: true,
        data: content.all(),
        pagination: {
          total: content.total,
          perPage: content.perPage,
          currentPage: content.currentPage,
          lastPage: content.lastPage,
        },
      })
    } catch {
      return response.status(404).json({ error: 'Profile not found' })
    }
  }

  /**
   * Get content analytics
   * GET /api/influencers/content/:id/analytics
   */
  async getContentAnalytics({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const content = await InfluencerContent.findOrFail(params.id)

      if (content.influencerId !== profile.id) {
        return response.status(403).json({ error: 'Unauthorized' })
      }

      const analytics = await InfluencerService.getContentAnalytics(content.id)

      return response.json({
        success: true,
        data: analytics,
      })
    } catch {
      return response.status(404).json({ error: 'Content not found' })
    }
  }

  /**
   * Get content performance summary
   * GET /api/influencers/content/performance
   */
  async getContentPerformance({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const daysBack = request.input('days', 30)

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const endDate = DateTime.now()
      const startDate = endDate.minus({ days: daysBack })

      const performance = await InfluencerService.getContentPerformance(
        profile.id,
        startDate,
        endDate
      )

      return response.json({
        success: true,
        data: performance,
      })
    } catch {
      return response.status(404).json({ error: 'Profile not found' })
    }
  }

  /**
   * Update content status
   * PUT /api/influencers/content/:id
   */
  async updateContent({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    try {
      const profile = await InfluencerProfile.query().where('affiliate_id', user.id).firstOrFail()
      const content = await InfluencerContent.findOrFail(params.id)

      if (content.influencerId !== profile.id) {
        return response.status(403).json({ error: 'Unauthorized' })
      }

      const data = request.all()

      if (data.status) {
        content.status = data.status
      }
      if (data.publishedAt && data.status === 'published') {
        content.publishedAt = DateTime.fromISO(data.publishedAt)
      }
      if (data.views !== undefined) {
        content.views = data.views
      }
      if (data.likes !== undefined) {
        content.likes = data.likes
      }
      if (data.comments !== undefined) {
        content.comments = data.comments
      }
      if (data.shares !== undefined) {
        content.shares = data.shares
      }
      if (data.clicks !== undefined) {
        content.clicks = data.clicks
      }
      if (data.conversions !== undefined) {
        content.conversions = data.conversions
      }
      if (data.revenue !== undefined) {
        content.revenue = data.revenue
      }

      await content.save()

      return response.json({
        success: true,
        message: 'Content updated',
        data: content.serialize(),
      })
    } catch {
      return response.status(404).json({ error: 'Content not found' })
    }
  }

  /**
   * Admin: List all influencers
   * GET /api/admin/influencers
   */
  async listInfluencers({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const category = request.input('category')
    const status = request.input('status')

    let query = InfluencerProfile.query()

    if (category) {
      query = query.where('category', category)
    }
    if (status) {
      query = query.where('verification_status', status)
    }

    const influencers = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: influencers.all(),
      pagination: {
        total: influencers.total,
        perPage: influencers.perPage,
        currentPage: influencers.currentPage,
        lastPage: influencers.lastPage,
      },
    })
  }

  /**
   * Admin: Verify influencer
   * POST /api/admin/influencers/:id/verify
   */
  async verifyInfluencer({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const profile = await InfluencerService.verifyProfile(params.id, user.id)

      return response.json({
        success: true,
        message: 'Influencer verified',
        data: profile.serialize(),
      })
    } catch {
      return response.status(404).json({ error: 'Influencer not found' })
    }
  }

  /**
   * Admin: Reject influencer
   * POST /api/admin/influencers/:id/reject
   */
  async rejectInfluencer({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const reason = request.input('reason', 'No reason provided')

    try {
      const profile = await InfluencerService.rejectProfile(params.id, reason)

      return response.json({
        success: true,
        message: 'Influencer rejected',
        data: profile.serialize(),
      })
    } catch {
      return response.status(404).json({ error: 'Influencer not found' })
    }
  }

  /**
   * Admin: View influencer details
   * GET /api/admin/influencers/:id
   */
  async viewInfluencer({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const profile = await InfluencerProfile.findOrFail(params.id)
      const { stats } = await InfluencerService.getProfileWithStats(profile.id)

      return response.json({
        success: true,
        data: {
          ...profile.serialize(),
          stats,
        },
      })
    } catch {
      return response.status(404).json({ error: 'Influencer not found' })
    }
  }
}
