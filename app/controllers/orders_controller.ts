import Order from '#models/order'
import Product from '#models/product'
import AffiliateLink from '#models/affiliate_link'
import { processOrderValidator, updateOrderValidator } from '#validators/order'
import { RevenueService } from '#services/revenue_service'
import { OrderNumberService } from '#services/order_number_service'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import Decimal from 'decimal.js'

export default class OrdersController {
  async index({ auth, response, request }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    let query = Order.query()

    if (user.role === 'vendor') {
      query = query.where('vendorId', user.id)
    } else if (user.role === 'affiliate') {
      query = query.where('affiliateId', user.id)
    }

    const orders = await query.paginate(page, limit)

    return response.json({
      success: true,
      data: orders.all(),
      pagination: {
        total: orders.total,
        perPage: orders.perPage,
        currentPage: orders.currentPage,
        lastPage: orders.lastPage,
      },
    })
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const order = await Order.find(params.id)

    if (!order) {
      return response.status(404).json({ error: 'Order not found' })
    }

    if (
      user.role !== 'admin' &&
      order.vendorId !== user.id &&
      order.buyerId !== user.id &&
      order.affiliateId !== user.id
    ) {
      return response.status(403).json({ error: 'Not authorized to view this order' })
    }

    return response.json({
      success: true,
      data: order.serialize(),
    })
  }

  async processOrder({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const payload = await request.validateUsing(processOrderValidator)

    const product = await Product.find(payload.productId)
    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    if (product.status !== 'approved') {
      return response.status(400).json({ error: 'Product is not approved for purchase' })
    }

    const salePrice = product.salePrice && new Decimal(product.salePrice).lessThan(product.price)
      ? product.salePrice
      : product.price

    const { platformFee, commissionAmount, vendorPayout } = RevenueService.calculateSplit(
      salePrice,
      product.commissionRate,
      payload.affiliateLinkCode ? true : false
    )

    const orderNumber = OrderNumberService.generate()

    let affiliateLink: typeof AffiliateLink | null = null
    let affiliateId: number | null = null

    if (payload.affiliateLinkCode) {
      affiliateLink = await AffiliateLink.findBy('linkCode', payload.affiliateLinkCode)
      if (!affiliateLink || affiliateLink.status !== 'active') {
        return response.status(400).json({ error: 'Invalid or inactive affiliate link' })
      }
      affiliateId = affiliateLink.affiliateId
    }

    const order = await Order.create({
      orderNumber,
      productId: payload.productId,
      productName: product.name,
      buyerId: user.id,
      buyerEmail: user.email,
      vendorId: product.vendorId,
      affiliateId,
      affiliateLinkId: affiliateLink?.id || null,
      amount: salePrice,
      commissionAmount,
      platformFee,
      vendorPayout,
      status: 'completed',
      currency: 'USD',
    })

    if (affiliateLink) {
      affiliateLink.conversions = (affiliateLink.conversions || 0) + 1
      affiliateLink.revenue = new Decimal(affiliateLink.revenue || 0)
        .plus(new Decimal(salePrice))
        .toNumber()
      affiliateLink.commissionEarned = new Decimal(affiliateLink.commissionEarned || 0)
        .plus(new Decimal(commissionAmount))
        .toNumber()
      await affiliateLink.save()
    }

    product.totalSales = (product.totalSales || 0) + 1
    product.totalRevenue = new Decimal(product.totalRevenue || 0)
      .plus(new Decimal(salePrice))
      .toNumber()
    product.gravityScore = Math.min(100, (product.gravityScore || 0) + 1)
    await product.save()

    await mail.send((message) => {
      message
        .to(user.email)
        .subject(`Order ${order.orderNumber} Confirmed — Plenty Value`)
        .htmlView('emails/order_confirmation', {
          order: order.serialize(),
          product: product.serialize(),
        })
    })

    return response.status(201).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        amount: order.amount,
        commissionAmount: order.commissionAmount,
        platformFee: order.platformFee,
        vendorPayout: order.vendorPayout,
        status: order.status,
      },
    })
  }

  async updateStatus({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can update orders' })
    }

    const order = await Order.find(params.id)
    if (!order) {
      return response.status(404).json({ error: 'Order not found' })
    }

    const payload = await request.validateUsing(updateOrderValidator)
    const oldStatus = order.status

    if (oldStatus === payload.status) {
      return response.json({
        success: true,
        message: 'No change needed',
        order: order.serialize(),
      })
    }

    order.status = payload.status
    await order.save()

    if (payload.status === 'refunded') {
      if (order.affiliateLinkId) {
        const affiliateLink = await AffiliateLink.find(order.affiliateLinkId)
        if (affiliateLink) {
          affiliateLink.conversions = Math.max(0, (affiliateLink.conversions || 0) - 1)
          affiliateLink.revenue = new Decimal(affiliateLink.revenue || 0)
            .minus(new Decimal(order.amount))
            .toNumber()
          affiliateLink.commissionEarned = new Decimal(affiliateLink.commissionEarned || 0)
            .minus(new Decimal(order.commissionAmount))
            .toNumber()
          await affiliateLink.save()
        }
      }

      const product = await Product.find(order.productId)
      if (product) {
        product.totalSales = Math.max(0, (product.totalSales || 0) - 1)
        product.totalRevenue = new Decimal(product.totalRevenue || 0)
          .minus(new Decimal(order.amount))
          .toNumber()
        await product.save()
      }
    }

    if (['completed', 'refunded'].includes(payload.status)) {
      const emailTemplate = payload.status === 'completed'
        ? 'emails/order_confirmation'
        : 'emails/refund_notification'

      await mail.send((message) => {
        message
          .to(order.buyerEmail!)
          .subject(
            payload.status === 'completed'
              ? `Order ${order.orderNumber} Completed`
              : `Refund Processed for Order ${order.orderNumber}`
          )
          .htmlView(emailTemplate, {
            order: order.serialize(),
          })
      })
    }

    return response.json({
      success: true,
      message: `Order updated to ${payload.status}`,
      order: {
        id: order.id,
        oldStatus,
        newStatus: order.status,
      },
    })
  }
}