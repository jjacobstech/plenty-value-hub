import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Bank Transfer fields
      table.string('payout_bank_name', 255).nullable()
      table.string('payout_account_number', 255).nullable()
      table.string('payout_account_name', 255).nullable()
      table.string('payout_routing_number', 100).nullable()
      table.string('payout_swift_code', 50).nullable()

      // Mobile Money fields
      table.string('payout_mobile_provider', 100).nullable()
      table.string('payout_mobile_number', 20).nullable()

      // PayPal/Stripe/Other
      table.string('payout_email', 255).nullable()
      table.string('payout_account_id', 255).nullable()

      // JSON for flexible additional data
      table.json('payout_metadata').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payout_bank_name')
      table.dropColumn('payout_account_number')
      table.dropColumn('payout_account_name')
      table.dropColumn('payout_routing_number')
      table.dropColumn('payout_swift_code')
      table.dropColumn('payout_mobile_provider')
      table.dropColumn('payout_mobile_number')
      table.dropColumn('payout_email')
      table.dropColumn('payout_account_id')
      table.dropColumn('payout_metadata')
    })
  }
}
