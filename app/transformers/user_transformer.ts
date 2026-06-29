import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'fullName',
      'email',
      'role',
      'createdAt',
      'updatedAt',
      'initials',
      // Shared profile fields
      'profilePicture',
      'bio',
      'website',
      'instagram',
      'twitter',
      'youtube',
      'location',
      'phone',
      // Affiliate-specific
      'niche',
      'marketingChannels',
      // Vendor-specific
      'businessName',
      'businessDescription',
      'businessLogo',
      'coverBanner',
      'productCategories',
    ])
  }
}
