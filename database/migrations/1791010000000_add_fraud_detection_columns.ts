import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vendor_conversions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('fraud_risk_level', ['low', 'medium', 'high', 'critical'])
        .defaultTo('low')
        .after('fraud_flags')

      table
        .integer('fraud_score')
        .defaultTo(0)
        .after('fraud_risk_level')

      table
        .boolean('is_fraud_flagged')
        .defaultTo(false)
        .after('fraud_score')

      table
        .string('ip_address')
        .nullable()
        .after('is_fraud_flagged')

      table
        .string('device_id')
        .nullable()
        .after('ip_address')

      table
        .string('user_agent')
        .nullable()
        .after('device_id')

      table
        .timestamp('fraud_review_at')
        .nullable()
        .after('user_agent')

      table
        .integer('reviewed_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .after('fraud_review_at')

      table
        .string('fraud_review_notes')
        .nullable()
        .after('reviewed_by')

      table.index('fraud_risk_level')
      table.index('is_fraud_flagged')
      table.index('fraud_score')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('fraud_flags')
      table.dropColumn('fraud_risk_level')
      table.dropColumn('fraud_score')
      table.dropColumn('is_fraud_flagged')
      table.dropColumn('ip_address')
      table.dropColumn('device_id')
      table.dropColumn('user_agent')
      table.dropColumn('fraud_review_at')
      table.dropColumn('reviewed_by')
      table.dropColumn('fraud_review_notes')
    })
  }
}
