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
export default class BlogPost extends BaseModel {
    static table = 'blog_posts';
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], BlogPost.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BlogPost.prototype, "title", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "slug", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "excerpt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "content", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "featuredImageUrl", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "category", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "tags", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "authorName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BlogPost.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "seoTitle", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], BlogPost.prototype, "seoDescription", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], BlogPost.prototype, "readTimeMinutes", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], BlogPost.prototype, "viewCount", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], BlogPost.prototype, "publishedAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], BlogPost.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], BlogPost.prototype, "updatedAt", void 0);
//# sourceMappingURL=blog_post.js.map