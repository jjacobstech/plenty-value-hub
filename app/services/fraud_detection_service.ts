import Conversion from '#models/conversion'
import Click from '#models/click'
import User from '#models/user'
import { DateTime } from 'luxon'

export interface FraudFlag {
  affiliateId: number
  flagType: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  description: string
  metadata: Record<string, any>
  createdAt: DateTime
  status: 'pending' | 'investigating' | 'approved' | 'rejected'
}

export default class FraudDetectionService {
  /**
   * Analyze conversion for fraud signals
   */
  static async analyzeConversion(conversionId: number): Promise<FraudFlag[]> {
    const conversion = await Conversion.findOrFail(conversionId)
    const flags: FraudFlag[] = []

    if (!conversion.affiliateId) return flags

    // Check 1: Velocity anomaly (too many conversions in short time)
    const velocityFlag = await this.checkVelocityAnomaly(conversion.affiliateId)
    if (velocityFlag) flags.push(velocityFlag)

    // Check 2: Duplicate orders (same customer, product within hours)
    const duplicateFlag = await this.checkDuplicateOrders(conversion)
    if (duplicateFlag) flags.push(duplicateFlag)

    // Check 3: Suspicious IP pattern
    const ipFlag = await this.checkSuspiciousIP(conversion.affiliateId)
    if (ipFlag) flags.push(ipFlag)

    // Check 4: Device fingerprint anomaly
    const deviceFlag = await this.checkDeviceAnomaly(conversion.affiliateId)
    if (deviceFlag) flags.push(deviceFlag)

    // Check 5: Geographic anomaly
    const geoFlag = await this.checkGeographicAnomaly(conversion.affiliateId)
    if (geoFlag) flags.push(geoFlag)

    // Check 6: Bot-like behavior
    const botFlag = await this.checkBotLikeBehavior(conversion.affiliateId)
    if (botFlag) flags.push(botFlag)

    return flags
  }

  /**
   * Check for velocity anomalies (rapid conversions)
   */
  private static async checkVelocityAnomaly(affiliateId: number): Promise<FraudFlag | null> {
    const lastHour = DateTime.now().minus({ hour: 1 }).toSQL()
    const conversionsLastHour = await Conversion.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>', lastHour)
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    // Flag if > 20 conversions in 1 hour
    if (conversionsLastHour > 20) {
      return {
        affiliateId,
        flagType: 'velocity_anomaly',
        riskLevel: conversionsLastHour > 50 ? 'critical' : 'high',
        description: `${conversionsLastHour} conversions in last hour (threshold: 20)`,
        metadata: {
          conversionsLastHour,
          threshold: 20,
        },
        createdAt: DateTime.now(),
        status: 'pending',
      }
    }

    return null
  }

  /**
   * Check for duplicate orders
   */
  private static async checkDuplicateOrders(conversion: Conversion): Promise<FraudFlag | null> {
    const twoHoursAgo = DateTime.now().minus({ hours: 2 }).toISO()!

    if (!conversion.customerEmail || !conversion.productId) {
      return null
    }

    const duplicates = await Conversion.query()
      .where('affiliate_id', conversion.affiliateId)
      .where('customer_email', conversion.customerEmail!)
      .where('product_id', conversion.productId!)
      .where('created_at', '>', twoHoursAgo)
      .where('id', '!=', conversion.id)

    if (duplicates.length > 0) {
      return {
        affiliateId: conversion.affiliateId,
        flagType: 'duplicate_orders',
        riskLevel: duplicates.length > 3 ? 'critical' : 'high',
        description: `${duplicates.length + 1} orders from same customer for same product in 2 hours`,
        metadata: {
          customerEmail: conversion.customerEmail,
          productId: conversion.productId,
          duplicateCount: duplicates.length,
        },
        createdAt: DateTime.now(),
        status: 'pending',
      }
    }

    return null
  }

  /**
   * Check for suspicious IP patterns
   */
  private static async checkSuspiciousIP(affiliateId: number): Promise<FraudFlag | null> {
    const dayAgo = DateTime.now().minus({ day: 1 }).toISO()!

    const clicks = await Click.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>', dayAgo)

    // Group by IP
    const ipMap = new Map<string, number>()
    for (const click of clicks) {
      if (!click.ipAddress) continue
      const count = (ipMap.get(click.ipAddress) || 0) + 1
      ipMap.set(click.ipAddress, count)
    }

    // Check for single IP with high click volume
    const highVolumeIPs = Array.from(ipMap.entries())
      .filter(([_, count]) => count > 100)
      .map(([ip]) => ip)

    if (highVolumeIPs.length > 0) {
      return {
        affiliateId,
        flagType: 'suspicious_ip',
        riskLevel: 'high',
        description: `${highVolumeIPs.length} IP(s) with unusual click volume (>100 in 24h)`,
        metadata: {
          suspiciousIPs: highVolumeIPs.slice(0, 5),
          ipCount: highVolumeIPs.length,
        },
        createdAt: DateTime.now(),
        status: 'pending',
      }
    }

    return null
  }

