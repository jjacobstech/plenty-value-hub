import type { HttpContext } from '@adonisjs/core/http'
import { createOrganisation } from '#services/organisation/provisioning'
import { organisationOnboardValidator } from '#validators/organisation_portal'

export default class OnboardingController {
  async create({ inertia }: HttpContext) {
    return inertia.render('organisation/New', {})
  }

  /** Any signed-in user can open an organisation. They become its owner and the portal opens on it. */
  async store({ request, auth, session, response }: HttpContext) {
    const data = await request.validateUsing(organisationOnboardValidator)
    const domains = (data.domains ?? '')
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean)
    const { organisation } = await createOrganisation({
      name: data.name,
      ownerEmail: auth.user!.email,
      domains,
    })
    session.put('organisation_id', organisation.id)
    return response.redirect('/organisation')
  }
}
