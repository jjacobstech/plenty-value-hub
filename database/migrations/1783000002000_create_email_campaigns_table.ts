import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'email_campaigns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('subject').notNullable()
      table.text('content').nullable()
      table
        .enum('campaign_type', ['product_promo', 'announcement', 'buying_guide', 'review', 'offer'])
        .defaultTo('product_promo')
      table.string('audience_segment').nullable()
      table.enum('status', ['draft', 'scheduled', 'sent', 'paused']).defaultTo('draft')
      table.integer('recipients_count').defaultTo(0)
      table.integer('open_count').defaultTo(0)
      table.integer('click_count').defaultTo(0)
      table.integer('conversion_count').defaultTo(0)
      table.decimal('revenue_generated', 14, 2).defaultTo(0)
      table.timestamp('sent_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
