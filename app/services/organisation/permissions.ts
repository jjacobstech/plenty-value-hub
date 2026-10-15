export type OrganisationRole = 'owner' | 'admin' | 'developer' | 'viewer'

export type OrganisationAction =
  | 'view'
  | 'manage_keys'
  | 'manage_webhooks'
  | 'manage_program'
  | 'manage_affiliates'
  | 'manage_commissions'
  | 'manage_team'

/** What each role may do in the developer portal. Viewers are read-only. */
const ALLOWED: Record<OrganisationAction, OrganisationRole[]> = {
  view: ['owner', 'admin', 'developer', 'viewer'],
  manage_keys: ['owner', 'admin', 'developer'],
  manage_webhooks: ['owner', 'admin', 'developer'],
  manage_program: ['owner', 'admin'],
  manage_affiliates: ['owner', 'admin'],
  manage_commissions: ['owner', 'admin'],
  manage_team: ['owner', 'admin'],
}

export function can(role: OrganisationRole, action: OrganisationAction): boolean {
  return ALLOWED[action].includes(role)
}
