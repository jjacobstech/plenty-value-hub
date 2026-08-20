import type { PaymentRequest } from '#interfaces/payment_provider'
import { paymentGateway } from './payment_gateway.js'

export class PaymentValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'PaymentValidationError'
  }
}

export class PaymentProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'PaymentProcessingError'
  }
}

/**
 * Payment Validator Service
 * Validates payment requests and operations
 */
export class PaymentValidator {
  /**
   * Validate payment request
   */
  static validatePaymentRequest(request: PaymentRequest): void {
    const errors: Record<string, string> = {}

    // Validate amount
    if (!request.amount || request.amount <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }

    const amountValidation = paymentGateway.validateAmount(request.amount)
    if (!amountValidation.valid) {
      errors.amount = amountValidation.error || 'Invalid amount'
    }

    // Validate currency
    if (!request.currency || request.currency.length !== 3) {
      errors.currency = 'Currency must be a valid 3-letter code'
    }

    if (!paymentGateway.isCurrencySupported(request.currency)) {
      errors.currency = `Currency ${request.currency} is not supported by the active provider`
    }

    // Validate email
    if (!request.email || !this.isValidEmail(request.email)) {
      errors.email = 'Valid email address is required'
    }

    // Validate orderId
    if (!request.orderId || request.orderId.trim() === '') {
      errors.orderId = 'Order ID is required'
    }

    // Validate description
    if (!request.description || request.description.trim() === '') {
      errors.description = 'Description is required'
    }

    if (request.description.length > 500) {
      errors.description = 'Description must be less than 500 characters'
    }

    // Validate return URL if provided
    if (request.returnUrl && !this.isValidUrl(request.returnUrl)) {
      errors.returnUrl = 'Return URL must be valid'
    }

    // Validate webhook URL if provided
    if (request.webhookUrl && !this.isValidUrl(request.webhookUrl)) {
      errors.webhookUrl = 'Webhook URL must be valid'
    }

    // Throw if validation errors exist
    if (Object.keys(errors).length > 0) {
      throw new PaymentValidationError(
        'Payment request validation failed',
        'VALIDATION_ERROR',
        errors
      )
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate transaction ID
   */
  static validateTransactionId(transactionId: string): void {
    if (!transactionId || transactionId.trim() === '') {
      throw new PaymentValidationError('Transaction ID is required', 'MISSING_TRANSACTION_ID')
    }

    if (transactionId.length < 5) {
      throw new PaymentValidationError('Transaction ID is invalid', 'INVALID_TRANSACTION_ID')
    }
  }

  /**
   * Validate provider
   */
  static async validateProvider(provider: string): Promise<void> {
    const available = await paymentGateway.getAvailableProviders()

    if (!available.includes(provider)) {
      throw new PaymentValidationError(
        `Payment provider '${provider}' is not available`,
        'PROVIDER_NOT_AVAILABLE',
        { availableProviders: available }
      )
    }
  }

  /**
   * Validate refund request
   */
  static validateRefundRequest(transactionId: string, amount?: number): void {
    this.validateTransactionId(transactionId)

    if (amount !== undefined) {
      if (amount <= 0) {
        throw new PaymentValidationError(
          'Refund amount must be greater than 0',
          'INVALID_REFUND_AMOUNT'
        )
      }

      const validation = paymentGateway.validateAmount(amount)
      if (!validation.valid) {
        throw new PaymentValidationError(
          validation.error || 'Invalid refund amount',
          'INVALID_REFUND_AMOUNT'
        )
      }
    }
  }

  /**
   * Validate webhook signature
   */
  static async validateWebhookSignature(
    provider: string,
    payload: string,
    signature: string
  ): Promise<void> {
    if (!provider || provider.trim() === '') {
      throw new PaymentValidationError('Provider is required', 'MISSING_PROVIDER')
    }

    if (!payload || payload.trim() === '') {
      throw new PaymentValidationError('Payload is required', 'MISSING_PAYLOAD')
    }

    if (!signature || signature.trim() === '') {
      throw new PaymentValidationError('Signature is required', 'MISSING_SIGNATURE')
    }

    await this.validateProvider(provider)
  }

  /**
   * Sanitize payment metadata
   */
  static sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {}

    const sanitized: Record<string, any> = {}
    const maxKeys = 10
    let keyCount = 0

    for (const [key, value] of Object.entries(metadata)) {
      if (keyCount >= maxKeys) break

      // Skip sensitive keys
      if (this.isSensitiveKey(key)) continue

      // Validate value type
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = this.sanitizeString(String(value))
        keyCount++
      }
    }

    return sanitized
  }

  /**
   * Check if key is sensitive
   */
  private static isSensitiveKey(key: string): boolean {
    const sensitiveKeys = ['password', 'pin', 'cvv', 'secret', 'token', 'key', 'card']

    return sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
  }

  /**
   * Sanitize string value
   */
  private static sanitizeString(value: string): string {
    return value.substring(0, 255).trim()
  }

  /**
   * Format payment error response
   */
  static formatErrorResponse(error: unknown): Record<string, any> {
    if (error instanceof PaymentValidationError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      }
    }

    if (error instanceof PaymentProcessingError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        provider: error.provider,
        details: error.details,
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        code: 'UNKNOWN_ERROR',
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    }
  }
}
