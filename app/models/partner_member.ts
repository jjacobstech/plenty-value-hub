import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Partner from '#models/partner'
import User from '#models/user'

export default class PartnerMember extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'partner_id' })
  declare partnerId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column()
  declare role: 'owner' | 'admin' | 'developer' | 'viewer'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Partner)
  declare partner: BelongsTo<typeof Partner>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
