import Campaign from '#models/campaign'
import AffiliateCampaign from '#models/affiliate_campaign'
import { DateTime } from 'luxon'

interface CreateCampaignData {
  vendorId: number
  name: string
  productServiceName: string
  description: string
  imageUrl?: string
  category: string
  commissionType: 'percentage' | 'fixed_amount' | 'lead' | 'hybrid'
  commissionAmount: number
  purchaseDestination: string
  attributionWindowDays?: number
  campaignTerms?: string
  promotionalGuidelines?: string
  startDate: DateTime
  endDate?: DateTime
  targetAudience?: string
  minimumRequirementsForAffiliates?: string
  approvalRequirements?: string
}

export default class CampaignService {
  /**
   * Create a new campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const campaign = await Campaign.create({
      vendorId: data.vendorId,
      name: data.name,
      productServiceName: data.productServiceName,
      description: data.description,
      imageUrl: data.imageUrl || null,
      category: data.category,
      commissionType: data.commissionType,
      commissionAmount: data.commissionAmount,
      purchaseDestination: data.purchaseDestination,
      attributionWindowDays: data.attributionWindowDays || 30,
      campaignTerms: data.campaignTerms || null,
      promotionalGuidelines: data.promotionalGuidelines || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      targetAudience: data.targetAudience || null,
      minimumRequirementsForAffiliates: data.minimumRequirementsForAffiliates || null,
      approvalRequirements: data.approvalRequirements || null,
      status: 'draft',
    })

    return campaign
  }

  /**
   * Update campaign (vendors can only update draft campaigns)
   */
  static async updateCampaign(campaignId: number, data: Partial<CreateCampaignData>): Promise<Campaign> {
    const campaign = await Campaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (campaign.status !== 'draft') {
      throw new Error('Can only edit draft campaigns')
    }

    await campaign.merge(data).save()
    return campaign
  }

  /**
   * Submit campaign for approval
   */
  static async submitForApproval(campaignId: number): Promise<Campaign> {
    const campaign = await Campaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (campaign.status !== 'draft') {
      throw new Error('Only draft campaigns can be submitted')
    }

    await campaign.merge({ status: 'pending_approval' }).save()
    return campaign
  }

  /**
   * Approve campaign (admin only)
   */
  static async approveCampaign(campaignId: number, adminId: number): Promise<Campaign> {
    const campaign = await Campaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (campaign.status !== 'pending_approval') {
      throw new Error('Only pending campaigns can be approved')
    }

    await campaign.merge({
      status: 'active',
      approvedByAdminId: adminId,
      approvedAt: DateTime.now(),
    }).save()

    return campaign
  }

  /**
   * Reject campaign (admin only)
   */
  static async rejectCampaign(campaignId: number, adminId: number, reason: string): Promise<Campaign> {
    const campaign = await Campaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (campaign.status !== 'pending_approval') {
      throw new Error('Only pending campaigns can be rejected')
    }

    await campaign.merge({
      status: 'rejected',
      rejectedByAdminId: adminId,
      rejectedAt: DateTime.now(),
      rejectionReason: reason,
    }).save()

    return campaign
  }

  /**
   * Pause campaign
   */
  static async pauseCampaign(campaignId: number): Promise<Campaign> {
    const campaign = await Campaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    await campaign.merge({ status: 'paused' }).save()
    return campaign
  }

  /**
   * Resume campaign
   */
  static async resumeCampaign(campaignId: number): Promise<Campaign> {
    const campaign = await Campaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (campaign.status !== 'paused') {
      throw new Error('Only paused campaigns can be resumed')
    }

    await campaign.merge({ status: 'active' }).save()
    return campaign
  }

  /**
   * Get vendor's campaigns
   */
  static async getVendorCampaigns(vendorId: number, status?: string, page = 1, limit = 20) {
    let query = Campaign.query().where('vendor_id', vendorId)

    if (status) {
      query = query.where('status', status)
    }

    return query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Get campaign with details
   */
  static async getCampaignWithDetails(campaignId: number) {
    return Campaign.query()
      .where('id', campaignId)
      .preload('affiliates')
      .first()
  }

  /**
   * Join affiliate to campaign
   */
  static async joinCampaign(affiliateId: number, campaignId: number): Promise<AffiliateCampaign> {
    const campaign = await Campaign.find(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (campaign.status !== 'active') {
      throw new Error('Can only join active campaigns')
    }

    const existing = await AffiliateCampaign.query()
      .where('affiliate_id', affiliateId)
      .where('campaign_id', campaignId)
      .first()

    if (existing) {
      throw new Error('Affiliate already joined this campaign')
    }

    const affiliateCampaign = await AffiliateCampaign.create({
      affiliateId,
      campaignId,
      status: 'joined',
      joinedAt: DateTime.now(),
    })

    await campaign.merge({
      activeAffiliates: campaign.activeAffiliates + 1,
    }).save()

    return affiliateCampaign
  }

  /**
   * Get affiliate's campaigns
   */
  static async getAffiliateCampaigns(affiliateId: number, page = 1, limit = 20) {
    return AffiliateCampaign.query()
      .where('affiliate_id', affiliateId)
      .preload('campaign')
      .orderBy('joined_at', 'desc')
      .paginate(page, limit)
  }

  /**
   * Get active campaigns for discovery
   */
  static async getActiveCampaigns(page = 1, limit = 20, filters?: {
    category?: string
    minCommission?: number
    maxCommission?: number
    searchTerm?: string
  }) {
    let query = Campaign.query().where('status', 'active')

    if (filters?.category) {
      query = query.where('category', filters.category)
    }

    if (filters?.searchTerm) {
      query = query.where((q) => {
        q.where('name', 'like', `%${filters.searchTerm}%`)
          .orWhere('product_service_name', 'like', `%${filters.searchTerm}%`)
          .orWhere('description', 'like', `%${filters.searchTerm}%`)
      })
    }

    return query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }
}
