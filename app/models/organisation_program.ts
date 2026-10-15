import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organisation from '#models/organisation'

export default class OrganisationProgram extends BaseModel {
  static table = 'organisation_programs'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'attribution_window_days' })
  declare attributionWindowDays: number

  @column({ columnName: 'attribution_model' })
  declare attributionModel: 'last_click' | 'first_click'

  @column({ columnName: 'allowed_event_types', prepare: (v: string[]) => JSON.stringify(v) })
  declare allowedEventTypes: string[]

  @column({ columnName: 'commission_mode' })
  declare commissionMode: 'none' | 'flat' | 'percent'

  @column({ columnName: 'commission_flat_amount' })
  declare commissionFlatAmount: number | null

  @column({ columnName: 'commission_percent_bps' })
  declare commissionPercentBps: number | null

  @column({ columnName: 'commission_currency' })
  declare commissionCurrency: string | null

  @column({ columnName: 'commission_hold_days' })
  declare commissionHoldDays: number

  @column({ columnName: 'auto_approve_after_hold' })
  declare autoApproveAfterHold: boolean

  @column({ columnName: 'self_referral_blocked' })
  declare selfReferralBlocked: boolean

  @column({ columnName: 'dedupe_unique_click_minutes' })
  declare dedupeUniqueClickMinutes: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organisation)
  declare organisation: BelongsTo<typeof Organisation>
}
