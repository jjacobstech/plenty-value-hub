/**
 * Payment Test Utilities
 * Provides helpers and mock data for testing payment functionality
 */

import type { PaymentRequest, PaymentResponse, WebhookPayload } from '#interfaces/payment_provider'

/**
 * Test data generators
 */
export class PaymentTestData {
  /**
   * Generate test payment request
   */
  static generatePaymentRequest(overrides?: Partial<PaymentRequest>): PaymentRequest {
    return {
      id: `test_${Date.now()}`,
      amount: 10000, // $100.00
      currency: 'USD',
      email: 'test@example.com',
      orderId: `ORD-TEST-${Date.now()}`,
      description: 'Test Product Purchase',
      metadata: {
        productId: '123',
        userId: '456',
      },
      returnUrl: 'http://localhost:3333/checkout/success',
      webhookUrl: 'http://localhost:3333/api/payments/webhook',
      ...overrides,
    }
  }

  /**
   * Generate test payment response
   */
  static generatePaymentResponse(
    provider: string,
    overrides?: Partial<PaymentResponse>
  ): PaymentResponse {
    return {
      success: true,
      provider,
      transactionId: `txn_test_${Date.now()}`,
      status: { status: 'completed', code: 'SUCCESS', message: 'Test payment completed' },
      amount: 10000,
      currency: 'USD',
      reference: `ref_test_${Date.now()}`,
      timestamp: new Date(),
      ...overrides,
    }
  }

  /**
   * Generate Stripe webhook payload
   */
  static generateStripeWebhook(overrides?: Record<string, any>): WebhookPayload {
    return {
      provider: 'stripe',
      eventType: 'charge.succeeded',
      data: {
        object: {
          id: 'ch_test_123',
          object: 'charge',
          amount: 10000,
          currency: 'usd',
          status: 'succeeded',
          metadata: {
            reference: `ORD-TEST-${Date.now()}`,
          },
        },
      },
      signature: 'test_signature',
      timestamp: new Date(),
      ...overrides,
    }
  }

  /**
   * Generate Paystack webhook payload
   */
  static generatePaystackWebhook(overrides?: Record<string, any>): WebhookPayload {
    return {
      provider: 'paystack',
      eventType: 'charge.success',
      data: {
        id: 123456,
        reference: `ref_test_${Date.now()}`,
        amount: 10000,
        currency: 'NGN',
        status: 'success',
        customer: {
          email: 'test@example.com',
        },
      },
      signature: 'test_signature',
      timestamp: new Date(),
      ...overrides,
    }
  }

  /**
   * Generate Flutterwave webhook payload
   */
  static generateFlutterwaveWebhook(overrides?: Record<string, any>): WebhookPayload {
    return {
      provider: 'flutterwave',
      eventType: 'charge.completed',
      data: {
        id: 123456,
        tx_ref: `ref_test_${Date.now()}`,
        flw_ref: 'FLW123456',
        amount: 100,
        currency: 'USD',
        status: 'successful',
        customer: {
          email: 'test@example.com',
        },
      },
      signature: 'test_signature',
      timestamp: new Date(),
      ...overrides,
    }
  }

  /**
   * Generate PayPal webhook payload
   */
  static generatePayPalWebhook(overrides?: Record<string, any>): WebhookPayload {
    const timestamp = new Date().toISOString()

    return {
      provider: 'paypal',
      eventType: 'CHECKOUT.ORDER.COMPLETED',
      data: {
        id: 'WH-TEST123',
        event_type: 'CHECKOUT.ORDER.COMPLETED',
        create_time: timestamp,
        resource: {
          id: `ord_test_${Date.now()}`,
          status: 'COMPLETED',
          purchase_units: [
            {
              reference_id: `ORD-TEST-${Date.now()}`,
              amount: {
                currency_code: 'USD',
                value: '100.00',
              },
            },
          ],
        },
      },
      signature: 'test_signature',
      timestamp: new Date(),
      ...overrides,
    }
  }
}

/**
 * Mock payment provider for testing
 */
export class MockPaymentProvider {
  private responses: Map<string, PaymentResponse> = new Map()

  /**
   * Set mock response for transaction
   */
  setResponse(transactionId: string, response: PaymentResponse): void {
    this.responses.set(transactionId, response)
  }

  /**
   * Get mock response
   */
  getResponse(transactionId: string): PaymentResponse | undefined {
    return this.responses.get(transactionId)
  }

  /**
   * Clear all responses
   */
  clear(): void {
    this.responses.clear()
  }
}

/**
 * Payment test assertions
 */
