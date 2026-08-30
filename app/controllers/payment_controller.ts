import Order from '#models/order'
import Product from '#models/product'
import User from '#models/user'
import AffiliateLink from '#models/affiliate_link'
import { PaymentService } from '#services/payment_service'
import { paymentGateway } from '#services/payment_gateway'
import { PaymentValidator, PaymentValidationError } from '#services/payment_validator'
import { RevenueService } from '#services/revenue_service'
import { generateOrderNumber } from '#services/order_number_service'
import { initializePaymentValidator, verifyPaymentValidator } from '#validators/payment'
import type { HttpContext } from '@adonisjs/core/http'
import { Decimal } from 'decimal.js'
import logger from '@adonisjs/core/services/logger'
import { CommissionService } from '#services/commission_service'

export default class PaymentController {
  /**
   * GET /api/payment-providers
   * Return the list of enabled payment providers (public-safe, no secret keys).
   */
  async providers({ response }: HttpContext) {
    try {
      const config = await PaymentService.getPublicConfig()

      return response.json({
        success: true,
        activeProvider: config.activeProvider,
        providers: config.providers,
      })
    } catch (error) {
      logger.error('Failed to get payment providers', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        error: 'Failed to fetch payment providers',
      })
    }
  }

  /**
   * POST /api/payments/initialize
   * Start a payment session for a product purchase.
   */
  async initialize({ request, auth, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      const payload = await request.validateUsing(initializePaymentValidator)
      const buyerEmail = user?.email || payload.email

      if (!buyerEmail) {
        return response.status(400).json({ error: 'Email is required for guest checkout' })
      }

      const product = await Product.find(payload.productId)
      if (!product) {
        return response.status(404).json({ error: 'Product not found' })
      }

      if (product.status !== 'approved') {
        return response.status(400).json({ error: 'Product is not approved for purchase' })
      }

      // Resolve quantity (default to 1)
      const quantity = payload.quantity && payload.quantity >= 1 ? Math.floor(payload.quantity) : 1

      // Validate stock if unitCount is tracked
      if (product.unitCount !== null && product.unitCount !== undefined) {
        if (product.unitCount < quantity) {
          return response.status(400).json({
            error: `Only ${product.unitCount} unit${product.unitCount !== 1 ? 's' : ''} available.`,
          })
        }
      }

      // Get chosen provider
      const chosenProvider = payload.paymentProvider || paymentGateway.getActiveProvider()

      // Validate provider
      try {
        await PaymentValidator.validateProvider(chosenProvider)
      } catch (error) {
        if (error instanceof PaymentValidationError) {
          return response.status(400).json({ error: error.message, details: error.details })
        }
        throw error
      }

      // Calculate pricing (per-unit × quantity)
      const productPrice = Number.parseFloat(product.price)
      const unitSalePrice =
        product.salePrice && new Decimal(product.salePrice).lessThan(product.price)
          ? Number.parseFloat(product.salePrice)
          : productPrice

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
          // Ignore JSON parse errors
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

      const orderNumber = generateOrderNumber()
      const callbackUrl =
        payload.callbackUrl || `${request.header('origin') || ''}/product/${product.id}`

      // For manual payments, create order immediately as completed
      console.log(chosenProvider)
      if (chosenProvider === 'manual') {
        const order = await Order.create({
          orderNumber,
          productId: payload.productId,
          productName: product.name,
          buyerId: user?.id ?? null,
          buyerEmail: buyerEmail,
          vendorId: product.vendorId,
          affiliateId,
          affiliateLinkId: affiliateLink?.id || null,
          amount: salePrice.toFixed(2),
          commissionAmount: commissionAmount.toFixed(2),
          platformFee: platformFee.toFixed(2),
          vendorPayout: vendorPayout.toFixed(2),
          status: 'completed',
          currency: 'USD',
          paymentMethod: 'manual',
          quantity,
          shippingDetails: payload.shippingDetails ? JSON.stringify(payload.shippingDetails) : null,
        })

        await this.postOrderComplete(order, product, affiliateLink, quantity)

        const vendor = await User.find(product.vendorId)
        const vendorPayoutInfo = vendor
          ? {
              fullName: vendor.fullName,
              email: vendor.email,
              payoutMethod: vendor.payoutMethod,
              payoutDetails: vendor.payoutDetails,
            }
          : null

        logger.info('Manual payment order created', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.amount,
          quantity,
          buyerEmail,
        })

        return response.status(201).json({
          success: true,
          provider: 'manual',
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            amount: order.amount,
            quantity: order.quantity,
            status: order.status,
          },
          vendor: vendorPayoutInfo,
        })
      }

      // Get currency set by admin in payment settings
      const publicPaymentConfig = await PaymentService.getPublicConfig()
      const systemCurrency = publicPaymentConfig.currency || 'USD'

      // For gateway payments, create order as pending and initialize payment
      const order = await Order.create({
        orderNumber,
        productId: payload.productId,
        productName: product.name,
        buyerId: user?.id ?? null,
        buyerEmail: buyerEmail,
        vendorId: product.vendorId,
        affiliateId,
        affiliateLinkId: affiliateLink?.id || null,
        amount: salePrice.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        vendorPayout: vendorPayout.toFixed(2),
        status: 'pending',
        currency: systemCurrency,
        paymentMethod: chosenProvider,
        quantity,
        shippingDetails: payload.shippingDetails ? JSON.stringify(payload.shippingDetails) : null,
      })

      const { WalletService } = await import('#services/wallet_service')
      await WalletService.handleOrderCreated(order)

      // Initiate payment with gateway
      const paymentResult = await paymentGateway.initiatePayment(
        {
          id: order.id.toString(),
          amount: Math.round(salePrice * 100), // Convert to cents
          currency: systemCurrency,
          email: buyerEmail,
          orderId: orderNumber,
          description: `Purchase of ${product.name}${quantity > 1 ? ` (×${quantity})` : ''}`,
          returnUrl: callbackUrl,
          metadata: {
            productId: product.id,
            affiliateId: affiliateId || undefined,
            quantity,
          },
        },
        chosenProvider
      )

      if (!paymentResult.success) {
        order.status = 'cancelled'
        await order.save()

        logger.error('Payment initiation failed', {
          provider: chosenProvider,
          orderId: order.id,
          message: paymentResult.message,
          status: paymentResult.status,
        })

        console.error('[PaymentController.initialize] Payment result failed:', paymentResult)

        return response.status(500).json({
          success: false,
          error: paymentResult.message || 'Payment initialization failed',
          details: paymentResult.status,
        })
      }

      logger.info('Payment initiated successfully', {
        provider: chosenProvider,
        orderId: order.id,
        orderNumber: order.orderNumber,
        transactionId: paymentResult.transactionId,
        quantity,
      })

      return response.json({
        success: true,
        provider: chosenProvider,
        payment: {
          transactionId: paymentResult.transactionId,
          paymentUrl: paymentResult.paymentUrl,
          reference: paymentResult.reference,
        },
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          amount: order.amount,
          quantity: order.quantity,
          status: order.status,
        },
      })
    } catch (error) {
      const errorResponse = PaymentValidator.formatErrorResponse(error)

      logger.error('Payment initialization error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(400).json(errorResponse)
    }
  }

  /**
   * POST /api/payments/verify
   * Verify a payment by its reference.
   */
  async verify({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(verifyPaymentValidator)

      // Validate transaction ID
      PaymentValidator.validateTransactionId(payload.reference)
      PaymentValidator.validateProvider(payload.provider)

      const order = await Order.findBy('orderNumber', payload.reference)
      if (!order) {
        return response.status(404).json({ error: 'Order not found' })
      }

      // If already settled (completed or processing), return immediately
      if (order.status === 'completed' || order.status === 'processing') {
        return response.json({
          success: true,
          verified: true,
          order: { id: order.id, orderNumber: order.orderNumber, status: order.status },
        })
      }

      // Verify payment with gateway
      const verifyResult = await paymentGateway.verifyPayment(
        payload.reference,
        payload.reference,
        payload.provider
      )

      if (verifyResult.success) {
        const product = await Product.find(order.productId)
        const affiliateLink = order.affiliateLinkId
          ? await AffiliateLink.find(order.affiliateLinkId)
          : null

        if (product) {
          // postOrderComplete sets order.status based on product type
          await this.postOrderComplete(order, product, affiliateLink)
        } else {
          // Fallback if product is missing — complete the order directly
          order.status = 'completed'
          await order.save()
        }

        logger.info('Payment verified successfully', {
          provider: payload.provider,
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
        })
      } else {
        logger.warn('Payment verification failed', {
          provider: payload.provider,
          reference: payload.reference,
          status: verifyResult.status,
        })
      }

      return response.json({
        success: true,
        verified: verifyResult.success,
        order: { id: order.id, orderNumber: order.orderNumber, status: order.status },
      })
    } catch (error) {
      const errorResponse = PaymentValidator.formatErrorResponse(error)

      logger.error('Payment verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(400).json(errorResponse)
    }
  }

  /**
   * Shared post-completion logic: update product stats, affiliate stats, and notify admin, vendor, affiliate, & buyer.
   *
   * Status is determined by product type:
   * - digital  → 'completed' immediately (payment received + asset delivered)
   * - physical → 'processing' (payment received, awaiting fulfillment/shipping)
   *
   * Wallet and notifications behave differently for each:
   * - completed:  full wallet credit + buyer download email
   * - processing: pending wallet credit only + vendor notified to fulfil
   */
  private async postOrderComplete(
    order: Order,
    product: Product,
    affiliateLink: AffiliateLink | null,
    quantity: number = 1
  ) {
    const isDigital = product.productType === 'digital'
    const newStatus = isDigital ? 'completed' : 'processing'

    order.status = newStatus
    await order.save()

    const orderedQty = order.quantity ?? quantity

    await CommissionService.recordAffiliateConversion(order, affiliateLink)

    product.totalSales = (product.totalSales || 0) + orderedQty
    if (product.unitCount !== null && product.unitCount !== undefined && product.unitCount > 0) {
      product.unitCount = Math.max(0, product.unitCount - orderedQty)
    }
    product.totalRevenue = new Decimal(product.totalRevenue || 0)
      .plus(order.amount)
      .toDecimalPlaces(2)
      .toString()
    product.gravityScore = Math.min(100, (product.gravityScore || 0) + 1)
    await product.save()

    const { WalletService } = await import('#services/wallet_service')
    const { NotificationService } = await import('#services/notification_service')

    if (isDigital) {
    // Digital product: Full completion - credit vendor wallet, fire all notifications (includes buyer download link)
      await WalletService.handleOrderCompleted(order)
      await NotificationService.notifyOrderCompleted(order, product)
      console.log(`[PaymentController] Digital product completed via payment: ${order.orderNumber}`)


    } else {
      // Physical product: Payment received but not yet fulfilled - add pending balance, notify for processing
      await WalletService.handleOrderCreated(order)
      await NotificationService.notifyOrderProcessing(order, product)
      console.log(`[PaymentController] Physical product set to processing via payment: ${order.orderNumber}`)

    }
  }
}
