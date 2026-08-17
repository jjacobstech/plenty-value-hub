import Stripe from 'stripe'
import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  WebhookPayload,
  WebhookResponse,
  PaymentStatus,
  RefundResponse,
} from '#interfaces/payment_provider'
import crypto from 'node:crypto'
import { paymentConfig } from '#config/payment'
import { PaymentGatewayService } from '#services/payment_gateway_service'

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe | null = null
  private config: Record<string, any>

  constructor() {
    this.config = paymentConfig.providers.stripe
    const secretKey = this.config?.secretKey

    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-01-01' as any,
      })
    }
  }

  private async getStripeClient(): Promise<Stripe> {
    if (this.stripe) return this.stripe

    const secretKey = await PaymentGatewayService.getCredential('stripe', 'secretKey')

    if (!secretKey) {
      throw new Error('Stripe secret key not configured in database')
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-01-01' as any,
    })

    return this.stripe
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const stripeClient = await this.getStripeClient()
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: request.currency.toLowerCase(),
              product_data: {
                name: request.description,
                metadata: request.metadata || {},
              },
              unit_amount: request.amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${request.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: request.returnUrl || `${this.config.webhookUrl}/stripe/cancel`,
        customer_email: request.email,
        metadata: {
          orderId: request.orderId,
          ...request.metadata,
        },
        payment_intent_data: {
          metadata: {
            orderId: request.orderId,
          },
        },
      })

      return {
        success: true,
        provider: 'stripe',
        transactionId: session.id,
        status: this.getPaymentStatus(session.payment_status),
        amount: request.amount,
        currency: request.currency,
        paymentUrl: session.url || '',
        reference: session.id,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'stripe',
        transactionId: '',
        status: {
          status: 'failed',
          code: 'STRIPE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        amount: request.amount,
        currency: request.currency,
        message: error instanceof Error ? error.message : 'Payment initiation failed',
        timestamp: new Date(),
      }
    }
  }

  async verifyPayment(sessionId: string, reference?: string): Promise<PaymentResponse> {
    try {
      void reference
      const stripe = await this.getStripeClient()
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (!session.payment_intent || typeof session.payment_intent === 'string') {
        throw new Error('Payment intent not found')
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent.id)

      return {
        success: paymentIntent.status === 'succeeded',
        provider: 'stripe',
        transactionId: session.id,
        status: this.getPaymentIntentStatus(paymentIntent),
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        reference: session.id,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'stripe',
        transactionId: sessionId,
        status: {
          status: 'failed',
          code: 'STRIPE_ERROR',
          message: error instanceof Error ? error.message : 'Verification failed',
        },
        amount: 0,
        currency: '',
        message: error instanceof Error ? error.message : 'Payment verification failed',
        timestamp: new Date(),
      }
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const secret = paymentConfig.providers.stripe.webhookSecret
      if (!secret) return false

      const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex')

      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
    } catch {
      return false
    }
  }

  async handleWebhookEvent(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      const { eventType } = payload

      switch (eventType) {
        case 'charge.succeeded':
          // Payment successful
          return {
            success: true,
            message: 'Payment processed successfully',
            received: true,
          }

        case 'charge.failed':
          // Payment failed
          return {
            success: true,
            message: 'Payment failure processed',
            received: true,
          }

        case 'charge.refunded':
          // Refund processed
          return {
            success: true,
            message: 'Refund processed',
            received: true,
          }

        default:
          return {
            success: true,
            message: 'Webhook event received',
            received: true,
          }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
        received: false,
      }
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResponse> {
    try {
      const stripe = await this.getStripeClient()
      const session = await stripe.checkout.sessions.retrieve(transactionId)

      if (!session.payment_intent || typeof session.payment_intent === 'string') {
        throw new Error('Payment intent not found')
      }

      const refund = await stripe.refunds.create({
        payment_intent: session.payment_intent.id,
        amount: amount,
      })

      return {
        success: refund.status === 'succeeded',
        provider: 'stripe',
        refundId: refund.id,
        transactionId: transactionId,
        amount: refund.amount,
        status: refund.status as 'pending' | 'completed' | 'failed',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'stripe',
        refundId: '',
        transactionId: transactionId,
        amount: 0,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Refund failed',
        timestamp: new Date(),
      }
    }
  }

  getConfig(): Record<string, any> {
    return {
      publicKey: this.config.publicKey,
      name: this.config.name,
      label: this.config.label,
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const isConfigured = await PaymentGatewayService.isConfigured('stripe')
      if (isConfigured) return true
    } catch {}
    return !!(this.config?.publicKey && this.config?.secretKey)
  }

  private getPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      paid: { status: 'completed', code: 'SUCCESS', message: 'Payment completed' },
      unpaid: { status: 'pending', code: 'PENDING', message: 'Payment pending' },
      no_payment_required: {
        status: 'completed',
        code: 'NO_PAYMENT',
        message: 'No payment required',
      },
    }

    return (
      statusMap[status] || {
        status: 'processing',
        code: 'PROCESSING',
        message: 'Processing payment',
      }
    )
  }

  private getPaymentIntentStatus(intent: Stripe.PaymentIntent): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      succeeded: { status: 'completed', code: 'SUCCESS', message: 'Payment succeeded' },
      processing: { status: 'processing', code: 'PROCESSING', message: 'Payment processing' },
      requires_payment_method: {
        status: 'pending',
        code: 'PENDING',
        message: 'Requires payment method',
      },
      requires_action: { status: 'pending', code: 'PENDING', message: 'Requires action' },
      requires_confirmation: {
        status: 'pending',
        code: 'PENDING',
        message: 'Requires confirmation',
      },
      canceled: { status: 'cancelled', code: 'CANCELLED', message: 'Payment cancelled' },
    }

    return (
      statusMap[intent.status] || { status: 'failed', code: 'ERROR', message: 'Unknown status' }
    )
  }
}
