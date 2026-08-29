import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('payout_requests', (table) => {
      // Paystack transfer tracking
      table.string('transfer_code').nullable()
      table.string('transfer_reference').nullable()
      table.string('transfer_status').nullable() // pending, success, failed, reversed
      table.text('transfer_error_message').nullable()
      table.timestamp('transfer_initiated_at').nullable()
      table.timestamp('transfer_completed_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('payout_requests', (table) => {
      table.dropColumn('transfer_code')
      table.dropColumn('transfer_reference')
      table.dropColumn('transfer_status')
      table.dropColumn('transfer_error_message')
      table.dropColumn('transfer_initiated_at')
      table.dropColumn('transfer_completed_at')
    })
  }
}