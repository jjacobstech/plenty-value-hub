import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Shared profile fields
      table.string('profile_picture').nullable()
      table.text('bio').nullable()
      table.string('website').nullable()
      table.string('instagram').nullable()
      table.string('twitter').nullable()
      table.string('youtube').nullable()
      table.string('location').nullable()

      // Affiliate-specific
      table.string('niche').nullable()
      table.string('marketing_channels').nullable()

      // Vendor-specific
      table.text('business_description').nullable()
      table.string('business_logo').nullable()
      table.string('cover_banner').nullable()
      table.string('product_categories').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profile_picture')
      table.dropColumn('bio')
      table.dropColumn('website')
      table.dropColumn('instagram')
      table.dropColumn('twitter')
      table.dropColumn('youtube')
      table.dropColumn('location')
      table.dropColumn('niche')
      table.dropColumn('marketing_channels')
      table.dropColumn('business_description')
      table.dropColumn('business_logo')
      table.dropColumn('cover_banner')
      table.dropColumn('product_categories')
    })
  }
}
