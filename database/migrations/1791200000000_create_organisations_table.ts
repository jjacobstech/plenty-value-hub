import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partners'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table.string('name').notNullable()
      table.enum('status', ['active', 'suspended']).notNullable().defaultTo('active')
      table.string('contact_email').notNullable()
      table.jsonb('allowed_redirect_domains').notNullable().defaultTo('[]')
      table.string('click_id_param').notNullable().defaultTo('pv_click_id')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
