import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.table(this.tableName, (table) => {
      // External purchase destination (for backward compatibility)
      table.string('purchase_destination_url').nullable()
      table.enum('purchase_destination_type', [
        'external_url',
        'shopify',
        'woocommerce',
        'paystack',
        'flutterwave',
        'internal'
      ]).defaultTo('internal')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('purchase_destination_url')
      table.dropColumn('purchase_destination_type')
    })
  }
}
