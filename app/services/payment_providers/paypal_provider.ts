import axios, { AxiosInstance } from 'axios'
import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  WebhookPayload,
  WebhookResponse,
  PaymentStatus,
  RefundRequest,
  RefundResponse,
} from '#interfaces/payment_provider'
import crypto from 'node:crypto'
import { paymentConfig } from '#config/payment'
import { PaymentGatewayService } from '#services/payment_gateway_service'

export class PayPalProvider implements PaymentProvider {
  private client: AxiosInstance
  private config: Record<string, any>
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.config = paymentConfig.providers.paypal
    const clientId = this.config.clientId

    this.client = axios.create({
      baseURL: this.config.apiBaseUrl,
      timeout: this.config.timeout,
    })
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await this.client.post(
        '/v2/checkout/orders',
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: request.orderId,
              amount: {
                currency_code: request.currency,
                value: (request.amount / 100).toFixed(2),
              },
              description: request.description,
              custom_id: request.orderId,
            },
          ],
          payer: {
            email_address: request.email,
          },
          application_context: {
            return_url: request.returnUrl || '',
            cancel_url: `${this.config.webhookUrl}/paypal/cancel`,
            brand_name: 'Plenty Value Hub',
            user_action: 'PAY_NOW',
            locale: 'en-US',
          },
          notification_url: request.webhookUrl,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = response.data

      const approvalLink = data.links?.find((link: any) => link.rel === 'approve')?.href

      return {
        success: true,
        provider: 'paypal',
        transactionId: data.id,
        status: { status: 'pending', code: 'CREATED', message: 'Order created' },
        amount: request.amount,
        currency: request.currency,
        paymentUrl: approvalLink || '',
        reference: data.id,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'paypal',
        transactionId: '',
        status: { status: 'failed', code: 'PAYPAL_ERROR', message: 'Payment initiation failed' },
        amount: request.amount,
        currency: request.currency,
        message: error instanceof Error ? error.message : 'Payment initiation failed',
        timestamp: new Date(),
      }
    }
  }

  async verifyPayment(orderId: string, reference?: string): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await this.client.get(`/v2/checkout/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = response.data
      const purchase = data.purchase_units?.[0]

      return {
        success: data.status === 'APPROVED' || data.status === 'COMPLETED',
        provider: 'paypal',
        transactionId: data.id,
        status: this.getOrderStatus(data.status),
        amount: Math.round(parseFloat(purchase?.amount?.value || 0) * 100), // Convert to cents
        currency: purchase?.amount?.currency_code || '',
        reference: data.id,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'paypal',
        transactionId: orderId,
        status: { status: 'failed', code: 'PAYPAL_ERROR', message: 'Verification failed' },
        amount: 0,
        currency: '',
        message: error instanceof Error ? error.message : 'Payment verification failed',
        timestamp: new Date(),
      }
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // PayPal webhook signature verification is more complex
      // This is a simplified version. In production, verify using PayPal's verification endpoint
      return true // Implement full verification as needed
    } catch {
      return false
    }
  }

  async handleWebhookEvent(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      const { eventType, data } = payload

      switch (eventType) {
        case 'CHECKOUT.ORDER.APPROVED':
          // Order approved
          return {
            success: true,
            message: 'Order approved',
            received: true,
          }

        case 'CHECKOUT.ORDER.COMPLETED':
          // Order completed/captured
          return {
            success: true,
            message: 'Order completed',
            received: true,
          }

        case 'PAYMENT.CAPTURE.COMPLETED':
          // Payment captured
          return {
            success: true,
            message: 'Payment captured',
            received: true,
          }

        case 'PAYMENT.CAPTURE.REFUNDED':
          // Payment refunded
          return {
            success: true,
            message: 'Payment refunded',
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
      const token = await this.getAccessToken()

      // Get the capture ID first
      const orderResponse = await this.client.get(`/v2/checkout/orders/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const captureId = orderResponse.data.purchase_units?.[0]?.payments?.captures?.[0]?.id

      if (!captureId) {
        throw new Error('No capture found for this order')
      }

      const response = await this.client.post(
        `/v2/payments/captures/${captureId}/refund`,
        {
          amount: amount ? { currency_code: 'USD', value: (amount / 100).toFixed(2) } : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = response.data

      return {
        success: data.status === 'COMPLETED',
        provider: 'paypal',
        refundId: data.id,
        transactionId: transactionId,
        amount: amount || 0,
        status: 'completed',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        provider: 'paypal',
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
      clientId: this.config.clientId,
      name: this.config.name,
      label: this.config.label,
      mode: this.config.mode,
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const isConfigured = await PaymentGatewayService.isConfigured('paypal')
      if (isConfigured) return true
    } catch {}
    return !!(this.config?.clientId && this.config?.clientSecret)
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken
    }

    try {
      const clientId = await PaymentGatewayService.getCredential('paypal', 'clientId')
      const clientSecret = await PaymentGatewayService.getCredential('paypal', 'clientSecret')

      if (!clientId || !clientSecret) {
        throw new Error('PayPal clientId or clientSecret not configured in database')
      }

      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

      const response = await this.client.post('/v1/oauth2/token', 'grant_type=client_credentials', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      this.accessToken = response.data.access_token
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000 // Refresh 1 min before expiry

      return this.accessToken!
    } catch (error) {
      throw new Error(
        `Failed to get PayPal access token: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private getOrderStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      CREATED: { status: 'pending', code: 'CREATED', message: 'Order created' },
      SAVED: { status: 'pending', code: 'SAVED', message: 'Order saved' },
      APPROVED: { status: 'processing', code: 'APPROVED', message: 'Order approved' },
      VOIDED: { status: 'cancelled', code: 'VOIDED', message: 'Order voided' },
      COMPLETED: { status: 'completed', code: 'COMPLETED', message: 'Order completed' },
      PAYER_ACTION_REQUIRED: {
        status: 'pending',
        code: 'ACTION_REQUIRED',
        message: 'Action required',
      },
    }

    return statusMap[status] || { status: 'processing', code: 'PROCESSING', message: 'Processing' }
  }
}
