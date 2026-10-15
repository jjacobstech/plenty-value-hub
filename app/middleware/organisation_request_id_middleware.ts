import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { publicId } from '#services/organisation/public_id'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    organisationRequestId: string
  }
}

/** Gives every /api/v1/organisations response a Request-Id header and an id for error bodies. */
export default class OrganisationRequestIdMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.organisationRequestId = publicId('req_')
    ctx.response.header('Request-Id', ctx.organisationRequestId)
    await next()
  }
}
