import { test } from '@japa/runner'
import limiter from '@adonisjs/limiter/services/main'
import Organisation from '#models/organisation'
import OrganisationMember from '#models/organisation_member'
import OrganisationProgram from '#models/organisation_program'
import User from '#models/user'
import { createOrganisation } from '#services/organisation/provisioning'
import { api } from '#tests/helpers/organisation_api'
import { PortalClient, PASSWORD, makeUser } from '#tests/helpers/portal'

test.group('organisation portal', (group) => {
  const organisations: Organisation[] = []
  const users: User[] = []
  // Sign-in is throttled to 10 attempts per IP per 15 minutes, so each test starts with clean counters.
  group.each.setup(() => limiter.clear())
  group.each.teardown(async () => {
    for (const organisation of organisations.splice(0)) await organisation.delete()
    for (const user of users.splice(0)) await user.delete()
  })

  /** Signs in as a member with `role` of a new organisation (owned by someone else), or as its owner. */
  async function signedIn(role: 'owner' | 'admin' | 'developer' | 'viewer' | 'none') {
    const owner = await makeUser()
    users.push(owner)
    const { organisation } = await createOrganisation({ name: `Portal ${role}`, ownerEmail: owner.email })
    organisations.push(organisation)
    let user = owner
    if (role !== 'owner') {
      user = await makeUser()
      users.push(user)
      if (role !== 'none') await OrganisationMember.create({ organisationId: organisation.id, userId: user.id, role })
    }
    const client = new PortalClient()
    await client.login(user.email, PASSWORD)
    return { client, organisation, user }
  }

  test('signed out visitors are sent to log in', async ({ assert }) => {
    const res = await new PortalClient().get('/organisation')
    assert.oneOf(res.status, [301, 302, 303])
    assert.include(res.location ?? '', 'login')
  })

  test('a signed-in user who is not a member gets 404', async ({ assert }) => {
    const { client } = await signedIn('none')
    const res = await client.inertia('GET', '/organisation')
    assert.equal(res.status, 404, `redirected to ${res.location}`)
  })

  test('a signed-in user can open an organisation, becomes its owner, and lands on the portal', async ({
    assert,
  }) => {
    const user = await makeUser()
    users.push(user)
    const client = new PortalClient()
    await client.login(user.email, PASSWORD)

    const bad = await client.inertia('POST', '/organisation/new', { name: 'A' })
    assert.notInclude(bad.location ?? '', '/organisation', 'a one-letter name must not create a partner')

    const created = await client.inertia('POST', '/organisation/new', {
      name: 'Self Serve Co',
      domains: 'Shop.Example.com',
    })
    assert.equal(created.status, 302)
    assert.equal(created.location, '/organisation')
    const membership = await OrganisationMember.query()
      .where('user_id', user.id)
      .preload('organisation')
      .firstOrFail()
    organisations.push(membership.organisation)
    assert.equal(membership.role, 'owner')
    assert.deepEqual(membership.organisation.allowedRedirectDomains, ['shop.example.com'])

    const home = await client.inertia('GET', '/organisation')
    assert.equal(home.status, 200)
    assert.equal(home.json!.props.role, 'owner')
  })

  test('the owner sees the overview with 30-day totals', async ({ assert }) => {
    const { client } = await signedIn('owner')
    const res = await client.inertia('GET', '/organisation')
    assert.equal(res.status, 200)
    assert.equal(res.json!.component, 'organisation/Overview')
    assert.equal(res.json!.props.role, 'owner')
    assert.equal(res.json!.props.livemode, false)
    assert.equal(res.json!.props.totals.clicks, 0)
  })

  test('a viewer can read but cannot create a key', async ({ assert }) => {
    const { client } = await signedIn('viewer')
    assert.equal((await client.inertia('GET', '/organisation/keys')).status, 200)
    const res = await client.inertia('POST', '/organisation/keys', { name: 'Should fail' })
    assert.equal(res.status, 403)
  })

  test('a developer creates a key in the portal and the key works on /api/v1/organisations', async ({ assert }) => {
    const { client } = await signedIn('developer')
    const res = await client.inertia('POST', '/organisation/keys', { name: 'Build server' })
    assert.equal(res.status, 200)
    const secret = res.json!.props.newSecret as string
    assert.match(secret, /^pv_test_sk_[0-9A-Za-z]{32}$/)
    const ping = await api('GET', '/api/v1/organisations/ping', secret)
    assert.equal(ping.status, 200)
    assert.isFalse(ping.body.livemode)
  })

  test('switching to live mode is stored in the session', async ({ assert }) => {
    const { client } = await signedIn('owner')
    await client.inertia('POST', '/organisation/mode', { mode: 'live' })
    const res = await client.inertia('GET', '/organisation')
    assert.isTrue(res.json!.props.livemode)
  })

  test('a developer adds a webhook endpoint and gets the signing secret once', async ({ assert }) => {
    const { client } = await signedIn('developer')
    const res = await client.inertia('POST', '/organisation/webhooks', { url: 'http://127.0.0.1:9/hook', events: 'commission.approved' })
    assert.equal(res.status, 200)
    assert.match(res.json!.props.newSecret, /^whsec_/)
    assert.lengthOf(res.json!.props.endpoints, 1)
    assert.deepEqual(res.json!.props.endpoints[0].events, ['commission.approved'])
  })

  test('a viewer cannot change the program, an admin can', async ({ assert }) => {
    const programForm = {
      attribution_window_days: '45', attribution_model: 'first_click', allowed_event_types: 'registration, purchase', commission_mode: 'flat',
      commission_flat_amount: '500', commission_currency: 'usd', commission_hold_days: '7', auto_approve_after_hold: 'false', self_referral_blocked: 'true',
      dedupe_unique_click_minutes: '15', allowed_redirect_domains: 'example.com', click_id_param: 'pv_click_id',
    }
    const viewer = await signedIn('viewer')
    assert.equal((await viewer.client.inertia('POST', '/organisation/program', programForm)).status, 403)

    const admin = await signedIn('admin')
    assert.equal((await admin.client.inertia('POST', '/organisation/program', programForm)).status, 302)
    const program = await OrganisationProgram.query().where('organisation_id', admin.organisation.id).where('livemode', false).firstOrFail()
    assert.equal(program.attributionWindowDays, 45)
    assert.equal(program.attributionModel, 'first_click')
    assert.deepEqual(program.allowedEventTypes, ['registration', 'purchase'])
    assert.equal(program.commissionFlatAmount, 500)
    assert.equal(program.commissionCurrency, 'USD')
    assert.isFalse(program.autoApproveAfterHold)
  })

  test('the owner invites an existing account, and an unknown email is refused', async ({ assert }) => {
    const { client, organisation } = await signedIn('owner')
    const invitee = await makeUser()
    users.push(invitee)
    const ok = await client.inertia('POST', '/organisation/team/invite', { email: invitee.email, role: 'viewer' })
    assert.equal(ok.status, 302)
    const member = await OrganisationMember.query().where('organisation_id', organisation.id).where('user_id', invitee.id).first()
    assert.equal(member?.role, 'viewer')

    const unknown = await client.inertia('POST', '/organisation/team/invite', { email: 'nobody-here@example.com', role: 'viewer' })
    assert.equal(unknown.status, 404)
  })

  test('the admin organisation area is closed to non-admins', async ({ assert }) => {
    const { client } = await signedIn('owner')
    const res = await client.get('/admin/organisations')
    assert.oneOf(res.status, [301, 302, 303, 403])
  })

  test('an admin creates, suspends and reactivates an organisation, and a suspended organisation is refused', async ({ assert }) => {
    const admin = await makeUser('admin')
    users.push(admin)
    const owner = await makeUser()
    users.push(owner)
    const client = new PortalClient()
    assert.equal(await client.login(admin.email, PASSWORD), 302)

    const list = await client.inertia('GET', '/admin/organisations')
    assert.equal(list.status, 200)
    assert.equal(list.json!.component, 'admin/AdminOrganisations')

    const created = await client.inertia('POST', '/admin/organisations', { name: 'Admin made partner', owner_email: owner.email, domains: 'example.com' })
    assert.equal(created.status, 302)
    const organisation = await Organisation.query().where('name', 'Admin made partner').firstOrFail()
    organisations.push(organisation)
    assert.equal(organisation.status, 'active')

    // The owner can open the portal, create a key, and use it.
    const ownerClient = new PortalClient()
    await ownerClient.login(owner.email, PASSWORD)
    const key = await ownerClient.inertia('POST', '/organisation/keys', { name: 'Ops' })
    const secret = key.json!.props.newSecret as string
    assert.equal((await api('GET', '/api/v1/organisations/ping', secret)).status, 200)

    await client.inertia('POST', `/admin/organisations/${organisation.publicId}/suspend`)
    await organisation.refresh()
    assert.equal(organisation.status, 'suspended')
    const refused = await api('GET', '/api/v1/organisations/ping', secret)
    assert.equal(refused.status, 403)
    assert.equal(refused.body.error.code, 'organisation_suspended')

    await client.inertia('POST', `/admin/organisations/${organisation.publicId}/reactivate`)
    await organisation.refresh()
    assert.equal(organisation.status, 'active')
  })
})
