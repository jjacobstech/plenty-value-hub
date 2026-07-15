import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Newsletter extends BaseModel {
  static table = 'newsletters'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare subject: string

  @column()
  declare category: string | null

  @column()
  declare content: string | null

  @column()
  declare status: 'draft' | 'sent' | 'archived'

  @column()
  declare recipientsCount: number

  @column()
  declare openCount: number

  @column()
  declare clickCount: number

  @column()
  declare revenueGenerated: number

  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
