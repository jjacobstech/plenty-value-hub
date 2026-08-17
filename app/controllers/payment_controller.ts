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

      // Calculate pricing
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

      // Validate affiliate link if present
      let affiliateLink: AffiliateLink | null = null
      let affiliateId: number | null = null

      if (payload.affiliateLinkCode) {
        affiliateLink = await AffiliateLink.findBy('linkCode', payload.affiliateLinkCode)
        if (!affiliateLink || affiliateLink.status !== 'active') {
          return response.status(400).json({ error: 'Invalid or inactive affiliate link' })
        }
        affiliateId = affiliateLink.affiliateId
      }

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
        })

        await this.postOrderComplete(order, product, affiliateLink)

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
          buyerEmail,
        })

        return response.status(201).json({
          success: true,
          provider: 'manual',
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            amount: order.amount,
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
          description: `Purchase of ${product.name}`,
          returnUrl: callbackUrl,
          metadata: {
            productId: product.id,
            affiliateId: affiliateId || undefined,
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

      // If already completed, return immediately
      if (order.status === 'completed') {
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
        order.status = 'completed'
        await order.save()

        const product = await Product.find(order.productId)
        const affiliateLink = order.affiliateLinkId
          ? await AffiliateLink.find(order.affiliateLinkId)
          : null

        if (product) {
          await this.postOrderComplete(order, product, affiliateLink)
        }

        logger.info('Payment verified successfully', {
          provider: payload.provider,
          orderId: order.id,
          orderNumber: order.orderNumber,
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
   */
  private async postOrderComplete(
    order: Order,
    product: Product,
    affiliateLink: AffiliateLink | null
  ) {
    if (affiliateLink) {
      affiliateLink.conversions = (affiliateLink.conversions || 0) + 1
      affiliateLink.revenue = new Decimal(affiliateLink.revenue || 0)
        .plus(order.amount)
        .toDecimalPlaces(2)
        .toString()
      affiliateLink.commissionEarned = new Decimal(affiliateLink.commissionEarned || 0)
        .plus(order.commissionAmount || 0)
        .toDecimalPlaces(2)
        .toString()
      await affiliateLink.save()
    }

    product.totalSales = (product.totalSales || 0) + 1
    product.totalRevenue = new Decimal(product.totalRevenue || 0)
      .plus(order.amount)
      .toDecimalPlaces(2)
      .toString()
    product.gravityScore = Math.min(100, (product.gravityScore || 0) + 1)
    await product.save()

    const { WalletService } = await import('#services/wallet_service')
    await WalletService.handleOrderCompleted(order)

    // Dispatch notifications to Admin, Vendor, Affiliate, and Buyer
    const { NotificationService } = await import('#services/notification_service')
    await NotificationService.notifyOrderCompleted(order, product)
  }
}
