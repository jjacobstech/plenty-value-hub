import { BaseSchema } from '@adonisjs/lucid/schema'

/** partner_id becomes organisation_id on every organisation table. The stored reversal reason follows. */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('organisation_affiliates', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_api_keys', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_clicks', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_commissions', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_dashboard_sessions', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_events', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_idempotency_keys', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_links', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_members', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_programs', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_webhook_endpoints', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.alterTable('organisation_webhook_events', (table) => {
      table.renameColumn('partner_id', 'organisation_id')
    })
    this.schema.raw("update organisation_events set reason = 'reversed_by_organisation' where reason = 'reversed_by_partner'")
  }

  async down() {
    this.schema.alterTable('organisation_affiliates', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_api_keys', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_clicks', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_commissions', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_dashboard_sessions', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_events', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_idempotency_keys', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_links', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_members', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_programs', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_webhook_endpoints', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.alterTable('organisation_webhook_events', (table) => {
      table.renameColumn('organisation_id', 'partner_id')
    })
    this.schema.raw("update organisation_events set reason = 'reversed_by_partner' where reason = 'reversed_by_organisation'")
  }
}
