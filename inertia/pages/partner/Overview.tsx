import PartnerLayout, { card, type PartnerRole } from '@/components/partner/PartnerLayout'

type Money = { count: number; amount: number | null; currency: string | null }
type Totals = {
  clicks: number
  unique_clicks: number
  conversions: number
  conversion_rate: number
  commissions: Record<'pending' | 'approved' | 'paid' | 'reversed', Money>
}
type RecentEvent = { id: string; type: string; status: string; reason: string | null; occurredAt: string }

type OverviewProps = {
  partner: { publicId: string; name: string; status: string }
  role: PartnerRole
  livemode: boolean
  totals: Totals
  recentEvents: RecentEvent[]
}

function money(m: Money) {
  if (m.count === 0) return '0'
  if (m.amount === null || m.currency === null) return `${m.count} (mixed currencies)`
  return `${(m.amount / 100).toFixed(2)} ${m.currency} · ${m.count}`
}

export default function Overview({ partner, role, livemode, totals, recentEvents }: OverviewProps) {
  return (
    <PartnerLayout title={partner.name} role={role} livemode={livemode}>
      <p className="mb-6 text-sm text-stone-600">Last 30 days, {livemode ? 'live' : 'test'} data.</p>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={card}><div className="text-xs uppercase text-stone-500">Clicks</div><div className="text-2xl font-semibold">{totals.clicks}</div></div>
        <div className={card}><div className="text-xs uppercase text-stone-500">Unique clicks</div><div className="text-2xl font-semibold">{totals.unique_clicks}</div></div>
        <div className={card}><div className="text-xs uppercase text-stone-500">Conversions</div><div className="text-2xl font-semibold">{totals.conversions}</div></div>
        <div className={card}><div className="text-xs uppercase text-stone-500">Conversion rate</div><div className="text-2xl font-semibold">{(totals.conversion_rate * 100).toFixed(1)}%</div></div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(['pending', 'approved', 'paid', 'reversed'] as const).map((bucket) => (
          <div key={bucket} className={card}>
            <div className="text-xs uppercase text-stone-500">Commissions {bucket}</div>
            <div className="text-lg font-semibold">{money(totals.commissions[bucket])}</div>
          </div>
        ))}
      </div>
      <h2 className="mb-3 text-lg font-semibold">Latest events</h2>
      <div className={card}>
        {recentEvents.length === 0 && <p className="text-sm text-stone-600">No events yet. Send one from your server with POST /v1/events.</p>}
        <ul className="divide-y divide-stone-100 text-sm">
          {recentEvents.map((e) => (
            <li key={e.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span className="font-mono">{e.id}</span>
              <span>{e.type}</span>
              <span className="capitalize">{e.status}{e.reason ? ` · ${e.reason}` : ''}</span>
              <span className="text-stone-500">{new Date(e.occurredAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </PartnerLayout>
  )
}
