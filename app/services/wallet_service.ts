import Wallet from '#models/wallet'
import WalletTransaction from '#models/wallet_transaction'
import PayoutRequest from '#models/payout_request'
import Order from '#models/order'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { Decimal } from 'decimal.js'
import { DateTime } from 'luxon'
import { PaystackTransferService } from '#services/paystack_transfer_service'
import { TransactionService } from '#services/transaction_service'
import { nanoid } from 'nanoid'

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

    // Record global transactions
    try {
      if (order.buyerId) {
        await TransactionService.record({
          userId: order.buyerId,
          type: 'purchase',
          category: 'product_purchase',
          status: 'completed',
          amount: order.amount,
          currency: order.currency || 'USD',
          paymentMethod: order.paymentMethod,
          paymentGatewayReference: order.orderNumber,
          orderId: order.id,
          productId: order.productId,
          description: `Purchase of ${order.productName}`,
          transactionReference: `PUR_${order.orderNumber}_${order.id}`,
        })
      }

      if (order.vendorId) {
        await TransactionService.record({
          userId: order.vendorId,
          type: 'sale',
          category: 'vendor_sale',
          status: 'completed',
          amount: order.vendorPayout || order.amount,
          currency: order.currency || 'USD',
          paymentMethod: order.paymentMethod,
          orderId: order.id,
          productId: order.productId,
          description: `Sale of ${order.productName}`,
          transactionReference: `SALE_${order.orderNumber}_${order.id}`,
        })
      }

      if (order.affiliateId && order.commissionAmount) {
        await TransactionService.record({
          userId: order.affiliateId,
          type: 'commission',
          category: 'affiliate_commission',
          status: 'completed',
          amount: order.commissionAmount,
          currency: order.currency || 'USD',
          paymentMethod: order.paymentMethod,
          orderId: order.id,
          productId: order.productId,
          description: `Affiliate commission for ${order.productName}`,
          transactionReference: `COMM_${order.orderNumber}_${order.id}`,
        })
      }
    } catch (txErr) {
      console.error('[WalletService] Error recording transaction:', txErr)
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

    // Check if payout method is configured
    if (!user.payoutMethod) {
      throw new Error('Configure your payout method in profile settings first')
    }

    // Validate payout method has required fields
    switch (user.payoutMethod) {
      case 'bank':
      case 'bank_transfer':
        if (!user.payoutBankName || !user.payoutAccountNumber || !user.payoutAccountName) {
          throw new Error('Configure your payout method in profile settings first')
        }
        break
      case 'mobile_money':
        if (!user.payoutMobileProvider || !user.payoutMobileNumber || !user.payoutAccountName) {
          throw new Error('Configure your payout method in profile settings first')
        }
        break
      case 'paypal':
        if (!user.payoutEmail) {
          throw new Error('Configure your payout method in profile settings first')
        }
        break
      case 'stripe':
        if (!user.payoutAccountId || !user.payoutEmail) {
          throw new Error('Configure your payout method in profile settings first')
        }
        break
      case 'paystack':
      case 'flutterwave':
        if (!user.payoutBankName || !user.payoutAccountNumber || !user.payoutAccountName) {
          throw new Error('Configure your payout method in profile settings first')
        }
        break
      default:
        throw new Error('Invalid payout method')
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

    const payout = await db.transaction(async (trx) => {
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
          // Serialize payout details from individual fields
          payoutDetails: JSON.stringify({
            method: user.payoutMethod,
            bankName: user.payoutBankName,
            accountNumber: user.payoutAccountNumber,
            accountName: user.payoutAccountName,
            mobileProvider: user.payoutMobileProvider,
            mobileNumber: user.payoutMobileNumber,
            email: user.payoutEmail,
            accountId: user.payoutAccountId,
          }),
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

    // Process automated Paystack transfer if bank/paystack details are present
    const isBankPayout =
      user.payoutMethod === 'bank' ||
      user.payoutMethod === 'bank_transfer' ||
      user.payoutMethod === 'paystack' ||
      (user.payoutAccountNumber && user.payoutBankName)

    if (isBankPayout) {
      try {
        await this.processPaystackTransfer(payout, user)
      } catch (err: any) {
        console.error('[WalletService] Automated Paystack transfer failed:', err?.message || err)
        // If transfer fails, processPaystackTransfer rejects the payout and refunds balance
        throw err
      }
    }

    try {
      await TransactionService.record({
        userId: payout.userId,
        type: 'payout',
        category: 'vendor_payout',
        status:
          payout.status === 'paid'
            ? 'completed'
            : payout.status === 'rejected'
              ? 'failed'
              : 'pending',
        amount: payout.amount,
        currency: 'USD',
        paymentMethod: payout.payoutMethod,
        payoutRequestId: payout.id,
        transactionReference: payout.transferReference || `PO_${payout.id}`,
        description: `Payout request #${payout.id} via ${payout.payoutMethod}`,
      })
    } catch (txErr) {
      console.error('[WalletService] Error recording payout transaction:', txErr)
    }

    return payout
  }


  /**
   * Process automated transfer via Paystack for vendor/affiliate payout requests
   */
  static async processPaystackTransfer(payout: PayoutRequest, user: User) {
    const paystackTransferService = new PaystackTransferService()

    // Common bank abbreviations mapping for Nigerian banks
    const bankAbbreviations: Record<string, string[]> = {
      'guaranty trust bank': ['gtb', 'guaranty trust', 'guaranty'],
      'access bank': ['access', 'access bank plc', 'diamond bank'],
      'first bank': ['first bank nigeria', 'fbn', 'firstbank'],
      'zenith bank': ['zenith', 'zenith bank plc'],
      'uba': ['united bank for africa', 'uba plc'],
      'fidelity bank': ['fidelity', 'fidelity bank plc'],
      'union bank': ['union bank of nigeria', 'union bank plc'],
      'sterling bank': ['sterling', 'sterling bank plc'],
      'fcmb': ['first city monument bank', 'fcmb plc'],
      'wema bank': ['wema', 'wema bank plc'],
      'ecobank': ['ecobank nigeria', 'ecobank plc'],
      'keystone bank': ['keystone', 'keystone bank limited'],
      'polaris bank': ['polaris', 'polaris bank limited', 'skye bank'],
      'stanbic ibtc': ['stanbic', 'stanbic ibtc bank'],
      'unity bank': ['unity', 'unity bank plc'],
      'providus bank': ['providus', 'providus bank limited'],
      'jaiz bank': ['jaiz', 'jaiz bank plc'],
      'suntrust bank': ['suntrust', 'suntrust bank nigeria limited'],
      'heritage bank': ['heritage', 'heritage banking company limited'],
      'taj bank': ['taj', 'taj bank limited'],
    }

    try {
      let recipientCode = user.paystackRecipientCode

      // Step 1: Create recipient if not already stored
      if (!recipientCode) {
        let bankCode = user.paystackBankCode

        if (!bankCode && user.payoutBankName) {
          const banksRes = await paystackTransferService.getBanks()
          if (banksRes.success && banksRes.banks) {
            const searchName = user.payoutBankName.trim().toLowerCase()
            
            // First, try exact matching
            let matchedBank = banksRes.banks.find((b) => {
              const bName = b.name.toLowerCase()
              const bSlug = b.slug.toLowerCase()
              return (
                bName === searchName ||
                bSlug === searchName ||
                b.code === searchName
              )
            })

            // If no exact match, try abbreviation mapping
            if (!matchedBank) {
              for (const [fullName, abbreviations] of Object.entries(bankAbbreviations)) {
                if (abbreviations.includes(searchName)) {
                  matchedBank = banksRes.banks.find((b) => 
                    b.name.toLowerCase().includes(fullName) || 
                    b.slug.toLowerCase().includes(fullName.replace(/\s+/g, '-'))
                  )
                  if (matchedBank) break
                }
              }
            }

            // Fallback to partial matching
            if (!matchedBank) {
              matchedBank = banksRes.banks.find((b) => {
                const bName = b.name.toLowerCase()
                const bSlug = b.slug.toLowerCase()
                return (
                  bName.includes(searchName) ||
                  searchName.includes(bName) ||
                  bSlug.includes(searchName)
                )
              })
            }

            if (matchedBank) {
              bankCode = matchedBank.code
              user.paystackBankCode = bankCode
              user.paystackBankName = matchedBank.name
              await user.save()
              console.log(`[PaystackTransfer] Resolved bank "${user.payoutBankName}" to "${matchedBank.name}" (${bankCode})`)
            }
          }
        }

        if (!bankCode) {
          if (/^\d+$/.test(user.payoutBankName || '')) {
            bankCode = user.payoutBankName!
          } else {
            const errMsg = `Could not resolve bank code for "${user.payoutBankName}". Please update bank details in profile.`
            payout.transferStatus = 'failed'
            payout.transferErrorMessage = errMsg
            await payout.save()
            await this.updatePayoutStatus(payout.id, 'rejected', errMsg)
            throw new Error(errMsg)
          }
        }

        const recipientRes = await paystackTransferService.createTransferRecipient(
          user.payoutAccountNumber!,
          bankCode,
          user.payoutAccountName!
        )

        if (!recipientRes.success || !recipientRes.recipientCode) {
          const errMsg = recipientRes.message || 'Failed to create Paystack transfer recipient'
          payout.transferStatus = 'failed'
          payout.transferErrorMessage = errMsg
          await payout.save()
          await this.updatePayoutStatus(payout.id, 'rejected', errMsg)
          throw new Error(errMsg)
        }

        recipientCode = recipientRes.recipientCode
        user.paystackRecipientCode = recipientCode
        user.paystackRecipientVerified = true
        await user.save()
      }

      // Step 2: Initiate Transfer
      const reference = `TRF_${payout.id}_${Date.now()}_${nanoid(8)}`
      const amountInKobo = Math.round(Number(payout.amount) * 100)

      const transferRes = await paystackTransferService.initiateTransfer({
        amount: amountInKobo,
        recipientCode,
        reference,
        reason: `Payout #${payout.id} - ${user.businessName || user.fullName || user.email}`,
        currency: 'NGN',
      })

      // Update payout with transfer details
      payout.transferCode = transferRes.transferCode || null
      payout.transferReference = reference
      payout.transferStatus = transferRes.status
      payout.transferInitiatedAt = DateTime.now()

      if (transferRes.success) {
        if (transferRes.status === 'success') {
          // Transfer completed immediately
          payout.status = 'paid'
          payout.processedAt = DateTime.now()
          payout.transferCompletedAt = DateTime.now()
        } else {
          // Transfer is pending, keep status as approved
          payout.status = 'approved'
        }
        await payout.save()

        user.lastTransferReference = reference
        user.lastTransferAt = DateTime.now()
        await user.save()

        console.log(`[PaystackTransfer] Transfer initiated successfully for payout ${payout.id}, status: ${transferRes.status}`)
      } else {
        // Transfer failed
        payout.transferStatus = 'failed'
        payout.transferErrorMessage = transferRes.message || 'Paystack transfer failed'
        await payout.save()

        await this.updatePayoutStatus(
          payout.id,
          'rejected',
          `Paystack transfer failed: ${transferRes.message || 'Unknown error'}`
        )
        throw new Error(`Paystack Transfer Failed: ${transferRes.message || 'Unknown error'}`)
      }

      return payout
    } catch (error: any) {
      // Ensure error is logged and payout is marked as failed
      console.error(`[PaystackTransfer] Error processing transfer for payout ${payout.id}:`, error.message)
      
      if (payout.transferStatus !== 'failed') {
        payout.transferStatus = 'failed'
        payout.transferErrorMessage = error.message
        await payout.save()
      }
      
      throw error
    }
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

    // Automatically process Paystack transfer when payout is approved
    if (status === 'approved' && payout.payoutMethod === 'bank_transfer') {
      const user = await User.findOrFail(payout.userId)
      try {
        await this.processPaystackTransfer(payout, user)
        console.log(`[WalletService] Automatic Paystack transfer initiated for payout ${payout.id}`)
      } catch (error: any) {
        console.error(`[WalletService] Automatic Paystack transfer failed for payout ${payout.id}:`, error.message)
        // The processPaystackTransfer method already handles failure by rejecting the payout
        // So we don't need to do anything else here
      }
    }

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

  /**
   * Retry a failed Paystack transfer
   */
  static async retryPaystackTransfer(payoutId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)
    const user = await User.findOrFail(payout.userId)

    if (payout.status !== 'approved' || payout.transferStatus !== 'failed') {
      throw new Error('Only failed transfers can be retried')
    }

    // Reset transfer status
    payout.transferStatus = null
    payout.transferErrorMessage = null
    await payout.save()

    try {
      await this.processPaystackTransfer(payout, user)
      return { success: true, message: 'Transfer retry initiated successfully' }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  /**
   * Debug method to list all available Paystack banks
   * Useful for troubleshooting bank code resolution issues
   */
  static async listPaystackBanks() {
    const paystackTransferService = new PaystackTransferService()
    const banksRes = await paystackTransferService.getBanks()
    
    if (banksRes.success && banksRes.banks) {
      console.log(`[PaystackTransfer] Available banks (${banksRes.banks.length}):`)
      
      // Show all GTB-related banks
      const gtbBanks = banksRes.banks.filter(b => 
        b.name.toLowerCase().includes('guaranty') || 
        b.name.toLowerCase().includes('gtb') ||
        b.slug.toLowerCase().includes('gtb') ||
        b.slug.toLowerCase().includes('guaranty')
      )
      
      if (gtbBanks.length > 0) {
        console.log('\n[PaystackTransfer] GTB/Guaranty related banks:')
        gtbBanks.forEach(bank => {
          console.log(`- ${bank.name} (${bank.code}) - slug: ${bank.slug}`)
        })
      }
      
      return banksRes.banks
    } else {
      console.error('[PaystackTransfer] Failed to fetch banks:', banksRes.message)
      return []
    }
  }
}
