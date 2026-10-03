import { randomUUID } from 'crypto'
import AffiliateWallet from '#models/affiliate_wallet'
import PayoutRequest from '#models/payout_request'
import PayoutMethod from '#models/payout_method'
import PayoutHistory from '#models/payout_history'
import { DateTime } from 'luxon'

export default class PayoutService {
  /**
   * Generate unique request ID
   */
  static generateRequestId(): string {
    return `payout_${randomUUID().replace(/-/g, '').substring(0, 20)}`
  }

  /**
   * Generate unique method ID
   */
  static generateMethodId(): string {
    return `method_${randomUUID().replace(/-/g, '').substring(0, 20)}`
  }

  /**
   * Get or create affiliate wallet
   */
  static async getOrCreateWallet(affiliateId: number): Promise<AffiliateWallet> {
    const wallet = await AffiliateWallet.query()
      .where('affiliate_id', affiliateId)
      .first()

    if (wallet) {
      return wallet
    }

    return AffiliateWallet.create({
      affiliateId,
    })
  }

  /**
   * Update wallet balance
   */
  static async updateWalletBalance(
    affiliateId: number,
    availableAmount: number,
    pendingAmount?: number
  ): Promise<AffiliateWallet> {
    const wallet = await this.getOrCreateWallet(affiliateId)

    await wallet
      .merge({
        availableBalance: Math.max(0, wallet.availableBalance + availableAmount),
        pendingBalance: pendingAmount !== undefined 
          ? wallet.pendingBalance + pendingAmount 
          : wallet.pendingBalance,
      })
      .save()

    return wallet
  }

  /**
   * Request payout
   */
  static async requestPayout(
    affiliateId: number,
    amount: number,
    paymentMethodId: string,
    platformFeePercent: number = 2
  ): Promise<PayoutRequest> {
    const wallet = await this.getOrCreateWallet(affiliateId)

    if (amount < wallet.minimumPayoutThreshold) {
      throw new Error(`Minimum payout threshold is ${wallet.minimumPayoutThreshold}`)
    }

    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient balance for payout')
    }

    const platformFee = (amount * platformFeePercent) / 100
    const netAmount = amount - platformFee

    const payout = await PayoutRequest.create({
      requestId: this.generateRequestId(),
      affiliateId,
      amount,
      paymentMethodId,
      currency: wallet.currency,
      platformFee,
      netAmount,
      status: 'pending',
      paymentMethod: 'bank_transfer',
    })

    await wallet
      .merge({
        availableBalance: wallet.availableBalance - amount,
        pendingBalance: wallet.pendingBalance + amount,
      })
      .save()

    await this.createPayoutHistory(payout.id, affiliateId, 'created', 'pending', undefined)

