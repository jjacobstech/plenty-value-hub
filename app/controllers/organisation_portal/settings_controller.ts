import type { HttpContext } from '@adonisjs/core/http'
import OrganisationMember from '#models/organisation_member'
import OrganisationProgram from '#models/organisation_program'
import User from '#models/user'
import { publicId } from '#services/organisation/public_id'
import { requireCan } from '#services/organisation/portal_guard'
import { inviteValidator, programValidator } from '#validators/organisation_portal'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import { assertDestinationAllowed } from '#services/organisation/link_service'

function splitList(raw: string) {
  return raw.split(',').map((v) => v.trim()).filter(Boolean)
}

export default class SettingsController {
  async program({ inertia, portal }: HttpContext) {
    const program = await OrganisationProgram.query().where('organisation_id', portal.organisation.id).where('livemode', portal.livemode).firstOrFail()
    return inertia.render('organisation/Programs', {
      program: {
        attribution_window_days: program.attributionWindowDays,
        attribution_model: program.attributionModel,
        allowed_event_types: program.allowedEventTypes.join(', '),
        commission_mode: program.commissionMode,
        commission_flat_amount: program.commissionFlatAmount,
        commission_percent_bps: program.commissionPercentBps,
        commission_currency: program.commissionCurrency,
        commission_hold_days: program.commissionHoldDays,
        auto_approve_after_hold: program.autoApproveAfterHold,
        self_referral_blocked: program.selfReferralBlocked,
        dedupe_unique_click_minutes: program.dedupeUniqueClickMinutes,
        allowed_redirect_domains: portal.organisation.allowedRedirectDomains.join(', '),
        click_id_param: portal.organisation.clickIdParam,
        fallback_url: portal.organisation.fallbackUrl ?? '',
      },
      role: portal.membership.role,
      livemode: portal.livemode,
    })
  }

  async updateProgram(ctx: HttpContext) {
    requireCan(ctx, 'manage_program')
    const data = await ctx.request.validateUsing(programValidator)
    const types = splitList(data.allowed_event_types)
    if (types.length === 0) throw new OrganisationApiException('Add at least one event type.', 'invalid_request_error', 'parameter_invalid', 400, 'allowed_event_types')
    if (data.commission_mode === 'flat' && (data.commission_flat_amount == null || !data.commission_currency)) {
      throw new OrganisationApiException('Flat commissions need an amount and a currency.', 'invalid_request_error', 'parameter_missing', 400, 'commission_flat_amount')
    }
    if (data.commission_mode === 'percent' && data.commission_percent_bps == null) {
      throw new OrganisationApiException('Percent commissions need a rate.', 'invalid_request_error', 'parameter_missing', 400, 'commission_percent_bps')
    }

    ctx.portal.organisation.allowedRedirectDomains = splitList(data.allowed_redirect_domains)
    ctx.portal.organisation.clickIdParam = data.click_id_param
    ctx.portal.organisation.fallbackUrl = data.fallback_url?.trim() || null
    if (ctx.portal.organisation.fallbackUrl) assertDestinationAllowed(ctx.portal.organisation, ctx.portal.organisation.fallbackUrl, ctx.portal.livemode)

    const program = await OrganisationProgram.query().where('organisation_id', ctx.portal.organisation.id).where('livemode', ctx.portal.livemode).firstOrFail()
    program.attributionWindowDays = data.attribution_window_days
    program.attributionModel = data.attribution_model
    program.allowedEventTypes = types
    program.commissionMode = data.commission_mode
    program.commissionFlatAmount = data.commission_mode === 'flat' ? (data.commission_flat_amount ?? null) : null
    program.commissionPercentBps = data.commission_mode === 'percent' ? (data.commission_percent_bps ?? null) : null
    program.commissionCurrency = data.commission_currency ? data.commission_currency.toUpperCase() : null
    program.commissionHoldDays = data.commission_hold_days
    program.autoApproveAfterHold = data.auto_approve_after_hold
    program.selfReferralBlocked = data.self_referral_blocked
    program.dedupeUniqueClickMinutes = data.dedupe_unique_click_minutes
    await program.save()
    await ctx.portal.organisation.save()
    return ctx.response.redirect().back()
  }

  async team({ inertia, portal }: HttpContext) {
    const members = await OrganisationMember.query().where('organisation_id', portal.organisation.id).preload('user').orderBy('id', 'asc')
    return inertia.render('organisation/Team', {
      members: members.map((m) => ({ id: m.publicId, email: m.user.email, name: m.user.fullName, role: m.role })),
      role: portal.membership.role,
      livemode: portal.livemode,
    })
  }

  /** Adds an existing account to the organisation. Only owners and admins can invite. */
  async invite(ctx: HttpContext) {
    requireCan(ctx, 'manage_team')
    const data = await ctx.request.validateUsing(inviteValidator)
    const user = await User.findBy('email', data.email)
    if (!user) throw new OrganisationApiException('No account has that email yet. Ask them to sign up first.', 'invalid_request_error', 'resource_missing', 404, 'email')
    const member = await OrganisationMember.firstOrNew({ organisationId: ctx.portal.organisation.id, userId: user.id }, { publicId: publicId('mem_') })
    member.role = data.role
    await member.save()
    return ctx.response.redirect().back()
  }

  /** Removes a member. Owners cannot be removed here, and a member cannot remove themselves. */
  async remove(ctx: HttpContext) {
    requireCan(ctx, 'manage_team')
    const member = await OrganisationMember.query().where('public_id', ctx.params.id).where('organisation_id', ctx.portal.organisation.id).firstOrFail()
    if (member.role === 'owner' || member.userId === ctx.auth.user!.id) {
      throw new OrganisationApiException('This member cannot be removed here.', 'invalid_request_error', 'invalid_state_transition', 422)
    }
    await member.delete()
    return ctx.response.redirect().back()
  }
}
