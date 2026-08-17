import type {
  PaymentProvider,
  PaymentProviderFactory,
  PaymentRequest,
  PaymentResponse,
  WebhookPayload,
  WebhookResponse,
  RefundResponse,
} from '#interfaces/payment_provider'
import { StripeProvider } from './payment_providers/stripe_provider.js'
import { PaystackProvider } from './payment_providers/paystack_provider.js'
import { FlutterwaveProvider } from './payment_providers/flutterwave_provider.js'
import { PayPalProvider } from './payment_providers/paypal_provider.js'
import { paymentConfig } from '#config/payment'
import logger from '@adonisjs/core/services/logger'
import { PaymentGatewayService } from '#services/payment_gateway_service'

/**
 * Manual Payment Provider (for offline/manual payments)
 */
class ManualProvider implements PaymentProvider {
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      success: true,
      provider: 'manual',
      transactionId: `manual_${Date.now()}`,
      status: { status: 'pending', code: 'MANUAL', message: 'Manual payment initiated' },
      amount: request.amount,
      currency: request.currency,
      reference: `manual_${Date.now()}`,
      timestamp: new Date(),
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    return {
      success: false,
      provider: 'manual',
      transactionId: transactionId,
      status: { status: 'pending', code: 'MANUAL', message: 'Manual payment pending' },
      amount: 0,
      currency: '',
      message: 'Manual payment - requires admin verification',
      timestamp: new Date(),
    }
  }

  verifyWebhookSignature(): boolean {
    return false
  }

  async handleWebhookEvent(): Promise<WebhookResponse> {
    return {
      success: false,
      message: 'Manual provider does not support webhooks',
      received: false,
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResponse> {
    void transactionId
    void amount
    return {
      success: false,
      provider: 'manual',
      refundId: '',
      transactionId,
      amount: 0,
      status: 'failed',
      message: 'Manual provider does not support automated refunds',
      timestamp: new Date(),
    }
  }

  getConfig() {
    return {
      name: 'manual',
      label: 'Manual / Offline',
    }
  }

  isAvailable(): boolean {
    return true
  }
}

/**
 * Payment Gateway Service
 * Orchestrates payment operations across multiple providers
 */
export class PaymentGateway implements PaymentProviderFactory {
  private providers: Map<string, PaymentProvider> = new Map()
  private activeProvider: string

  constructor() {
    this.activeProvider = paymentConfig.defaultProvider
    // Register default manual provider
    this.providers.set('manual', new ManualProvider())
  }

  /**
   * Get or lazily instantiate a payment provider on-demand
   */
  getProvider(provider: string): PaymentProvider | null {
    if (this.providers.has(provider)) {
      return this.providers.get(provider)!
    }

    try {
      let instance: PaymentProvider | null = null

      switch (provider) {
        case 'stripe':
          instance = new StripeProvider()
          break
        case 'paystack':
          instance = new PaystackProvider()
          break
        case 'flutterwave':
          instance = new FlutterwaveProvider()
          break
        case 'paypal':
          instance = new PayPalProvider()
          break
        default:
          logger.warn(`Unknown payment provider: ${provider}`)
          return null
      }

      if (!instance) {
        return null
      }

      this.providers.set(provider, instance)
      logger.info(`Lazy-initialized payment provider: ${provider}`)
      return instance
    } catch (error) {
      logger.warn(
        `Failed to initialize provider ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      return null
    }
  }

  /**
   * Create a payment provider instance
   */
  create(provider: string): PaymentProvider | null {
    return this.getProvider(provider)
  }

  /**
   * Get all available providers
   */
  /**
   * Get all available providers by querying DB status directly without initializing unused providers
   */
  async getAvailableProviders(): Promise<string[]> {
    const knownProviders = ['manual', 'stripe', 'paystack', 'flutterwave', 'paypal']
    const results = await Promise.all(
      knownProviders.map(async (provider) => {
        if (provider === 'manual') return true
        return await PaymentGatewayService.isConfigured(provider)
      })
    )
    return knownProviders.filter((_, idx) => results[idx])
  }

  /**
   * Set the active payment provider
   */
  async setActiveProvider(provider: string): Promise<boolean> {
    if (!this.providers.has(provider)) {
      logger.warn(`Provider not found: ${provider}`)
      return false
    }

    const instance = this.providers.get(provider)
    const available = instance ? await instance.isAvailable() : false
    if (!available && provider !== 'manual') {
      logger.warn(`Provider not available: ${provider}`)
      return false
    }

    this.activeProvider = provider
    return true
  }

  /**
   * Get the active payment provider
   */
  getActiveProvider(): string {
    return this.activeProvider
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider?: string): Record<string, any> {
    const prov = provider || this.activeProvider
    const instance = this.create(prov)

    if (!instance) {
      throw new Error(`Provider not found: ${prov}`)
    }

    return instance.getConfig()
  }

  /**
   * Initiate a payment with the active provider
   */
  async initiatePayment(request: PaymentRequest, provider?: string): Promise<PaymentResponse> {
    const prov = provider || this.activeProvider
    const instance = this.create(prov)

    if (!instance) {
      return {
        success: false,
        provider: prov,
        transactionId: '',
        status: {
          status: 'failed',
          code: 'PROVIDER_NOT_FOUND',
          message: `Provider not found: ${prov}`,
        },
        amount: request.amount,
        currency: request.currency,
        message: `Payment provider not found: ${prov}`,
        timestamp: new Date(),
      }
    }

    try {
      logger.debug(`Initiating payment with ${prov}`, {
        orderId: request.orderId,
        amount: request.amount,
      })

      const result = await instance.initiatePayment(request)

      logger.info(`Payment initiated successfully`, {
        provider: prov,
        orderId: request.orderId,
        transactionId: result.transactionId,
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log('error')
      logger.error(`Payment initiation failed with ${prov}`, {
        error: errorMessage,
        orderId: request.orderId,
      })

      return {
        success: false,
        provider: prov,
        transactionId: '',
        status: { status: 'failed', code: 'INITIATION_ERROR', message: errorMessage },
        amount: request.amount,
        currency: request.currency,
        message: `Payment initiation failed: ${errorMessage}`,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(
    transactionId: string,
    reference?: string,
    provider?: string
  ): Promise<PaymentResponse> {
    const prov = provider || this.activeProvider
    const instance = this.create(prov)

    if (!instance) {
      return {
        success: false,
        provider: prov,
        transactionId: transactionId,
        status: {
          status: 'failed',
          code: 'PROVIDER_NOT_FOUND',
          message: `Provider not found: ${prov}`,
        },
        amount: 0,
        currency: '',
        message: `Payment provider not found: ${prov}`,
        timestamp: new Date(),
      }
    }

    try {
      logger.debug(`Verifying payment with ${prov}`, { transactionId })

      const result = await instance.verifyPayment(transactionId, reference)

      logger.info(`Payment verified`, {
        provider: prov,
        transactionId,
        success: result.success,
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Payment verification failed with ${prov}`, {
        error: errorMessage,
        transactionId,
      })

      return {
        success: false,
        provider: prov,
        transactionId: transactionId,
        status: { status: 'failed', code: 'VERIFICATION_ERROR', message: errorMessage },
        amount: 0,
        currency: '',
        message: `Payment verification failed: ${errorMessage}`,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Handle a webhook event
   */
  async handleWebhook(
    provider: string,
    payload: string,
    signature: string
  ): Promise<{ success: boolean; message: string; provider: string; reference?: string; eventType?: string }> {
    const instance = this.create(provider)

    if (!instance) {
      return {
        success: false,
        message: `Provider not found: ${provider}`,
        provider: provider,
      }
    }

    try {
      // Verify webhook signature
      if (!instance.verifyWebhookSignature(payload, signature)) {
        logger.warn(`Invalid webhook signature for ${provider}`)
        return {
          success: false,
          message: 'Invalid webhook signature',
          provider: provider,
        }
      }

      // Parse payload
      const data = JSON.parse(payload)

      // Handle webhook event
      const webhookPayload: WebhookPayload = {
        provider: provider,
        eventType: data.type || data.event || data.event_type || '',
        data: data.data || data,
        signature: signature,
        timestamp: new Date(),
      }

      const result = await instance.handleWebhookEvent(webhookPayload)

      logger.info(`Webhook processed successfully`, {
        provider: provider,
        eventType: webhookPayload.eventType,
        reference: result.reference,
      })

      return {
        success: result.success,
        message: result.message,
        provider: provider,
        reference: result.reference,
        eventType: result.eventType,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Webhook processing failed for ${provider}`, { error: errorMessage })

      return {
        success: false,
        message: `Webhook processing failed: ${errorMessage}`,
        provider: provider,
      }
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    transactionId: string,
    amount?: number,
    provider?: string
  ): Promise<RefundResponse> {
    const prov = provider || this.activeProvider
    const instance = this.create(prov)

    if (!instance) {
      return {
        success: false,
        provider: prov,
        refundId: '',
        transactionId: transactionId,
        amount: amount || 0,
        status: 'failed',
        message: `Provider not found: ${prov}`,
        timestamp: new Date(),
      }
    }

    try {
      logger.debug(`Refunding payment with ${prov}`, { transactionId, amount })

      const result = await instance.refundPayment(transactionId, amount)

      logger.info(`Payment refunded`, {
        provider: prov,
        transactionId,
        refundId: result.refundId,
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Refund failed with ${prov}`, { error: errorMessage, transactionId })

      return {
        success: false,
        provider: prov,
        refundId: '',
        transactionId: transactionId,
        amount: amount || 0,
        status: 'failed',
        message: `Refund failed: ${errorMessage}`,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get provider supported currencies
   */
  getSupportedCurrencies(provider?: string): string[] {
    const prov = provider || this.activeProvider
    const supportedCurrencies = paymentConfig.supportedCurrencies as Record<string, string[]>
    return supportedCurrencies[prov] || []
  }

  /**
   * Check if a currency is supported by a provider
   */
  isCurrencySupported(currency: string, provider?: string): boolean {
    const prov = provider || this.activeProvider
    const supportedCurrencies = paymentConfig.supportedCurrencies as Record<string, string[]>
    const supported = supportedCurrencies[prov] || []
    return supported.includes(currency.toUpperCase())
  }

  /**
   * Get payment limits
   */
  getLimits(): Record<string, number> {
    return paymentConfig.limits
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number): { valid: boolean; error?: string } {
    const limits = paymentConfig.limits

    if (amount < limits.minAmount) {
      return { valid: false, error: `Minimum amount is ${limits.minAmount} cents` }
    }

    if (amount > limits.maxAmount) {
      return { valid: false, error: `Maximum amount is ${limits.maxAmount} cents` }
    }

    return { valid: true }
  }

  /**
   * Get webhook URL for a provider
   */
  getWebhookUrl(provider: string): string {
    const webhookEndpoints = paymentConfig.webhookEndpoints as Record<string, string>
    const endpoint = webhookEndpoints[provider]
    if (!endpoint) {
      throw new Error(`Webhook endpoint not configured for ${provider}`)
    }

    return `${paymentConfig.webhookUrl}${endpoint}`
  }

  /**
   * Get all webhook endpoints
   */
  getAllWebhookEndpoints(): Record<string, string> {
    const endpoints: Record<string, string> = {}

    for (const [provider, endpoint] of Object.entries(paymentConfig.webhookEndpoints)) {
      endpoints[provider] = `${paymentConfig.webhookUrl}${endpoint}`
    }

    return endpoints
  }
}

// Export singleton instance
export const paymentGateway = new PaymentGateway()
