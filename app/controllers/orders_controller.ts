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
import { CommissionService } from '#services/commission_service'

export default class OrdersController {
  async trackOrder({ request, response }: HttpContext) {
    const orderNumber = String(request.input('orderNumber') || '').trim()
    const email = String(request.input('email') || '').trim()

    if (!orderNumber || !email) {
      return response.status(400).json({
        success: false,
        error: 'Both Order Number and Email Address are required to track an order.',
      })
    }

    const order = await Order.query()
      .whereRaw('LOWER(order_number) = ?', [orderNumber.toLowerCase()])
      .whereRaw('LOWER(buyer_email) = ?', [email.toLowerCase()])
      .preload('product' as never)
      .first()

    if (!order) {
      return response.status(404).json({
        success: false,
        error: 'No order found matching the provided Order Number and Email Address.',
      })
    }

    const vendor = order.vendorId ? await User.find(order.vendorId) : null
    const product = order.productId ? await Product.find(order.productId) : null

    const orderData = order.serialize()

    let digitalAsset = null
    if (order.status === 'completed' && product && product.productType === 'digital') {
      if (product.digitalAssetUrl) {
        digitalAsset = {
          url: product.digitalAssetUrl,
          name: product.digitalAssetName || product.name || 'Digital Asset',
        }
      }
    }

    const { default: env } = await import('#start/env')
    const supportEmail = env.get('SUPPORT_EMAIL', 'support@plentyvalue.com')

    return response.json({
      success: true,
      data: {
        ...orderData,
        digitalAsset,
        product: product ? product.serialize() : null,
        vendor: vendor
          ? {
            fullName: vendor.fullName,
            businessName: vendor.businessName,
            email: vendor.email,
            phone: vendor.phone,
            location: vendor.location,
          }
          : null,
        supportEmail,
      },
    })
  }

  async downloadDigitalAsset({ request, response }: HttpContext) {
    const orderNumber = String(request.input('orderNumber') || '').trim()
    const email = String(request.input('email') || '').trim()

    if (!orderNumber || !email) {
      return response.badRequest({
        success: false,
        error: 'Order number and email are required to download digital assets.',
      })
    }

    const order = await Order.query()
      .whereRaw('LOWER(order_number) = ?', [orderNumber.toLowerCase()])
      .whereRaw('LOWER(buyer_email) = ?', [email.toLowerCase()])
      .preload('product' as never)
      .first()

    if (!order) {
      return response.notFound({
        success: false,
        error: 'Order not found.',
      })
    }

    if (order.status !== 'completed') {
      return response.forbidden({
        success: false,
        error: 'Digital download is only available for completed orders.',
      })
    }

    const product = order.product as any
    if (!product || product.productType !== 'digital' || !product.digitalAssetUrl) {
      return response.badRequest({
        success: false,
        error: 'This order does not contain a downloadable digital asset.',
      })
    }

    return response.redirect(product.digitalAssetUrl)
  }

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
    const UUID_REGEX =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    const paramId = String(params.id ?? '').trim()
    const isUuid = UUID_REGEX.test(paramId)
    const isNumeric = /^\d+$/.test(paramId)
    const order = await Order.query()
      .where((q) => {
        if (isUuid) {
          q.where('uuid', paramId)
        } else if (isNumeric) {
          q.where('id', paramId)
        } else {
          q.where('orderNumber', paramId)
        }
      })
      .preload('product' as never)
      .first()

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

    const orderData = order.serialize()

    // Include digital asset information if order is completed and user is buyer, vendor, or admin
    if (order.status === 'completed' && (order.product as any)) {
      const prod = order.product as any
      if (prod.productType === 'digital' && prod.digitalAssetUrl) {
        orderData.digitalAsset = {
          url: prod.digitalAssetUrl,
          name: prod.digitalAssetName || prod.name || 'Digital Asset',
        }
      }
    }

    return response.json({
      success: true,
      data: orderData,
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
    const unitSalePrice =
      product.salePrice && new Decimal(product.salePrice).lessThan(product.price)
        ? Number.parseFloat(product.salePrice)
        : productPrice

    const quantity = payload.quantity && payload.quantity >= 1 ? Math.floor(payload.quantity) : 1

    // Validate stock if unitCount is tracked
    if (product.unitCount !== null && product.unitCount !== undefined) {
      if (product.unitCount < quantity) {
        return response.status(400).json({
          error: `Only ${product.unitCount} unit${product.unitCount !== 1 ? 's' : ''} available.`,
        })
      }
    }

    const salePrice = new Decimal(unitSalePrice).mul(quantity).toDecimalPlaces(2).toNumber()

    // Resolve affiliate token: HTTP-only cookie first, fallback to payload
    let affiliateCode = payload.affiliateLinkCode
    const cookieAttrRaw = request.cookie('pv_aff_attr')
    if (cookieAttrRaw) {
      try {
        const parsed = typeof cookieAttrRaw === 'string' ? JSON.parse(cookieAttrRaw) : cookieAttrRaw
        if (parsed && parsed.linkCode) {
          affiliateCode = parsed.linkCode
        }
      } catch {
        // Ignore JSON parse error
      }
    }

    let affiliateLink: AffiliateLink | null = null
    let affiliateId: number | null = null

    if (affiliateCode) {
      const foundLink = await AffiliateLink.findBy('linkCode', affiliateCode)
      if (foundLink && foundLink.status === 'active') {
        // Self-referral check: block if buyer is the affiliate
        const isSelfReferral = user && user.id === foundLink.affiliateId
        if (!isSelfReferral) {
          affiliateLink = foundLink
          affiliateId = foundLink.affiliateId
        }
      }
    }

    const { platformFee, commissionAmount, vendorPayout } = RevenueService.calculate(
      productPrice * quantity,
      salePrice,
      Number(product.commissionRate),
      !!affiliateLink
    )

    const paymentConfig = await PaymentService.resolveCheckoutMethod()
    const paymentMethod = payload.paymentMethod || paymentConfig.provider.key
    if (paymentMethod !== 'manual' && !paymentConfig.provider.enabled) {
      return response.status(400).json({ error: 'Selected payment provider is not enabled' })
    }

    const orderNumber = generateOrderNumber()

    // Determine initial order status based on product type
    const initialStatus = product.productType === 'digital' ? 'completed' : 'processing'

    console.log(`[OrdersController] Creating order for product type: ${product.productType}, initial status: ${initialStatus}`)

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
      status: initialStatus,
      currency: 'USD',
      paymentMethod,
      quantity,
      shippingDetails: payload.shippingDetails ? JSON.stringify(payload.shippingDetails) : null,
    })

