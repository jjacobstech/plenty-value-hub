import db from '@adonisjs/lucid/services/db'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import Organisation from '#models/organisation'
import OrganisationMember from '#models/organisation_member'
import OrganisationProgram from '#models/organisation_program'
import User from '#models/user'
import ApiKeyService from '#services/organisation/api_key_service'
import { publicId } from '#services/organisation/public_id'

/**
 * Creates an organisation with its owner membership and test and live programs. Keys are optional:
 * the command creates them and prints them once, while the admin screen leaves them to the owner.
 */
export async function createOrganisation(input: { name: string; ownerEmail: string; domains?: string[]; withKeys?: boolean }) {
  const owner = await User.findBy('email', input.ownerEmail)
  if (!owner) {
    throw new OrganisationApiException(`No user with email ${input.ownerEmail}. Create the user first.`, 'invalid_request_error', 'resource_missing', 404, 'owner_email')
  }
  return db.transaction(async (trx) => {
    const organisation = await Organisation.create(
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
    await OrganisationMember.create({ publicId: publicId('mem_'), organisationId: organisation.id, userId: owner.id, role: 'owner' }, { client: trx })
    await OrganisationProgram.create({ organisationId: organisation.id, livemode: false }, { client: trx })
    await OrganisationProgram.create({ organisationId: organisation.id, livemode: true }, { client: trx })
    if (!input.withKeys) return { organisation, keys: null }
    const test = await ApiKeyService.create(organisation.id, false, 'Test key', trx)
    const live = await ApiKeyService.create(organisation.id, true, 'Live key', trx)
    return { organisation, keys: { test: test.secret, live: live.secret } }
  })
}
