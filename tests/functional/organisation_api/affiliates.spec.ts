import { test } from '@japa/runner'
import crypto from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'
import { api, makeOrganisation } from '#tests/helpers/organisation_api'

test.group('organisation api affiliates', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
  })

  test('create returns 201, then the same external_user_id returns 200 with the same affiliate', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const first = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'user_1', display_name: 'Ada' })
    assert.equal(first.status, 201)
    assert.equal(first.body.object, 'affiliate')
    assert.match(first.body.id, /^aff_[0-9A-Za-z]{20}$/)
    assert.equal(first.body.display_name, 'Ada')
    assert.equal(first.body.status, 'active')
    assert.isFalse(first.body.livemode)
    assert.isNumber(first.body.created)

    const again = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'user_1' })
    assert.equal(again.status, 200)
    assert.equal(again.body.id, first.body.id)
  })

  test('20 concurrent creates for one external_user_id make exactly one affiliate', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const results = await Promise.all(
      Array.from({ length: 20 }, () => api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'race_user' }))
    )
    assert.equal(results.filter((r) => r.status === 201).length, 1)
    assert.equal(results.filter((r) => r.status === 200).length, 19)
    assert.equal(new Set(results.map((r) => r.body.id)).size, 1)
    const rows = await OrganisationAffiliate.query().where('organisation_id', organisation.id)
    assert.lengthOf(rows, 1)
  })

  test("another organisation's and the other mode's affiliates are 404, never 403", async ({ assert }) => {
    const a = await makeOrganisation()
    const b = await makeOrganisation()
    created.push(a.organisation, b.organisation)
    const mine = await api('POST', '/api/v1/organisations/affiliates', a.testKey.secret, { external_user_id: 'u' })
    const liveMine = await api('POST', '/api/v1/organisations/affiliates', a.liveKey.secret, { external_user_id: 'u' })

    const crossOrganisation = await api('GET', `/api/v1/organisations/affiliates/${mine.body.id}`, b.testKey.secret)
    assert.equal(crossOrganisation.status, 404)
    assert.equal(crossOrganisation.body.error.code, 'resource_missing')
    const crossPatch = await api('PATCH', `/api/v1/organisations/affiliates/${mine.body.id}`, b.testKey.secret, { status: 'suspended' })
    assert.equal(crossPatch.status, 404)

    const crossMode = await api('GET', `/api/v1/organisations/affiliates/${liveMine.body.id}`, a.testKey.secret)
    assert.equal(crossMode.status, 404)
    const list = await api('GET', '/api/v1/organisations/affiliates', a.testKey.secret)
    assert.deepEqual(
      list.body.data.map((x: any) => x.id),
      [mine.body.id]
    )
  })

  test('affiliate ids with the wrong prefix are a 404', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const res = await api('GET', '/api/v1/organisations/affiliates/lnk_whatever', testKey.secret)
    assert.equal(res.status, 404)
  })

  test('missing and unknown fields are rejected in the error shape', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const missing = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, {})
    assert.equal(missing.status, 400)
    assert.equal(missing.body.error.code, 'parameter_missing')
    assert.equal(missing.body.error.param, 'external_user_id')

    const unknown = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'x', surprise: true })
    assert.equal(unknown.status, 400)
    assert.equal(unknown.body.error.code, 'parameter_unknown')
  })

  test('metadata is limited to 20 keys of 500 characters', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const tooMany = Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`k${i}`, 'v']))
    const many = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'm1', metadata: tooMany })
    assert.equal(many.status, 400)
    assert.equal(many.body.error.param, 'metadata')

    const long = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'm2', metadata: { a: 'x'.repeat(501) } })
    assert.equal(long.status, 400)
  })

  test('PATCH changes status and leaves other fields alone', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const created1 = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'p1', display_name: 'Keep me' })
    const patched = await api('PATCH', `/api/v1/organisations/affiliates/${created1.body.id}`, testKey.secret, { status: 'suspended' })
    assert.equal(patched.status, 200)
    assert.equal(patched.body.status, 'suspended')
    assert.equal(patched.body.display_name, 'Keep me')

    const bad = await api('PATCH', `/api/v1/organisations/affiliates/${created1.body.id}`, testKey.secret, { status: 'deleted' })
    assert.equal(bad.status, 400)
  })

  test('list is cursor-paginated and filters by external_user_id', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    for (const id of ['a', 'b', 'c']) await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: id })

    const page1 = await api('GET', '/api/v1/organisations/affiliates?limit=2', testKey.secret)
    assert.equal(page1.body.object, 'list')
    assert.lengthOf(page1.body.data, 2)
    assert.isTrue(page1.body.has_more)

    const page2 = await api('GET', `/api/v1/organisations/affiliates?limit=2&starting_after=${page1.body.data[1].id}`, testKey.secret)
    assert.lengthOf(page2.body.data, 1)
    assert.isFalse(page2.body.has_more)

    const filtered = await api('GET', '/api/v1/organisations/affiliates?external_user_id=b', testKey.secret)
    assert.equal(filtered.body.data[0].external_user_id, 'b')

    const badLimit = await api('GET', '/api/v1/organisations/affiliates?limit=500', testKey.secret)
    assert.equal(badLimit.status, 400)
  })

  test('a repeated Idempotency-Key replays the stored response', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const body = { external_user_id: 'idem_1' }
    const headers = { 'idempotency-key': 'key-1' }
    const first = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, body, headers)
    const replay = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, body, headers)
    assert.equal(first.status, 201)
    assert.equal(replay.status, 201)
    assert.equal(replay.headers.get('idempotent-replayed'), 'true')
    assert.equal(replay.body.id, first.body.id)
  })

  test('the same Idempotency-Key with a different body is 409 idempotency_key_reused', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const headers = { 'idempotency-key': 'key-2' }
    await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'one' }, headers)
    const other = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, { external_user_id: 'two' }, headers)
    assert.equal(other.status, 409)
    assert.equal(other.body.error.code, 'idempotency_key_reused')
    assert.equal(other.body.error.type, 'idempotency_error')
  })

  test('a key still locked by another request is 409 idempotency_key_in_use', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const body = { external_user_id: 'locked_user' }
    const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex')
    await db.rawQuery(
      `insert into organisation_idempotency_keys (organisation_id, livemode, key, request_method, request_path, request_hash, locked_at, expires_at, created_at, updated_at)
       values (?, false, 'key-locked', 'POST', '/api/v1/organisations/affiliates', ?, now(), now() + interval '1 day', now(), now())`,
      [organisation.id, hash]
    )
    const res = await api('POST', '/api/v1/organisations/affiliates', testKey.secret, body, { 'idempotency-key': 'key-locked' })
    assert.equal(res.status, 409)
    assert.equal(res.body.error.code, 'idempotency_key_in_use')
  })
})
