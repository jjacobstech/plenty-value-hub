import crypto from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import OrganisationIdempotencyKey from '#models/organisation_idempotency_key'

/** JSON with object keys sorted, so the same body always hashes the same. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v
  )
}

/**
 * Replays the stored response for a repeated Idempotency-Key on a POST. Requires organisationApiAuth
 * to run first (it reads ctx.organisation and ctx.livemode). 5xx and thrown errors are not stored,
 * so the client can retry.
 */
export default class OrganisationIdempotencyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const key = ctx.request.header('idempotency-key')
    if (!key) return next()
    if (key.length > 255) {
      throw new OrganisationApiException('Idempotency-Key must be 255 characters or fewer.', 'invalid_request_error', 'parameter_invalid', 400, 'Idempotency-Key')
    }

    const organisationId = ctx.organisation.id
    const livemode = ctx.livemode
    const requestHash = crypto.createHash('sha256').update(canonicalJson(ctx.request.body())).digest('hex')

    // Expired keys are free to reuse. Then claim the key; ON CONFLICT means another request owns it.
    await db.rawQuery('delete from organisation_idempotency_keys where organisation_id = ? and livemode = ? and key = ? and expires_at < now()', [organisationId, livemode, key])
    const claimed = await db.rawQuery(
      `insert into organisation_idempotency_keys (organisation_id, livemode, key, request_method, request_path, request_hash, locked_at, expires_at, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, now(), now() + interval '24 hours', now(), now())
       on conflict (organisation_id, livemode, key) do nothing returning id`,
      [organisationId, livemode, key, ctx.request.method(), ctx.request.url(false), requestHash]
    )

    if (claimed.rows.length === 0) {
      const existing = await OrganisationIdempotencyKey.query()
        .where('organisation_id', organisationId)
        .where('livemode', livemode)
        .where('key', key)
        .firstOrFail()
      if (existing.requestHash !== requestHash) {
        throw new OrganisationApiException('This Idempotency-Key was already used with a different request body.', 'idempotency_error', 'idempotency_key_reused', 409)
      }
      if (existing.responseStatus === null) {
        throw new OrganisationApiException('A request with this Idempotency-Key is still in progress.', 'idempotency_error', 'idempotency_key_in_use', 409)
      }
      ctx.response.header('Idempotent-Replayed', 'true')
      return ctx.response.status(existing.responseStatus).json(existing.responseBody)
    }

    const rowId = claimed.rows[0].id
    try {
      await next()
    } catch (error) {
      await OrganisationIdempotencyKey.query().where('id', rowId).delete()
      throw error
    }

    const status = ctx.response.getStatus()
    if (status >= 500) {
      await OrganisationIdempotencyKey.query().where('id', rowId).delete()
    } else {
      await OrganisationIdempotencyKey.query()
        .where('id', rowId)
        .update({ response_status: status, response_body: JSON.stringify(ctx.response.getBody()), locked_at: null })
    }
  }
}
