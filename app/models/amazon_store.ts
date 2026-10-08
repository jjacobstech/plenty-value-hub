import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate, beforeUpdate, afterFetch, afterFind } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { encrypt, decrypt } from '#services/encryption_service'
import User from '#models/user'

export default class AmazonStore extends BaseModel {
  static table = 'amazon_stores'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare vendorId: number

  @column()
  declare sellerId: string

  @column()
  declare accessToken: string

  @column()
  declare refreshToken: string | null

  @column()
  declare region: string

  @column()
  declare scopes: Record<string, any>

  @column()
  declare isConnected: boolean

  @column()
  declare connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'

  @column.dateTime()
  declare lastSyncAt: DateTime | null

  @column.dateTime()
  declare lastCampaignsSyncAt: DateTime | null

  @column()
  declare syncFrequency: number

  @column()
  declare autoSync: boolean

  @column()
  declare totalCampaigns: number

  @column()
  declare totalAdSpend: number

  @column()
  declare totalSales: number

  @column()
  declare currency: string

  @column()
  declare storeSettings: Record<string, any> | null

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
  static encryptTokensOnCreate(model: AmazonStore) {
    if (model.accessToken) {
      model.accessToken = encrypt(model.accessToken)
    }
    if (model.refreshToken) {
      model.refreshToken = encrypt(model.refreshToken)
    }
  }

  @beforeUpdate()
  static encryptTokensOnUpdate(model: AmazonStore) {
    if (model.isDirty('accessToken') && model.accessToken) {
      model.accessToken = encrypt(model.accessToken)
    }
    if (model.isDirty('refreshToken') && model.refreshToken) {
      model.refreshToken = encrypt(model.refreshToken)
    }
  }

  @afterFetch()
  @afterFind()
  static decryptTokens(model: AmazonStore) {
    try {
      if (model.accessToken && model.accessToken.includes(':')) {
        model.accessToken = decrypt(model.accessToken)
      }
    } catch (error) {
      console.error('[AmazonStore] Failed to decrypt accessToken:', error)
    }

    try {
      if (model.refreshToken && model.refreshToken.includes(':')) {
        model.refreshToken = decrypt(model.refreshToken)
      }
    } catch (error) {
      console.error('[AmazonStore] Failed to decrypt refreshToken:', error)
    }
  }
}
