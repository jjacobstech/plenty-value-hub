import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('slug').nullable().unique()
      table.text('description').nullable()
      table.string('short_description').nullable()
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
        'lifestyle',
      ]).notNullable()
      table.enum('product_type', ['digital', 'physical', 'service']).notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.decimal('sale_price', 10, 2).nullable()
      table.decimal('commission_rate', 5, 2).notNullable()
      table.integer('vendor_id').unsigned().references('id').inTable('users')
      table.string('vendor_name').nullable()
      table.string('image_url').nullable()
      table.json('gallery_urls').nullable()
      table.enum('status', ['pending', 'approved', 'rejected', 'archived']).defaultTo('pending')
      table.integer('gravity_score').defaultTo(0)
      table.decimal('avg_earnings_per_sale', 10, 2).nullable()
      table.decimal('conversion_rate', 5, 2).nullable()
      table.decimal('refund_rate', 5, 2).nullable()
      table.integer('total_sales').defaultTo(0)
      table.decimal('total_revenue', 12, 2).defaultTo(0)
      table.decimal('rating', 3, 2).nullable()
      table.integer('review_count').defaultTo(0)
      table.boolean('is_featured').defaultTo(false)
      table.json('tags').nullable()
      table.json('affiliate_resources').nullable()
      table.boolean('recurring_billing').defaultTo(false)
      table.enum('billing_cycle', ['one_time', 'monthly', 'yearly']).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}