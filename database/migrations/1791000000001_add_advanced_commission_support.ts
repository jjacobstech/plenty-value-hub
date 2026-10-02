import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.table(this.tableName, (table) => {
      // Support for tiered commission structures
      table.json('commission_tiers').nullable()

      // Support for volume-based bonuses
      table.json('volume_bonuses').nullable()

      // Min/max commission caps
      table.decimal('min_commission', 10, 2).nullable()
      table.decimal('max_commission', 10, 2).nullable()

      // Commission review settings
      table.boolean('require_commission_approval').defaultTo(false)
      table.integer('commission_approval_threshold').nullable()
    })

    // Also add to products for backward compatibility
    this.schema.table('products', (table) => {
      table.json('commission_tiers').nullable()
      table.decimal('min_commission', 10, 2).nullable()
      table.decimal('max_commission', 10, 2).nullable()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('commission_tiers')
      table.dropColumn('volume_bonuses')
      table.dropColumn('min_commission')
      table.dropColumn('max_commission')
      table.dropColumn('require_commission_approval')
      table.dropColumn('commission_approval_threshold')
    })

    this.schema.table('products', (table) => {
      table.dropColumn('commission_tiers')
      table.dropColumn('min_commission')
      table.dropColumn('max_commission')
    })
  }
}
