import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid').unique().notNullable()
      table.string('name').notNullable()
      table.string('slug').unique().nullable()
      table.text('description').nullable()
      table.text('terms_and_conditions').nullable()
      table.text('promotion_guidelines').nullable()

      // Campaign metadata
      table.integer('vendor_id').unsigned().references('id').inTable('users').notNullable()
      table.string('vendor_name').nullable()

      // Campaign dates
      table.dateTime('start_date').nullable()
      table.dateTime('end_date').nullable()

      // Commission configuration
      table.enum('commission_type', [
        'percentage',
        'fixed_amount',
        'lead_commission',
        'cost_per_acquisition',
        'tiered',
        'hybrid'
      ]).defaultTo('percentage')
      table.decimal('commission_value', 10, 2).notNullable()

      // For tiered commission - stored as JSON
      table.json('tiered_commission_structure').nullable()

      // For hybrid models
      table.decimal('fixed_fee', 10, 2).nullable()

      // Attribution settings
      table.integer('attribution_window_days').defaultTo(30)

      // Campaign status
      table.enum('status', [
        'draft',
        'pending_approval',
        'active',
        'paused',
        'expired',
        'rejected',
        'archived'
      ]).defaultTo('draft')

      // Tracking and metrics
      table.integer('total_clicks').defaultTo(0)
      table.integer('total_conversions').defaultTo(0)
      table.decimal('total_commission_paid', 12, 2).defaultTo(0)
      table.decimal('conversion_rate', 5, 2).nullable()
      table.decimal('average_commission_per_sale', 10, 2).nullable()

      // Featured/visibility
      table.boolean('is_featured').defaultTo(false)
      table.integer('visibility_rank').nullable()

      // Images and assets
      table.string('featured_image_url').nullable()
      table.json('gallery_urls').nullable()

      // Tags
      table.json('tags').nullable()

      // Category
      table.enum('category', [
        'health_fitness',
        'business_investing',
        'software_saas',
        'ecommerce',
        'education',
        'fashion',
        'beauty',
        'home_garden',
        'technology',
        'finance',
        'digital_services',
        'ai_tools',
        'productivity',
        'lifestyle'
      ]).notNullable()

      // Resources for affiliates
      table.json('affiliate_resources').nullable()

      // Approval tracking
      table.string('approval_notes').nullable()
      table.dateTime('approved_at').nullable()

      // Suspension/termination
      table.dateTime('suspended_at').nullable()
      table.string('suspension_reason').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
