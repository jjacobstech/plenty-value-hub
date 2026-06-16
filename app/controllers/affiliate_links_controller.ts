import AffiliateLink from '#models/affiliate_link'
import Product from '#models/product'
import {
  createAffiliateLinkValidator,
  updateAffiliateLinkValidator,
  trackClickValidator,
} from '#validators/affiliate_link'
import type { HttpContext } from '@adonisjs/core/http'
import { nanoid } from 'nanoid'

export default class AffiliateLinksController {
  async index({ auth, response, request }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const links = await AffiliateLink.query()
      .where('affiliateId', user.id)
      .paginate(page, limit)

    return response.json({
      success: true,
      data: links.all(),
      pagination: {
        total: links.total,
        perPage: links.perPage,
        currentPage: links.currentPage,
        lastPage: links.lastPage,
      },
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'affiliate' && user.role !== 'admin') {
      return response.status(403).json({ error: 'Only affiliates can create links' })
    }

    const payload = await request.validateUsing(createAffiliateLinkValidator)

    const product = await Product.find(payload.productId)
    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    if (product.status !== 'approved') {
      return response.status(400).json({ error: 'Product is not approved for affiliate promotion' })
    }

    const linkCode = nanoid(10)

    const link = await AffiliateLink.create({
      affiliateId: user.id,
      productId: payload.productId,
      productName: product.name,
      linkCode,
      subId: payload.subId || null,
      campaignName: payload.campaignName || null,
      status: 'active',
      clicks: 0,
      conversions: 0,
      revenue: 0,
      commissionEarned: 0,
    })

    return response.status(201).json({
      success: true,
      message: 'Affiliate link created',
      data: link.serialize(),
    })
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const link = await AffiliateLink.find(params.id)

    if (!link) {
      return response.status(404).json({ error: 'Affiliate link not found' })
    }

    if (link.affiliateId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Not authorized to update this link' })
    }

    const payload = await request.validateUsing(updateAffiliateLinkValidator)

    link.status = payload.status
    await link.save()

    return response.json({
      success: true,
      message: 'Affiliate link updated',
      data: link.serialize(),
    })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const link = await AffiliateLink.find(params.id)

    if (!link) {
      return response.status(404).json({ error: 'Affiliate link not found' })
    }

    if (link.affiliateId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Not authorized to delete this link' })
    }

    await link.delete()

    return response.json({
      success: true,
      message: 'Affiliate link deleted',
    })
  }

  async trackClick({ request, response }: HttpContext) {
    const payload = await request.validateUsing(trackClickValidator)

    const link = await AffiliateLink.findBy('linkCode', payload.linkCode)

    if (!link) {
      return response.status(404).json({ error: 'Affiliate link not found' })
    }

    if (link.status !== 'active') {
      return response.status(400).json({ error: 'Affiliate link is not active' })
    }

    link.clicks = (link.clicks || 0) + 1
    await link.save()

    return response.json({
      success: true,
      productId: link.productId,
      affiliateLinkId: link.id,
    })
  }
}