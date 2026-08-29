import axios, { AxiosInstance } from 'axios'
import { PaymentGatewayService } from '#services/payment_gateway_service'
import { paymentConfig } from '#config/payment'

export interface TransferRecipient {
  recipientCode: string
  accountNumber: string
  accountName: string
  bankCode: string
  bankName: string
  currency: string
}

export interface TransferRequest {
  amount: number // in kobo/cents
  recipientCode: string
  reference: string
  reason?: string
  currency?: string
}

export interface TransferResponse {
  success: boolean
  transferCode?: string
  reference: string
  amount: number
  status: 'pending' | 'success' | 'failed' | 'reversed'
  message?: string
  transferId?: string
}

export class PaystackTransferService {
  private client: AxiosInstance | null = null
  private config: Record<string, any>
  private secretKey: string | null = null

  constructor() {
    this.config = paymentConfig.providers.paystack
  }

  /**
   * Load secrets from database
   */
  private async loadSecrets(): Promise<boolean> {
    try {
      if (!this.secretKey) {
        this.secretKey = await PaymentGatewayService.getCredential('paystack', 'secretKey')
      }

      if (!this.secretKey) {
        throw new Error('Paystack secret key not configured')
      }

      // Initialize client
      if (!this.client) {
        this.client = axios.create({
          baseURL: this.config.apiBaseUrl,
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      }

      return true
    } catch (err) {
      console.error('[PaystackTransferService] Failed to load secrets:', err)
      return false
    }
  }

  /**
   * Create a transfer recipient for a user's bank account
   */
  async createTransferRecipient(
    accountNumber: string,
    bankCode: string,
    accountName: string,
    currency: string = 'NGN'
  ): Promise<{ success: boolean; recipientCode?: string; message?: string }> {
    try {
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack transfer service not properly configured')
      }

      const response = await this.client.post('/transferrecipient', {
        type: 'nuban', // Nigerian bank account
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency,
      })

      const data = response.data

      if (data.status && data.data) {
        return {
          success: true,
          recipientCode: data.data.recipient_code,
        }
      }

      return {
        success: false,
        message: data.message || 'Failed to create transfer recipient',
      }
    } catch (error: any) {
      console.error('[PaystackTransferService] Create recipient error:', error.response?.data || error.message)
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to create transfer recipient',
      }
    }
  }

  /**
   * Verify a bank account before creating recipient
   */
  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<{ success: boolean; accountName?: string; message?: string }> {
    try {
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack transfer service not properly configured')
      }

      const response = await this.client.get(
        `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
      )

      const data = response.data

      if (data.status && data.data) {
        return {
          success: true,
          accountName: data.data.account_name,
        }
      }

      return {
        success: false,
        message: data.message || 'Failed to verify bank account',
      }
    } catch (error: any) {
      console.error('[PaystackTransferService] Verify account error:', error.response?.data || error.message)
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to verify bank account',
      }
    }
  }

  /**
   * Get list of Nigerian banks for bank code lookup
   */
  async getBanks(): Promise<{ success: boolean; banks?: Array<{ name: string; code: string; slug: string }>; message?: string }> {
    try {
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack transfer service not properly configured')
      }

      const response = await this.client.get('/bank?country=nigeria')
      const data = response.data

      if (data.status && data.data) {
        return {
          success: true,
          banks: data.data.map((bank: any) => ({
            name: bank.name,
            code: bank.code,
            slug: bank.slug,
          })),
        }
      }

      return {
        success: false,
        message: data.message || 'Failed to fetch banks',
      }
    } catch (error: any) {
      console.error('[PaystackTransferService] Get banks error:', error.response?.data || error.message)
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to fetch banks',
      }
    }
  }

  /**
   * Initiate a transfer to a recipient
   */
  async initiateTransfer(transferRequest: TransferRequest): Promise<TransferResponse> {
    try {
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack transfer service not properly configured')
      }

      const response = await this.client.post('/transfer', {
        source: 'balance', // Transfer from main balance
        amount: transferRequest.amount,
        recipient: transferRequest.recipientCode,
        reference: transferRequest.reference,
        reason: transferRequest.reason || 'Payout',
        currency: transferRequest.currency || 'NGN',
      })

      const data = response.data

      if (data.status && data.data) {
        return {
          success: true,
          transferCode: data.data.transfer_code,
          reference: data.data.reference,
          amount: data.data.amount,
          status: this.mapTransferStatus(data.data.status),
          transferId: data.data.id?.toString(),
        }
      }

      return {
        success: false,
        reference: transferRequest.reference,
        amount: transferRequest.amount,
        status: 'failed',
        message: data.message || 'Transfer initiation failed',
      }
    } catch (error: any) {
      console.error('[PaystackTransferService] Transfer error:', error.response?.data || error.message)
      return {
        success: false,
        reference: transferRequest.reference,
        amount: transferRequest.amount,
        status: 'failed',
        message: error?.response?.data?.message || error.message || 'Transfer failed',
      }
    }
  }

  /**
   * Verify transfer status
   */
  async verifyTransfer(transferCode: string): Promise<TransferResponse> {
    try {
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack transfer service not properly configured')
      }

      const response = await this.client.get(`/transfer/verify/${transferCode}`)
      const data = response.data

      if (data.status && data.data) {
        return {
          success: true,
          transferCode: data.data.transfer_code,
          reference: data.data.reference,
          amount: data.data.amount,
          status: this.mapTransferStatus(data.data.status),
          transferId: data.data.id?.toString(),
        }
      }

      return {
        success: false,
        reference: '',
        amount: 0,
        status: 'failed',
        message: data.message || 'Transfer verification failed',
      }
    } catch (error: any) {
      console.error('[PaystackTransferService] Verify transfer error:', error.response?.data || error.message)
      return {
        success: false,
        reference: '',
        amount: 0,
        status: 'failed',
        message: error?.response?.data?.message || error.message || 'Transfer verification failed',
      }
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ success: boolean; balance?: number; currency?: string; message?: string }> {
    try {
      if (!(await this.loadSecrets()) || !this.client) {
        throw new Error('Paystack transfer service not properly configured')
      }

      const response = await this.client.get('/balance')
      const data = response.data

      if (data.status && data.data && data.data.length > 0) {
        // Return NGN balance (first currency is usually NGN)
        const ngnBalance = data.data.find((b: any) => b.currency === 'NGN') || data.data[0]
        return {
          success: true,
          balance: ngnBalance.balance,
          currency: ngnBalance.currency,
        }
      }

      return {
        success: false,
        message: data.message || 'Failed to fetch balance',
      }
    } catch (error: any) {
      console.error('[PaystackTransferService] Get balance error:', error.response?.data || error.message)
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to fetch balance',
      }
    }
  }

  private mapTransferStatus(paystackStatus: string): 'pending' | 'success' | 'failed' | 'reversed' {
    const statusMap: Record<string, 'pending' | 'success' | 'failed' | 'reversed'> = {
      pending: 'pending',
      success: 'success',
      failed: 'failed',
      reversed: 'reversed',
      otp: 'pending', // OTP required
      'in-progress': 'pending',
    }

    return statusMap[paystackStatus] || 'pending'
  }
}