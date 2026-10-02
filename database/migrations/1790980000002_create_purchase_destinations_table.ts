import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchase_destinations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid').unique().notNullable()

      // Relationships
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns')
      table.integer('product_id').unsigned().references('id').inTable('products')
      table.integer('affiliate_id').unsigned().references('id').inTable('users')
      table.integer('affiliate_link_id').unsigned().references('id').inTable('affiliate_links')

      // Destination URL
      table.string('destination_url').notNullable()

      // Tracking information
      table.string('redirect_token').unique().notNullable()
      table.dateTime('redirected_at').notNullable()

      // Customer information (not sensitive)
      table.string('customer_email').nullable()
      table.string('customer_identifier').nullable()

      // Conversion tracking
      table.enum('status', [
        'pending',
        'redirected',
        'conversion_pending',
        'converted',
        'failed',
        'expired'
      ]).defaultTo('pending')

      // External conversion reference
      table.string('external_order_id').nullable()
      table.string('external_reference').nullable()
      table.decimal('external_amount', 12, 2).nullable()

      // Metadata
      table.json('metadata').nullable()

      // Expiration (default 30 days)
      table.dateTime('expires_at').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
