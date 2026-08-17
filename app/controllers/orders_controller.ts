import Order from '#models/order'
import Product from '#models/product'
import User from '#models/user'
import AffiliateLink from '#models/affiliate_link'
import { processOrderValidator, updateOrderValidator } from '#validators/order'
import { RevenueService } from '#services/revenue_service'
import { generateOrderNumber } from '#services/order_number_service'
import { PaymentService } from '#services/payment_service'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { Decimal } from 'decimal.js'

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

    const productPrice = Number.parseFloat(product.price)
    const salePrice =
      product.salePrice && new Decimal(product.salePrice).lessThan(product.price)
        ? Number.parseFloat(product.salePrice)
        : productPrice

    const { platformFee, commissionAmount, vendorPayout } = RevenueService.calculate(
      productPrice,
      salePrice,
      product.commissionRate,
      !!payload.affiliateLinkCode
    )

    const paymentConfig = await PaymentService.resolveCheckoutMethod()
    const paymentMethod = payload.paymentMethod || paymentConfig.provider.key
    if (paymentMethod !== 'manual' && !paymentConfig.provider.enabled) {
      return response.status(400).json({ error: 'Selected payment provider is not enabled' })
    }

    const orderNumber = generateOrderNumber()

    let affiliateLink: AffiliateLink | null = null
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
      amount: salePrice.toFixed(2),
      commissionAmount: commissionAmount.toFixed(2),
      platformFee: platformFee.toFixed(2),
      vendorPayout: vendorPayout.toFixed(2),
      status: 'completed',
      currency: 'USD',
      paymentMethod,
    })

    if (affiliateLink) {
      affiliateLink.conversions = (affiliateLink.conversions || 0) + 1
      affiliateLink.revenue = new Decimal(affiliateLink.revenue || 0)
        .plus(salePrice)
        .toDecimalPlaces(2)
        .toString()
      affiliateLink.commissionEarned = new Decimal(affiliateLink.commissionEarned || 0)
        .plus(commissionAmount)
        .toDecimalPlaces(2)
        .toString()
      await affiliateLink.save()
    }

    product.totalSales = (product.totalSales || 0) + 1
    product.totalRevenue = new Decimal(product.totalRevenue || 0)
      .plus(salePrice)
      .toDecimalPlaces(2)
      .toString()
    product.gravityScore = Math.min(100, (product.gravityScore || 0) + 1)
    await product.save()

    const { WalletService } = await import('#services/wallet_service')
    await WalletService.handleOrderCompleted(order)

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

  async notifyVendor({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const order = await Order.find(params.id)

    if (!order) {
      return response.status(404).json({ error: 'Order not found' })
    }

    if (order.buyerId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Not authorized to notify vendor' })
    }

    const vendor = order.vendorId ? await User.find(order.vendorId) : null
    if (!vendor || !vendor.email) {
      return response.status(404).json({ error: 'Vendor not found' })
    }

    const message = String(request.input('message') || '').trim()
    const paymentReference = String(request.input('paymentReference') || '').trim()
    const notes = [
      message || 'I have completed the manual payment for this order.',
      paymentReference ? `Payment reference: ${paymentReference}` : null,
      `Order number: ${order.orderNumber}`,
      `Buyer email: ${user.email}`,
    ].filter((line): line is string => Boolean(line))

    await mail.send((messageBuilder) => {
      messageBuilder
        .to(vendor.email)
        .subject(`Manual payment notification for order #${order.orderNumber}`).html(`
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1f2937;">
            <h2 style="color: #001845; margin-bottom: 12px;">Manual payment notification</h2>
            <p>Hello ${vendor.fullName || 'Seller'},</p>
            <p>A buyer has notified you that they completed a manual payment for order <strong>#${order.orderNumber}</strong>.</p>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 18px 0;">
              ${notes
                .map((line) => `<p style="margin: 8px 0;">${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
                .join('')}
            </div>
            <p>Please confirm receipt and then mark the order as completed in your dashboard.</p>
          </div>
        `)
    })

    return response.json({
      success: true,
      message: 'Vendor has been notified about the manual payment.',
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

    const { WalletService } = await import('#services/wallet_service')

    if (payload.status === 'completed' && oldStatus === 'pending') {
      await WalletService.handleOrderCompleted(order)
    }

    if (payload.status === 'cancelled' && oldStatus === 'pending') {
      await WalletService.handleOrderCancelled(order)
    }

    if (payload.status === 'refunded') {
      if (order.affiliateLinkId) {
        const affiliateLink = await AffiliateLink.find(order.affiliateLinkId)
        if (affiliateLink) {
          affiliateLink.conversions = Math.max(0, (affiliateLink.conversions || 0) - 1)
          affiliateLink.revenue = new Decimal(affiliateLink.revenue || 0)
            .minus(order.amount)
            .toDecimalPlaces(2)
            .toString()
          affiliateLink.commissionEarned = new Decimal(affiliateLink.commissionEarned || 0)
            .minus(order.commissionAmount || 0)
            .toDecimalPlaces(2)
            .toString()
          await affiliateLink.save()
        }
      }

      const product = await Product.find(order.productId)
      if (product) {
        product.totalSales = Math.max(0, (product.totalSales || 0) - 1)
        product.totalRevenue = new Decimal(product.totalRevenue || 0)
          .minus(order.amount)
          .toDecimalPlaces(2)
          .toString()
        await product.save()
      }

      if (oldStatus === 'completed') {
        await WalletService.handleOrderRefunded(order)
      }
    }

    if (['completed', 'refunded'].includes(payload.status)) {
      const emailTemplate =
        payload.status === 'completed' ? 'emails/order_confirmation' : 'emails/refund_notification'

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
