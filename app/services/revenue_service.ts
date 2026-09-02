import { Decimal } from 'decimal.js'
import SiteSetting from '#models/site_setting'

export interface RevenueBreakdown {
  salePrice: number
  platformFee: number
  commissionAmount: number
  vendorPayout: number
}

/**
 * Reads the platform commission rate from site_settings.
 * Falls back to 10% if not configured.
 */
export async function getPlatformCommissionRate(): Promise<number> {
  try {
    const setting = await SiteSetting.findBy('key', 'platform_commission')
    if (setting?.value != null) {
      const rate = parseFloat(setting.value)
      if (Number.isFinite(rate) && rate >= 0 && rate <= 100) {
        return rate
      }
    }
  } catch {
    // fall through to default
  }
  return 10 // default 10%
}

export class RevenueService {
  /**
   * Calculate revenue split for an order.
   *
   * @param productPrice    - Original product price
   * @param salePrice       - Actual sale price (may differ due to sale/discount)
   * @param commissionRate  - Affiliate commission rate in % (e.g. 30 means 30%)
   * @param hasAffiliate    - Whether an affiliate is attached to the order
   * @param platformRate    - Platform fee in % (e.g. 10 means 10%). Defaults to 10%.
   */
  static calculate(
    productPrice: number,
    salePrice: number | null,
    commissionRate: number,
    hasAffiliate: boolean = true,
    platformRate: number = 10
  ): RevenueBreakdown {
    const finalPrice = salePrice && salePrice < productPrice ? salePrice : productPrice

    const platformFee = new Decimal(finalPrice)
      .times(platformRate)
      .dividedBy(100)
      .toDecimalPlaces(2)
      .toNumber()
    const commissionAmount = hasAffiliate
      ? new Decimal(finalPrice).times(commissionRate).dividedBy(100).toDecimalPlaces(2).toNumber()
      : 0
    const vendorPayout = new Decimal(finalPrice)
      .minus(platformFee)
      .minus(commissionAmount)
      .toDecimalPlaces(2)
      .toNumber()

    return {
      salePrice: finalPrice,
      platformFee,
      commissionAmount,
      vendorPayout,
    }
  }

  /**
   * Same as calculate() but reads platformRate from site_settings automatically.
   */
  static async calculateWithSettings(
    productPrice: number,
    salePrice: number | null,
    commissionRate: number,
    hasAffiliate: boolean = true
  ): Promise<RevenueBreakdown> {
    const platformRate = await getPlatformCommissionRate()
    return this.calculate(productPrice, salePrice, commissionRate, hasAffiliate, platformRate)
  }
}
