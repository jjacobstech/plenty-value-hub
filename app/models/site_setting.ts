import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

export default class SiteSetting extends BaseModel {
  static table = 'site_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: SiteSetting) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @column()
  declare key: string

  @column()
  declare label: string | null

  @column()
  declare value: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
