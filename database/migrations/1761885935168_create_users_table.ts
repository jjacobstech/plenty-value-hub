import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.enum('role', ['admin', 'vendor', 'affiliate']).notNullable()
      table.timestamp('email_verified_at').nullable()
      table.string('otp_code', 6).nullable()
      table.timestamp('otp_expires_at').nullable()
      table.string('reset_token').nullable()
      table.timestamp('reset_token_expires_at').nullable()
      table.string('business_name').nullable()
      table.string('country').nullable()
      table.string('phone').nullable()
      table.enum('business_type', ['individual', 'business']).nullable()
      table.string('heard_about').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
