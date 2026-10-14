import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import limiter from '@adonisjs/limiter/services/main'
import { errors as limiterErrors } from '@adonisjs/limiter'
import PartnerApiException from '#exceptions/partner_api_exception'
import Partner from '#models/partner'
import PartnerApiKey from '#models/partner_api_key'
import { hashKey, parseKeyMode } from '#services/partner/api_key_service'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    partner: Partner
    livemode: boolean
    apiKey: PartnerApiKey
  }
}

/** Bearer token, or Basic auth with the key as the username. */
function extractSecret(header: string | undefined): string {
  if (!header) return ''
  if (header.startsWith('Bearer ')) return header.slice(7).trim()
  if (header.startsWith('Basic ')) {
    return Buffer.from(header.slice(6), 'base64').toString().split(':')[0].trim()
  }
  return ''
}

/** Authenticates a /v1 request with a partner API key and applies the per-key rate limit. */
export default class PartnerApiAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const secret = extractSecret(ctx.request.header('authorization'))
    if (!secret) {
      throw new PartnerApiException('No API key provided.', 'authentication_error', 'api_key_missing', 401)
    }

    // Hash even malformed keys so bad and good keys cost about the same.
    const hash = hashKey(secret)
    const mode = parseKeyMode(secret)
    const apiKey = mode ? await PartnerApiKey.query().where('key_hash', hash).first() : null
    if (!apiKey) {
      throw new PartnerApiException('Invalid API key.', 'authentication_error', 'api_key_invalid', 401)
    }
    if (apiKey.revokedAt) {
      throw new PartnerApiException('This API key has been revoked.', 'authentication_error', 'api_key_revoked', 401)
    }

    const partner = await Partner.find(apiKey.partnerId)
    if (!partner) {
      throw new PartnerApiException('Invalid API key.', 'authentication_error', 'api_key_invalid', 401)
    }
    if (partner.status === 'suspended') {
      throw new PartnerApiException('This partner account is suspended.', 'permission_error', 'partner_suspended', 403)
    }

    // Per-key limit: live 100 and test 50 requests per 10 seconds.
    try {
      await limiter.use({ requests: apiKey.livemode ? 100 : 50, duration: '10 s' }).consume(`partner_key:${apiKey.id}`)
    } catch (error) {
      if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
        ctx.response.header('Retry-After', String(error.response.availableIn))
        throw new PartnerApiException('Too many requests. Retry later.', 'rate_limit_error', 'rate_limited', 429)
      }
      throw error
    }

    // Update last_used_at at most once a minute.
    if (!apiKey.lastUsedAt || apiKey.lastUsedAt < DateTime.now().minus({ minutes: 1 })) {
      apiKey.lastUsedAt = DateTime.now()
      await apiKey.save()
    }

    ctx.partner = partner
    ctx.livemode = apiKey.livemode
    ctx.apiKey = apiKey
    return next()
  }
}
