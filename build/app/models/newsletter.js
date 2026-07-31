var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseModel, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
export default class Newsletter extends BaseModel {
    static table = 'newsletters';
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], Newsletter.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "subject", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Newsletter.prototype, "category", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Newsletter.prototype, "content", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Newsletter.prototype, "recipientsCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Newsletter.prototype, "openCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Newsletter.prototype, "clickCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Newsletter.prototype, "revenueGenerated", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], Newsletter.prototype, "sentAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Newsletter.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], Newsletter.prototype, "updatedAt", void 0);
//# sourceMappingURL=newsletter.js.map