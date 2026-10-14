import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_links'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.integer('partner_id').unsigned().notNullable().references('id').inTable('partners').onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.integer('affiliate_id').unsigned().notNullable().references('id').inTable('partner_affiliates').onDelete('CASCADE')
      table.string('code', 16).notNullable().unique()
      table.string('product_ref', 191).nullable()
      table.string('campaign_ref', 191).nullable()
      table.text('destination_url').notNullable()
      table.enum('status', ['active', 'disabled']).notNullable().defaultTo('active')
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
    // Expression index so NULL product_ref and campaign_ref behave as one value for create-or-get.
    this.schema.raw(
      `create unique index partner_links_scope_unique on partner_links (partner_id, livemode, affiliate_id, (coalesce(product_ref, '')), (coalesce(campaign_ref, '')))`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
