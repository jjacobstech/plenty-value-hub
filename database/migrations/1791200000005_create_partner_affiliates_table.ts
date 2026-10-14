import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partner_affiliates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id', 32).notNullable().unique()
      table
        .integer('partner_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('partners')
        .onDelete('CASCADE')
      table.boolean('livemode').notNullable()
      table.string('external_user_id', 191).notNullable()
      table.enum('status', ['active', 'suspended', 'closed']).notNullable().defaultTo('active')
      table.string('email').nullable()
      table.string('display_name', 120).nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.unique(['partner_id', 'livemode', 'external_user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
