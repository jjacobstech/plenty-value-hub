import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_clicks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.integer('link_id').unsigned().notNullable().references('id').inTable('partner_links').onDelete('CASCADE')
      table.integer('affiliate_id').unsigned().notNullable().references('id').inTable('partner_affiliates').onDelete('CASCADE')
      table.string('product_ref', 191).nullable()
      table.string('campaign_ref', 191).nullable()
      table.specificType('visitor_hash', 'char(64)').notNullable()
      table.boolean('is_unique').notNullable()
      table.text('referrer').nullable()
      table.jsonb('utm').notNullable().defaultTo('{}')
      table.string('user_agent_family', 64).nullable()
      table.timestamp('clicked_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.index(['partner_id', 'livemode', 'affiliate_id', 'clicked_at'])
      table.index(['link_id', 'visitor_hash', 'clicked_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
