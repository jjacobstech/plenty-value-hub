import Wallet from '#models/wallet'
import WalletTransaction from '#models/wallet_transaction'
import PayoutRequest from '#models/payout_request'
import Order from '#models/order'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { Decimal } from 'decimal.js'
import { DateTime } from 'luxon'

export const MIN_PAYOUT_AMOUNT = 10

type WalletRole = 'vendor' | 'affiliate'

export class WalletService {
  static async getOrCreateWallet(userId: number): Promise<Wallet> {
    let wallet = await Wallet.findBy('userId', userId)
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        availableBalance: '0.00',
        pendingBalance: '0.00',
        currency: 'USD',
      })
    }
    return wallet
  }

  static async getSummary(userId: number) {
    const wallet = await this.getOrCreateWallet(userId)
    const user = await User.findOrFail(userId)

    if (user.role === 'vendor' || user.role === 'affiliate') {
      await this.backfillFromOrders(wallet, user.role as WalletRole)
    }

    const [transactions, payoutRequests] = await Promise.all([
      WalletTransaction.query()
        .where('walletId', wallet.id)
        .orderBy('created_at', 'desc')
        .limit(50),
      PayoutRequest.query().where('userId', userId).orderBy('created_at', 'desc').limit(20),
    ])

    return {
      wallet: wallet.serialize(),
      transactions: transactions.map((t) => t.serialize()),
      payoutRequests: payoutRequests.map((p) => p.serialize()),
    }
  }

  /**
   * One-time backfill for wallets created before the ledger existed.
   */
  static async backfillFromOrders(wallet: Wallet, role: WalletRole) {
    const existingCount = await WalletTransaction.query()
      .where('walletId', wallet.id)
      .count('* as total')
    if (Number(existingCount[0].$extras.total) > 0) {
      return
    }

    let query = Order.query().where('status', 'completed')

    if (role === 'vendor') {
      query = query.where('vendorId', wallet.userId)
    } else {
      query = query.where('affiliateId', wallet.userId).whereNotNull('commissionAmount')
    }

    const orders = await query.orderBy('created_at', 'asc')

    for (const order of orders) {
      await this.handleOrderCompleted(order, { skipPendingClear: true })
    }
  }

  static async handleOrderCreated(order: Order) {
    if (order.status !== 'pending') {
      return
    }

    if (order.vendorId) {
      await this.creditPending(
        order.vendorId,
        order.vendorPayout || '0',
        'vendor_pending',
        'order',
        order.id,
        `Pending sale — ${order.productName}`
      )
    }

    if (order.affiliateId && order.commissionAmount) {
      const commission = new Decimal(order.commissionAmount || 0)
      if (commission.greaterThan(0)) {
        await this.creditPending(
          order.affiliateId,
          order.commissionAmount!,
          'affiliate_pending',
          'order',
          order.id,
          `Pending commission — ${order.productName}`
        )
      }
    }
  }

  static async handleOrderCompleted(order: Order, options: { skipPendingClear?: boolean } = {}) {
    if (order.vendorId) {
      if (!options.skipPendingClear && order.status === 'completed') {
        await this.clearPending(
          order.vendorId,
          order.vendorPayout || '0',
          'vendor_pending',
          'order',
          order.id
        )
      }

      await this.creditAvailable(
        order.vendorId,
        order.vendorPayout || '0',
        'vendor_earning',
        'order',
        order.id,
        `Sale completed — ${order.productName}`
      )
    }

    if (order.affiliateId && order.commissionAmount) {
      const commission = new Decimal(order.commissionAmount || 0)
      if (commission.greaterThan(0)) {
        if (!options.skipPendingClear && order.status === 'completed') {
          await this.clearPending(
            order.affiliateId,
            order.commissionAmount!,
            'affiliate_pending',
            'order',
            order.id
          )
        }

        await this.creditAvailable(
          order.affiliateId,
          order.commissionAmount!,
          'affiliate_earning',
          'order',
          order.id,
          `Commission earned — ${order.productName}`
        )
      }
    }
  }

  static async handleOrderCancelled(order: Order) {
    if (order.vendorId) {
      await this.clearPending(
        order.vendorId,
        order.vendorPayout || '0',
        'vendor_pending',
        'order',
        order.id
      )
    }

    if (order.affiliateId && order.commissionAmount) {
      await this.clearPending(
        order.affiliateId,
        order.commissionAmount!,
        'affiliate_pending',
        'order',
        order.id
      )
    }
  }

  static async handleOrderRefunded(order: Order) {
    if (order.vendorId) {
      await this.debitAvailable(
        order.vendorId,
        order.vendorPayout || '0',
        'vendor_refund',
        'order',
        order.id,
        `Refund reversal — ${order.productName}`
      )
    }

    if (order.affiliateId && order.commissionAmount) {
      const commission = new Decimal(order.commissionAmount || 0)
      if (commission.greaterThan(0)) {
        await this.debitAvailable(
          order.affiliateId,
          order.commissionAmount!,
          'affiliate_refund',
          'order',
          order.id,
          `Commission reversed — ${order.productName}`
        )
      }
    }
  }

  static async requestPayout(userId: number, amount: number) {
    const user = await User.findOrFail(userId)

    if (user.role !== 'vendor' && user.role !== 'affiliate') {
      throw new Error('Only vendors and affiliates can request payouts')
    }

    if (!user.payoutMethod || !user.payoutDetails) {
      throw new Error('Configure your payout method in profile settings first')
    }

    if (amount < MIN_PAYOUT_AMOUNT) {
      throw new Error(`Minimum withdrawal amount is $${MIN_PAYOUT_AMOUNT}`)
    }

    const wallet = await this.getOrCreateWallet(userId)
    const available = new Decimal(wallet.availableBalance || 0)

    if (available.lessThan(amount)) {
      throw new Error('Insufficient available balance')
    }

    const pendingRequest = await PayoutRequest.query()
      .where('userId', userId)
      .where('status', 'pending')
      .first()

    if (pendingRequest) {
      throw new Error('You already have a pending payout request')
    }

    return db.transaction(async (trx) => {
      const lockedWallet = await Wallet.query({ client: trx })
        .where('id', wallet.id)
        .forUpdate()
        .firstOrFail()

      const lockedAvailable = new Decimal(lockedWallet.availableBalance || 0)
      if (lockedAvailable.lessThan(amount)) {
        throw new Error('Insufficient available balance')
      }

      const amountStr = new Decimal(amount).toDecimalPlaces(2).toString()
      const newAvailable = lockedAvailable.minus(amount).toDecimalPlaces(2).toString()

      lockedWallet.availableBalance = newAvailable
      lockedWallet.useTransaction(trx)
      await lockedWallet.save()

      const payout = await PayoutRequest.create(
        {
          userId,
          walletId: wallet.id,
          amount: amountStr,
          payoutMethod: user.payoutMethod!,
          payoutDetails: user.payoutDetails!,
          status: 'pending',
        },
        { client: trx }
      )

      await WalletTransaction.create(
        {
          walletId: wallet.id,
          type: 'debit',
          category: 'payout_hold',
          amount: amountStr,
          referenceType: 'payout',
          referenceId: payout.id,
          description: `Withdrawal request — ${user.payoutMethod}`,
          balanceAfter: newAvailable,
        },
        { client: trx }
      )

      return payout
    })
  }

  static async updatePayoutStatus(
    payoutId: number,
    status: 'approved' | 'paid' | 'rejected',
    adminNotes?: string
  ) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    if (payout.status !== 'pending' && payout.status !== 'approved') {
      throw new Error('This payout request can no longer be updated')
    }

    if (status === 'rejected') {
      return db.transaction(async (trx) => {
        const wallet = await Wallet.query({ client: trx })
          .where('id', payout.walletId)
          .forUpdate()
          .firstOrFail()

        const newAvailable = new Decimal(wallet.availableBalance || 0)
          .plus(payout.amount)
          .toDecimalPlaces(2)
          .toString()

        wallet.availableBalance = newAvailable
        wallet.useTransaction(trx)
        await wallet.save()

        payout.status = 'rejected'
        payout.adminNotes = adminNotes || null
        payout.processedAt = DateTime.now()
        payout.useTransaction(trx)
        await payout.save()

        await WalletTransaction.create(
          {
            walletId: wallet.id,
            type: 'credit',
            category: 'payout_reversal',
            amount: payout.amount,
            referenceType: 'payout',
            referenceId: payout.id,
            description: 'Withdrawal request rejected — funds returned',
            balanceAfter: newAvailable,
          },
          { client: trx }
        )

        return payout
      })
    }

    payout.status = status
    payout.adminNotes = adminNotes || payout.adminNotes
    if (status === 'paid') {
      payout.processedAt = DateTime.now()
    }
    await payout.save()
    return payout
  }

  static async listPayoutRequests(status?: string) {
    const query = PayoutRequest.query().preload('user').orderBy('created_at', 'desc')

    if (status && status !== 'all') {
      query.where('status', status as PayoutRequest['status'])
    }

    return query.limit(200)
  }

  private static async creditPending(
    userId: number,
    amount: string,
    category: string,
    referenceType: string,
    referenceId: number,
    description: string
  ) {
    const value = new Decimal(amount || 0)
    if (value.lessThanOrEqualTo(0)) {
      return
    }

    await this.applyWalletChange(userId, category, referenceType, referenceId, (wallet) => {
      const pending = new Decimal(wallet.pendingBalance || 0).plus(value).toDecimalPlaces(2)
      wallet.pendingBalance = pending.toString()
      return {
        type: 'credit' as const,
        amount: value.toDecimalPlaces(2).toString(),
        balanceAfter: pending.toString(),
        description,
        affectsAvailable: false,
      }
    })
  }

  private static async clearPending(
    userId: number,
    amount: string,
    category: string,
    referenceType: string,
    referenceId: number
  ) {
    const value = new Decimal(amount || 0)
    if (value.lessThanOrEqualTo(0)) {
      return
    }

    const wallet = await this.getOrCreateWallet(userId)
    const exists = await WalletTransaction.query()
      .where('walletId', wallet.id)
      .where('category', category)
      .where('referenceType', referenceType)
      .where('referenceId', referenceId)
      .first()

    if (!exists) {
      return
    }

    await this.applyWalletChange(userId, `${category}_clear`, referenceType, referenceId, (w) => {
      const pending = Decimal.max(
        new Decimal(w.pendingBalance || 0).minus(value),
        0
      ).toDecimalPlaces(2)
      w.pendingBalance = pending.toString()
      return {
        type: 'debit' as const,
        amount: value.toDecimalPlaces(2).toString(),
        balanceAfter: pending.toString(),
        description: 'Pending earnings cleared',
        affectsAvailable: false,
      }
    })
  }

  private static async creditAvailable(
    userId: number,
    amount: string,
    category: string,
    referenceType: string,
    referenceId: number,
    description: string
  ) {
    const value = new Decimal(amount || 0)
    if (value.lessThanOrEqualTo(0)) {
      return
    }

    await this.applyWalletChange(userId, category, referenceType, referenceId, (wallet) => {
      const available = new Decimal(wallet.availableBalance || 0).plus(value).toDecimalPlaces(2)
      wallet.availableBalance = available.toString()
      return {
        type: 'credit' as const,
        amount: value.toDecimalPlaces(2).toString(),
        balanceAfter: available.toString(),
        description,
        affectsAvailable: true,
      }
    })
  }

  private static async debitAvailable(
    userId: number,
    amount: string,
    category: string,
    referenceType: string,
    referenceId: number,
    description: string
  ) {
    const value = new Decimal(amount || 0)
    if (value.lessThanOrEqualTo(0)) {
      return
    }

    await this.applyWalletChange(userId, category, referenceType, referenceId, (wallet) => {
      const available = Decimal.max(
        new Decimal(wallet.availableBalance || 0).minus(value),
        0
      ).toDecimalPlaces(2)
      wallet.availableBalance = available.toString()
      return {
        type: 'debit' as const,
        amount: value.toDecimalPlaces(2).toString(),
        balanceAfter: available.toString(),
        description,
        affectsAvailable: true,
      }
    })
  }

  private static async applyWalletChange(
    userId: number,
    category: string,
    referenceType: string,
    referenceId: number,
    mutate: (wallet: Wallet) => {
      type: 'credit' | 'debit'
      amount: string
      balanceAfter: string
      description: string
      affectsAvailable: boolean
    }
  ) {
    await db.transaction(async (trx) => {
      const wallet = await this.getOrCreateWallet(userId)
      const lockedWallet = await Wallet.query({ client: trx })
        .where('id', wallet.id)
        .forUpdate()
        .firstOrFail()

      const existing = await WalletTransaction.query({ client: trx })
        .where('walletId', lockedWallet.id)
        .where('category', category)
        .where('referenceType', referenceType)
        .where('referenceId', referenceId)
        .first()

      if (existing) {
        return
      }

      const change = mutate(lockedWallet)
      lockedWallet.useTransaction(trx)
      await lockedWallet.save()

      await WalletTransaction.create(
        {
          walletId: lockedWallet.id,
          type: change.type,
          category,
          amount: change.amount,
          referenceType,
          referenceId,
          description: change.description,
          balanceAfter: change.affectsAvailable
            ? lockedWallet.availableBalance
            : lockedWallet.pendingBalance,
        },
        { client: trx }
      )
    })
  }
}
