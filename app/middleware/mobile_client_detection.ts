import type { HttpContext } from '@adonisjs/core/http'

export default class MobileClientDetectionMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const userAgent = (request.header('user-agent') || '').toLowerCase()

    const isMobileUserAgent = this.detectMobileUserAgent(userAgent)

    ;(request as any).isMobileClient = isMobileUserAgent

    if (isMobileUserAgent) {
      response.header('X-Mobile-Client', 'true')
    }

    await next()
  }

  private detectMobileUserAgent(userAgent: string): boolean {
    const mobilePatterns = [
      /android/i,
      /webos/i,
      /iphone/i,
      /ipad/i,
      /ipod/i,
      /blackberry/i,
      /windows phone/i,
      /mobile/i,
      /mobile safari/i,
      /expo/i,
      /react native/i,
      /flutter/i,
    ]

    return mobilePatterns.some((pattern) => pattern.test(userAgent))
  }
}
