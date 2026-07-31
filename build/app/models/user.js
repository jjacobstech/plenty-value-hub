var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { UserSchema } from '#database/schema';
import hash from '@adonisjs/core/services/hash';
import { compose } from '@adonisjs/core/helpers';
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import { column } from '@adonisjs/lucid/orm';
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
    get initials() {
        const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@');
        if (first && last) {
            return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
        }
        return `${first.slice(0, 2)}`.toUpperCase();
    }
    get isEmailVerified() {
        return this.emailVerifiedAt !== null;
    }
}
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], User.prototype, "emailVerifiedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "otpCode", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], User.prototype, "otpExpiresAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "resetToken", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], User.prototype, "resetTokenExpiresAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "businessName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "country", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "phone", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "businessType", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "heardAbout", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "profilePicture", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "bio", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "website", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "instagram", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "twitter", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "youtube", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "location", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "niche", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "marketingChannels", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "businessDescription", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "businessLogo", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "coverBanner", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "productCategories", void 0);
//# sourceMappingURL=user.js.map