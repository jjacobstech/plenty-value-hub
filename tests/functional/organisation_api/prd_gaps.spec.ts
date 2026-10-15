import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import Organisation from '#models/organisation'
import OrganisationClick from '#models/organisation_click'
import OrganisationLink from '#models/organisation_link'
import { BASE, api, eventually, makeOrganisation } from '#tests/helpers/organisation_api'

async function createAffiliateAndLink(secret: string) {
  const affiliate = (
    await api('POST', '/api/v1/organisations/affiliates', secret, {
      external_user_id: `g_${randomUUID()}`,
    })
  ).body
  const link = (
    await api('POST', '/api/v1/organisations/links', secret, {
      affiliate: affiliate.id,
      product_ref: 'p1',
      destination_url: 'https://shop.example.com/p',
    })
  ).body
  return { affiliate, link, dbId: (await OrganisationLink.findByOrFail('public_id', link.id)).id }
}

test.group('organisation api PRD gaps', (group) => {
  const created: Organisation[] = []
  group.each.teardown(async () => {
    for (const organisation of created.splice(0)) await organisation.delete()
  })

  test('GET affiliates/:id/stats counts only that affiliate, and rejects bad group_by and foreign ids', async ({
    assert,
  }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { affiliate, link } = await createAffiliateAndLink(testKey.secret)
    for (let i = 0; i < 2; i++) {
      await fetch(`${BASE}/r/${link.code}`, {
        redirect: 'manual',
        headers: { 'user-agent': `Mozilla/5.0 Stats/${i}` },
      })
    }
    await eventually(
      async () =>
        (
          await OrganisationClick.query().where(
            'link_id',
            (await OrganisationLink.findByOrFail('public_id', link.id)).id
          )
        ).length === 2 || null
    )

    const stats = await api(
      'GET',
      `/api/v1/organisations/affiliates/${affiliate.id}/stats`,
      testKey.secret
    )
    assert.equal(stats.status, 200)
    assert.equal(stats.body.object, 'stats')
    assert.equal(stats.body.totals.clicks, 2)

    const byDay = await api(
      'GET',
      `/api/v1/organisations/affiliates/${affiliate.id}/stats?group_by=day`,
      testKey.secret
    )
    assert.equal(byDay.status, 200)

    const badGroup = await api(
      'GET',
      `/api/v1/organisations/affiliates/${affiliate.id}/stats?group_by=country`,
      testKey.secret
    )
    assert.equal(badGroup.status, 400)
    assert.equal(badGroup.body.error.code, 'parameter_invalid')

    const { organisation: other, testKey: otherKey } = await makeOrganisation()
    created.push(other)
    const foreign = await api(
      'GET',
      `/api/v1/organisations/affiliates/${affiliate.id}/stats`,
      otherKey.secret
    )
    assert.equal(foreign.status, 404)
    assert.equal(foreign.body.error.code, 'resource_missing')
  })

  test('the redirect keeps sending visitors on after 60 clicks a minute, but stops counting them', async ({
    assert,
  }) => {
    const { organisation, testKey } = await makeOrganisation()
    created.push(organisation)
    const { link, dbId } = await createAffiliateAndLink(testKey.secret)
    const ua = `Mozilla/5.0 VisitorLimit/${randomUUID()}`

    for (let i = 0; i < 61; i++) {
      const res = await fetch(`${BASE}/r/${link.code}`, {
        redirect: 'manual',
        headers: { 'user-agent': ua },
      })
      assert.equal(res.status, 302, `click ${i + 1} must still redirect`)
    }
    await eventually(
      async () => (await OrganisationClick.query().where('link_id', dbId)).length >= 60 || null
    )
    await new Promise((resolve) => setTimeout(resolve, 300))
    const counted = await OrganisationClick.query().where('link_id', dbId)
    assert.lengthOf(counted, 60)
  })

  test('a live key is limited to 100 requests per 10 seconds', async ({ assert }) => {
    const { organisation, liveKey } = await makeOrganisation()
    created.push(organisation)
    const auth = { authorization: `Bearer ${liveKey.secret}` }
    for (let i = 0; i < 100; i++) {
      const res = await fetch(`${BASE}/api/v1/organisations/ping`, { headers: auth })
      assert.equal(res.status, 200)
    }
    const limited = await fetch(`${BASE}/api/v1/organisations/ping`, { headers: auth })
    assert.equal(limited.status, 429)
    assert.isNotNull(limited.headers.get('retry-after'))
  })
})
