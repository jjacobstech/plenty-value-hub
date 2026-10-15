import { BaseSchema } from '@adonisjs/lucid/schema'

/** Partner tables are renamed to organisation tables. Columns (partner_id and friends) keep their names. */
export default class extends BaseSchema {
  async up() {
    this.schema.renameTable('partners', 'organisations')
    this.schema.renameTable('partner_members', 'organisation_members')
    this.schema.renameTable('partner_api_keys', 'organisation_api_keys')
    this.schema.renameTable('partner_programs', 'organisation_programs')
    this.schema.renameTable('partner_idempotency_keys', 'organisation_idempotency_keys')
    this.schema.renameTable('partner_affiliates', 'organisation_affiliates')
    this.schema.renameTable('partner_links', 'organisation_links')
    this.schema.renameTable('partner_clicks', 'organisation_clicks')
    this.schema.renameTable('partner_events', 'organisation_events')
    this.schema.renameTable('partner_commissions', 'organisation_commissions')
    this.schema.renameTable('partner_webhook_endpoints', 'organisation_webhook_endpoints')
    this.schema.renameTable('partner_webhook_events', 'organisation_webhook_events')
    this.schema.renameTable('partner_webhook_deliveries', 'organisation_webhook_deliveries')
    this.schema.renameTable('partner_dashboard_sessions', 'organisation_dashboard_sessions')
  }

  async down() {
    this.schema.renameTable('organisations', 'partners')
    this.schema.renameTable('organisation_members', 'partner_members')
    this.schema.renameTable('organisation_api_keys', 'partner_api_keys')
    this.schema.renameTable('organisation_programs', 'partner_programs')
    this.schema.renameTable('organisation_idempotency_keys', 'partner_idempotency_keys')
    this.schema.renameTable('organisation_affiliates', 'partner_affiliates')
    this.schema.renameTable('organisation_links', 'partner_links')
    this.schema.renameTable('organisation_clicks', 'partner_clicks')
    this.schema.renameTable('organisation_events', 'partner_events')
    this.schema.renameTable('organisation_commissions', 'partner_commissions')
    this.schema.renameTable('organisation_webhook_endpoints', 'partner_webhook_endpoints')
    this.schema.renameTable('organisation_webhook_events', 'partner_webhook_events')
    this.schema.renameTable('organisation_webhook_deliveries', 'partner_webhook_deliveries')
    this.schema.renameTable('organisation_dashboard_sessions', 'partner_dashboard_sessions')
  }
}