    return payout
  }

  /**
   * Approve payout
   */
  static async approvePayout(
    payoutId: number,
    adminId: number
  ): Promise<PayoutRequest> {
    const payout = await PayoutRequest.find(payoutId)
    if (!payout) {
      throw new Error('Payout request not found')
    }

    if (payout.status !== 'pending') {
      throw new Error('Only pending payouts can be approved')
    }

    await payout
      .merge({
        status: 'approved',
        approvedAt: DateTime.now(),
        approvedByAdminId: adminId,
      })
      .save()

    await this.createPayoutHistory(payout.id, payout.affiliateId, 'approved', 'approved', undefined, adminId)

    return payout
  }

  /**
   * Reject payout
   */
  static async rejectPayout(
    payoutId: number,
    reason: string
  ): Promise<PayoutRequest> {
    const payout = await PayoutRequest.find(payoutId)
    if (!payout) {
      throw new Error('Payout request not found')
    }

    if (payout.status !== 'pending') {
      throw new Error('Only pending payouts can be rejected')
    }

    const wallet = await AffiliateWallet.query()
      .where('affiliate_id', payout.affiliateId)
      .first()

    if (wallet) {
      await wallet
        .merge({
          availableBalance: wallet.availableBalance + payout.amount,
          pendingBalance: wallet.pendingBalance - payout.amount,
        })
        .save()
    }

    await payout
      .merge({
        status: 'cancelled',
        rejectionReason: reason,
      })
      .save()

    await this.createPayoutHistory(payout.id, payout.affiliateId, 'cancelled', 'cancelled', undefined)

    return payout
  }

  /**
   * Mark payout as processing
   */
  static async markAsProcessing(payoutId: number): Promise<PayoutRequest> {
    const payout = await PayoutRequest.find(payoutId)
    if (!payout) {
      throw new Error('Payout request not found')
    }

    if (payout.status !== 'approved') {
      throw new Error('Only approved payouts can be marked as processing')
    }

    await payout
      .merge({
        status: 'processing',
        processedAt: DateTime.now(),
      })
      .save()

    await this.createPayoutHistory(payout.id, payout.affiliateId, 'processing', 'processing', undefined)

    return payout
  }

  /**
   * Mark payout as completed
   */
  static async completePayout(
    payoutId: number,
    referenceNumber?: string
  ): Promise<PayoutRequest> {
    const payout = await PayoutRequest.find(payoutId)
    if (!payout) {
      throw new Error('Payout request not found')
    }

    if (payout.status !== 'processing') {
      throw new Error('Only processing payouts can be completed')
    }

    const wallet = await AffiliateWallet.query()
      .where('affiliate_id', payout.affiliateId)
      .first()

    if (wallet) {
      await wallet
        .merge({
          pendingBalance: Math.max(0, wallet.pendingBalance - payout.amount),
          totalPaid: wallet.totalPaid + payout.netAmount,
          lastPayoutAt: DateTime.now(),
        })
        .save()
    }

    await payout
      .merge({
        status: 'completed',
        completedAt: DateTime.now(),
        referenceNumber: referenceNumber || null,
      })
      .save()

    await this.createPayoutHistory(payout.id, payout.affiliateId, 'completed', 'completed', undefined)

    return payout
  }

  /**
   * Mark payout as failed
   */
  static async failPayout(payoutId: number, reason: string): Promise<PayoutRequest> {
    const payout = await PayoutRequest.find(payoutId)
    if (!payout) {
      throw new Error('Payout request not found')
    }

    const wallet = await AffiliateWallet.query()
      .where('affiliate_id', payout.affiliateId)
      .first()

    if (wallet && payout.status === 'processing') {
      await wallet
        .merge({
          availableBalance: wallet.availableBalance + payout.amount,
          pendingBalance: Math.max(0, wallet.pendingBalance - payout.amount),
        })
        .save()
    }

    await payout
      .merge({
        status: 'failed',
        failedAt: DateTime.now(),
        rejectionReason: reason,
      })
      .save()

    await this.createPayoutHistory(payout.id, payout.affiliateId, 'failed', 'failed', undefined)

    return payout
  }

  /**
   * Add payout method
   */
  static async addPayoutMethod(
    affiliateId: number,
    methodType: string,
    accountHolderName: string,
    methodDetails: any
  ): Promise<PayoutMethod> {
    const method = await PayoutMethod.create({
      affiliateId,
      methodId: this.generateMethodId(),
      methodType: methodType as any,
      accountHolderName,
      accountNumber: methodDetails.accountNumber || null,
      bankCode: methodDetails.bankCode || null,
      bankName: methodDetails.bankName || null,
      countryCode: methodDetails.countryCode || null,
      email: methodDetails.email || null,
      phoneNumber: methodDetails.phoneNumber || null,
      walletAddress: methodDetails.walletAddress || null,
      isPrimary: false,
    })

    return method
  }

  /**
   * Get affiliate payout methods
   */
  static async getPayoutMethods(affiliateId: number) {
    return PayoutMethod.query()
      .where('affiliate_id', affiliateId)
      .orderBy('is_primary', 'desc')
      .orderBy('created_at', 'desc')
  }

  /**
   * Get payout history
   */
  static async getPayoutHistory(
    affiliateId?: number,
    status?: string,
    page = 1,
    limit = 20
  ) {
    let query = PayoutRequest.query()

    if (affiliateId) {
      query = query.where('affiliate_id', affiliateId)
    }

    if (status) {
      query = query.where('status', status)
    }

    return query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Get wallet stats
   */
  static async getWalletStats(affiliateId: number) {
    const wallet = await this.getOrCreateWallet(affiliateId)
    const payouts = await PayoutRequest.query().where('affiliate_id', affiliateId)

    const stats = {
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      totalEarned: wallet.totalEarned,
      totalPaid: wallet.totalPaid,
      minimumThreshold: wallet.minimumPayoutThreshold,
      currency: wallet.currency,
      totalPayouts: payouts.length,
      completedPayouts: payouts.filter((p) => p.status === 'completed').length,
      pendingPayouts: payouts.filter((p) => p.status === 'pending').length,
    }

    return stats
  }

  /**
   * Create payout history entry
   */
  private static async createPayoutHistory(
    payoutRequestId: number,
    affiliateId: number,
    event: string,
    status: string,
    notes?: string,
    createdByUserId?: number
  ) {
    await PayoutHistory.create({
      payoutRequestId,
      affiliateId,
      event: event as any,
      status,
      notes: notes || null,
      createdByUserId: createdByUserId || null,
    })
  }
}
