import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

export default class BlogPost extends BaseModel {
  static table = 'blog_posts'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: BlogPost) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @column()
  declare title: string

  @column()
  declare slug: string | null

  @column()
  declare excerpt: string | null

  @column()
  declare content: string | null

  @column()
  declare featuredImageUrl: string | null

  @column()
  declare category: string | null

  @column()
  declare tags: any | null

  @column()
  declare authorName: string | null

  @column()
  declare status: 'draft' | 'published' | 'archived'

  @column()
  declare seoTitle: string | null

  @column()
  declare seoDescription: string | null

  @column()
  declare readTimeMinutes: number

  @column()
  declare viewCount: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
