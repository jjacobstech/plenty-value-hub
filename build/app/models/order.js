var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { OrderSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import User from '#models/user';
import Product from '#models/product';
import AffiliateLink from '#models/affiliate_link';
export default class Order extends OrderSchema {
}
__decorate([
    belongsTo(() => Product, { foreignKey: 'productId' }),
    __metadata("design:type", Object)
], Order.prototype, "product", void 0);
__decorate([
    belongsTo(() => User, { foreignKey: 'buyerId' }),
    __metadata("design:type", Object)
], Order.prototype, "buyer", void 0);
__decorate([
    belongsTo(() => User, { foreignKey: 'vendorId' }),
    __metadata("design:type", Object)
], Order.prototype, "vendor", void 0);
__decorate([
    belongsTo(() => User, { foreignKey: 'affiliateId' }),
    __metadata("design:type", Object)
], Order.prototype, "affiliate", void 0);
__decorate([
    belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' }),
    __metadata("design:type", Object)
], Order.prototype, "affiliateLink", void 0);
//# sourceMappingURL=order.js.map