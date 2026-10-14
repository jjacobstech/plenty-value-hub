import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class PartnerDeliverWebhooks extends BaseCommand {
  static commandName = 'partner:deliver-webhooks'
  static description = 'Send due partner webhook deliveries and schedule retries (also runs every minute from partner:worker)'

  static options: CommandOptions = { startApp: true }

  async run() {
    const { deliverDue } = await import('#services/partner/webhook_delivery_service')
    const count = await deliverDue()
    this.logger.success(`Attempted ${count} delivery(ies).`)
  }
}
