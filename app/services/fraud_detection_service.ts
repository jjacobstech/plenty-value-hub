import VendorConversion from '#models/vendor_conversion'
import Campaign from '#models/campaign'
import { DateTime } from 'luxon'

export interface FraudFlags {
  isDuplicate: boolean
  isDuplicateReason?: string
  isVelocityAnomaly: boolean
  velocityAnomalyReason?: string
  isAmountAnomaly: boolean
  amountAnomalyReason?: string
  isAffiliateAnomaly: boolean
  affiliateAnomalyReason?: string
  isDeviceSuspicious: boolean
  deviceSuspiciousReason?: string
  fraudScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
}

export default class FraudDetectionService {
  /**
   * Perform comprehensive fraud detection on a conversion
   */
  static async detectFraud(
    campaignId: number,
    affiliateId: number,
    affiliateLinkId: number,
    amount: number,
    customerEmail: string,
    customerPhone?: string,
    ipAddress?: string,
    _userAgent?: string,
    _deviceId?: string
  ): Promise<FraudFlags> {
    const flags: FraudFlags = {
      isDuplicate: false,
      isVelocityAnomaly: false,
      isAmountAnomaly: false,
      isAffiliateAnomaly: false,
      isDeviceSuspicious: false,
      fraudScore: 0,
      riskLevel: 'low',
      flags: [],
    }

    try {
      // Get campaign and conversion history
      const campaign = await Campaign.find(campaignId)
      if (!campaign) return flags

      // Check for duplicate conversions
      await this.checkDuplicateConversion(
        campaignId,
        customerEmail,
        customerPhone,
        flags
      )

      // Check for velocity anomalies
      await this.checkVelocityAnomaly(affiliateId, campaignId, flags)

      // Check for amount anomalies
      await this.checkAmountAnomaly(campaignId, amount, flags)

      // Check for affiliate anomalies
      await this.checkAffiliateAnomaly(affiliateLinkId, campaignId, flags)

      // Check for device/IP suspicions
      await this.checkDeviceSuspicion(ipAddress, _deviceId, flags)

      // Calculate fraud score
      flags.fraudScore = this.calculateFraudScore(flags)
      flags.riskLevel = this.getRiskLevel(flags.fraudScore)

      return flags
    } catch (error) {
      console.error('Fraud detection error:', error)
      return flags
    }
  }

  /**
   * Check for duplicate conversions within 1 hour
   */
  private static async checkDuplicateConversion(
    campaignId: number,
    customerEmail: string,
    customerPhone: string | undefined,
    flags: FraudFlags
  ): Promise<void> {
    const oneHourAgo = DateTime.now().minus({ hours: 1 })

    const query = VendorConversion.query()
      .where('campaign_id', campaignId)
      .where('status', '!=', 'rejected')
      .where('created_at', '>', oneHourAgo.toSQL())

    if (customerEmail) {
      const duplicateEmail = await query
        .clone()
        .where('customer_email', customerEmail)
        .first()

      if (duplicateEmail) {
        flags.isDuplicate = true
        flags.isDuplicateReason = `Email ${customerEmail} already converted within last hour`
        flags.flags.push('DUPLICATE_EMAIL')
        return
      }
    }

    if (customerPhone) {
      const duplicatePhone = await query
        .clone()
        .where('customer_phone', customerPhone)
        .first()

      if (duplicatePhone) {
        flags.isDuplicate = true
        flags.isDuplicateReason = `Phone ${customerPhone} already converted within last hour`
        flags.flags.push('DUPLICATE_PHONE')
      }
    }
  }

  /**
   * Check for velocity anomalies (too many conversions too fast)
   */
  private static async checkVelocityAnomaly(
    affiliateId: number,
    campaignId: number,
    flags: FraudFlags
  ): Promise<void> {
    const thirtyMinutesAgo = DateTime.now().minus({ minutes: 30 })

    const recentConversions = await VendorConversion.query()
      .where('affiliate_id', affiliateId)
      .where('campaign_id', campaignId)
      .where('created_at', '>', thirtyMinutesAgo.toSQL())
      .where('status', '!=', 'rejected')
      .count('*', 'count')

    const count = parseInt((recentConversions[0] as any)?.count || '0')

    if (count > 5) {
      flags.isVelocityAnomaly = true
      flags.velocityAnomalyReason = `${count} conversions in last 30 minutes (threshold: 5)`
      flags.flags.push('VELOCITY_ANOMALY')
    }
  }

