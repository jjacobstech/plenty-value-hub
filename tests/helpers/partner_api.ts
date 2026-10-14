import env from '#start/env'
import Partner from '#models/partner'
import PartnerProgram from '#models/partner_program'
import ApiKeyService from '#services/partner/api_key_service'
import { publicId } from '#services/partner/public_id'

export const BASE = `http://${env.get('HOST')}:${env.get('PORT')}`

/** Creates a partner with both programs and one test and one live key. Delete `partner` to clean up. */
export async function makePartner(status: 'active' | 'suspended' = 'active') {
  const partner = await Partner.create({
    publicId: publicId('ptn_'),
    name: 'API test partner',
    status,
    contactEmail: 'api-test@example.com',
    allowedRedirectDomains: ['example.com'],
    clickIdParam: 'pv_click_id',
  })
  await PartnerProgram.create({ partnerId: partner.id, livemode: false })
  await PartnerProgram.create({ partnerId: partner.id, livemode: true })
  const testKey = await ApiKeyService.create(partner.id, false, 'test')
  const liveKey = await ApiKeyService.create(partner.id, true, 'live')
  return { partner, testKey, liveKey }
}

export type ApiResponse = { status: number; headers: Headers; body: any }

/** Calls /v1 with a secret key. A JSON body is sent when given. */
export async function api(
  method: string,
  path: string,
  secret: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {}
): Promise<ApiResponse> {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${secret}`,
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return { status: response.status, headers: response.headers, body: await response.json() }
}

/** Polls until `check` returns a truthy value. Clicks are recorded after the redirect responds. */
export async function eventually<T>(check: () => Promise<T>, timeoutMs = 3000): Promise<T> {
  const started = Date.now()
  let last: T = await check()
  while (!last && Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    last = await check()
  }
  return last
}