    // Record affiliate conversion safely and idempotently
    await CommissionService.recordAffiliateConversion(order, affiliateLink)

    // Update product stats (for both digital and physical products)
    product.totalSales = (product.totalSales || 0) + quantity
    if (product.unitCount !== null && product.unitCount !== undefined && product.unitCount > 0) {
      product.unitCount = Math.max(0, product.unitCount - quantity)
    }
    product.totalRevenue = new Decimal(product.totalRevenue || 0)
      .plus(salePrice)
      .toDecimalPlaces(2)
      .toString()
    product.gravityScore = Math.min(100, (product.gravityScore || 0) + 1)
    await product.save()

    // Handle order completion logic only for digital products (auto-completed)
    if (order.status === 'completed') {
    // Digital product - complete immediately
      const { WalletService } = await import('#services/wallet_service')
      await WalletService.handleOrderCompleted(order)

      // Send comprehensive notifications (buyer, admin, vendor, affiliate)
      try {
        const { NotificationService } = await import('#services/notification_service')
        await NotificationService.notifyOrderCompleted(order, product)
        console.log(`[OrdersController] Digital product order completed: ${order.orderNumber}`)


      } catch (error: any) {
        console.error(`[OrdersController] Failed to send notifications for order ${order.orderNumber}:`, error.message)


      }
    } else {


      try {
        const { NotificationService } = await import('#services/notification_service')
        await NotificationService.notifyOrderProcessing(order, product)
        console.log(`[OrdersController] Physical product order created (processing): ${order.orderNumber}`)


      } catch (error: any) {
        console.error(`[OrdersController] Failed to send processing notifications for order ${order.orderNumber}:`, error.message)

        // Log email failure

      }
    }

    return response.status(201).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        amount: order.amount,
        quantity: order.quantity,
        commissionAmount: order.commissionAmount,
        platformFee: order.platformFee,
        vendorPayout: order.vendorPayout,
        status: order.status,
      },
    })
  }

  async notifyVendor({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const UUID_REGEX =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    const paramId = String(params.id ?? '').trim()
    const isUuid = UUID_REGEX.test(paramId)
    const isNumeric = /^\d+$/.test(paramId)
    const order = await Order.query()
      .where((q) => {
        if (isUuid) {
          q.where('uuid', paramId)
        } else if (isNumeric) {
          q.where('id', paramId)
        } else {
          q.where('orderNumber', paramId)
        }
      })
      .first()

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
                .map(
                  (line) =>
                    `<p style="margin: 8px 0;">${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
                )
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

    const UUID_REGEX =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    const paramId = String(params.id ?? '').trim()
    const isUuid = UUID_REGEX.test(paramId)
    const isNumeric = /^\d+$/.test(paramId)
    const order = await Order.query()
      .where((q) => {
        if (isUuid) {
          q.where('uuid', paramId)
        } else if (isNumeric) {
          q.where('id', paramId)
        } else {
          q.where('orderNumber', paramId)
        }
      })
      .first()
    if (!order) {
      return response.status(404).json({ error: 'Order not found' })
    }

    if (user.role !== 'admin' && order.vendorId !== user.id) {
      return response.status(403).json({ error: 'Not authorized to update this order' })
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

    if (payload.status === 'completed' && (oldStatus === 'pending' || oldStatus === 'processing')) {
    // Payment was already received (processing) or order was manual (pending)
    // — now fully complete: credit vendor wallet
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
      if (payload.status === 'completed') {
        // Only send completion notifications if order was not already completed
        if (oldStatus !== 'completed') {
          const product = await Product.find(order.productId)
          if (product) {
            try {
              const { NotificationService } = await import('#services/notification_service')
              await NotificationService.notifyOrderCompleted(order, product)
              console.log(`[OrdersController] Order completion notification sent for status update ${order.orderNumber} (was ${oldStatus})`)

              // Log manual completion email success

            } catch (error: any) {
              console.error(`[OrdersController] Failed to send completion notifications for order ${order.orderNumber}:`, error.message)

              // Log manual completion email failure

            }
          }
        } else {
          console.log(`[OrdersController] Order ${order.orderNumber} was already completed, skipping duplicate notification`)

      // Log duplicate prevention

        }
      } else {
        // Handle refund notifications
        try {
          await mail.send((message) => {
            message
              .to(order.buyerEmail!)
              .subject(`Refund Processed for Order ${order.orderNumber}`)
              .htmlView('emails/refund_notification', {
                order: order.serialize(),
              })
          })


        } catch (error: any) {
          console.error(`[OrdersController] Failed to send refund notification for order ${order.orderNumber}:`, error.message)
        }
      }
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
