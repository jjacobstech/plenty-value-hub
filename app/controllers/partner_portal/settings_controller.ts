import type { HttpContext } from '@adonisjs/core/http'
import PartnerMember from '#models/partner_member'
import PartnerProgram from '#models/partner_program'
import User from '#models/user'
import { requireCan } from '#services/partner/portal_guard'
import { inviteValidator, programValidator } from '#validators/partner_portal'
import PartnerApiException from '#exceptions/partner_api_exception'

function splitList(raw: string) {
  return raw.split(',').map((v) => v.trim()).filter(Boolean)
}

export default class SettingsController {
  async program({ inertia, portal }: HttpContext) {
    const program = await PartnerProgram.query().where('partner_id', portal.partner.id).where('livemode', portal.livemode).firstOrFail()
    return inertia.render('partner/Programs', {
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
        allowed_redirect_domains: portal.partner.allowedRedirectDomains.join(', '),
        click_id_param: portal.partner.clickIdParam,
      },
      role: portal.membership.role,
      livemode: portal.livemode,
    })
  }

  async updateProgram(ctx: HttpContext) {
    requireCan(ctx, 'manage_program')
    const data = await ctx.request.validateUsing(programValidator)
    const types = splitList(data.allowed_event_types)
    if (types.length === 0) throw new PartnerApiException('Add at least one event type.', 'invalid_request_error', 'parameter_invalid', 400, 'allowed_event_types')
    if (data.commission_mode === 'flat' && (data.commission_flat_amount == null || !data.commission_currency)) {
      throw new PartnerApiException('Flat commissions need an amount and a currency.', 'invalid_request_error', 'parameter_missing', 400, 'commission_flat_amount')
    }
    if (data.commission_mode === 'percent' && data.commission_percent_bps == null) {
      throw new PartnerApiException('Percent commissions need a rate.', 'invalid_request_error', 'parameter_missing', 400, 'commission_percent_bps')
    }

    const program = await PartnerProgram.query().where('partner_id', ctx.portal.partner.id).where('livemode', ctx.portal.livemode).firstOrFail()
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

    ctx.portal.partner.allowedRedirectDomains = splitList(data.allowed_redirect_domains)
    ctx.portal.partner.clickIdParam = data.click_id_param
    await ctx.portal.partner.save()
    return ctx.response.redirect().back()
  }

  async team({ inertia, portal }: HttpContext) {
    const members = await PartnerMember.query().where('partner_id', portal.partner.id).preload('user').orderBy('id', 'asc')
    return inertia.render('partner/Team', {
      members: members.map((m) => ({ id: m.id, email: m.user.email, name: m.user.fullName, role: m.role })),
      role: portal.membership.role,
      livemode: portal.livemode,
    })
  }

  /** Adds an existing account to the partner. Only owners and admins can invite. */
  async invite(ctx: HttpContext) {
    requireCan(ctx, 'manage_team')
    const data = await ctx.request.validateUsing(inviteValidator)
    const user = await User.findBy('email', data.email)
    if (!user) throw new PartnerApiException('No account has that email yet. Ask them to sign up first.', 'invalid_request_error', 'resource_missing', 404, 'email')
    await PartnerMember.updateOrCreate({ partnerId: ctx.portal.partner.id, userId: user.id }, { role: data.role })
    return ctx.response.redirect().back()
  }

  /** Removes a member. Owners cannot be removed here, and a member cannot remove themselves. */
  async remove(ctx: HttpContext) {
    requireCan(ctx, 'manage_team')
    const member = await PartnerMember.query().where('id', ctx.params.id).where('partner_id', ctx.portal.partner.id).firstOrFail()
    if (member.role === 'owner' || member.userId === ctx.auth.user!.id) {
      throw new PartnerApiException('This member cannot be removed here.', 'invalid_request_error', 'invalid_state_transition', 422)
    }
    await member.delete()
    return ctx.response.redirect().back()
  }
}
