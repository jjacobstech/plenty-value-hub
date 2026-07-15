import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('slug').nullable()
      table.text('excerpt').nullable()
      table.text('content').nullable()
      table.string('featured_image_url').nullable()
      table.string('category').nullable()
      table.json('tags').nullable()
      table.string('author_name').nullable()
      table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft')
      table.string('seo_title').nullable()
      table.text('seo_description').nullable()
      table.integer('read_time_minutes').defaultTo(1)
      table.integer('view_count').defaultTo(0)
      table.timestamp('published_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
