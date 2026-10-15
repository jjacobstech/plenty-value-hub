import { test } from '@japa/runner'
import crypto from 'node:crypto'
import env from '#start/env'
import Organisation from '#models/organisation'
import OrganisationApiKey from '#models/organisation_api_key'
import OrganisationProgram from '#models/organisation_program'
import ApiKeyService from '#services/organisation/api_key_service'
import { publicId } from '#services/organisation/public_id'

// Tests run on the same database as the app (plenty_value_hub). Each test creates
// its own organisation and deletes it afterwards; cascades remove keys and programs.
const BASE = `http://${env.get('HOST')}:${env.get('PORT')}`

async function makeOrganisation(status: 'active' | 'suspended' = 'active') {
  const organisation = await Organisation.create({
    publicId: publicId('ptn_'),
    name: 'Auth test partner',
    status,
    contactEmail: 'auth-test@example.com',
    allowedRedirectDomains: ['example.com'],
    clickIdParam: 'pv_click_id',
  })
  await OrganisationProgram.create({ organisationId: organisation.id, livemode: false })
  await OrganisationProgram.create({ organisationId: organisation.id, livemode: true })
  const test = await ApiKeyService.create(organisation.id, false, 'test')
  const live = await ApiKeyService.create(organisation.id, true, 'live')
  return { organisation, testKey: test, liveKey: live }
}

async function ping(headers: Record<string, string> = {}) {
  const response = await fetch(`${BASE}/api/v1/organisations/ping`, { headers })
  return { status: response.status, headers: response.headers, body: (await response.json()) as any }
}

test.group('organisation api auth', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
  })

  test('ping works with a test key and reports test mode', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const res = await ping({ authorization: `Bearer ${testKey.secret}` })
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { object: 'ping', organisation_id: organisation.publicId, livemode: false })
    assert.match(res.headers.get('request-id') ?? '', /^req_[0-9A-Za-z]{20}$/)
  })

  test('a live key reports live mode', async ({ assert }) => {
    const { organisation, liveKey } = await makeOrganisation()
    created.push(organisation)
    const res = await ping({ authorization: `Bearer ${liveKey.secret}` })
    assert.equal(res.status, 200)
    assert.isTrue(res.body.livemode)
  })

  test('Basic auth with the key as username is accepted', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const basic = Buffer.from(`${testKey.secret}:`).toString('base64')
    const res = await ping({ authorization: `Basic ${basic}` })
    assert.equal(res.status, 200)
  })

  test('missing key returns 401 api_key_missing in the SPEC error shape', async ({ assert }) => {
    const res = await ping()
    assert.equal(res.status, 401)
    assert.equal(res.body.error.type, 'authentication_error')
    assert.equal(res.body.error.code, 'api_key_missing')
    assert.equal(res.body.error.request_id, res.headers.get('request-id'))
  })

  test('malformed and unknown keys return 401 api_key_invalid', async ({ assert }) => {
    const malformed = await ping({ authorization: 'Bearer not_a_key' })
    assert.equal(malformed.body.error.code, 'api_key_invalid')
    const unknown = await ping({ authorization: `Bearer pv_live_sk_${'a'.repeat(32)}` })
    assert.equal(unknown.status, 401)
    assert.equal(unknown.body.error.code, 'api_key_invalid')
  })

  test('revoked key returns 401 api_key_revoked', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    await OrganisationApiKey.query().where('id', testKey.key.id).update({ revoked_at: new Date() })
    const res = await ping({ authorization: `Bearer ${testKey.secret}` })
    assert.equal(res.status, 401)
    assert.equal(res.body.error.code, 'api_key_revoked')
  })

  test('suspended organisation returns 403 organisation_suspended', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation('suspended')
    created.push(organisation)
    const res = await ping({ authorization: `Bearer ${testKey.secret}` })
    assert.equal(res.status, 403)
    assert.equal(res.body.error.type, 'permission_error')
    assert.equal(res.body.error.code, 'organisation_suspended')
  })

  test("one organisation's key never answers as another organisation", async ({ assert }) => {
    const a = await makeOrganisation()
    const b = await makeOrganisation()
    created.push(a.organisation, b.organisation)
    const res = await ping({ authorization: `Bearer ${a.testKey.secret}` })
    assert.equal(res.body.organisation_id, a.organisation.publicId)
    assert.notEqual(res.body.organisation_id, b.organisation.publicId)
  })

  test('keys are stored as SHA-256 hashes only', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const row = await OrganisationApiKey.findOrFail(testKey.key.id)
    const expected = crypto.createHash('sha256').update(testKey.secret).digest('hex')
    assert.equal(row.keyHash, expected)
    assert.notInclude(JSON.stringify(row.serialize()), testKey.secret)
    assert.equal(row.last4, testKey.secret.slice(-4))
  })

  test('unknown /api/v1/organisations path returns 404 resource_missing', async ({ assert }) => {
    const res = await ping()
    assert.equal(res.status, 401)
    const unknown = await fetch(`${BASE}/api/v1/organisations/nope`)
    assert.equal(unknown.status, 404)
    assert.equal(((await unknown.json()) as any).error.code, 'resource_missing')
  })

  test('per-key limit returns 429 with Retry-After after 50 test requests', async ({ assert }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const auth = { authorization: `Bearer ${testKey.secret}` }
    for (let i = 0; i < 50; i++) {
      assert.equal((await ping(auth)).status, 200)
    }
    const limited = await ping(auth)
    assert.equal(limited.status, 429)
    assert.equal(limited.body.error.code, 'rate_limited')
    assert.isNotNull(limited.headers.get('retry-after'))
  })
})
