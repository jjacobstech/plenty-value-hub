import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { publicId } from '#services/partner/public_id'

const MAX_BODY_BYTES = 64 * 1024

/**
 * Runs before the body parser. /v1 accepts JSON only, up to 64 KB (SPEC §5). Larger or non-JSON
 * bodies are refused here, so the 20 MB limit for the marketplace does not apply to /v1.
 */
export default class PartnerBodyLimitMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.request.url(false).startsWith('/v1/')) return next()

    const requestId = publicId('req_')
    ctx.response.header('Request-Id', requestId)
    const reject = (status: number, message: string) =>
      ctx.response.status(status).json({
        error: { type: 'invalid_request_error', code: 'parameter_invalid', message, param: null, request_id: requestId },
      })

    if (Number(ctx.request.header('content-length') ?? 0) > MAX_BODY_BYTES) {
      return reject(413, 'The request body is larger than 64 KB.')
    }
    const hasBody = Number(ctx.request.header('content-length') ?? 0) > 0
    const type = ctx.request.header('content-type') ?? ''
    if (hasBody && !type.includes('application/json')) {
      return reject(415, 'Send the request body as application/json.')
    }
    return next()
  }
}
