import type { HttpContext } from '@adonisjs/core/http'

export default class PingController {
  /** GET /v1/ping: confirms the key works and shows which mode it is in. */
  async show({ partner, livemode, response }: HttpContext) {
    return response.json({ object: 'ping', partner: partner.publicId, livemode })
  }
}
