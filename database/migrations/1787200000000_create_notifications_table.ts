import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('uuid').nullable()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.string('type').notNullable() // 'sale', 'review', 'message', etc.
      table.string('title').notNullable()
      table.text('message').nullable()
      table.string('icon').nullable() // emoji or icon identifier
      table.json('data').nullable() // extra data like orderId, productId, etc.
      table.boolean('is_read').defaultTo(false)
      table.timestamp('read_at').nullable()
      table.string('action_url').nullable() // link to relevant page
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index('user_id')
      table.index('is_read')
      table.index('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
