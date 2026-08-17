import type { HttpContext } from '@adonisjs/core/http'
import { paymentGateway } from '#services/payment_gateway'
import { PaymentValidator } from '#services/payment_validator'
import Order from '#models/order'
import Product from '#models/product'
import AffiliateLink from '#models/affiliate_link'
import logger from '@adonisjs/core/services/logger'

/**
 * Webhook Controller
 * Handles webhook events from all payment providers
 */
export default class WebhookController {
  /**
   * Complete an order once a gateway confirms successful payment.
   * Looks up the order by orderNumber (= the reference sent to the gateway),
   * marks it completed, credits the vendor wallet, and fires notifications.
   */
  private async completeOrderByReference(reference: string, provider: string) {
    if (!reference) return

    const order = await Order.findBy('orderNumber', reference)
    if (!order || order.status === 'completed') return

    order.status = 'completed'
    order.paymentMethod = provider
    await order.save()

    const [product, affiliateLink] = await Promise.all([
      Product.find(order.productId),
      order.affiliateLinkId ? AffiliateLink.find(order.affiliateLinkId) : null,
    ])

    if (product) {
      // Update product stats
      product.totalSales = (product.totalSales || 0) + 1
      const { Decimal } = await import('decimal.js')
      product.totalRevenue = new Decimal(product.totalRevenue || 0)
        .plus(order.amount)
        .toDecimalPlaces(2)
        .toString()
      product.gravityScore = Math.min(100, (product.gravityScore || 0) + 1)
      await product.save()

      // Update affiliate stats
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
    }

    // Credit vendor and affiliate wallets
    const { WalletService } = await import('#services/wallet_service')
    await WalletService.handleOrderCompleted(order)

    // Send notifications
    const { NotificationService } = await import('#services/notification_service')
    if (product) await NotificationService.notifyOrderCompleted(order, product)

    logger.info('Order completed via webhook', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      provider,
    })
  }

  /**
   * POST /api/payments/webhook/:provider
   * Handle incoming webhook from payment provider
   */
  async handleWebhook({ params, request, response }: HttpContext) {
    const { provider } = params
    const payload = request.raw() || ''
    const signature = request.header('x-webhook-signature') || request.header('signature') || ''

    try {
      // Log webhook receipt
      logger.info(`Received webhook from ${provider}`, {
        provider,
        signaturePresent: !!signature,
        payloadSize: payload.length,
      })

      // Validate inputs
      PaymentValidator.validateWebhookSignature(provider, payload, signature)

      // Handle webhook
      const result = await paymentGateway.handleWebhook(provider, payload, signature)

      // Complete order on successful payment event
      if (result.success && result.reference) {
        await this.completeOrderByReference(result.reference, provider)
      }

      // Log result
      if (result.success) {
        logger.info(`Webhook processed successfully for ${provider}`, {
          provider,
          message: result.message,
        })
      } else {
        logger.warn(`Webhook processing failed for ${provider}`, {
          provider,
          message: result.message,
        })
      }

      // Always return 200 to acknowledge receipt
      return response.status(200).json({
        success: result.success,
        message: result.message,
        provider: result.provider,
      })
    } catch (error) {
      logger.error(`Webhook error for ${provider}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        provider,
      })

      // Still return 200 to prevent retries for validation errors
      const errorResponse = PaymentValidator.formatErrorResponse(error)

      return response.status(200).json(errorResponse)
    }
  }

  /**
   * POST /api/payments/webhook/stripe
   * Stripe-specific webhook handler
   */
  async stripeWebhook({ request, response }: HttpContext) {
    const payload = request.raw() || ''
    const signature = request.header('stripe-signature') || ''

    try {
      const result = await paymentGateway.handleWebhook('stripe', payload, signature)

      if (result.success && result.reference) {
        await this.completeOrderByReference(result.reference, 'stripe')
      }

      return response.status(200).json({
        success: result.success,
        message: result.message,
      })
    } catch (error) {
      logger.error('Stripe webhook error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(200).json({
        success: false,
        message: 'Webhook processing failed',
      })
    }
  }

  /**
   * POST /api/payments/webhook/paystack
   * Paystack-specific webhook handler
   */
  async paystackWebhook({ request, response }: HttpContext) {
    const payload = request.raw() || ''
    const signature = request.header('x-paystack-signature') || ''

    try {
      const result = await paymentGateway.handleWebhook('paystack', payload, signature)

      if (result.success && result.reference) {
        await this.completeOrderByReference(result.reference, 'paystack')
      }

      return response.status(200).json({
        success: result.success,
        message: result.message,
      })
    } catch (error) {
      logger.error('Paystack webhook error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(200).json({
        success: false,
        message: 'Webhook processing failed',
      })
    }
  }

  /**
   * POST /api/payments/webhook/flutterwave
   * Flutterwave-specific webhook handler
   */
  async flutterwaveWebhook({ request, response }: HttpContext) {
    const payload = request.raw() || ''
    const signature = request.header('verif-hash') || ''

    try {
      const result = await paymentGateway.handleWebhook('flutterwave', payload, signature)

      if (result.success && result.reference) {
        await this.completeOrderByReference(result.reference, 'flutterwave')
      }

      return response.status(200).json({
        success: result.success,
        message: result.message,
      })
    } catch (error) {
      logger.error('Flutterwave webhook error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(200).json({
        success: false,
        message: 'Webhook processing failed',
      })
    }
  }

  /**
   * POST /api/payments/webhook/paypal
   * PayPal-specific webhook handler
   */
  async paypalWebhook({ request, response }: HttpContext) {
    const payload = request.raw() || ''
    const signature = request.header('paypal-transmission-sig') || ''

    try {
      const result = await paymentGateway.handleWebhook('paypal', payload, signature)

      if (result.success && result.reference) {
        await this.completeOrderByReference(result.reference, 'paypal')
      }

      return response.status(200).json({
        success: result.success,
        message: result.message,
      })
    } catch (error) {
      logger.error('PayPal webhook error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(200).json({
        success: false,
        message: 'Webhook processing failed',
      })
    }
  }


  /**
   * GET /api/payments/webhook-endpoints
   * Get all webhook endpoints (for configuration)
   * Admin only
   */
  async getWebhookEndpoints({ response }: HttpContext) {
    try {
      const endpoints = paymentGateway.getAllWebhookEndpoints()

      return response.json({
        success: true,
        endpoints: endpoints,
      })
    } catch (error) {
      logger.error('Failed to get webhook endpoints', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        message: 'Failed to get webhook endpoints',
      })
    }
  }

  /**
   * POST /api/payments/webhook-test/:provider
   * Test webhook from provider (admin only)
   */
  async testWebhook({ params, response }: HttpContext) {
    const { provider } = params

    try {
      // Validate provider
      await PaymentValidator.validateProvider(provider)

      // Create test payload based on provider
      const testPayload = this.createTestPayload(provider)
      const testSignature = 'test_signature'

      // Process webhook
      const result = await paymentGateway.handleWebhook(
        provider,
        JSON.stringify(testPayload),
        testSignature
      )

      logger.info(`Test webhook for ${provider}`, {
        provider,
        success: result.success,
      })

      return response.json({
        success: true,
        message: `Test webhook sent to ${provider}`,
        result: result,
      })
    } catch (error) {
      const errorResponse = PaymentValidator.formatErrorResponse(error)

      return response.status(400).json(errorResponse)
    }
  }

  /**
   * Create test payload for a provider
   */
  private createTestPayload(provider: string): Record<string, any> {
    const timestamp = new Date().toISOString()

    const payloads: Record<string, Record<string, any>> = {
      stripe: {
        type: 'charge.succeeded',
        data: {
          object: {
            id: 'ch_test_123',
            object: 'charge',
            amount: 10000,
            currency: 'usd',
            status: 'succeeded',
          },
        },
        created: Math.floor(Date.now() / 1000),
      },

      paystack: {
        event: 'charge.success',
        data: {
          id: 123456,
          reference: 'ref_test_123',
          amount: 10000,
          currency: 'NGN',
          status: 'success',
          customer: {
            email: 'test@example.com',
          },
        },
      },

      flutterwave: {
        event: 'charge.completed',
        data: {
          id: 123456,
          tx_ref: 'ref_test_123',
          flw_ref: 'FLW123456',
          amount: 100,
          currency: 'USD',
          status: 'successful',
          customer: {
            email: 'test@example.com',
          },
        },
      },

      paypal: {
        event_type: 'CHECKOUT.ORDER.COMPLETED',
        id: 'WH-TEST123',
        create_time: timestamp,
        resource: {
          id: 'test_order_123',
          status: 'COMPLETED',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: '100.00',
              },
            },
          ],
        },
      },
    }

    return payloads[provider] || { event: 'test', provider }
  }
}
