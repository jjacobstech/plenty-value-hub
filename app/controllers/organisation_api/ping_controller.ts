import type { HttpContext } from '@adonisjs/core/http'

export default class PingController {
  /** GET /api/v1/organisations/ping: confirms the key works and shows which mode it is in. */
  async show({ organisation, livemode, response }: HttpContext) {
    return response.json({ object: 'ping', organisation_id: organisation.publicId, livemode })
  }
}
