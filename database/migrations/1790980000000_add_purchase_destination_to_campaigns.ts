import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.table(this.tableName, (table) => {
      // External purchase destination
      table.string('purchase_destination_url').nullable()
      table.enum('purchase_destination_type', [
        'external_url',
        'shopify',
        'woocommerce',
        'paystack',
        'flutterwave',
        'internal'
      ]).defaultTo('internal')

      // Purchase tracking
      table.integer('total_redirects').defaultTo(0)
      table.integer('total_external_conversions').defaultTo(0)

      // Metadata for external integrations
      table.json('external_integration_config').nullable()

      // Webhook for external conversion reporting
      table.string('webhook_url').nullable()
      table.string('webhook_secret').nullable()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('purchase_destination_url')
      table.dropColumn('purchase_destination_type')
      table.dropColumn('total_redirects')
      table.dropColumn('total_external_conversions')
      table.dropColumn('external_integration_config')
      table.dropColumn('webhook_url')
      table.dropColumn('webhook_secret')
    })
  }
}
