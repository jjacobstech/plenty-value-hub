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
export class AffiliateLinkSchema extends BaseModel {
    static $columns = [
        'affiliateId',
        'campaignName',
        'clicks',
        'commissionEarned',
        'conversions',
        'createdAt',
        'id',
        'linkCode',
        'productId',
        'productName',
        'revenue',
        'status',
        'subId',
        'updatedAt',
    ];
    $columns = AffiliateLinkSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Number)
], AffiliateLinkSchema.prototype, "affiliateId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "campaignName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "clicks", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "commissionEarned", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "conversions", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], AffiliateLinkSchema.prototype, "createdAt", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], AffiliateLinkSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], AffiliateLinkSchema.prototype, "linkCode", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], AffiliateLinkSchema.prototype, "productId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "productName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "revenue", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "subId", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], AffiliateLinkSchema.prototype, "updatedAt", void 0);
export class BlogPostSchema extends BaseModel {
    static $columns = [
        'authorName',
        'category',
        'content',
        'createdAt',
        'excerpt',
        'featuredImageUrl',
        'id',
        'publishedAt',
        'readTimeMinutes',
        'seoDescription',
        'seoTitle',
        'slug',
        'status',
        'tags',
        'title',
        'updatedAt',
        'viewCount',
    ];
    $columns = BlogPostSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "authorName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "category", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "content", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], BlogPostSchema.prototype, "createdAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "excerpt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "featuredImageUrl", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], BlogPostSchema.prototype, "id", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "publishedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "readTimeMinutes", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "seoDescription", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "seoTitle", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "slug", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "tags", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BlogPostSchema.prototype, "title", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "updatedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPostSchema.prototype, "viewCount", void 0);
export class EmailCampaignSchema extends BaseModel {
    static $columns = [
        'audienceSegment',
        'campaignType',
        'clickCount',
        'content',
        'conversionCount',
        'createdAt',
        'id',
        'name',
        'openCount',
        'recipientsCount',
        'revenueGenerated',
        'sentAt',
        'status',
        'subject',
        'updatedAt',
    ];
    $columns = EmailCampaignSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "audienceSegment", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "campaignType", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "clickCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "content", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "conversionCount", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], EmailCampaignSchema.prototype, "createdAt", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], EmailCampaignSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], EmailCampaignSchema.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "openCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "recipientsCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "revenueGenerated", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "sentAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], EmailCampaignSchema.prototype, "subject", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], EmailCampaignSchema.prototype, "updatedAt", void 0);
export class NewsletterSubscriberSchema extends BaseModel {
    static $columns = [
        'createdAt',
        'email',
        'id',
        'interests',
        'name',
        'source',
        'status',
        'updatedAt',
    ];
    $columns = NewsletterSubscriberSchema.$columns;
}
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], NewsletterSubscriberSchema.prototype, "createdAt", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], NewsletterSubscriberSchema.prototype, "email", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], NewsletterSubscriberSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSubscriberSchema.prototype, "interests", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSubscriberSchema.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSubscriberSchema.prototype, "source", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSubscriberSchema.prototype, "status", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], NewsletterSubscriberSchema.prototype, "updatedAt", void 0);
export class NewsletterSchema extends BaseModel {
    static $columns = [
        'category',
        'clickCount',
        'content',
        'createdAt',
        'id',
        'openCount',
        'recipientsCount',
        'revenueGenerated',
        'sentAt',
        'status',
        'subject',
        'updatedAt',
    ];
    $columns = NewsletterSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "category", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "clickCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "content", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], NewsletterSchema.prototype, "createdAt", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], NewsletterSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "openCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "recipientsCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "revenueGenerated", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "sentAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], NewsletterSchema.prototype, "subject", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], NewsletterSchema.prototype, "updatedAt", void 0);
export class OrderSchema extends BaseModel {
    static $columns = [
        'affiliateId',
        'affiliateLinkId',
        'amount',
        'buyerEmail',
        'buyerId',
        'commissionAmount',
        'createdAt',
        'currency',
        'id',
        'orderNumber',
        'paymentMethod',
        'platformFee',
        'productId',
        'productName',
        'status',
        'updatedAt',
        'vendorId',
        'vendorPayout',
    ];
    $columns = OrderSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "affiliateId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "affiliateLinkId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], OrderSchema.prototype, "amount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "buyerEmail", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "buyerId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "commissionAmount", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], OrderSchema.prototype, "createdAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "currency", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], OrderSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], OrderSchema.prototype, "orderNumber", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "paymentMethod", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "platformFee", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "productId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "productName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "status", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], OrderSchema.prototype, "updatedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "vendorId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], OrderSchema.prototype, "vendorPayout", void 0);
