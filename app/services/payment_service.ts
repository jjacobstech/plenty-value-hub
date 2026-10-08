import axios from 'axios'
import PayoutRequest from '#models/payout_request'
import WalletService from './wallet_service.js'
import { DateTime } from 'luxon'

export default class PaymentService {
  private static PAYSTACK_API_KEY = process.env.PAYSTACK_API_KEY || ''
  private static PAYSTACK_BASE_URL = 'https://api.paystack.co'

  /**
   * Verify bank account
   */
  static async verifyBankAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await axios.get(
        `${this.PAYSTACK_BASE_URL}/bank/resolve`,
        {
          params: {
            account_number: accountNumber,
            bank_code: bankCode,
          },
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_API_KEY}`,
          },
        }
      )

      return response.data.data
    } catch (error) {
      throw new Error('Failed to verify bank account')
    }
  }

  /**
   * Get Paystack banks list
   */
  static async getBanksList() {
    try {
      const response = await axios.get(`${this.PAYSTACK_BASE_URL}/bank`, {
        headers: {
          Authorization: `Bearer ${this.PAYSTACK_API_KEY}`,
        },
      })

      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch banks list')
    }
  }

  /**
   * Process bank transfer via Paystack
   */
  static async processBankTransfer(payoutId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    if (payout.status !== 'approved') {
      throw new Error('Payout must be approved first')
    }

    try {
      const bankDetails = JSON.parse(payout.payoutDetails)

      // Create transfer recipient
      const recipientResponse = await axios.post(
        `${this.PAYSTACK_BASE_URL}/transferrecipient`,
        {
          type: 'nuban',
          name: bankDetails.accountName,
          account_number: bankDetails.accountNumber,
          bank_code: bankDetails.bankCode,
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_API_KEY}`,
          },
        }
      )

      const recipientCode = recipientResponse.data.data.recipient_code

      // Initiate transfer
      const transferResponse = await axios.post(
        `${this.PAYSTACK_BASE_URL}/transfer`,
        {
          source: 'balance',
          recipient: recipientCode,
          amount: payout.amount * 100, // Paystack uses kobo (cents)
          reason: `Payout for affiliate #${payout.userId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_API_KEY}`,
          },
        }
      )

      const transferCode = transferResponse.data.data.transfer_code
      const transferRef = transferResponse.data.data.reference

      // Update payout
      payout.status = 'processing'
      payout.transferCode = transferCode
      payout.transferReference = transferRef
      payout.transferInitiatedAt = DateTime.now()
      await payout.save()

      return {
        transferCode,
        transferRef,
        status: 'processing',
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process transfer'
      throw new Error(errorMsg)
    }
  }

  /**
   * Check transfer status
   */
  static async checkTransferStatus(transferCode: string) {
    try {
      const response = await axios.get(
        `${this.PAYSTACK_BASE_URL}/transfer/${transferCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_API_KEY}`,
          },
        }
      )

      const transfer = response.data.data

      return {
        status: transfer.status,
        amount: transfer.amount / 100,
        fee: transfer.fees / 100,
        reference: transfer.reference,
      }
    } catch (error) {
      throw new Error('Failed to check transfer status')
    }
  }

  /**
   * Handle Paystack webhook
   */
  static async handlePaystackWebhook(event: string, data: any) {
    if (event === 'transfer.success') {
      const transferRef = data.reference

      // Find payout with this reference
      const payout = await PayoutRequest.query()
        .where('transfer_reference', transferRef)
        .first()

      if (payout) {
        await WalletService.completePayout(payout.id, transferRef)
      }
    } else if (event === 'transfer.failed') {
      const transferRef = data.reference

      const payout = await PayoutRequest.query()
        .where('transfer_reference', transferRef)
        .first()

      if (payout) {
        await WalletService.failPayout(payout.id, data.reason || 'Transfer failed')
      }
    }
  }

  /**
   * Process PayPal payout
   */
  static async processPayPalPayout(payoutId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    if (payout.status !== 'approved') {
      throw new Error('Payout must be approved first')
    }

    try {
      const paypalDetails = JSON.parse(payout.payoutDetails)

      // TODO: Integrate with PayPal SDK
      // For now, simulate processing
      payout.status = 'processing'
      payout.transferInitiatedAt = DateTime.now()
      await payout.save()

      // Simulate completion after 1 minute
      setTimeout(async () => {
        await WalletService.completePayout(payoutId, `PAYPAL-${Date.now()}`)
      }, 60000)

      return { status: 'processing' }
    } catch (error) {
      throw new Error('Failed to process PayPal payout')
    }
  }

  /**
   * Process crypto payout (placeholder)
   */
  static async processCryptoPayout(payoutId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)

    if (payout.status !== 'approved') {
      throw new Error('Payout must be approved first')
    }

    try {
      const cryptoDetails = JSON.parse(payout.payoutDetails)

      // TODO: Integrate with blockchain/crypto payment provider
      payout.status = 'processing'
      payout.transferInitiatedAt = DateTime.now()
      await payout.save()

      return { status: 'processing' }
    } catch (error) {
      throw new Error('Failed to process crypto payout')
    }
  }

  /**
   * Get payout processing statistics
   */
  static async getPayoutStats() {
    const payouts = await PayoutRequest.query()

    const byStatus = {
      pending: payouts.filter((p) => p.status === 'pending').length,
      approved: payouts.filter((p) => p.status === 'approved').length,
      processing: payouts.filter((p) => p.status === 'processing').length,
      completed: payouts.filter((p) => p.status === 'completed').length,
      failed: payouts.filter((p) => p.status === 'failed').length,
    }

    const byMethod = {
      bank_transfer: payouts.filter((p) => p.payoutMethod === 'bank_transfer').length,
      paypal: payouts.filter((p) => p.payoutMethod === 'paypal').length,
      crypto: payouts.filter((p) => p.payoutMethod === 'crypto').length,
    }

    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0)
    const completedAmount = payouts
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    const avgProcessingTime = await this.calculateAvgProcessingTime()

    return {
      totalPayouts: payouts.length,
      byStatus,
      byMethod,
      totalAmount,
      completedAmount,
      avgProcessingTime,
    }
  }

  /**
   * Calculate average payout processing time
   */
  private static async calculateAvgProcessingTime(): Promise<number> {
    const completed = await PayoutRequest.query()
      .where('status', 'completed')
      .where('transfer_completed_at', '!=', null)

    if (completed.length === 0) return 0

    const times = completed.map((p) => {
      const initiated = DateTime.fromJSDate(p.transferInitiatedAt as any)
      const completed = DateTime.fromJSDate(p.transferCompletedAt as any)
      return completed.diff(initiated, 'hours').hours
    })

    return times.reduce((a, b) => a + b, 0) / times.length
  }

  static async getPublicConfig() {
    return {
      providers: [
        { name: 'bank_transfer', enabled: true },
        { name: 'paypal', enabled: true },
        { name: 'crypto', enabled: true },
      ],
      activeProvider: 'bank_transfer',
      currency: 'USD',
    }
  }

  static async getConfig() {
    return this.getPublicConfig()
  }

  static async saveConfig(config: Record<string, any>) {
    return config
  }

  static async resolveCheckoutMethod(method: string) {
    return { method, resolved: true }
  }

  static async recordAffiliateConversion(conversionData: Record<string, any>) {
    return conversionData
  }
}

export { PaymentService }
