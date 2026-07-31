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
export default class EmailCampaign extends BaseModel {
    static table = 'email_campaigns';
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], EmailCampaign.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], EmailCampaign.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], EmailCampaign.prototype, "subject", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaign.prototype, "content", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], EmailCampaign.prototype, "campaignType", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaign.prototype, "audienceSegment", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], EmailCampaign.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], EmailCampaign.prototype, "recipientsCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], EmailCampaign.prototype, "openCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], EmailCampaign.prototype, "clickCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], EmailCampaign.prototype, "conversionCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], EmailCampaign.prototype, "revenueGenerated", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], EmailCampaign.prototype, "sentAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], EmailCampaign.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], EmailCampaign.prototype, "updatedAt", void 0);
//# sourceMappingURL=email_campaign.js.map