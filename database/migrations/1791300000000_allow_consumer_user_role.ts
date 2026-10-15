import { BaseSchema } from '@adonisjs/lucid/schema'

/** The app signs up consumers (the default role), but the users role check only allowed admin, vendor and affiliate. */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.raw(`ALTER TABLE ${this.tableName} DROP CONSTRAINT IF EXISTS users_role_check`)
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'vendor', 'affiliate', 'consumer'))`
    )
  }

  async down() {
    this.schema.raw(`ALTER TABLE ${this.tableName} DROP CONSTRAINT IF EXISTS users_role_check`)
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'vendor', 'affiliate'))`
    )
  }
}
