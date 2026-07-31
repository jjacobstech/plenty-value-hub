var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ProductSchema } from '#database/schema';
import { belongsTo, hasMany } from '@adonisjs/lucid/orm';
import User from '#models/user';
import Order from '#models/order';
import AffiliateLink from '#models/affiliate_link';
import Review from '#models/review';
export default class Product extends ProductSchema {
}
__decorate([
    belongsTo(() => User, { foreignKey: 'vendorId' }),
    __metadata("design:type", Object)
], Product.prototype, "vendor", void 0);
__decorate([
    hasMany(() => Order, { foreignKey: 'productId' }),
    __metadata("design:type", Object)
], Product.prototype, "orders", void 0);
__decorate([
    hasMany(() => AffiliateLink, { foreignKey: 'productId' }),
    __metadata("design:type", Object)
], Product.prototype, "affiliateLinks", void 0);
__decorate([
    hasMany(() => Review, { foreignKey: 'productId' }),
    __metadata("design:type", Object)
], Product.prototype, "reviews", void 0);
//# sourceMappingURL=product.js.map