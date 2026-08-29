import Transaction from '#models/transaction'
import type { TransactionType, TransactionStatus } from '#models/transaction'
import crypto from 'node:crypto'

/**
 * Input data for recording a transaction.
 *
 * At minimum, `type`, `category`, and `amount` are required.
 * A `transactionReference` should be provided whenever the caller has a
 * stable, business-meaningful ID (e.g. `SALE_<orderNumber>_<orderId>`).
 * If omitted, one is derived from `paymentGatewayReference` or auto-generated.
 */
export interface RecordTransactionData {
  /** ID of the user this transaction belongs to. Nullable for anonymous/system transactions. */
  userId?: number | null

  /** High-level type of the transaction (e.g. 'purchase', 'sale', 'payout', 'commission'). */
  type: TransactionType

  /** Sub-classification within the type (e.g. 'vendor_sale', 'product_purchase'). */
  category: string

  /**
   * Settlement status of the transaction.
   * Defaults to `'completed'` if not provided.
   */
  status?: TransactionStatus

  /** Transaction amount. Stored as a string internally; pass a number or numeric string. */
  amount: number | string

  /** ISO 4217 currency code. Defaults to `'USD'`. */
  currency?: string

  /** Payment method used (e.g. 'card', 'bank_transfer', 'paystack'). */
  paymentMethod?: string | null

  /** Reference returned by the payment gateway (e.g. Paystack charge reference). */
  paymentGatewayReference?: string | null

  /** ID of the associated order, if applicable. */
  orderId?: number | null

  /** ID of the associated payout request, if applicable. */
  payoutRequestId?: number | null

  /** ID of the product involved in the transaction, if applicable. */
  productId?: number | null

  /** Human-readable description shown in transaction history. */
  description?: string | null

  /**
   * Unique, stable reference for this transaction.
   *
   * Used as the idempotency key — calling `record()` twice with the same
   * reference returns the existing row instead of inserting a duplicate.
   *
   * Recommended format by type:
   * - Purchase:   `PUR_<orderNumber>_<orderId>`
   * - Sale:       `SALE_<orderNumber>_<orderId>`
   * - Commission: `COMM_<orderNumber>_<orderId>`
   * - Payout:     `PO_<payoutRequestId>` or the Paystack transfer reference
   *
   * Falls back to `paymentGatewayReference`, then an auto-generated value.
   */
  transactionReference?: string | null

  /** Arbitrary structured data to attach to the transaction (stored as JSON). */
  metadata?: Record<string, any> | null
}

/**
 * Service responsible for persisting and querying financial transactions.
 *
 * Transactions are the global audit ledger for all money movement in the
 * platform (purchases, sales, commissions, payouts). They are distinct from
 * `WalletTransaction`, which tracks per-user wallet balance changes.
 */
export class TransactionService {
  /**
   * Record a financial transaction in the global transactions table.
   *
   * **Idempotent:** uses `transactionReference` as a dedup key via
   * `firstOrCreate`. If a row with that reference already exists (e.g. because
   * `handleOrderCompleted` fired more than once for the same order), the
   * existing record is returned and no duplicate is inserted.
   *
   * Reference resolution order:
   * 1. `data.transactionReference` (preferred — caller-supplied stable key)
   * 2. `data.paymentGatewayReference`
   * 3. Auto-generated `TXN_<timestamp>_<random>` (non-idempotent fallback)
   *
   * @param data - Transaction fields to persist.
   * @returns The newly created or pre-existing `Transaction` record.
   */
  static async record(data: RecordTransactionData): Promise<Transaction> {
    const reference =
      data.transactionReference ||
      data.paymentGatewayReference ||
      `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

    const metadataStr = data.metadata ? JSON.stringify(data.metadata) : null

    const payload = {
      userId: data.userId || null,
      type: data.type,
      category: data.category,
      status: data.status || 'completed',
      amount: String(data.amount),
      currency: data.currency || 'USD',
      paymentMethod: data.paymentMethod || null,
      paymentGatewayReference: data.paymentGatewayReference || null,
      orderId: data.orderId || null,
      payoutRequestId: data.payoutRequestId || null,
      productId: data.productId || null,
      description: data.description || null,
      transactionReference: reference,
      metadata: metadataStr,
    }

    return Transaction.firstOrCreate({ transactionReference: reference }, payload)
  }

  /**
   * Query transactions with optional filtering and cursor-based pagination.
   *
   * Results are always ordered newest-first. Related models (`user`, `order`,
   * `product`, `payoutRequest`) are eager-loaded to avoid N+1 queries.
   *
   * @param options.userId   - Filter to a specific user's transactions.
   * @param options.type     - Filter by transaction type.
   * @param options.status   - Filter by settlement status.
   * @param options.limit    - Rows per page (default: 50).
   * @param options.page     - 1-based page number (default: 1).
   * @returns A Lucid `ModelPaginatorContract` with rows and pagination metadata.
   */
  static async getTransactions(options: {
    userId?: number
    type?: TransactionType
    status?: TransactionStatus
    limit?: number
    page?: number
  }) {
    const query = Transaction.query()
      .preload('user')
      .preload('order')
      .preload('product')
      .preload('payoutRequest')
      .orderBy('createdAt', 'desc')

    if (options.userId) {
      query.where('userId', options.userId)
    }

    if (options.type) {
      query.where('type', options.type)
    }

    if (options.status) {
      query.where('status', options.status)
    }

    const limit = options.limit || 50
    const page = options.page || 1

    return query.paginate(page, limit)
  }
}
