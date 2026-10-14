import { useForm } from '@inertiajs/react'
import PartnerLayout, { button, card, input, type PartnerRole } from '@/components/partner/PartnerLayout'

type Program = {
  attribution_window_days: number
  attribution_model: 'last_click' | 'first_click'
  allowed_event_types: string
  commission_mode: 'none' | 'flat' | 'percent'
  commission_flat_amount: number | null
  commission_percent_bps: number | null
  commission_currency: string | null
  commission_hold_days: number
  auto_approve_after_hold: boolean
  self_referral_blocked: boolean
  dedupe_unique_click_minutes: number
  allowed_redirect_domains: string
  click_id_param: string
}

type ProgramProps = { program: Program; role: PartnerRole; livemode: boolean }

export default function Programs({ program, role, livemode }: ProgramProps) {
  const form = useForm<Program>({ ...program })
  const canEdit = role === 'owner' || role === 'admin'
  const set = <K extends keyof Program>(key: K, value: Program[K]) => form.setData((data) => ({ ...data, [key]: value }))

  return (
    <PartnerLayout title="Program settings" role={role} livemode={livemode}>
      <form
        className={`${card} grid gap-4 md:grid-cols-2`}
        onSubmit={(e) => {
          e.preventDefault()
          form.post('/partner/program', { preserveScroll: true })
        }}
      >
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Attribution window (days)</span>
          <input type="number" className={input} disabled={!canEdit} value={form.data.attribution_window_days} onChange={(e) => set('attribution_window_days', Number(e.target.value))} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Attribution model</span>
          <select className={input} disabled={!canEdit} value={form.data.attribution_model} onChange={(e) => set('attribution_model', e.target.value as Program['attribution_model'])}>
            <option value="last_click">Last click</option>
            <option value="first_click">First click</option>
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-stone-600">Event types that count (comma separated)</span>
          <input className={input} disabled={!canEdit} value={form.data.allowed_event_types} onChange={(e) => set('allowed_event_types', e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Commission mode</span>
          <select className={input} disabled={!canEdit} value={form.data.commission_mode} onChange={(e) => set('commission_mode', e.target.value as Program['commission_mode'])}>
            <option value="none">None</option>
            <option value="flat">Flat amount</option>
            <option value="percent">Percent of event amount</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Flat amount (minor units, e.g. 500 = 5.00)</span>
          <input type="number" className={input} disabled={!canEdit} value={form.data.commission_flat_amount ?? ''} onChange={(e) => set('commission_flat_amount', e.target.value === '' ? null : Number(e.target.value))} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Percent rate (basis points, 1000 = 10%)</span>
          <input type="number" className={input} disabled={!canEdit} value={form.data.commission_percent_bps ?? ''} onChange={(e) => set('commission_percent_bps', e.target.value === '' ? null : Number(e.target.value))} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Commission currency (ISO code)</span>
          <input className={input} disabled={!canEdit} value={form.data.commission_currency ?? ''} onChange={(e) => set('commission_currency', e.target.value || null)} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Hold period (days)</span>
          <input type="number" className={input} disabled={!canEdit} value={form.data.commission_hold_days} onChange={(e) => set('commission_hold_days', Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" disabled={!canEdit} checked={form.data.auto_approve_after_hold} onChange={(e) => set('auto_approve_after_hold', e.target.checked)} />
          Approve automatically after the hold period
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" disabled={!canEdit} checked={form.data.self_referral_blocked} onChange={(e) => set('self_referral_blocked', e.target.checked)} />
          Block self-referrals
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Unique click window (minutes)</span>
          <input type="number" className={input} disabled={!canEdit} value={form.data.dedupe_unique_click_minutes} onChange={(e) => set('dedupe_unique_click_minutes', Number(e.target.value))} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-600">Click id parameter</span>
          <input className={input} disabled={!canEdit} value={form.data.click_id_param} onChange={(e) => set('click_id_param', e.target.value)} />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-stone-600">Allowed redirect domains (comma separated)</span>
          <input className={input} disabled={!canEdit} value={form.data.allowed_redirect_domains} onChange={(e) => set('allowed_redirect_domains', e.target.value)} />
        </label>
        {canEdit && (
          <div className="md:col-span-2">
            <button type="submit" className={button} disabled={form.processing}>Save settings</button>
            {Object.values(form.errors).map((message) => (
              <p key={message} className="mt-2 text-sm text-red-700">{message}</p>
            ))}
          </div>
        )}
      </form>
    </PartnerLayout>
  )
}
