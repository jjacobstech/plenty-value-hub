import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OrganisationPrune extends BaseCommand {
  static commandName = 'organisation:prune'
  static description = 'Delete expired idempotency keys (24h) and webhook deliveries older than 30 days'

  static options: CommandOptions = { startApp: true }

  async run() {
    const { prune } = await import('#services/organisation/maintenance')
    const removed = await prune()
    this.logger.success(`Removed ${removed.idempotencyKeys} idempotency key(s) and ${removed.deliveries} delivery(ies).`)
  }
}
