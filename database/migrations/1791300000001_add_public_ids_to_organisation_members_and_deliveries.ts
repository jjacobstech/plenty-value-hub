import { BaseSchema } from '@adonisjs/lucid/schema'

/** Portal rows that were exposed by numeric id get a public id. Existing rows are backfilled in SQL. */
export default class extends BaseSchema {
  async up() {
    const tables: [string, string][] = [
      ['partner_members', 'mem_'],
      ['partner_webhook_deliveries', 'whd_'],
    ]
    for (const [table, prefix] of tables) {
      this.schema.alterTable(table, (t) => t.string('public_id', 32).nullable())
      this.schema.raw(`update ${table} set public_id = '${prefix}' || substr(md5(random()::text || id::text), 1, 20)`)
      this.schema.alterTable(table, (t) => t.string('public_id', 32).notNullable().alter())
      this.schema.alterTable(table, (t) => t.unique(['public_id']))
    }
  }

  async down() {
    this.schema.alterTable('partner_members', (t) => t.dropColumn('public_id'))
    this.schema.alterTable('partner_webhook_deliveries', (t) => t.dropColumn('public_id'))
  }
}
