import { test } from '@japa/runner'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import { PortalClient, PASSWORD, makeUser } from '#tests/helpers/portal'

const PUBLIC_PAGES = ['/', '/marketplace', '/reviews', '/for-partners', '/privacy', '/track-order']
const ADMIN_PAGES = [
  '/admin', '/admin/users', '/admin/products', '/admin/orders', '/admin/analytics', '/admin/subscribers',
  '/admin/blog', '/admin/newsletters', '/admin/newsletter', '/admin/email-campaigns', '/admin/conversions',
  '/admin/hero-banner', '/admin/payment-settings', '/admin/payouts', '/admin/disputes', '/admin/fraud-detection',
]
const VENDOR_PAGES = [
  '/vendor', '/vendor/products', '/vendor/orders', '/vendor/kyc', '/vendor/earnings', '/vendor/analytics',
  '/vendor/profile', '/vendor/integrations',
]
const AFFILIATE_PAGES = [
  '/affiliate', '/affiliate/products', '/affiliate/campaigns/discover', '/affiliate/links', '/affiliate/earnings',
  '/affiliate/performance', '/affiliate/profile',
]

/**
 * Renders every page the pages controller serves, signed in as each role. A page passes when it
 * returns 200 and the Inertia page data names a component. This catches props that do not match
 * what the page expects.
 */
test.group('pages render', (group) => {
  group.each.setup(() => limiter.clear())
  const users: User[] = []
  group.each.teardown(async () => {
    for (const user of users.splice(0)) await user.delete()
  })

  test('public pages render', async ({ assert }) => {
    const client = new PortalClient()
    for (const path of PUBLIC_PAGES) {
      const res = await client.inertia('GET', path)
      assert.equal(res.status, 200, path)
    }
  })

  for (const [role, pages] of [
    ['admin', ADMIN_PAGES],
    ['vendor', VENDOR_PAGES],
    ['affiliate', AFFILIATE_PAGES],
  ] as const) {
    test(`${role} pages render for a signed-in ${role}`, async ({ assert }) => {
      const user = await makeUser(role)
      users.push(user)
      const client = new PortalClient()
      assert.equal(await client.login(user.email, PASSWORD), 302)
      for (const path of pages) {
        const res = await client.inertia('GET', path)
        assert.equal(res.status, 200, `${role} ${path}`)
        assert.isString(res.json?.component, `${role} ${path} has no page component`)
      }
    })
  }
})
