import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import crypto from 'node:crypto'

export type NotificationType = 'sale' | 'review' | 'message' | 'system'

export default class Notification extends BaseModel {
  static table = 'notifications'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare userId: number

  @column()
  declare type: NotificationType

  @column()
  declare title: string

  @column()
  declare message: string | null

  @column()
  declare icon: string | null

  @column()
  declare data: any | null

  @column()
  declare isRead: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column()
  declare actionUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async generateUuid(notification: Notification) {
    if (!notification.uuid) {
      notification.uuid = crypto.randomUUID()
    }
  }

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  /**
   * Mark notification as read
   */
  markAsRead() {
    this.isRead = true
    this.readAt = DateTime.now()
  }

  /**
   * Create and save a notification for a user
   */
  static async createNotification(options: {
    userId: number
    type: NotificationType
    title: string
    message?: string | null
    icon?: string | null
    data?: any | null
    actionUrl?: string | null
  }) {
    return await this.create({
      userId: options.userId,
      type: options.type,
      title: options.title,
      message: options.message || null,
      icon: options.icon || null,
      data: options.data || null,
      actionUrl: options.actionUrl || null,
    })
  }
}
