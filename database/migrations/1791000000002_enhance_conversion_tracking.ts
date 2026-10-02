import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.table(this.tableName, (table) => {
      // Conversion tracking status
      table.enum('conversion_status', [
        'pending',
        'approved',
        'rejected',
        'reversed',
        'disputed'
      ]).defaultTo('pending')

      // Conversion validation
      table.boolean('conversion_verified').defaultTo(false)
      table.dateTime('conversion_verified_at').nullable()
      table.string('conversion_verification_method').nullable()

      // Conversion reversal
      table.boolean('is_reversed').defaultTo(false)
      table.dateTime('reversed_at').nullable()
      table.string('reversal_reason').nullable()

      // Dispute tracking
      table.boolean('is_disputed').defaultTo(false)
      table.dateTime('disputed_at').nullable()
      table.string('dispute_reason').nullable()

      // Attribution tracking
      table.integer('attribution_window_days').defaultTo(30)
      table.dateTime('attribution_expires_at').nullable()

      // Validation metadata
      table.json('conversion_validation_metadata').nullable()
    })

    // Also enhance vendor_conversions table
    this.schema.table('vendor_conversions', (table) => {
      // Add conversion verification fields
      table.boolean('conversion_verified').defaultTo(false)
      table.dateTime('conversion_verified_at').nullable()

      // Add attribution expiration
      table.dateTime('attribution_expires_at').nullable()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('conversion_status')
      table.dropColumn('conversion_verified')
      table.dropColumn('conversion_verified_at')
      table.dropColumn('conversion_verification_method')
      table.dropColumn('is_reversed')
      table.dropColumn('reversed_at')
      table.dropColumn('reversal_reason')
      table.dropColumn('is_disputed')
      table.dropColumn('disputed_at')
      table.dropColumn('dispute_reason')
      table.dropColumn('attribution_window_days')
      table.dropColumn('attribution_expires_at')
      table.dropColumn('conversion_validation_metadata')
    })

    this.schema.table('vendor_conversions', (table) => {
      table.dropColumn('conversion_verified')
      table.dropColumn('conversion_verified_at')
      table.dropColumn('attribution_expires_at')
    })
  }
}