  /**
   * Check for device anomalies
   */
  private static async checkDeviceAnomaly(affiliateId: number): Promise<FraudFlag | null> {
    const dayAgo = DateTime.now().minus({ day: 1 }).toSQL()

    const clicks = await Click.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>', dayAgo)

    // Count unique devices
    const devices = new Set(clicks.map((c) => c.userAgent))

    // If > 50 clicks but only 1-2 user agents, suspicious
    if (clicks.length > 50 && devices.size <= 2) {
      return {
        affiliateId,
        flagType: 'device_suspicion',
        riskLevel: 'medium',
        description: `${clicks.length} clicks from only ${devices.size} unique device(s)`,
        metadata: {
          clickCount: clicks.length,
          uniqueDevices: devices.size,
        },
        createdAt: DateTime.now(),
        status: 'pending',
      }
    }

    return null
  }

  /**
   * Check for geographic anomalies
   */
  private static async checkGeographicAnomaly(affiliateId: number): Promise<FraudFlag | null> {
    const hourAgo = DateTime.now().minus({ hour: 1 }).toSQL()

    const clicks = await Click.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>', hourAgo)

    // For now, check if clicks from vastly different regions in short time
    // In real implementation, would use GeoIP lookup
    const geoLocations = new Set(clicks.map((c) => c.countryCode))

    if (geoLocations.size > 10 && clicks.length > 20) {
      return {
        affiliateId,
        flagType: 'geographic_anomaly',
        riskLevel: 'medium',
        description: `Clicks from ${geoLocations.size} countries in 1 hour`,
        metadata: {
          locationCount: geoLocations.size,
          clickCount: clicks.length,
        },
        createdAt: DateTime.now(),
        status: 'pending',
      }
    }

    return null
  }

  /**
   * Check for bot-like behavior
   */
  private static async checkBotLikeBehavior(affiliateId: number): Promise<FraudFlag | null> {
    const hourAgo = DateTime.now().minus({ hour: 1 }).toSQL()

    const clicks = await Click.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>', hourAgo)

    // Bot indicators:
    // 1. All same user agent
    // 2. Same IP
    // 3. Regular time intervals
    // 4. No referrer

    const userAgents = new Set(clicks.map((c) => c.userAgent))
    const ips = new Set(clicks.map((c) => c.ipAddress))
    const noReferrer = clicks.filter((c) => !c.referrer).length

    if (
      userAgents.size === 1 &&
      ips.size === 1 &&
      noReferrer === clicks.length &&
      clicks.length > 30
    ) {
      return {
        affiliateId,
        flagType: 'bot_network',
        riskLevel: 'critical',
        description: `Strong bot indicators: identical UA, IP, no referrer, ${clicks.length} clicks`,
        metadata: {
          clickCount: clicks.length,
          uniqueUA: 1,
          uniqueIP: 1,
          noReferrer: noReferrer,
        },
        createdAt: DateTime.now(),
        status: 'pending',
      }
    }

    return null
  }

  /**
   * Get affiliate risk score (0-100)
   */
  static async calculateAffiliateRiskScore(affiliateId: number): Promise<number> {
    let score = 0
    const dayAgo = DateTime.now().minus({ day: 1 }).toSQL()

    // Check conversion velocity
    const conversions = await Conversion.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>', dayAgo)

    if (conversions.length > 100) score += 30

    // Check click to conversion ratio
    const clicks = await Click.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>', dayAgo)

    const ratio = clicks.length > 0 ? conversions.length / clicks.length : 0
    if (ratio > 0.5) score += 25 // Unusually high conversion rate

    // Check for previous flags
    const user = await User.findOrFail(affiliateId)
    if ((user as any).fraudFlags > 0) score += 20

    return Math.min(score, 100)
  }

  /**
   * Get flagged conversions (returns query builder)
   */
  static getFlaggedConversions(status?: 'pending' | 'investigating' | 'approved' | 'all') {
    let query = Conversion.query().where('fraud_flags_count', '>', 0)

    if (status && status !== 'all') {
      query = query.where('fraud_status', status)
    }

    return query.orderBy('created_at', 'desc').limit(100)
  }

  /**
   * Approve conversion (remove fraud flag)
   */
  static async approveConversion(conversionId: number) {
    const conversion = await Conversion.findOrFail(conversionId)
    conversion.fraudStatus = 'approved'
    conversion.fraudFlagsCount = 0
    await conversion.save()
    return conversion
  }

  /**
   * Reject conversion (mark as fraudulent)
   */
  static async rejectConversion(conversionId: number, reason: string) {
    const conversion = await Conversion.findOrFail(conversionId)
    conversion.fraudStatus = 'rejected'
    conversion.fraudReason = reason
    await conversion.save()

    // Cancel associated commissions
    // TODO: Call CommissionService.cancelCommission()

    return conversion
  }

  static async detectFraud(
    _campaignId: number,
    _affiliateId: number,
    _linkId: number,
    _amount: number,
    _email?: string,
    _phone?: string,
    _ipAddress?: string,
    _userAgent?: string,
    _deviceId?: string
  ) {
    return { fraudScore: 0, riskLevel: 'low' as const, flags: [] }
  }

  static async getFraudStats(_campaignId: number | null, _dateRange?: { start: Date; end: Date }) {
    return {
      totalFraudFlags: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      topAffiliatesByRisk: [],
      conversionsWithFlags: 0,
    }
  }
}

export { FraudDetectionService }
