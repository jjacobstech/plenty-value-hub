import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('wallets', (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').unique()
      table.decimal('available_balance', 12, 2).notNullable().defaultTo(0)
      table.decimal('pending_balance', 12, 2).notNullable().defaultTo(0)
      table.string('currency', 3).notNullable().defaultTo('USD')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('wallet_transactions', (table) => {
      table.increments('id')
      table.integer('wallet_id').unsigned().notNullable().references('id').inTable('wallets')
      table.enum('type', ['credit', 'debit']).notNullable()
      table.string('category', 50).notNullable()
      table.decimal('amount', 12, 2).notNullable()
      table.string('reference_type', 50).nullable()
      table.integer('reference_id').unsigned().nullable()
      table.string('description').nullable()
      table.decimal('balance_after', 12, 2).notNullable()
      table.timestamp('created_at').notNullable()

      table.unique(['wallet_id', 'category', 'reference_type', 'reference_id'])
      table.index(['wallet_id', 'created_at'])
    })

    this.schema.createTable('payout_requests', (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('wallet_id').unsigned().notNullable().references('id').inTable('wallets')
      table.decimal('amount', 12, 2).notNullable()
      table.string('payout_method', 50).notNullable()
      table.text('payout_details').notNullable()
      table
        .enum('status', ['pending', 'approved', 'paid', 'rejected'])
        .notNullable()
        .defaultTo('pending')
      table.text('admin_notes').nullable()
      table.timestamp('processed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status', 'created_at'])
      table.index(['user_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable('payout_requests')
    this.schema.dropTable('wallet_transactions')
    this.schema.dropTable('wallets')
  }
}
