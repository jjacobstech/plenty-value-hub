import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

export default class EmailCampaign extends BaseModel {
  static table = 'email_campaigns'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: EmailCampaign) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @column()
  declare name: string

  @column()
  declare subject: string

  @column()
  declare content: string | null

  @column()
  declare campaignType: 'product_promo' | 'announcement' | 'buying_guide' | 'review' | 'offer'

  @column()
  declare audienceSegment: string | null

  @column()
  declare status: 'draft' | 'scheduled' | 'sent' | 'paused'

  @column()
  declare recipientsCount: number

  @column()
  declare openCount: number

  @column()
  declare clickCount: number

  @column()
  declare conversionCount: number

  @column()
  declare revenueGenerated: number

  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
