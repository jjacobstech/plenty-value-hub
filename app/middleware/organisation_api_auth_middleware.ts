import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import limiter from '@adonisjs/limiter/services/main'
import { errors as limiterErrors } from '@adonisjs/limiter'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import Organisation from '#models/organisation'
import OrganisationApiKey from '#models/organisation_api_key'
import { hashKey, parseKeyMode } from '#services/organisation/api_key_service'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    organisation: Organisation
    livemode: boolean
    apiKey: OrganisationApiKey
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

/** Authenticates a /api/v1/organisations request with an organisation API key and applies the per-key rate limit. */
export default class OrganisationApiAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const secret = extractSecret(ctx.request.header('authorization'))
    if (!secret) {
      throw new OrganisationApiException('No API key provided.', 'authentication_error', 'api_key_missing', 401)
    }

    // Hash even malformed keys so bad and good keys cost about the same.
    const hash = hashKey(secret)
    const mode = parseKeyMode(secret)
    const apiKey = mode ? await OrganisationApiKey.query().where('key_hash', hash).first() : null
    if (!apiKey) {
      throw new OrganisationApiException('Invalid API key.', 'authentication_error', 'api_key_invalid', 401)
    }
    if (apiKey.revokedAt) {
      throw new OrganisationApiException('This API key has been revoked.', 'authentication_error', 'api_key_revoked', 401)
    }

    const organisation = await Organisation.find(apiKey.organisationId)
    if (!organisation) {
      throw new OrganisationApiException('Invalid API key.', 'authentication_error', 'api_key_invalid', 401)
    }
    if (organisation.status === 'suspended') {
      throw new OrganisationApiException('This organisation account is suspended.', 'permission_error', 'organisation_suspended', 403)
    }

    // Per-key limit: live 100 and test 50 requests per 10 seconds.
    try {
      await limiter.use({ requests: apiKey.livemode ? 100 : 50, duration: '10 s' }).consume(`organisation_key:${apiKey.id}`)
    } catch (error) {
      if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
        ctx.response.header('Retry-After', String(error.response.availableIn))
        throw new OrganisationApiException('Too many requests. Retry later.', 'rate_limit_error', 'rate_limited', 429)
      }
      throw error
    }

    // Update last_used_at at most once a minute.
    if (!apiKey.lastUsedAt || apiKey.lastUsedAt < DateTime.now().minus({ minutes: 1 })) {
      apiKey.lastUsedAt = DateTime.now()
      await apiKey.save()
    }

    ctx.organisation = organisation
    ctx.livemode = apiKey.livemode
    ctx.apiKey = apiKey
    return next()
  }
}
