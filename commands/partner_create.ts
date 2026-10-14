import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class PartnerCreate extends BaseCommand {
  static commandName = 'partner:create'
  static description = 'Create a partner with an owner, test and live programs, and test and live API keys'

  static options: CommandOptions = { startApp: true }

  @flags.string({ description: 'Partner name' })
  declare name: string

  @args.string({ description: 'Owner email (must match an existing user)' })
  declare ownerEmail: string

  @flags.array({ description: 'Allowed redirect domains', alias: 'd' })
  declare domains: string[]

  async run() {
    const { default: User } = await import('#models/user')
    const { default: Partner } = await import('#models/partner')
    const { default: PartnerMember } = await import('#models/partner_member')
    const { default: PartnerProgram } = await import('#models/partner_program')
    const { default: ApiKeyService } = await import('#services/partner/api_key_service')
    const { publicId } = await import('#services/partner/public_id')
    const db = (await import('@adonisjs/lucid/services/db')).default

    if (!this.name || !this.ownerEmail) {
      this.logger.error('Usage: node ace partner:create <owner-email> --name "Partner name" [--domains example.com]')
      this.exitCode = 1
      return
    }

    const owner = await User.findBy('email', this.ownerEmail)
    if (!owner) {
      this.logger.error(`No user with email ${this.ownerEmail}. Create the user first.`)
      this.exitCode = 1
      return
    }

    const keys = await db.transaction(async (trx) => {
      const partner = await Partner.create(
        {
          publicId: publicId('ptn_'),
          name: this.name,
          status: 'active',
          contactEmail: this.ownerEmail,
          allowedRedirectDomains: this.domains ?? [],
          clickIdParam: 'pv_click_id',
        },
        { client: trx }
      )
      await PartnerMember.create({ partnerId: partner.id, userId: owner.id, role: 'owner' }, { client: trx })
      await PartnerProgram.create({ partnerId: partner.id, livemode: false }, { client: trx })
      await PartnerProgram.create({ partnerId: partner.id, livemode: true }, { client: trx })
      const test = await ApiKeyService.create(partner.id, false, 'Test key', trx)
      const live = await ApiKeyService.create(partner.id, true, 'Live key', trx)
      this.logger.success(`Created partner ${partner.publicId} (${this.name})`)
      return { test: test.secret, live: live.secret }
    })

    // Secrets are printed once and never stored.
    this.logger.info(`Test secret key: ${keys.test}`)
    this.logger.info(`Live secret key: ${keys.live}`)
    this.logger.warning('Store these keys now. They cannot be shown again.')
  }
}
