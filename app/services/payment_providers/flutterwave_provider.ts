import axios, { AxiosInstance } from 'axios'
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

export class FlutterwaveProvider implements PaymentProvider {
  private client: AxiosInstance | null = null
  private config: Record<string, any>

  constructor() {
    this.config = paymentConfig.providers.flutterwave
  }

  private async getClient(): Promise<AxiosInstance> {
    if (this.client) return this.client

    const secretKey = await PaymentGatewayService.getCredential('flutterwave', 'secretKey')

    if (!secretKey) {
      throw new Error('Flutterwave secret key not configured in database')
    }

    this.client = axios.create({
      baseURL: this.config.apiBaseUrl,
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: this.config.timeout,
    })

    return this.client
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const client = await this.getClient()
      const response = await client.post('/payments', {
        tx_ref: request.orderId,
        amount: (request.amount / 100).toString(), // Convert cents to dollars
        currency: this.getCurrency(request.currency),
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: request.email,
          phonenumber: request.metadata?.phone || '',
          name: request.metadata?.name || '',
        },
        customizations: {
          title: request.description,
          description: request.description,
          logo: request.metadata?.logo || '',
        },
        redirect_url: request.returnUrl,
      })

      const data = response.data

      if (!data.status || data.status !== 'success') {
        throw new Error(data.message || 'Payment initiation failed')
      }

      return {
        success: true,
        provider: 'flutterwave',
        transactionId: data.data.id.toString(),
        status: { status: 'pending', code: 'INITIATED', message: 'Payment initiated' },
        amount: request.amount,
        currency: request.currency,
        paymentUrl: data.data.link || '',
        reference: data.data.id.toString(),
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'flutterwave',
        transactionId: '',
        status: {
          status: 'failed',
          code: 'FLUTTERWAVE_ERROR',
          message: 'Payment initiation failed',
        },
        amount: request.amount,
        currency: request.currency,
        message: error instanceof Error ? error.message : 'Payment initiation failed',
        timestamp: new Date(),
      }
    }
  }

  async verifyPayment(transactionId: string, reference?: string): Promise<PaymentResponse> {
    try {
      void reference
      const client = await this.getClient()
      const response = await client.get(`/transactions/${transactionId}/verify`)
      const data = response.data

      if (!data.status) {
        throw new Error('Invalid response from Flutterwave')
      }

      return {
        success: data.data.status === 'successful',
        provider: 'flutterwave',
        transactionId: data.data.id.toString(),
        status: this.getPaymentStatus(data.data.status),
        amount: Math.round(parseFloat(data.data.amount) * 100), // Convert to cents
        currency: data.data.currency.toUpperCase(),
        reference: data.data.flw_ref,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'flutterwave',
        transactionId: transactionId,
        status: { status: 'failed', code: 'FLUTTERWAVE_ERROR', message: 'Verification failed' },
        amount: 0,
        currency: '',
        message: error instanceof Error ? error.message : 'Payment verification failed',
        timestamp: new Date(),
      }
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const secret = paymentConfig.providers.flutterwave.webhookSecret
      if (!secret) return false

      const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex')

      return hash === signature
    } catch {
      return false
    }
  }

  async handleWebhookEvent(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      const { eventType, data } = payload
      void data

      switch (eventType) {
        case 'charge.completed':
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
      const client = await this.getClient()
      const response = await client.post(`/transactions/${transactionId}/refund`, {
        amount: amount ? (amount / 100).toString() : undefined,
      })

      const data = response.data

      return {
        success: data.status === 'success',
        provider: 'flutterwave',
        refundId: data.data.refund_id,
        transactionId: transactionId,
        amount: Math.round(parseFloat(data.data.amount_refunded || 0) * 100),
        status: 'completed',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'flutterwave',
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
      const isConfigured = await PaymentGatewayService.isConfigured('flutterwave')
      if (isConfigured) return true
    } catch {}
    return !!(this.config?.publicKey && this.config?.secretKey)
  }

  private getPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      successful: { status: 'completed', code: 'SUCCESS', message: 'Payment completed' },
      pending: { status: 'processing', code: 'PENDING', message: 'Payment pending' },
      failed: { status: 'failed', code: 'FAILED', message: 'Payment failed' },
      cancelled: { status: 'cancelled', code: 'CANCELLED', message: 'Payment cancelled' },
    }

    return (
      statusMap[status] || {
        status: 'processing',
        code: 'PROCESSING',
        message: 'Processing payment',
      }
    )
  }

  private getCurrency(currency: string): string {
    const currencyMap: Record<string, string> = {
      USD: 'USD',
      EUR: 'EUR',
      GBP: 'GBP',
      KES: 'KES',
      NGN: 'NGN',
      GHS: 'GHS',
      ZAR: 'ZAR',
      CAD: 'CAD',
      AUD: 'AUD',
    }

    return currencyMap[currency] || 'USD'
  }
}
