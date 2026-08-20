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

export class PaystackProvider implements PaymentProvider {
  private client: AxiosInstance | null = null
  private config: Record<string, any>
  private secretKey: string | null = null
  private webhookSecret: string | null = null

  constructor() {
    this.config = paymentConfig.providers.paystack
  }

  /**
   * Lazy load secrets from database on first use
   */
  private async loadSecrets(): Promise<boolean> {
    try {
      if (!this.secretKey) {
        this.secretKey = await PaymentGatewayService.getCredential('paystack', 'secretKey')
      }
      if (!this.webhookSecret) {
        this.webhookSecret = await PaymentGatewayService.getCredential('paystack', 'webhookSecret')
      }

      if (!this.secretKey) {
        throw new Error('Paystack secret key not configured in database')
      }

      // Initialize client if not already done
      if (!this.client) {
        this.client = axios.create({
          baseURL: this.config.apiBaseUrl,
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.config.timeout,
        })
      }

      return true
    } catch (err) {
      console.error('[PaystackProvider] Failed to load secrets:', err)
      return false
    }
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack provider not properly configured')
      }

      const response = await this.client.post('/transaction/initialize', {
        email: request.email,
        amount: request.amount,
        currency: this.getCurrency(request.currency),
        reference: request.orderId,
        callback_url: request.returnUrl,
        metadata: {
          orderId: request.orderId,
          description: request.description,
          ...request.metadata,
        },
      })

      const data = response.data

      return {
        success: data.status === true,
        provider: 'paystack',
        transactionId: data.data.reference,
        status: { status: 'pending', code: 'INITIATED', message: 'Payment initiated' },
        amount: request.amount,
        currency: request.currency,
        paymentUrl: data.data.authorization_url || '',
        reference: data.data.reference,
        timestamp: new Date(),
      }
    } catch (error: any) {
      if (error?.response?.data) {
        console.error(
          '[PaystackProvider.initiatePayment] Paystack API error response:',
          error.response.data
        )
      }
      return {
        success: false,
        provider: 'paystack',
        transactionId: '',
        status: { status: 'failed', code: 'PAYSTACK_ERROR', message: 'Payment initiation failed' },
        amount: request.amount,
        currency: request.currency,
        message:
          error?.response?.data?.message ||
          (error instanceof Error ? error.message : 'Payment initiation failed'),
        timestamp: new Date(),
      }
    }
  }

  async verifyPayment(reference: string, transactionId?: string): Promise<PaymentResponse> {
    try {
      void transactionId
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack provider not properly configured')
      }

      const response = await this.client.get(`/transaction/verify/${reference}`)
      const data = response.data

      if (!data.status || !data.data) {
        throw new Error('Invalid response from Paystack')
      }

      return {
        success: data.data.status === 'success',
        provider: 'paystack',
        transactionId: data.data.reference,
        status: this.getPaymentStatus(data.data.status),
        amount: data.data.amount,
        currency: data.data.currency.toUpperCase(),
        reference: data.data.reference,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'paystack',
        transactionId: reference,
        status: { status: 'failed', code: 'PAYSTACK_ERROR', message: 'Verification failed' },
        amount: 0,
        currency: '',
        message: error instanceof Error ? error.message : 'Payment verification failed',
        timestamp: new Date(),
      }
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const secret = this.webhookSecret || paymentConfig.providers.paystack.webhookSecret
      if (!secret) return false

      const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex')

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
        case 'charge.success': {
          // Extract order reference from Paystack data
          const reference = data?.reference || data?.data?.reference || ''
          return {
            success: true,
            message: 'Payment processed successfully',
            received: true,
            reference,
            eventType,
          }
        }

        case 'charge.failed': {
          const reference = data?.reference || data?.data?.reference || ''
          return {
            success: false,
            message: 'Payment failure processed',
            received: true,
            reference,
            eventType,
          }
        }

        default:
          return {
            success: true,
            message: 'Webhook event received',
            received: true,
            eventType,
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
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack provider not properly configured')
      }

      const response = await this.client.post('/refund', {
        transaction: transactionId,
        amount: amount,
      })

      const data = response.data

      return {
        success: data.status === true,
        provider: 'paystack',
        refundId: data.data.reference,
        transactionId: transactionId,
        amount: data.data.amount,
        status: 'completed',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'paystack',
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
      // Try to load secrets from database
      const isConfigured = await PaymentGatewayService.isConfigured('paystack')
      return isConfigured
    } catch {
      // Fallback to config file
      return !!(this.config.publicKey && this.config.secretKey)
    }
  }

  private getPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      success: { status: 'completed', code: 'SUCCESS', message: 'Payment completed' },
      pending: { status: 'processing', code: 'PENDING', message: 'Payment pending' },
      failed: { status: 'failed', code: 'FAILED', message: 'Payment failed' },
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
      NGN: 'NGN',
      KES: 'KES',
      GHS: 'GHS',
    }

    return currencyMap[currency] || 'NGN'
  }
}
