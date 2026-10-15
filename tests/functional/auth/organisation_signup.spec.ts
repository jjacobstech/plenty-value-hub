import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { PortalClient, PASSWORD } from '#tests/helpers/portal'

test.group('organisation signup', (group) => {
  // limiter.clear() does not reset the database store, so drop this IP's signup counter directly.
  group.each.setup(async () => {
    await db.from('rate_limits').where('key', 'like', 'rlflx:signup%').delete()
  })

  test('a organisation signup becomes a consumer and is sent to open an organisation account after verifying', async ({
    assert,
  }) => {
    const email = `organisation_signup_${crypto.randomUUID().slice(0, 8)}@example.com`
    const client = new PortalClient()
    await client.get('/auth/signup')

    const created = await client.inertia('POST', '/auth/signup', {
      fullName: 'Organisation Founder',
      email,
      password: PASSWORD,
      passwordConfirmation: PASSWORD,
      role: 'consumer',
      organisation: 'true',
    })
    assert.equal(created.status, 302)

    const user = await User.findByOrFail('email', email)
    try {
      assert.equal(user.role, 'consumer')
      const verified = await client.inertia('POST', '/auth/signup/verify-otp', {
        otpCode: user.otpCode!,
      })
      assert.equal(verified.location, '/organisation/new')
    } finally {
      await user.delete()
    }
  })
})
