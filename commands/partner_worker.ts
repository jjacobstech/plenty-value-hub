import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class PartnerWorker extends BaseCommand {
  static commandName = 'partner:worker'
  static description = 'Run the partner job worker (BullMQ) and register the recurring jobs'

  static options: CommandOptions = { startApp: true, staysAlive: true }

  async run() {
    const { scheduleRecurringJobs, startWorker } = await import('#services/partner/jobs')
    await scheduleRecurringJobs()
    const worker = startWorker()
    this.logger.info('Partner worker running. Ctrl+C to stop.')

    const stop = async () => {
      await worker.close()
      process.exit(0)
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  }
}
