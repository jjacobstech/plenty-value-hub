import type { HttpContext } from '@adonisjs/core/http'
import CampaignService from '#services/campaign_service'
import Campaign from '#models/campaign'

export default class CampaignsController {
  /**
   * Create a new campaign (vendor only)
   */
  async create({ request, auth, response }: HttpContext) {
    const user = auth.user!
    
    if (user.role !== 'vendor') {
      return response.unauthorized({ error: 'Only vendors can create campaigns' })
    }

    const data = request.only([
      'name',
      'productServiceName',
      'description',
      'imageUrl',
      'category',
      'commissionType',
      'commissionAmount',
      'purchaseDestination',
      'attributionWindowDays',
      'campaignTerms',
      'promotionalGuidelines',
      'startDate',
      'endDate',
      'targetAudience',
      'minimumRequirementsForAffiliates',
      'approvalRequirements',
    ])

    try {
      const campaign = await CampaignService.createCampaign({
        vendorId: user.id,
        ...data,
      })

      return response.created({ success: true, data: campaign })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create campaign'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Update campaign (vendor only, draft campaigns only)
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const campaign = await Campaign.find(params.id)

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    if (campaign.vendorId !== user.id) {
      return response.forbidden({ error: 'You can only edit your own campaigns' })
    }

    const data = request.only([
      'name',
      'productServiceName',
      'description',
      'imageUrl',
      'category',
      'commissionType',
      'commissionAmount',
      'purchaseDestination',
      'attributionWindowDays',
      'campaignTerms',
      'promotionalGuidelines',
      'startDate',
      'endDate',
      'targetAudience',
      'minimumRequirementsForAffiliates',
      'approvalRequirements',
    ])

    try {
      const updated = await CampaignService.updateCampaign(campaign.id, data)
      return response.ok({ success: true, data: updated })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Submit campaign for approval (vendor only)
   */
  async submit({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const campaign = await Campaign.find(params.id)

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    if (campaign.vendorId !== user.id) {
      return response.forbidden({ error: 'You can only submit your own campaigns' })
    }

    try {
      const updated = await CampaignService.submitForApproval(campaign.id)
      return response.ok({ success: true, data: updated, message: 'Campaign submitted for approval' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Approve campaign (admin only)
   */
  async approve({ params, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can approve campaigns' })
    }

    try {
      const campaign = await CampaignService.approveCampaign(params.id, user.id)
      return response.ok({ success: true, data: campaign, message: 'Campaign approved' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Reject campaign (admin only)
   */
  async reject({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can reject campaigns' })
    }

    const { reason } = request.only(['reason'])

    try {
      const campaign = await CampaignService.rejectCampaign(params.id, user.id, reason)
      return response.ok({ success: true, data: campaign, message: 'Campaign rejected' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Pause campaign
   */
  async pause({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const campaign = await Campaign.find(params.id)

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.forbidden({ error: 'You do not have permission to pause this campaign' })
    }

    try {
      const updated = await CampaignService.pauseCampaign(campaign.id)
      return response.ok({ success: true, data: updated, message: 'Campaign paused' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Resume campaign
   */
  async resume({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const campaign = await Campaign.find(params.id)

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.forbidden({ error: 'You do not have permission to resume this campaign' })
    }

    try {
      const updated = await CampaignService.resumeCampaign(campaign.id)
      return response.ok({ success: true, data: updated, message: 'Campaign resumed' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get vendor's campaigns
   */
  async vendorCampaigns({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { status, page = 1, limit = 20 } = request.qs()

    try {
      const campaigns = await CampaignService.getVendorCampaigns(user.id, status, page, limit)
      return response.ok({ success: true, data: campaigns })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get campaign with details
   */
  async show({ params, response }: HttpContext) {
    try {
      const campaign = await CampaignService.getCampaignWithDetails(params.id)

      if (!campaign) {
        return response.notFound({ error: 'Campaign not found' })
      }

      return response.ok({ success: true, data: campaign })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get active campaigns for discovery
   */
  async discover({ request, response }: HttpContext) {
    const { page = 1, limit = 20, category, minCommission, maxCommission, searchTerm } = request.qs()

    try {
      const campaigns = await CampaignService.getActiveCampaigns(page, limit, {
        category,
        minCommission: minCommission ? parseFloat(minCommission) : undefined,
        maxCommission: maxCommission ? parseFloat(maxCommission) : undefined,
        searchTerm,
      })

      return response.ok({ success: true, data: campaigns })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Join campaign as affiliate
   */
  async join({ params, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'affiliate') {
      return response.unauthorized({ error: 'Only affiliates can join campaigns' })
    }

    try {
      const affiliateCampaign = await CampaignService.joinCampaign(user.id, params.id)
      return response.created({ success: true, data: affiliateCampaign, message: 'Successfully joined campaign' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get affiliate's campaigns
   */
  async affiliateCampaigns({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { page = 1, limit = 20 } = request.qs()

    try {
      const campaigns = await CampaignService.getAffiliateCampaigns(user.id, page, limit)
      return response.ok({ success: true, data: campaigns })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed'
      return response.badRequest({ error: msg })
    }
  }
}
