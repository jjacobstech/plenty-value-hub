import type { HttpContext } from '@adonisjs/core/http'

export default class MobileCsrfExemptionMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const isMobileClient = (request.ctx as any)?.isMobileClient || false

    if (isMobileClient) {
      request.safeUrl = true
      response.header('X-CSRF-Exempt', 'true')
    }

    await next()
  }
}
