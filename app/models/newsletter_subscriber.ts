import { NewsletterSubscriberSchema } from '#database/schema'
import { column, beforeSave } from '@adonisjs/lucid/orm'
import crypto from 'node:crypto'

export default class NewsletterSubscriber extends NewsletterSubscriberSchema {
  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: NewsletterSubscriber) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }
}
