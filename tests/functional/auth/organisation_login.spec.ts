import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import OrganisationMember from '#models/organisation_member'
import User from '#models/user'
import { createOrganisation } from '#services/organisation/provisioning'
import { PortalClient, PASSWORD } from '#tests/helpers/portal'

test.group('login redirects', (group) => {
  // limiter.clear() does not reset the database store, so drop this IP's sign-in counter directly.
  group.each.setup(async () => {
    await db.from('rate_limits').where('key', 'like', 'rlflx:auth%').delete()
  })

  async function consumer() {
    const email = `login_${crypto.randomUUID().slice(0, 8)}@example.com`
    return User.create({
      email,
      password: PASSWORD,
      fullName: 'Login Tester',
      role: 'consumer',
      status: 'active',
      emailVerifiedAt: DateTime.now(),
    })
  }

  test('a consumer who belongs to an organisation lands on the organisation portal', async ({ assert }) => {
    const user = await consumer()
    const { organisation } = await createOrganisation({ name: 'Login Organisation', ownerEmail: user.email })
    try {
      const client = new PortalClient()
      await client.get('/auth/login')
      const res = await client.inertia('POST', '/auth/login', {
        email: user.email,
        password: PASSWORD,
      })
      assert.equal(res.location, '/organisation')
    } finally {
      await organisation.delete()
      await user.delete()
    }
  })

  test('a consumer with no organisation membership still lands on the marketplace', async ({
    assert,
  }) => {
    const user = await consumer()
    try {
      const client = new PortalClient()
      await client.get('/auth/login')
      const res = await client.inertia('POST', '/auth/login', {
        email: user.email,
        password: PASSWORD,
      })
      assert.equal(res.location, '/marketplace')
    } finally {
      await OrganisationMember.query().where('user_id', user.id).delete()
      await user.delete()
    }
  })
})
