import PayoutRequest from '#models/payout_request'
import { DateTime } from 'luxon'

export default class PayoutService {
  static async getWalletStats(userId: number) {
    const payouts = await PayoutRequest.query().where('user_id', userId)

    const pending = payouts.filter((p) => p.status === 'pending')
    const approved = payouts.filter((p) => p.status === 'approved')
    const paid = payouts.filter((p) => p.status === 'paid')
    const rejected = payouts.filter((p) => p.status === 'rejected')

    return {
      totalPayouts: payouts.length,
      pending: pending.length,
      approved: approved.length,
      paid: paid.length,
      rejected: rejected.length,
      totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: paid.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
    }
  }

  static async requestPayout(userId: number, amount: number, paymentMethodId: number) {
    const payout = await PayoutRequest.create({
      userId,
      amount,
      payoutMethod: `method_${paymentMethodId}`,
      payoutDetails: JSON.stringify({ methodId: paymentMethodId }),
      status: 'pending',
    })
    return payout
  }

  static async getPayoutHistory(userId?: number | null, status?: string, page = 1, limit = 10) {
    let query = PayoutRequest.query()
    if (userId) query = query.where('user_id', userId)
    if (status && status !== 'all') query = query.where('status', status)
    return query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  static async approvePayout(payoutId: number, _adminId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)
    payout.status = 'approved'
    payout.processedAt = DateTime.now()
    await payout.save()
    return payout
  }

  static async rejectPayout(payoutId: number, reason: string) {
    const payout = await PayoutRequest.findOrFail(payoutId)
    payout.status = 'rejected'
    payout.adminNotes = reason
    payout.processedAt = DateTime.now()
    await payout.save()
    return payout
  }

  static async markAsProcessing(payoutId: number) {
    const payout = await PayoutRequest.findOrFail(payoutId)
    payout.status = 'processing'
    payout.transferInitiatedAt = DateTime.now()
    await payout.save()
    return payout
  }

  static async completePayout(payoutId: number, referenceNumber: string) {
    const payout = await PayoutRequest.findOrFail(payoutId)
    payout.status = 'paid'
    payout.transferReference = referenceNumber
    payout.transferCompletedAt = DateTime.now()
    payout.transferStatus = 'success'
    await payout.save()
    return payout
  }

  static async failPayout(payoutId: number, reason: string) {
    const payout = await PayoutRequest.findOrFail(payoutId)
    payout.status = 'rejected'
    payout.transferStatus = 'failed'
    payout.transferErrorMessage = reason
    await payout.save()
    return payout
  }

  static async addPayoutMethod(userId: number, methodType: string, accountHolderName: string, details: Record<string, any>) {
    return { userId, methodType, accountHolderName, details }
  }

  static async getPayoutMethods(_userId: number) {
    return []
  }

  static generateRequestId(): string {
    return `payout_${Date.now()}`
  }

  static generateMethodId(): string {
    return `method_${Date.now()}`
  }
}

export { PayoutService }