export class ProductSchema extends BaseModel {
    static $columns = [
        'affiliateResources',
        'avgEarningsPerSale',
        'billingCycle',
        'category',
        'commissionRate',
        'conversionRate',
        'createdAt',
        'description',
        'galleryUrls',
        'gravityScore',
        'id',
        'imageUrl',
        'isFeatured',
        'name',
        'price',
        'productType',
        'rating',
        'recurringBilling',
        'refundRate',
        'reviewCount',
        'salePrice',
        'shortDescription',
        'slug',
        'status',
        'tags',
        'totalRevenue',
        'totalSales',
        'updatedAt',
        'vendorId',
        'vendorName',
    ];
    $columns = ProductSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "affiliateResources", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "avgEarningsPerSale", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "billingCycle", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ProductSchema.prototype, "category", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ProductSchema.prototype, "commissionRate", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "conversionRate", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], ProductSchema.prototype, "createdAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "description", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "galleryUrls", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "gravityScore", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], ProductSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "imageUrl", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "isFeatured", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ProductSchema.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ProductSchema.prototype, "price", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ProductSchema.prototype, "productType", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "rating", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "recurringBilling", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "refundRate", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "reviewCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "salePrice", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "shortDescription", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "slug", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "tags", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "totalRevenue", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "totalSales", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], ProductSchema.prototype, "updatedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "vendorId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ProductSchema.prototype, "vendorName", void 0);
export class RateLimitSchema extends BaseModel {
    static $columns = ['expire', 'key', 'points'];
    $columns = RateLimitSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], RateLimitSchema.prototype, "expire", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], RateLimitSchema.prototype, "key", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], RateLimitSchema.prototype, "points", void 0);
export class ReviewSchema extends BaseModel {
    static $columns = [
        'cons',
        'content',
        'createdAt',
        'helpfulCount',
        'id',
        'isVerifiedPurchase',
        'productId',
        'productName',
        'pros',
        'rating',
        'reviewerName',
        'status',
        'title',
        'updatedAt',
    ];
    $columns = ReviewSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "cons", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ReviewSchema.prototype, "content", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], ReviewSchema.prototype, "createdAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "helpfulCount", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], ReviewSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "isVerifiedPurchase", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], ReviewSchema.prototype, "productId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "productName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "pros", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], ReviewSchema.prototype, "rating", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "reviewerName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "title", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], ReviewSchema.prototype, "updatedAt", void 0);
export class SiteSettingSchema extends BaseModel {
    static $columns = ['createdAt', 'id', 'key', 'label', 'updatedAt', 'value'];
    $columns = SiteSettingSchema.$columns;
}
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], SiteSettingSchema.prototype, "createdAt", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], SiteSettingSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], SiteSettingSchema.prototype, "key", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], SiteSettingSchema.prototype, "label", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], SiteSettingSchema.prototype, "updatedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], SiteSettingSchema.prototype, "value", void 0);
export class UserSchema extends BaseModel {
    static $columns = [
        'bio',
        'businessDescription',
        'businessLogo',
        'businessName',
        'businessType',
        'country',
        'coverBanner',
        'createdAt',
        'email',
        'emailVerifiedAt',
        'fullName',
        'heardAbout',
        'id',
        'instagram',
        'location',
        'marketingChannels',
        'niche',
        'otpCode',
        'otpExpiresAt',
        'password',
        'phone',
        'productCategories',
        'profilePicture',
        'resetToken',
        'resetTokenExpiresAt',
        'role',
        'twitter',
        'updatedAt',
        'website',
        'youtube',
    ];
    $columns = UserSchema.$columns;
}
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "bio", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "businessDescription", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "businessLogo", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "businessName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "businessType", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "country", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "coverBanner", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], UserSchema.prototype, "createdAt", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserSchema.prototype, "email", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], UserSchema.prototype, "emailVerifiedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "fullName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "heardAbout", void 0);
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], UserSchema.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "instagram", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "location", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "marketingChannels", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "niche", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "otpCode", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], UserSchema.prototype, "otpExpiresAt", void 0);
__decorate([
    column({ serializeAs: null }),
    __metadata("design:type", String)
], UserSchema.prototype, "password", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "phone", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "productCategories", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "profilePicture", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "resetToken", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], UserSchema.prototype, "resetTokenExpiresAt", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserSchema.prototype, "role", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "twitter", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], UserSchema.prototype, "updatedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "website", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], UserSchema.prototype, "youtube", void 0);
//# sourceMappingURL=schema.js.map