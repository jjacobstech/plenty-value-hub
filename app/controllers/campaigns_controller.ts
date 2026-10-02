import Campaign from '#models/campaign'
import { createCampaignValidator, updateCampaignValidator } from '#validators/campaign'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class CampaignsController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const vendorId = request.input('vendor_id')
    const search = request.input('search')
    const sort = request.input('sort', '-created_at')

    let query = Campaign.query().where('status', 'active')

    if (status) query = query.where('status', status)
    if (vendorId) query = query.where('vendor_id', vendorId)
    if (search) {
      query = query
        .where('name', 'like', `%${search}%`)
        .orWhere('description', 'like', `%${search}%`)
    }

    if (sort === '-created_at') query = query.orderBy('created_at', 'desc')
    if (sort === '-total_conversions') query = query.orderBy('total_conversions', 'desc')
    if (sort === '-conversion_rate') query = query.orderBy('conversion_rate', 'desc')
    if (sort === 'is_featured') query = query.orderBy('is_featured', 'desc')

    const campaigns = await query.paginate(page, limit)

    return response.json({
      success: true,
      data: campaigns.all(),
      pagination: {
        total: campaigns.total,
        perPage: campaigns.perPage,
        currentPage: campaigns.currentPage,
        lastPage: campaigns.lastPage,
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const UUID_REGEX =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    const paramId = String(params.id ?? '').trim()
    const isUuid = UUID_REGEX.test(paramId)
    const isNumeric = /^\d+$/.test(paramId)

    const campaign = await Campaign.query()
      .where((q) => {
        if (isUuid) {
          q.where('uuid', paramId)
        } else if (isNumeric) {
          q.where('id', paramId)
        } else {
          q.where('slug', paramId).orWhere(
            'id',
            Number.isNaN(Number(paramId)) ? 0 : Number(paramId)
          )
        }
      })
      .where('status', 'active')
      .preload('vendor')
      .first()

    if (!campaign) {
      return response.status(404).json({ error: 'Campaign not found' })
    }

    return response.json({
      success: true,
      data: campaign.serialize(),
    })
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can create campaigns' })
    }

    const payload = await request.validateUsing(createCampaignValidator)

    const campaign = await Campaign.create({
      ...(payload as any),
      vendorId: user.id,
      vendorName: user.fullName || user.email,
      status: 'draft',
      totalClicks: 0,
      totalConversions: 0,
      totalCommissionPaid: 0,
      attributionWindowDays: 30,
    })

    return response.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign.serialize(),
    })
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    // Only allow updates if campaign is in draft or pending_approval status
    if (!['draft', 'pending_approval'].includes(campaign.status)) {
      return response
        .status(400)
        .json({ error: 'Can only update campaigns in draft or pending approval status' })
    }

    const payload = await request.validateUsing(updateCampaignValidator)
    campaign.merge(payload)
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign.serialize(),
    })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    if (campaign.status !== 'draft') {
      return response.status(400).json({ error: 'Can only delete campaigns in draft status' })
    }

    await campaign.delete()

    return response.json({
      success: true,
      message: 'Campaign deleted successfully',
    })
  }

  // ═══════════════════════════════════════════════════════════════════
  // Status Management Methods
  // ═══════════════════════════════════════════════════════════════════

  async submit({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    if (campaign.status !== 'draft') {
      return response.status(400).json({ error: 'Only draft campaigns can be submitted' })
    }

    campaign.status = 'pending_approval'
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign submitted for approval',
      data: campaign.serialize(),
    })
  }

  async approve({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve campaigns' })
    }

    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.status !== 'pending_approval') {
      return response.status(400).json({ error: 'Only pending campaigns can be approved' })
    }

    const approvalNotes = request.input('notes')

    campaign.status = 'active'
    campaign.approvalNotes = approvalNotes
    campaign.approvedAt = DateTime.now()
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign approved',
      data: campaign.serialize(),
    })
  }

  async reject({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can reject campaigns' })
    }

    const campaign = await Campaign.findOrFail(params.id)

    if (!['pending_approval'].includes(campaign.status)) {
      return response.status(400).json({ error: 'Only pending campaigns can be rejected' })
    }

    const rejectionNotes = request.input('notes', '')

    campaign.status = 'rejected'
    campaign.approvalNotes = rejectionNotes
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign rejected',
      data: campaign.serialize(),
    })
  }

  async pause({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    if (campaign.status !== 'active') {
      return response.status(400).json({ error: 'Only active campaigns can be paused' })
    }

    campaign.status = 'paused'
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign paused',
      data: campaign.serialize(),
    })
  }

  async resume({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    if (campaign.status !== 'paused') {
      return response.status(400).json({ error: 'Only paused campaigns can be resumed' })
    }

    campaign.status = 'active'
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign resumed',
      data: campaign.serialize(),
    })
  }

  async suspend({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can suspend campaigns' })
    }

    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.suspendedAt) {
      return response.status(400).json({ error: 'Campaign is already suspended' })
    }

    const reason = request.input('reason', 'No reason provided')

    campaign.suspendedAt = DateTime.now()
    campaign.suspensionReason = reason
    campaign.status = 'paused'
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign suspended',
      data: campaign.serialize(),
    })
  }

  async unsuspend({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can unsuspend campaigns' })
    }

    const campaign = await Campaign.findOrFail(params.id)

    if (!campaign.suspendedAt) {
      return response.status(400).json({ error: 'Campaign is not suspended' })
    }

    campaign.suspendedAt = null
    campaign.suspensionReason = null
    campaign.status = 'active'
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign unsuspended',
      data: campaign.serialize(),
    })
  }

  async archive({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const campaign = await Campaign.findOrFail(params.id)

    if (campaign.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    campaign.status = 'archived'
    await campaign.save()

    return response.json({
      success: true,
      message: 'Campaign archived',
      data: campaign.serialize(),
    })
  }
}
