import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tables = [
    'users',
    'products',
    'affiliate_links',
    'orders',
    'reviews',
    'newsletter_subscribers',
    'blog_posts',
    'newsletters',
    'email_campaigns',
    'site_settings',
    'payment_gateway_keys',
    'wallets',
    'wallet_transactions',
    'payout_requests',
  ]

  async up() {
    for (const tableName of this.tables) {
      this.schema.alterTable(tableName, (table) => {
        table.uuid('uuid').nullable().unique()
      })
    }

    // Populate missing UUIDs for existing records
    this.defer(async (db) => {
      const crypto = await import('node:crypto')
      for (const tableName of this.tables) {
        const rows = await db.from(tableName).whereNull('uuid').select('id')
        for (const row of rows) {
          await db.from(tableName).where('id', row.id).update({
            uuid: crypto.randomUUID(),
          })
        }
      }
    })
  }

  async down() {
    for (const tableName of this.tables) {
      this.schema.alterTable(tableName, (table) => {
        table.dropColumn('uuid')
      })
    }
  }
}
