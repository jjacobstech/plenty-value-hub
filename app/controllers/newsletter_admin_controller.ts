import Newsletter from '#models/newsletter'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class NewsletterAdminController {
  async index({ response }: HttpContext) {
    const newsletters = await Newsletter.query().orderBy('created_at', 'desc').limit(100)
    return response.json(newsletters.map((n) => n.serialize()))
  }

  async store({ request, response }: HttpContext) {
    const body = request.body() as Record<string, any>

    const newsletter = await Newsletter.create({
      subject: body.subject,
      category: body.category || null,
      content: body.content || null,
      status: body.status || 'draft',
      recipientsCount: body.recipients_count || 0,
      openCount: 0,
      clickCount: 0,
      revenueGenerated: 0,
      sentAt: body.status === 'sent' ? DateTime.now() : null,
    })

    return response.json(newsletter.serialize())
  }

  async update({ params, request, response }: HttpContext) {
    const newsletter = await Newsletter.findOrFail(params.id)
    const body = request.body() as Record<string, any>

    newsletter.merge({
      subject: body.subject ?? newsletter.subject,
      category: body.category ?? newsletter.category,
      content: body.content ?? newsletter.content,
      status: body.status ?? newsletter.status,
      recipientsCount: body.recipients_count ?? newsletter.recipientsCount,
      openCount: body.open_count ?? newsletter.openCount,
      clickCount: body.click_count ?? newsletter.clickCount,
      revenueGenerated: body.revenue_generated ?? newsletter.revenueGenerated,
    })

    if (body.status === 'sent' && !newsletter.sentAt) {
      newsletter.sentAt = DateTime.now()
    }
    if (body.sent_at) {
      newsletter.sentAt = DateTime.fromISO(body.sent_at)
    }

    await newsletter.save()
    return response.json(newsletter.serialize())
  }

  async destroy({ params, response }: HttpContext) {
    const newsletter = await Newsletter.findOrFail(params.id)
    await newsletter.delete()
    return response.json({ success: true })
  }
}
