import { test } from '@japa/runner'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { DateTime } from 'luxon'
import OrganisationClick from '#models/organisation_click'
import OrganisationCommission from '#models/organisation_commission'
import { approveDueCommissions } from '#services/organisation/commission_service'
import { deliverDue } from '#services/organisation/webhook_delivery_service'
import { createOrganisation } from '#services/organisation/provisioning'
import { verifySignature } from '#services/organisation/webhook_signer'
import { BASE, api, eventually } from '#tests/helpers/organisation_api'
import { PortalClient, PASSWORD, makeUser } from '#tests/helpers/portal'
import limiter from '@adonisjs/limiter/services/main'

/**
 * QUICKSTART end to end: organisation and keys (portal), program and webhook (portal), then the API
 * steps from QUICKSTART.md, the signed webhook, and the hosted dashboard.
 */
test.group('organisation quickstart', (group) => {
  group.each.setup(() => limiter.clear())

  test('the QUICKSTART flow works end to end', async ({ assert }) => {
    const owner = await makeUser()
    const { organisation } = await createOrganisation({ name: 'Quickstart partner', ownerEmail: owner.email, domains: ['example.com'] })

    const received: { body: string; signature: string }[] = []
    const hook = http.createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => {
        received.push({ body, signature: String(req.headers['pv-signature'] ?? '') })
        res.statusCode = 200
        res.end('ok')
      })
    })
    await new Promise<void>((resolve) => hook.listen(0, '127.0.0.1', () => resolve()))
    const hookUrl = `http://127.0.0.1:${(hook.address() as AddressInfo).port}/plenty-value`

    try {
      // Portal: sign in, create a test key, set the program, add the webhook endpoint.
      const portal = new PortalClient()
      assert.equal(await portal.login(owner.email, PASSWORD), 302)
      const keyPage = await portal.inertia('POST', '/organisation/keys', { name: 'QuickStart server' })
      const secret = keyPage.json!.props.newSecret as string
      assert.match(secret, /^pv_test_sk_/)

      const programForm = {
        attribution_window_days: '30', attribution_model: 'last_click', allowed_event_types: 'registration', commission_mode: 'flat',
        commission_flat_amount: '500', commission_currency: 'USD', commission_hold_days: '0', auto_approve_after_hold: 'true',
        self_referral_blocked: 'true', dedupe_unique_click_minutes: '30', allowed_redirect_domains: 'example.com', click_id_param: 'pv_click_id',
      }
      assert.equal((await portal.inertia('POST', '/organisation/program', programForm)).status, 302)

      const endpoint = await portal.inertia('POST', '/organisation/webhooks', { url: hookUrl, events: 'commission.approved, commission.reversed' })
      const signingSecret = endpoint.json!.props.newSecret as string
      assert.match(signingSecret, /^whsec_/)

      // 2. Create an affiliate for your user.
      const affiliate = await api('POST', '/api/v1/organisations/affiliates', secret, { external_user_id: 'user_10293', display_name: 'Ada O.' })
      assert.equal(affiliate.status, 201)

      // 3. Get a referral link for a product.
      const link = await api('POST', '/api/v1/organisations/links', secret, { affiliate: affiliate.body.id, product_ref: 'prod_42', destination_url: 'https://shop.example.com/products/42' })
      assert.equal(link.status, 201)
      assert.match(link.body.url, /\/r\/[0-9A-Za-z]{8}$/)

      // 4. A friend clicks; the redirect carries the click id.
      const code = link.body.code
      const redirect = await fetch(`${BASE}/r/${code}`, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 Firefox/132.0 quickstart' } })
      assert.equal(redirect.status, 302)
      const clickId = new URL(redirect.headers.get('location')!).searchParams.get('pv_click_id')!
      assert.match(clickId, /^clk_/)
      await eventually(() => OrganisationClick.query().where('public_id', clickId).first())

      // 5. Report the conversion from your server.
      const event = await api('POST', '/api/v1/organisations/events', secret, { event_id: 'reg_88121', type: 'registration', click_id: clickId, referred_external_user_id: 'user_88121' })
      assert.equal(event.status, 201)
      assert.equal(event.body.status, 'attributed')
      assert.equal(event.body.affiliate, affiliate.body.id)
      const again = await api('POST', '/api/v1/organisations/events', secret, { event_id: 'reg_88121', type: 'registration', click_id: clickId })
      assert.equal(again.status, 200)

      // The commission is pending. The approval job approves it once its hold has ended.
      const commissionId = event.body.commission as string
      assert.equal((await api('GET', `/api/v1/organisations/commissions/${commissionId}`, secret)).body.status, 'pending')
      await approveDueCommissions(DateTime.now().plus({ minutes: 1 }))
      const approved = await api('GET', `/api/v1/organisations/commissions/${commissionId}`, secret)
      assert.equal(approved.body.status, 'approved')

      // 6. The signed commission.approved event reaches the endpoint, and the organisation can map it to its user.
      await deliverDue()
      await eventually(async () => (received.length >= 1 ? true : null))
      assert.lengthOf(received, 1)
      const got = received[0]
      assert.isTrue(verifySignature(got.body, got.signature, signingSecret))
      const envelope = JSON.parse(got.body)
      assert.equal(envelope.type, 'commission.approved')
      assert.equal(envelope.data.object.id, commissionId)
      assert.equal(envelope.data.object.affiliate_external_user_id, 'user_10293')

      // 7. The affiliate's hosted dashboard shows the numbers.
      const session = await api('POST', `/api/v1/organisations/affiliates/${affiliate.body.id}/dashboard_sessions`, secret, {})
      assert.equal(session.status, 201)
      const path = new URL(session.body.url).pathname
      const redeemed = await fetch(`${BASE}${path}`, { redirect: 'manual' })
      const cookie = redeemed.headers.getSetCookie().find((c) => c.startsWith('pv_aff_dashboard='))!.split(';')[0]
      const dash = await fetch(`${BASE}/a`, { headers: { cookie } })
      const html = await dash.text()
      const data = JSON.parse(
        /data-page="([^"]*)"/.exec(html)![1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      )
      assert.equal(data.props.totals.conversions, 1)
      assert.equal(data.props.totals.clicks, 1)
      assert.equal(data.props.totals.commissions.approved.count, 1)
      assert.equal(data.props.totals.commissions.approved.amount, 500)

      // Reversing the event reverses the commission, and the endpoint hears about it.
      await api('POST', `/api/v1/organisations/events/${event.body.id}/reverse`, secret, { reason: 'refund' })
      await deliverDue()
      await eventually(async () => (received.length >= 2 ? true : null))
      assert.equal(JSON.parse(received[1].body).type, 'commission.reversed')
      const reversed = await OrganisationCommission.findByOrFail('public_id', commissionId)
      assert.equal(reversed.status, 'reversed')
    } finally {
      await new Promise<void>((resolve) => hook.close(() => resolve()))
      // Remove only what this test created: its organisation (cascades to keys, links and events) and its owner.
      await organisation.delete()
      await owner.delete()
    }
  })
})
