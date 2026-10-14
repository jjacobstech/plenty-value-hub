import db from '@adonisjs/lucid/services/db'
import PartnerApiException from '#exceptions/partner_api_exception'
import Partner from '#models/partner'
import PartnerMember from '#models/partner_member'
import PartnerProgram from '#models/partner_program'
import User from '#models/user'
import ApiKeyService from '#services/partner/api_key_service'
import { publicId } from '#services/partner/public_id'

/**
 * Creates a partner with its owner membership and test and live programs. Keys are optional:
 * the command creates them and prints them once, while the admin screen leaves them to the owner.
 */
export async function createPartner(input: { name: string; ownerEmail: string; domains?: string[]; withKeys?: boolean }) {
  const owner = await User.findBy('email', input.ownerEmail)
  if (!owner) {
    throw new PartnerApiException(`No user with email ${input.ownerEmail}. Create the user first.`, 'invalid_request_error', 'resource_missing', 404, 'owner_email')
  }
  return db.transaction(async (trx) => {
    const partner = await Partner.create(
      {
        publicId: publicId('ptn_'),
        name: input.name,
        status: 'active',
        contactEmail: input.ownerEmail,
        allowedRedirectDomains: input.domains ?? [],
        clickIdParam: 'pv_click_id',
      },
      { client: trx }
    )
    await PartnerMember.create({ partnerId: partner.id, userId: owner.id, role: 'owner' }, { client: trx })
    await PartnerProgram.create({ partnerId: partner.id, livemode: false }, { client: trx })
    await PartnerProgram.create({ partnerId: partner.id, livemode: true }, { client: trx })
    if (!input.withKeys) return { partner, keys: null }
    const test = await ApiKeyService.create(partner.id, false, 'Test key', trx)
    const live = await ApiKeyService.create(partner.id, true, 'Live key', trx)
    return { partner, keys: { test: test.secret, live: live.secret } }
  })
}
