import Order from '#models/order'
import AffiliateLink from '#models/affiliate_link'
import WalletTransaction from '#models/wallet_transaction'
import Wallet from '#models/wallet'
import db from '@adonisjs/lucid/services/db'
import { Decimal } from 'decimal.js'
import logger from '@adonisjs/core/services/logger'

export class CommissionService {
  /**
   * Safely and idempotently records affiliate conversion and updates link metrics.
   */
  static async recordAffiliateConversion(order: Order, affiliateLink: AffiliateLink | null) {
    if (!order.affiliateId || !order.affiliateLinkId || !affiliateLink) {
      return
    }

    await db.transaction(async (trx) => {
      // Find wallet for affiliate
      const wallet = await Wallet.findBy('userId', order.affiliateId)
      if (!wallet) return

      // Idempotency check: see if any affiliate transaction already exists for this order
      const existingTx = await WalletTransaction.query({ client: trx })
        .where('walletId', wallet.id)
        .where('referenceType', 'order')
        .where('referenceId', order.id)
        .whereIn('category', ['affiliate_pending', 'affiliate_earning'])
        .first()

      if (existingTx) {
        logger.info(`[CommissionService] Skipping duplicate conversion recording for order #${order.orderNumber}`)
        return
      }

      // Lock affiliate link for update to ensure accurate counters
      const lockedLink = await AffiliateLink.query({ client: trx })
        .where('id', affiliateLink.id)
        .forUpdate()
        .first()

      if (lockedLink) {
        lockedLink.conversions = (lockedLink.conversions || 0) + 1
        lockedLink.revenue = new Decimal(lockedLink.revenue || 0)
          .plus(order.amount)
          .toDecimalPlaces(2)
          .toString()
        lockedLink.commissionEarned = new Decimal(lockedLink.commissionEarned || 0)
          .plus(order.commissionAmount || 0)
          .toDecimalPlaces(2)
          .toString()
        lockedLink.useTransaction(trx)
        await lockedLink.save()
        logger.info(`[CommissionService] Conversion recorded for linkCode ${lockedLink.linkCode}, order #${order.orderNumber}`)
      }
    })
  }

  /**
   * Release pending affiliate commissions that have passed the refund/return window (default 14 days)
   */
  static async releasePendingCommissions(refundWindowDays = 14) {
    const cutoffDate = new Date(Date.now() - refundWindowDays * 24 * 60 * 60 * 1000)

    const pendingTxns = await WalletTransaction.query()
      .where('category', 'affiliate_pending')
      .where('referenceType', 'order')
      .where('created_at', '<=', cutoffDate)

    const { WalletService } = await import('#services/wallet_service')
    let releasedCount = 0

    for (const tx of pendingTxns) {
      const order = await Order.find(tx.referenceId)
      if (order && order.status === 'completed') {
        await WalletService.handleOrderCompleted(order)
        releasedCount++
      }
    }

    logger.info(`[CommissionService] Released ${releasedCount} pending affiliate commissions older than ${refundWindowDays} days.`)
    return releasedCount
  }
}
