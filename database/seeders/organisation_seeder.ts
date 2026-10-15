import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Organisation from '#models/organisation'
import User from '#models/user'
import { createOrganisation } from '#services/organisation/provisioning'

const OWNER_EMAIL = 'demo.partner@example.com'
const ORGANISATION_NAME = 'Demo Organisation'

/** Local development only: a demo organisation owned by a verified account, with one test key printed once. */
export default class extends BaseSeeder {
  async run() {
    if (await Organisation.findBy('name', ORGANISATION_NAME)) return

    if (!(await User.findBy('email', OWNER_EMAIL))) {
      await User.create({
        email: OWNER_EMAIL,
        password: 'Demo-partner-1',
        fullName: 'Demo Organisation Owner',
        role: 'consumer',
        status: 'active',
        emailVerifiedAt: DateTime.now(),
      })
    }

    const { keys } = await createOrganisation({
      name: ORGANISATION_NAME,
      ownerEmail: OWNER_EMAIL,
      domains: ['shop.example.com'],
      withKeys: true,
    })
    console.log(`Seeded "${ORGANISATION_NAME}" (owner ${OWNER_EMAIL}, password Demo-partner-1)`)
    console.log(`Test secret key (shown once): ${keys?.test}`)
  }
}
