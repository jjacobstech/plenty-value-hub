import { Decimal } from 'decimal.js'

export interface RevenueBreakdown {
  salePrice: number
  platformFee: number
  commissionAmount: number
  vendorPayout: number
}

export class RevenueService {
  static calculate(
    productPrice: number,
    salePrice: number | null,
    commissionRate: number,
    hasAffiliate: boolean = true
  ): RevenueBreakdown {
    const finalPrice = salePrice && salePrice < productPrice ? salePrice : productPrice

    const platformFee = new Decimal(finalPrice).times(0.1).toDecimalPlaces(2).toNumber()
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
}
