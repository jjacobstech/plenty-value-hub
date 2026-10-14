import { test } from '@japa/runner'
import Partner from '#models/partner'
import { BASE, api, makePartner } from '#tests/helpers/partner_api'

test.group('partner api hardening', (group) => {
  const created: Partner[] = []
  group.each.teardown(async () => {
    for (const partner of created.splice(0)) await partner.delete()
  })

  test('bodies over 64 KB are refused with 413 in the error shape', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const big = JSON.stringify({ external_user_id: 'big', metadata: { note: 'x'.repeat(70 * 1024) } })
    const res = await fetch(`${BASE}/v1/affiliates`, {
      method: 'POST',
      headers: { authorization: `Bearer ${testKey.secret}`, 'content-type': 'application/json' },
      body: big,
    })
    assert.equal(res.status, 413)
    const body = (await res.json()) as any
    assert.equal(body.error.code, 'parameter_invalid')
    assert.match(res.headers.get('request-id') ?? '', /^req_/)
  })

  test('non-JSON bodies are refused with 415', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const res = await fetch(`${BASE}/v1/affiliates`, {
      method: 'POST',
      headers: { authorization: `Bearer ${testKey.secret}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: 'external_user_id=form',
    })
    assert.equal(res.status, 415)
  })

  test('the partner API sends no CORS allow-origin header, even for a browser preflight', async ({ assert }) => {
    const res = await fetch(`${BASE}/v1/ping`, {
      method: 'OPTIONS',
      headers: { origin: 'https://evil.example', 'access-control-request-method': 'GET' },
    })
    assert.isNull(res.headers.get('access-control-allow-origin'))
  })

  test('the docs pages render from the committed OpenAPI and QUICKSTART files', async ({ assert }) => {
    const index = await fetch(`${BASE}/docs/api`)
    assert.equal(index.status, 200)
    const html = await index.text()
    assert.include(html, 'Partner API reference')
    assert.include(html, '/v1/affiliates')
    assert.include(html, '/v1/commissions/{id}/mark_paid')

    const spec = await fetch(`${BASE}/docs/api/openapi.yaml`)
    assert.equal(spec.status, 200)
    assert.include(await spec.text(), 'openapi: 3.1.0')

    const quick = await fetch(`${BASE}/docs/quickstart`)
    assert.include(await quick.text(), 'Plenty Value Partner API')
  })

  test('the ping endpoint reports its Request-Id on success', async ({ assert }) => {
    const { partner, testKey } = await makePartner()
    created.push(partner)
    const res = await api('GET', '/v1/ping', testKey.secret)
    assert.match(res.headers.get('request-id') ?? '', /^req_/)
  })
})
