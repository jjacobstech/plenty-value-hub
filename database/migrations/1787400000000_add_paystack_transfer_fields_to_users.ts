import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      // Paystack transfer recipient information
      table.string('paystack_recipient_code').nullable()
      table.string('paystack_bank_code').nullable()
      table.string('paystack_bank_name').nullable()
      table.boolean('paystack_recipient_verified').defaultTo(false)
      
      // Transfer reference tracking
      table.string('last_transfer_reference').nullable()
      table.timestamp('last_transfer_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('paystack_recipient_code')
      table.dropColumn('paystack_bank_code') 
      table.dropColumn('paystack_bank_name')
      table.dropColumn('paystack_recipient_verified')
      table.dropColumn('last_transfer_reference')
      table.dropColumn('last_transfer_at')
    })
  }
}