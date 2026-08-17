import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payment_gateway_keys'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('gateway').notNullable().unique() // e.g., 'paystack', 'flutterwave', 'paypal', 'stripe'
      table.text('public_key').notNullable() // Encrypted
      table.text('secret_key').notNullable() // Encrypted
      table.string('merchant_id').nullable() // For some gateways
      table.boolean('is_active').defaultTo(false) // Whether this gateway is enabled
      table.text('webhook_secret').nullable() // Encrypted - for webhook verification

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
