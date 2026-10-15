import OrganisationMember from '#models/organisation_member'
import type User from '#models/user'

/** Consumers who belong to an organisation are organisations. Their user role stays `consumer`. */
export async function isOrganisationUser(user: User) {
  if (user.role !== 'consumer') return false
  return !!(await OrganisationMember.query().where('user_id', user.id).first())
}

/**
 * Where a signed-in user lands. Consumers who belong to an organisation go to the portal. Vendors and affiliates
 * keep their own dashboards, so `fallback` is used for them.
 */
export async function postLoginPath(user: User, fallback: string) {
  return (await isOrganisationUser(user)) ? '/organisation' : fallback
}
