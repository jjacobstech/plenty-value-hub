/**
 * Payment Provider Interfaces
 * Defines contracts for all payment provider implementations
 */

export interface PaymentRequest {
  id: string
  amount: number // in cents
  currency: string
  email: string
  orderId: string
  description: string
  metadata?: Record<string, any>
  returnUrl?: string
  webhookUrl?: string
}

export interface PaymentResponse {
  success: boolean
  provider: string
  transactionId: string
  status: PaymentStatus
  amount: number
  currency: string
  message?: string
  paymentUrl?: string
  reference?: string
  timestamp: Date
}

export interface WebhookPayload {
  provider: string
  eventType: string
  data: Record<string, any>
  signature: string
  timestamp: Date
}

export interface WebhookResponse {
  success: boolean
  message: string
  received: boolean
}

export interface PaymentStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  code: string
  message: string
}

export interface PaymentProvider {
  /**
   * Initiate a payment
   */
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>

  /**
   * Verify a payment transaction
   */
  verifyPayment(transactionId: string, reference?: string): Promise<PaymentResponse>

  /**
   * Process webhook signature verification
   */
  verifyWebhookSignature(payload: string, signature: string): boolean

  /**
   * Handle webhook event
   */
  handleWebhookEvent(payload: WebhookPayload): Promise<WebhookResponse>

  /**
   * Refund a payment
   */
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>

  /**
   * Get provider configuration
   */
  getConfig(): Record<string, any>

  /**
   * Check if provider is available
   */
  isAvailable(): boolean
}

export interface PaymentProviderFactory {
  create(provider: string): PaymentProvider | null
  getAvailableProviders(): string[]
}

export interface RefundRequest {
  transactionId: string
  amount?: number // if partial refund
  reason?: string
  metadata?: Record<string, any>
}

export interface RefundResponse {
  success: boolean
  provider: string
  refundId: string
  transactionId: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  message?: string
  timestamp: Date
}

export interface TransactionRecord {
  id: string
  provider: string
  transactionId: string
  orderId: string
  amount: number
  currency: string
  status: string
  email: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