  /**
   * Check for amount anomalies
   */
  private static async checkAmountAnomaly(
    campaignId: number,
    amount: number,
    flags: FraudFlags
  ): Promise<void> {
    const conversions = await VendorConversion.query()
      .where('campaign_id', campaignId)
      .where('status', '!=', 'rejected')
      .select('amount')

    if (conversions.length > 0) {
      const amounts = conversions.map((c) => c.amount)
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
      const threshold = avgAmount * 3

      if (amount > threshold) {
        flags.isAmountAnomaly = true
        flags.amountAnomalyReason = `Amount ${amount} is >3x average (${avgAmount.toFixed(2)})`
        flags.flags.push('AMOUNT_ANOMALY')
      }
    }
  }

  /**
   * Check for affiliate anomalies
   */
  private static async checkAffiliateAnomaly(
    affiliateLinkId: number,
    _campaignId: number,
    flags: FraudFlags
  ): Promise<void> {
    const oneHourAgo = DateTime.now().minus({ hours: 1 })

    const recentConversions = await VendorConversion.query()
      .where('affiliate_link_id', affiliateLinkId)
      .where('created_at', '>', oneHourAgo.toSQL())
      .where('status', '!=', 'rejected')
      .count('*', 'count')

    const count = parseInt((recentConversions[0] as any)?.count || '0')

    if (count > 10) {
      flags.isAffiliateAnomaly = true
      flags.affiliateAnomalyReason = `${count} conversions from same link in last hour`
      flags.flags.push('AFFILIATE_VELOCITY_ANOMALY')
    }
  }

  /**
   * Check for device/IP suspicion
   */
  private static async checkDeviceSuspicion(
    ipAddress: string | undefined,
    _deviceId: string | undefined,
    flags: FraudFlags
  ): Promise<void> {
    const suspiciousIps = [
      '127.0.0.1',
      '0.0.0.0',
      // Add known proxy/VPN IPs as needed
    ]

    if (ipAddress && suspiciousIps.includes(ipAddress)) {
      flags.isDeviceSuspicious = true
      flags.deviceSuspiciousReason = `Suspicious IP: ${ipAddress}`
      flags.flags.push('SUSPICIOUS_IP')
    }
  }

  /**
   * Calculate fraud score (0-100)
   */
  private static calculateFraudScore(flags: FraudFlags): number {
    let score = 0

    if (flags.isDuplicate) score += 40
    if (flags.isVelocityAnomaly) score += 25
    if (flags.isAmountAnomaly) score += 20
    if (flags.isAffiliateAnomaly) score += 25
    if (flags.isDeviceSuspicious) score += 15

    return Math.min(score, 100)
  }

  /**
   * Get risk level from fraud score
   */
  private static getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 70) return 'critical'
    if (score >= 50) return 'high'
    if (score >= 30) return 'medium'
    return 'low'
  }

  /**
   * Get fraud statistics
   */
  static async getFraudStats(campaignId?: number, dateRange?: { start: DateTime; end: DateTime }) {
    let query = VendorConversion.query()

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    if (dateRange && dateRange.start && dateRange.end) {
      const startSql = dateRange.start.toSQL()
      const endSql = dateRange.end.toSQL()
      if (startSql && endSql) {
        query = query
          .where('created_at', '>=', startSql)
          .where('created_at', '<=', endSql)
      }
    }

    const conversions = await query.select('*')

    const stats = {
      total: conversions.length,
      flagged: conversions.filter((c) => c.fraudFlags && JSON.parse(c.fraudFlags).fraudScore > 30).length,
      byRiskLevel: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      topFlags: {} as Record<string, number>,
    }

    conversions.forEach((c) => {
      const fraudFlags = c.fraudFlags ? JSON.parse(c.fraudFlags) : {}
      if (fraudFlags.riskLevel) {
        stats.byRiskLevel[fraudFlags.riskLevel as keyof typeof stats.byRiskLevel]++
      }
      if (fraudFlags.flags) {
        fraudFlags.flags.forEach((flag: string) => {
          stats.topFlags[flag] = (stats.topFlags[flag] || 0) + 1
        })
      }
    })

    return stats
  }
}
