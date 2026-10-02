import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'affiliate_links'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('campaign_id').unsigned().nullable().references('id').inTable('campaigns')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('campaign_id')
    })
  }
}
