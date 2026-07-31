import { BaseTransformer } from '@adonisjs/core/transformers';
export default class UserTransformer extends BaseTransformer {
    toObject() {
        return this.pick(this.resource, [
            'id',
            'fullName',
            'email',
            'role',
            'createdAt',
            'updatedAt',
            'initials',
            'profilePicture',
            'bio',
            'website',
            'instagram',
            'twitter',
            'youtube',
            'location',
            'phone',
            'niche',
            'marketingChannels',
            'businessName',
            'businessDescription',
            'businessLogo',
            'coverBanner',
            'productCategories',
        ]);
    }
}
//# sourceMappingURL=user_transformer.js.map