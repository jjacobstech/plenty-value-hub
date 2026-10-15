import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationCommission from '#models/organisation_commission'
import OrganisationEvent from '#models/organisation_event'
import { transition } from '#services/organisation/commission_service'
import { requireCan } from '#services/organisation/portal_guard'
import { reverseEvent } from '#services/organisation/attribution_service'
import { commissionToApi, eventToApi } from '#services/organisation/serialize'
import { emit } from '#services/organisation/webhook_emitter'
import { reasonValidator } from '#validators/organisation_portal'

const LIST_LIMIT = 100

export default class ActivityController {
  async affiliates({ inertia, portal }: HttpContext) {
    const rows = await OrganisationAffiliate.query().where('organisation_id', portal.organisation.id).where('livemode', portal.livemode).orderBy('id', 'desc').limit(LIST_LIMIT)
    return inertia.render('organisation/Affiliates', {
      affiliates: rows.map((a) => ({ id: a.publicId, externalUserId: a.externalUserId, displayName: a.displayName, status: a.status, created: a.createdAt.toISO() ?? '' })),
      role: portal.membership.role,
      livemode: portal.livemode,
    })
  }

  async setAffiliateStatus(ctx: HttpContext, status: 'active' | 'suspended') {
    requireCan(ctx, 'manage_affiliates')
    const affiliate = await OrganisationAffiliate.query()
      .where('public_id', ctx.params.id)
      .where('organisation_id', ctx.portal.organisation.id)
      .where('livemode', ctx.portal.livemode)
      .firstOrFail()
    affiliate.status = status
    await affiliate.save()
    return ctx.response.redirect().back()
  }

  suspendAffiliate(ctx: HttpContext) {
    return this.setAffiliateStatus(ctx, 'suspended')
  }

  reactivateAffiliate(ctx: HttpContext) {
    return this.setAffiliateStatus(ctx, 'active')
  }

  async activity({ inertia, portal, request }: HttpContext) {
    const status = request.input('status')
    let events = OrganisationEvent.query().where('organisation_id', portal.organisation.id).where('livemode', portal.livemode).preload('click').preload('affiliate').preload('link').preload('commission').orderBy('id', 'desc').limit(LIST_LIMIT)
    if (status) events = events.where('status', status)
    let commissions = OrganisationCommission.query().where('organisation_id', portal.organisation.id).where('livemode', portal.livemode).preload('event').preload('affiliate').orderBy('id', 'desc').limit(LIST_LIMIT)
    if (status) commissions = commissions.where('status', status)
    const [eventRows, commissionRows] = await Promise.all([events, commissions])
    return inertia.render('organisation/Activity', {
      events: eventRows.map((e) => eventToApi(e)),
      commissions: commissionRows.map((c) => commissionToApi(c)),
      status: status ?? '',
      role: portal.membership.role,
      livemode: portal.livemode,
    })
  }

  async reverseEvent(ctx: HttpContext) {
    requireCan(ctx, 'manage_commissions')
    const event = await OrganisationEvent.query().where('public_id', ctx.params.id).where('organisation_id', ctx.portal.organisation.id).where('livemode', ctx.portal.livemode).preload('click').preload('affiliate').preload('link').preload('commission').firstOrFail()
    const data = await ctx.request.validateUsing(reasonValidator)
    await reverseEvent(event, data.reason)
    return ctx.response.redirect().back()
  }

  private async commissionAction(ctx: HttpContext, to: 'approved' | 'rejected') {
    requireCan(ctx, 'manage_commissions')
    const commission = await OrganisationCommission.query().where('public_id', ctx.params.id).where('organisation_id', ctx.portal.organisation.id).where('livemode', ctx.portal.livemode).preload('event').preload('affiliate').firstOrFail()
    const data = await ctx.request.validateUsing(reasonValidator)
    await db.transaction(async (trx) => {
      await transition(commission, to, { reason: data.reason }, trx)
      await emit(trx, commission.organisationId, commission.livemode, `commission.${to}`, commissionToApi(commission))
    })
    return ctx.response.redirect().back()
  }

  approveCommission(ctx: HttpContext) {
    return this.commissionAction(ctx, 'approved')
  }

  rejectCommission(ctx: HttpContext) {
    return this.commissionAction(ctx, 'rejected')
  }
}