export class PaymentAssertions {
  /**
   * Assert payment response is successful
   */
  static assertSuccessfulPayment(response: PaymentResponse): void {
    if (!response.success) {
      throw new Error(`Payment should be successful, but got: ${response.message}`)
    }

    if (response.status.status !== 'completed') {
      throw new Error(`Payment status should be 'completed', but got: ${response.status.status}`)
    }

    if (!response.transactionId) {
      throw new Error('Payment response should include transaction ID')
    }

    if (!response.reference) {
      throw new Error('Payment response should include reference')
    }
  }

  /**
   * Assert payment response is failed
   */
  static assertFailedPayment(response: PaymentResponse): void {
    if (response.success) {
      throw new Error('Payment should have failed')
    }

    if (response.status.status !== 'failed') {
      throw new Error(`Payment status should be 'failed', but got: ${response.status.status}`)
    }
  }

  /**
   * Assert payment request is valid
   */
  static assertValidPaymentRequest(request: PaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Payment amount must be greater than 0')
    }

    if (!request.currency || request.currency.length !== 3) {
      throw new Error('Currency must be a valid 3-letter code')
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      throw new Error('Valid email address is required')
    }

    if (!request.orderId) {
      throw new Error('Order ID is required')
    }

    if (!request.description) {
      throw new Error('Description is required')
    }
  }

  /**
   * Assert webhook payload is valid
   */
  static assertValidWebhookPayload(payload: WebhookPayload): void {
    if (!payload.provider) {
      throw new Error('Webhook payload must include provider')
    }

    if (!payload.eventType) {
      throw new Error('Webhook payload must include event type')
    }

    if (!payload.data) {
      throw new Error('Webhook payload must include data')
    }

    if (!payload.signature) {
      throw new Error('Webhook payload must include signature')
    }
  }

  /**
   * Check if email is valid
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

/**
 * Payment test scenarios
 */
export class PaymentTestScenarios {
  /**
   * Test successful payment flow
   */
  static successfulPaymentFlow(): {
    request: PaymentRequest
    response: PaymentResponse
  } {
    const request = PaymentTestData.generatePaymentRequest()
    const response = PaymentTestData.generatePaymentResponse('stripe')

    return { request, response }
  }

  /**
   * Test failed payment flow
   */
  static failedPaymentFlow(): {
    request: PaymentRequest
    response: PaymentResponse
  } {
    const request = PaymentTestData.generatePaymentRequest()
    const response = PaymentTestData.generatePaymentResponse('stripe', {
      success: false,
      status: { status: 'failed', code: 'DECLINED', message: 'Card declined' },
    })

    return { request, response }
  }

  /**
   * Test payment with affiliate
   */
  static affiliatePaymentFlow(): {
    request: PaymentRequest
    response: PaymentResponse
  } {
    const request = PaymentTestData.generatePaymentRequest({
      metadata: {
        productId: '123',
        userId: '456',
        affiliateId: '789',
      },
    })

    const response = PaymentTestData.generatePaymentResponse('stripe')

    return { request, response }
  }

  /**
   * Test multi-currency payment
   */
  static multiCurrencyPaymentFlow(currency: string): {
    request: PaymentRequest
    response: PaymentResponse
  } {
    const request = PaymentTestData.generatePaymentRequest({
      currency,
      amount: this.convertCurrency('USD', currency, 10000),
    })

    const response = PaymentTestData.generatePaymentResponse('stripe', {
      currency,
    })

    return { request, response }
  }

  /**
   * Test webhook processing
   */
  static webhookProcessingFlow(provider: string): {
    webhook: WebhookPayload
  } {
    let webhook: WebhookPayload

    switch (provider) {
      case 'stripe':
        webhook = PaymentTestData.generateStripeWebhook()
        break
      case 'paystack':
        webhook = PaymentTestData.generatePaystackWebhook()
        break
      case 'flutterwave':
        webhook = PaymentTestData.generateFlutterwaveWebhook()
        break
      case 'paypal':
        webhook = PaymentTestData.generatePayPalWebhook()
        break
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }

    return { webhook }
  }

  /**
   * Convert currency (approximate rates for testing)
   */
  private static convertCurrency(fromCurrency: string, toCurrency: string, amount: number): number {
    const rates: Record<string, number> = {
      'USD->EUR': 0.92,
      'USD->GBP': 0.79,
      'USD->NGN': 411,
      'USD->KES': 130,
      'USD->GHS': 13,
    }

    const key = `${fromCurrency}->${toCurrency}`
    const rate = rates[key] || 1

    return Math.round(amount * rate)
  }
}

