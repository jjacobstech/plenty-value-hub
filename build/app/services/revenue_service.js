import { Decimal } from 'decimal.js';
export class RevenueService {
    static calculate(productPrice, salePrice, commissionRate, hasAffiliate = true) {
        const finalPrice = salePrice && salePrice < productPrice ? salePrice : productPrice;
        const platformFee = new Decimal(finalPrice).times(0.1).toDecimalPlaces(2).toNumber();
        const commissionAmount = hasAffiliate
            ? new Decimal(finalPrice).times(commissionRate).dividedBy(100).toDecimalPlaces(2).toNumber()
            : 0;
        const vendorPayout = new Decimal(finalPrice)
            .minus(platformFee)
            .minus(commissionAmount)
            .toDecimalPlaces(2)
            .toNumber();
        return {
            salePrice: finalPrice,
            platformFee,
            commissionAmount,
            vendorPayout,
        };
    }
}
//# sourceMappingURL=revenue_service.js.map