import type { HttpContext } from '@adonisjs/core/http'
import PartnerApiException from '#exceptions/partner_api_exception'
import Partner from '#models/partner'
import { createPartner } from '#services/partner/provisioning'
import { partnerCreateValidator } from '#validators/partner_portal'

export default class AdminPartnersController {
  async index({ inertia }: HttpContext) {
    const partners = await Partner.query().withCount('members').orderBy('id', 'desc')
    return inertia.render('admin/AdminPartners', {
      partners: partners.map((p) => ({
        id: p.publicId,
        name: p.name,
        status: p.status,
        contactEmail: p.contactEmail,
        members: Number(p.$extras.members_count ?? 0),
        created: p.createdAt.toISO(),
      })),
    })
  }

  /** Creates a partner. The owner adds keys from the developer portal. */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(partnerCreateValidator)
    const domains = (data.domains ?? '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
    await createPartner({ name: data.name, ownerEmail: data.owner_email, domains })
    return response.redirect().back()
  }

  async setStatus(ctx: HttpContext, status: 'active' | 'suspended') {
    const partner = await Partner.query().where('public_id', ctx.params.id).firstOrFail()
    if (!['active', 'suspended'].includes(status)) throw new PartnerApiException('Invalid status.', 'invalid_request_error', 'parameter_invalid', 400)
    partner.status = status
    await partner.save()
    return ctx.response.redirect().back()
  }

  suspend(ctx: HttpContext) {
    return this.setStatus(ctx, 'suspended')
  }

  reactivate(ctx: HttpContext) {
    return this.setStatus(ctx, 'active')
  }
}