/**
 * Payment test helpers
 */
export class PaymentTestHelpers {
  /**
   * Create test order data
   */
  static createTestOrder(overrides?: Record<string, any>) {
    return {
      orderNumber: `ORD-TEST-${Date.now()}`,
      productId: 123,
      productName: 'Test Product',
      buyerId: 456,
      buyerEmail: 'buyer@example.com',
      vendorId: 789,
      amount: '99.99',
      commissionAmount: '9.99',
      platformFee: '2.99',
      vendorPayout: '87.01',
      status: 'pending',
      currency: 'USD',
      paymentMethod: 'stripe',
      ...overrides,
    }
  }

  /**
   * Create test payment settings
   */
  static createTestPaymentSettings(overrides?: Record<string, any>) {
    return {
      activeProvider: 'stripe',
      currency: 'USD',
      providers: [
        {
          key: 'manual',
          name: 'manual',
          label: 'Manual',
          enabled: true,
        },
        {
          key: 'stripe',
          name: 'stripe',
          label: 'Stripe',
          enabled: true,
          publicKey: 'pk_test_123',
        },
        {
          key: 'paystack',
          name: 'paystack',
          label: 'Paystack',
          enabled: true,
          publicKey: 'pk_test_456',
        },
        {
          key: 'flutterwave',
          name: 'flutterwave',
          label: 'Flutterwave',
          enabled: true,
          publicKey: 'FLWPUBK_TEST_789',
        },
        {
          key: 'paypal',
          name: 'paypal',
          label: 'PayPal',
          enabled: true,
          clientId: 'test_client_id',
        },
      ],
      ...overrides,
    }
  }

  /**
   * Simulate payment delay
   */
  static async simulatePaymentDelay(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Generate random transaction ID
   */
  static generateTransactionId(provider: string): string {
    const prefixes: Record<string, string> = {
      stripe: 'pi_',
      paystack: 'ref_',
      flutterwave: 'flw_',
      paypal: 'ec_',
    }

    const prefix = prefixes[provider] || 'txn_'
    const random = Math.random().toString(36).substring(2, 15)

    return `${prefix}${random}`
  }

  /**
   * Generate test webhook signature
   */
  static generateWebhookSignature(provider: string): string {
    return `test_sig_${provider}_${Date.now()}`
  }

  /**
   * Format amount for display
   */
  static formatAmount(cents: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    })

    return formatter.format(cents / 100)
  }

  /**
   * Parse amount from display format
   */
  static parseAmount(display: string): number {
    // Remove currency symbols and convert to cents
    const cleaned = display.replace(/[^\d.-]/g, '')
    return Math.round(parseFloat(cleaned) * 100)
  }
}

/**
 * Payment error scenarios for testing
 */
export class PaymentErrorScenarios {
  static readonly ERRORS = {
    INSUFFICIENT_FUNDS: {
      code: 'INSUFFICIENT_FUNDS',
      message: 'Insufficient funds on card',
    },
    CARD_DECLINED: {
      code: 'CARD_DECLINED',
      message: 'Card was declined',
    },
    EXPIRED_CARD: {
      code: 'EXPIRED_CARD',
      message: 'Card has expired',
    },
    INVALID_CVV: {
      code: 'INVALID_CVV',
      message: 'Invalid CVV provided',
    },
    PROCESSING_ERROR: {
      code: 'PROCESSING_ERROR',
      message: 'Payment processor error',
    },
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      message: 'Network connection error',
    },
    TIMEOUT: {
      code: 'TIMEOUT',
      message: 'Request timeout',
    },
    INVALID_AMOUNT: {
      code: 'INVALID_AMOUNT',
      message: 'Invalid payment amount',
    },
    INVALID_CURRENCY: {
      code: 'INVALID_CURRENCY',
      message: 'Currency not supported',
    },
    PROVIDER_NOT_AVAILABLE: {
      code: 'PROVIDER_NOT_AVAILABLE',
      message: 'Payment provider not available',
    },
  }

  /**
   * Get error by code
   */
  static getError(code: string) {
    return this.ERRORS[code as keyof typeof this.ERRORS] || this.ERRORS.PROCESSING_ERROR
  }

  /**
   * Create error response
   */
  static createErrorResponse(code: string, provider: string = 'test'): PaymentResponse {
    const error = this.getError(code)

    return {
      success: false,
      provider,
      transactionId: '',
      status: {
        status: 'failed',
        code: error.code,
        message: error.message,
      },
      amount: 0,
      currency: '',
      message: error.message,
      timestamp: new Date(),
    }
  }
}
