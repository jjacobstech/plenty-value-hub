import type { HttpContext } from '@adonisjs/core/http'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import Organisation from '#models/organisation'
import { createOrganisation } from '#services/organisation/provisioning'
import { organisationCreateValidator } from '#validators/organisation_portal'

export default class AdminOrganisationsController {
  async index({ inertia }: HttpContext) {
    const organisations = await Organisation.query().withCount('members').orderBy('id', 'desc')
    return inertia.render('admin/AdminOrganisations', {
      organisations: organisations.map((p) => ({
        id: p.publicId,
        name: p.name,
        status: p.status,
        contactEmail: p.contactEmail,
        members: Number(p.$extras.members_count ?? 0),
        created: p.createdAt.toISO() ?? '',
      })),
    })
  }

  /** Creates an organisation. The owner adds keys from the developer portal. */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(organisationCreateValidator)
    const domains = (data.domains ?? '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
    await createOrganisation({ name: data.name, ownerEmail: data.owner_email, domains })
    return response.redirect().back()
  }

  async setStatus(ctx: HttpContext, status: 'active' | 'suspended') {
    const organisation = await Organisation.query().where('public_id', ctx.params.id).firstOrFail()
    if (!['active', 'suspended'].includes(status)) throw new OrganisationApiException('Invalid status.', 'invalid_request_error', 'parameter_invalid', 400)
    organisation.status = status
    await organisation.save()
    return ctx.response.redirect().back()
  }

  suspend(ctx: HttpContext) {
    return this.setStatus(ctx, 'suspended')
  }

  reactivate(ctx: HttpContext) {
    return this.setStatus(ctx, 'active')
  }
}
