import EmailCampaign from '#models/email_campaign'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class EmailCampaignsController {
  async index({ response }: HttpContext) {
    const campaigns = await EmailCampaign.query().orderBy('created_at', 'desc').limit(100)
    return response.json(campaigns.map((c) => c.serialize()))
  }

  async store({ request, response }: HttpContext) {
    const body = request.body() as Record<string, any>

    const campaign = await EmailCampaign.create({
      name: body.name,
      subject: body.subject,
      content: body.content || null,
      campaignType: body.campaign_type || 'product_promo',
      audienceSegment: body.audience_segment || null,
      status: body.status || 'draft',
      recipientsCount: body.recipients_count || 0,
      openCount: 0,
      clickCount: 0,
      conversionCount: 0,
      revenueGenerated: 0,
    })

    return response.json(campaign.serialize())
  }

  async update({ params, request, response }: HttpContext) {
    const campaign = await EmailCampaign.findOrFail(params.id)
    const body = request.body() as Record<string, any>

    campaign.merge({
      name: body.name ?? campaign.name,
      subject: body.subject ?? campaign.subject,
      content: body.content ?? campaign.content,
      campaignType: body.campaign_type ?? campaign.campaignType,
      audienceSegment: body.audience_segment ?? campaign.audienceSegment,
      status: body.status ?? campaign.status,
      recipientsCount: body.recipients_count ?? campaign.recipientsCount,
      openCount: body.open_count ?? campaign.openCount,
      clickCount: body.click_count ?? campaign.clickCount,
      conversionCount: body.conversion_count ?? campaign.conversionCount,
      revenueGenerated: body.revenue_generated ?? campaign.revenueGenerated,
    })

    if (body.status === 'sent' && !campaign.sentAt) {
      campaign.sentAt = DateTime.now()
    }
    if (body.sent_at) {
      campaign.sentAt = DateTime.fromISO(body.sent_at)
    }

    await campaign.save()
    return response.json(campaign.serialize())
  }

  async destroy({ params, response }: HttpContext) {
    const campaign = await EmailCampaign.findOrFail(params.id)
    await campaign.delete()
    return response.json({ success: true })
  }
}
