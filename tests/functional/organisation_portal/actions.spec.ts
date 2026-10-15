import { test } from '@japa/runner'
import limiter from '@adonisjs/limiter/services/main'
import Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationCommission from '#models/organisation_commission'
import OrganisationEvent from '#models/organisation_event'
import OrganisationMember from '#models/organisation_member'
import OrganisationProgram from '#models/organisation_program'
import User from '#models/user'
import ApiKeyService from '#services/organisation/api_key_service'
import { createEndpoint } from '#services/organisation/webhook_emitter'
import { createOrganisation } from '#services/organisation/provisioning'
import { api } from '#tests/helpers/organisation_api'
import { PortalClient, PASSWORD, makeUser } from '#tests/helpers/portal'

test.group('organisation portal actions', (group) => {
  const organisations: Organisation[] = []
  const users: User[] = []
  group.each.setup(() => limiter.clear())
  group.each.teardown(async () => {
    for (const organisation of organisations.splice(0)) await organisation.delete()
    for (const user of users.splice(0)) await user.delete()
  })

  /** Signs in as `role` of a new organisation. The owner is always a separate account. */
  async function signedIn(role: 'owner' | 'admin' | 'developer' | 'viewer') {
    const owner = await makeUser()
    users.push(owner)
    const { organisation } = await createOrganisation({ name: `Actions ${role}`, ownerEmail: owner.email })
    organisations.push(organisation)
    let user = owner
    if (role !== 'owner') {
      user = await makeUser()
      users.push(user)
      await OrganisationMember.create({ organisationId: organisation.id, userId: user.id, role })
    }
    const client = new PortalClient()
    await client.login(user.email, PASSWORD)
    return { client, organisation, user }
  }

  test('a developer revokes a key in the portal and the key stops working on the API', async ({
    assert,
  }) => {
    const { client, organisation } = await signedIn('developer')
    const { key, secret } = await ApiKeyService.create(organisation.id, false, 'to revoke')
    assert.equal((await api('GET', '/api/v1/organisations/ping', secret)).status, 200)

    const res = await client.inertia('POST', `/organisation/keys/${key.publicId}/revoke`)
    assert.equal(res.status, 302)
    await key.refresh()
    assert.isNotNull(key.revokedAt)

    const after = await api('GET', '/api/v1/organisations/ping', secret)
    assert.equal(after.status, 401)
    assert.equal(after.body.error.code, 'api_key_revoked')
  })

  test("an admin of one organisation cannot revoke another organisation's key (404)", async ({ assert }) => {
    const mine = await signedIn('admin')
    const theirs = await signedIn('owner')
    const { key } = await ApiKeyService.create(theirs.organisation.id, false, 'theirs')
    assert.equal((await mine.client.inertia('POST', `/organisation/keys//revoke`)).status, 404)
    await key.refresh()
    assert.isNull(key.revokedAt)
  })

  test('a viewer cannot revoke a key', async ({ assert }) => {
    const { client, organisation } = await signedIn('viewer')
    const { key } = await ApiKeyService.create(organisation.id, false, 'stays')
    assert.equal((await client.inertia('POST', `/organisation/keys/${key.publicId}/revoke`)).status, 403)
    await key.refresh()
    assert.isNull(key.revokedAt)
  })

  test('rotating a webhook secret returns a new one, and disable and enable toggle delivery', async ({
    assert,
  }) => {
    const { client, organisation } = await signedIn('developer')
    const { endpoint, secret: original } = await createEndpoint({
      organisationId: organisation.id,
      livemode: false,
      url: 'http://127.0.0.1:9/hook',
    })

    const rotated = await client.inertia('POST', `/organisation/webhooks/${endpoint.publicId}/rotate`)
    assert.equal(rotated.status, 200)
    assert.match(rotated.json!.props.newSecret, /^whsec_/)
    assert.notEqual(rotated.json!.props.newSecret, original)
    await endpoint.refresh()
    assert.isNotNull(endpoint.previousSecretExpiresAt)

    assert.equal(
      (await client.inertia('POST', `/organisation/webhooks/${endpoint.publicId}/disable`)).status,
      302
    )
    await endpoint.refresh()
    assert.equal(endpoint.status, 'disabled')

    assert.equal(
      (await client.inertia('POST', `/organisation/webhooks/${endpoint.publicId}/enable`)).status,
      302
    )
    await endpoint.refresh()
    assert.equal(endpoint.status, 'enabled')
    assert.isNull(endpoint.failingSince)
  })

  test('an admin suspends and reactivates an affiliate from the portal, and the API follows', async ({
    assert,
  }) => {
    const { client, organisation } = await signedIn('admin')
    const { secret } = await ApiKeyService.create(organisation.id, false, 'actions')
    const affiliate = (
      await api('POST', '/api/v1/organisations/affiliates', secret, {
        external_user_id: 'portal-suspend',
      })
    ).body

    assert.equal(
      (await client.inertia('POST', `/organisation/affiliates/${affiliate.id}/suspend`)).status,
      302
    )
    assert.equal(
      (await OrganisationAffiliate.findByOrFail('public_id', affiliate.id)).status,
      'suspended'
    )

    assert.equal(
      (await client.inertia('POST', `/organisation/affiliates/${affiliate.id}/reactivate`)).status,
      302
    )
    assert.equal((await OrganisationAffiliate.findByOrFail('public_id', affiliate.id)).status, 'active')
  })

  test('a developer cannot suspend affiliates', async ({ assert }) => {
    const { client, organisation } = await signedIn('developer')
    const { secret } = await ApiKeyService.create(organisation.id, false, 'dev')
    const affiliate = (
      await api('POST', '/api/v1/organisations/affiliates', secret, { external_user_id: 'dev-suspend' })
    ).body
    assert.equal(
      (await client.inertia('POST', `/organisation/affiliates/${affiliate.id}/suspend`)).status,
      403
    )
    assert.equal((await OrganisationAffiliate.findByOrFail('public_id', affiliate.id)).status, 'active')
  })

  test('an admin approves a commission and reverses its event from the portal', async ({
    assert,
  }) => {
    const { client, organisation } = await signedIn('admin')
    const { secret } = await ApiKeyService.create(organisation.id, false, 'commissions')
    await OrganisationProgram.query().where('organisation_id', organisation.id).where('livemode', false).update({
      commission_mode: 'flat',
      commission_flat_amount: 100,
      commission_currency: 'USD',
      commission_hold_days: 14,
      auto_approve_after_hold: false,
    })
    const affiliate = (
      await api('POST', '/api/v1/organisations/affiliates', secret, {
        external_user_id: 'portal-commission',
      })
    ).body
    const event = await api('POST', '/api/v1/organisations/events', secret, {
      event_id: `pc_${crypto.randomUUID()}`,
      type: 'registration',
      affiliate_id: affiliate.id,
    })
    assert.equal(event.status, 201)
    const commission = await OrganisationCommission.query()
      .where('event_id', (await OrganisationEvent.findByOrFail('public_id', event.body.id)).id)
      .firstOrFail()
    assert.equal(commission.status, 'pending')

    assert.equal(
      (await client.inertia('POST', `/organisation/commissions/${commission.publicId}/approve`)).status,
      302
    )
    await commission.refresh()
    assert.equal(commission.status, 'approved')

    assert.equal(
      (
        await client.inertia('POST', `/organisation/events/${event.body.id}/reverse`, {
          reason: 'refund',
        })
      ).status,
      302
    )
    await commission.refresh()
    assert.equal(commission.status, 'reversed')
    assert.equal((await OrganisationEvent.findByOrFail('public_id', event.body.id)).status, 'reversed')
  })

  test('a viewer cannot approve commissions from the portal', async ({ assert }) => {
    const { client, organisation } = await signedIn('viewer')
    const { secret } = await ApiKeyService.create(organisation.id, false, 'viewer')
    const affiliate = (
      await api('POST', '/api/v1/organisations/affiliates', secret, {
        external_user_id: 'viewer-commission',
      })
    ).body
    const event = await api('POST', '/api/v1/organisations/events', secret, {
      event_id: `vc_${crypto.randomUUID()}`,
      type: 'registration',
      affiliate_id: affiliate.id,
    })
    assert.equal(event.status, 201)
    assert.equal(
      (await client.inertia('POST', `/organisation/events/${event.body.id}/reverse`, { reason: 'no' }))
        .status,
      403
    )
  })

  test('the owner removes a developer, but not the owner, and a developer cannot manage the team', async ({
    assert,
  }) => {
    const owner = await signedIn('owner')
    const developer = await makeUser()
    users.push(developer)
    const member = await OrganisationMember.create({
      organisationId: owner.organisation.id,
      userId: developer.id,
      role: 'developer',
    })
    const ownerMember = await OrganisationMember.query()
      .where('organisation_id', owner.organisation.id)
      .where('user_id', owner.user.id)
      .firstOrFail()

    assert.equal(
      (await owner.client.inertia('POST', `/organisation/team/${ownerMember.publicId}/remove`)).status,
      422
    )
    assert.equal(
      (await owner.client.inertia('POST', `/organisation/team/${member.publicId}/remove`)).status,
      302
    )
    assert.isNull(await OrganisationMember.find(member.id))

    const dev = await signedIn('developer')
    assert.equal(
      (
        await dev.client.inertia('POST', '/organisation/team/invite', {
          email: owner.user.email,
          role: 'viewer',
        })
      ).status,
      403
    )
  })
})
