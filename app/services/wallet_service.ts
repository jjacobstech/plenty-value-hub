import User from '#models/user'
import Wallet from '#models/wallet'
import Transaction from '#models/transaction'
import PayoutRequest from '#models/payout_request'
import { DateTime } from 'luxon'

export default class WalletService {
  /**
   * Get or create wallet for user
   */
  static async getOrCreateWallet(userId: number) {
    let wallet = await Wallet.query().where('user_id', userId).first()

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        lastUpdated: DateTime.now(),
      })
    }

    return wallet
  }

  /**
   * Record a transaction (commission, payout, etc.)
   */
  static async recordTransaction(
    userId: number,
    type: 'commission' | 'payout' | 'refund' | 'adjustment',
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ) {
    const wallet = await this.getOrCreateWallet(userId)

    const transaction = await Transaction.create({
      userId,
      walletId: wallet.id,
      type,
      amount,
      description,
      metadata: metadata || {},
      status: 'completed',
      createdAt: DateTime.now(),
    })

    // Update wallet balances
    if (type === 'commission') {
      wallet.pendingBalance += amount
      wallet.totalEarnings += amount
    } else if (type === 'payout') {
      wallet.balance -= amount
      wallet.totalWithdrawn += amount
      wallet.pendingBalance = Math.max(0, wallet.pendingBalance - amount)
    } else if (type === 'refund') {
      wallet.balance += amount
      wallet.totalEarnings -= amount
    }

    wallet.lastUpdated = DateTime.now()
    await wallet.save()

    return transaction
  }

  /**
   * Get wallet summary with transactions and pending payouts
   */
  static async getSummary(userId: number) {
    const wallet = await this.getOrCreateWallet(userId)

    const transactions = await Transaction.query()
      .where('wallet_id', wallet.id)
      .orderBy('created_at', 'desc')
      .limit(20)

    const payoutRequests = await PayoutRequest.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc')

    return {
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawn: wallet.totalWithdrawn,
        lastUpdated: wallet.lastUpdated,
      },
      transactions,
      payoutRequests,
    }
  }

  /**
   * Request a payout
   */
  static async requestPayout(
    userId: number,
    amount: number,
    payoutMethod: 'bank_transfer' | 'paypal' | 'crypto',
    payoutDetails: Record<string, any>
  ) {
    const wallet = await this.getOrCreateWallet(userId)

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance for payout')
    }

    const payoutRequest = await PayoutRequest.create({
      userId,
      walletId: wallet.id,
      amount,
      payoutMethod,
      payoutDetails,
      status: 'pending',
      adminNotes: '',
    })

    return payoutRequest
  }

  /**
   * Approve a payout request
   */
  static async approvePayout(payoutId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    if (payout.status !== 'pending') {
      throw new Error('Payout must be in pending status')
    }

    payout.status = 'approved'
    payout.processedAt = DateTime.now()
    await payout.save()

    return payout
  }

  /**
   * Reject a payout request
   */
  static async rejectPayout(payoutId: number, reason: string) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    if (payout.status !== 'pending') {
      throw new Error('Payout must be in pending status')
    }

    payout.status = 'rejected'
    payout.adminNotes = reason
    payout.processedAt = DateTime.now()
    await payout.save()

    // Return funds to wallet
    const wallet = await Wallet.findOrFail(payout.walletId)
    wallet.balance += payout.amount
    await wallet.save()

    return payout
  }

  /**
   * Process payout (initiate transfer)
   */
  static async processPayout(payoutId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    if (payout.status !== 'approved') {
      throw new Error('Payout must be approved first')
    }

    payout.status = 'processing'
    payout.transferInitiatedAt = DateTime.now()
    await payout.save()

    // TODO: Integrate with payment processor (Paystack, Stripe, etc.)
    // For Phase 2, we'll log this as pending
    console.log(`Processing payout ${payoutId} via ${payout.payoutMethod}`)

    return payout
  }

  /**
   * Complete a payout
   */
  static async completePayout(payoutId: number, transferRef: string) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    payout.status = 'completed'
    payout.transferReference = transferRef
    payout.transferStatus = 'success'
    payout.transferCompletedAt = DateTime.now()
    await payout.save()

    return payout
  }

  /**
   * Fail a payout
   */
  static async failPayout(payoutId: number, errorMessage: string) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    payout.status = 'failed'
    payout.transferStatus = 'failed'
    payout.transferErrorMessage = errorMessage
    await payout.save()

    // Return funds to wallet
    const wallet = await Wallet.findOrFail(payout.walletId)
    wallet.balance += payout.amount
    await wallet.save()

    return payout
  }

  /**
   * Get payout statistics
   */
  static async getPayoutStats(userId: number) {
    const payouts = await PayoutRequest.query().where('user_id', userId)

    const completed = payouts.filter((p) => p.status === 'completed')
    const pending = payouts.filter((p) => p.status === 'pending')
    const failed = payouts.filter((p) => p.status === 'failed')

    return {
      totalPayouts: payouts.length,
      totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
      completedPayouts: completed.length,
      completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),
      pendingPayouts: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      failedPayouts: failed.length,
      failedAmount: failed.reduce((sum, p) => sum + p.amount, 0),
      avgPayout: payouts.length > 0 ? payouts.reduce((sum, p) => sum + p.amount, 0) / payouts.length : 0,
    }
  }

  /**
   * List payout requests with filtering
   */
  static async listPayoutRequests(status?: 'all' | 'pending' | 'approved' | 'completed' | 'failed') {
    let query = PayoutRequest.query()

    if (status && status !== 'all') {
      query = query.where('status', status)
    }

    return query.orderBy('created_at', 'desc')
  }
}
