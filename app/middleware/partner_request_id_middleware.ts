import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { publicId } from '#services/partner/public_id'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    partnerRequestId: string
  }
}

/** Gives every /v1 response a Request-Id header and an id for error bodies. */
export default class PartnerRequestIdMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.partnerRequestId = publicId('req_')
    ctx.response.header('Request-Id', ctx.partnerRequestId)
    await next()
  }
}
