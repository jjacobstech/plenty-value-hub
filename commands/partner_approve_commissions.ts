import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class PartnerApproveCommissions extends BaseCommand {
  static commandName = 'partner:approve-commissions'
  static description = 'Approve pending commissions whose hold has ended (also runs every 10 minutes from partner:worker)'

  static options: CommandOptions = { startApp: true }

  async run() {
    const { approveDueCommissions } = await import('#services/partner/commission_service')
    const count = await approveDueCommissions()
    this.logger.success(`Approved ${count} commission(s).`)
  }
}
