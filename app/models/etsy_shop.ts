import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate, beforeUpdate, afterFetch, afterFind } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { encrypt, decrypt } from '#services/encryption_service'
import User from '#models/user'

export default class EtsyShop extends BaseModel {
  static table = 'etsy_shops'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare vendorId: number

  @column()
  declare shopId: string

  @column()
  declare shopName: string

  @column()
  declare shopUrl: string

  @column()
  declare accessToken: string

  @column()
  declare refreshToken: string | null

  @column()
  declare tokenType: string

  @column()
  declare expiresIn: number | null

  @column()
  declare scopes: Record<string, any>

  @column()
  declare isConnected: boolean

  @column()
  declare connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'

  @column.dateTime()
  declare lastSyncAt: DateTime | null

  @column.dateTime()
  declare lastListingsSyncAt: DateTime | null

  @column.dateTime()
  declare lastOrdersSyncAt: DateTime | null

  @column()
  declare syncFrequency: number

  @column()
  declare autoSync: boolean

  @column()
  declare totalListings: number

  @column()
  declare totalOrders: number

  @column()
  declare totalRevenue: number

  @column()
  declare currency: string

  @column()
  declare shopResponseTimeMinutes: number | null

  @column()
  declare shopRating: number | null

  @column()
  declare followers: number

  @column()
  declare shopSettings: Record<string, any> | null

  @column()
  declare errorLog: Record<string, any> | null

  @column.dateTime()
  declare lastErrorAt: DateTime | null

  @column()
  declare lastErrorMessage: string | null

  @column.dateTime()
  declare connectedAt: DateTime | null

  @column.dateTime()
  declare disconnectedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'vendorId',
  })
  declare vendor: BelongsTo<typeof User>

  @beforeCreate()
  static encryptTokensOnCreate(model: EtsyShop) {
    if (model.accessToken) {
      model.accessToken = encrypt(model.accessToken)
    }
    if (model.refreshToken) {
      model.refreshToken = encrypt(model.refreshToken)
    }
  }

  @beforeUpdate()
  static encryptTokensOnUpdate(model: EtsyShop) {
    if (model.isDirty('accessToken') && model.accessToken) {
      model.accessToken = encrypt(model.accessToken)
    }
    if (model.isDirty('refreshToken') && model.refreshToken) {
      model.refreshToken = encrypt(model.refreshToken)
    }
  }

  @afterFetch()
  @afterFind()
  static decryptTokens(model: EtsyShop) {
    try {
      if (model.accessToken && model.accessToken.includes(':')) {
        model.accessToken = decrypt(model.accessToken)
      }
    } catch (error) {
      console.error('[EtsyShop] Failed to decrypt accessToken:', error)
    }

    try {
      if (model.refreshToken && model.refreshToken.includes(':')) {
        model.refreshToken = decrypt(model.refreshToken)
      }
    } catch (error) {
      console.error('[EtsyShop] Failed to decrypt refreshToken:', error)
    }
  }
}
