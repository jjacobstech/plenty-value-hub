import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OrganisationApproveCommissions extends BaseCommand {
  static commandName = 'organisation:approve-commissions'
  static description = 'Approve pending commissions whose hold has ended (also runs every 10 minutes from partner:worker)'

  static options: CommandOptions = { startApp: true }

  async run() {
    const { approveDueCommissions } = await import('#services/organisation/commission_service')
    const count = await approveDueCommissions()
    this.logger.success(`Approved ${count} commission(s).`)
  }
}
