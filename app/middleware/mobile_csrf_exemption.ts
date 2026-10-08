import type { HttpContext } from '@adonisjs/core/http'

export default class MobileCsrfExemptionMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const isMobileClient = (request as any).isMobileClient || false

    if (isMobileClient) {
      ;(request as any).safeUrl = true
      response.header('X-CSRF-Exempt', 'true')
    }

    await next()
  }
}
