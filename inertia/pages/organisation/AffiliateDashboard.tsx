import { Head } from '@inertiajs/react'

type Money = { count: number; amount: number | null; currency: string | null }
type Totals = {
  clicks: number
  unique_clicks: number
  conversions: number
  conversion_rate: number
  commissions: Record<'pending' | 'approved' | 'paid' | 'reversed', Money>
}
type DayPoint = { day: string; clicks: number; conversions: number }
type LinkRow = {
  id: string
  url: string
  productRef: string | null
  campaignRef: string | null
  status: string
}
type CommissionRow = {
  id: string
  amount: number
  currency: string
  status: string
  created: string
}

type AffiliateDashboardProps = {
  organisationName: string
  affiliateName: string
  livemode: boolean
  returnUrl: string | null
  totals: Totals
  series: DayPoint[]
  links: LinkRow[]
  commissions: CommissionRow[]
}

function money(m: Money) {
  if (m.count === 0) return '0'
  if (m.amount === null || m.currency === null) return `${m.count} (mixed currencies)`
  return `${(m.amount / 100).toFixed(2)} ${m.currency} · ${m.count}`
}

function copy(value: string) {
  navigator.clipboard?.writeText(value).catch(() => undefined)
}

/** Read-only affiliate dashboard for one organisation. No marketplace navigation. */
export default function AffiliateDashboard(props: AffiliateDashboardProps) {
  const { organisationName, affiliateName, livemode, returnUrl, totals, series, links, commissions } =
    props
  const peak = Math.max(1, ...series.map((p) => p.clicks))

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Head title={`${organisationName} · Affiliate dashboard`} />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-stone-500">{organisationName}</div>
            <div className="text-lg font-semibold">{affiliateName}</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {!livemode && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
                Test data
              </span>
            )}
            {returnUrl && (
              <a
                href={returnUrl}
                className="rounded-md border border-stone-300 px-3 py-1.5 hover:bg-stone-100"
              >
                Back
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <p className="text-sm text-stone-600">Last 30 days.</p>
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Clicks', totals.clicks],
            ['Unique clicks', totals.unique_clicks],
            ['Conversions', totals.conversions],
            ['Conversion rate', `${(totals.conversion_rate * 100).toFixed(1)}%`],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs uppercase text-stone-500">{label}</div>
              <div className="text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(['pending', 'approved', 'paid', 'reversed'] as const).map((bucket) => (
            <div key={bucket} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="text-xs uppercase text-stone-500">Commissions {bucket}</div>
              <div className="font-semibold">{money(totals.commissions[bucket])}</div>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Clicks by day</h2>
          {series.length === 0 && (
            <p className="text-sm text-stone-600">No clicks in this period.</p>
          )}
          <div className="space-y-1">
            {series.map((point) => (
              <div key={point.day} className="flex items-center gap-3 text-xs">
                <span className="w-24 shrink-0 text-stone-500">{point.day}</span>
                <div
                  className="h-3 rounded bg-stone-900"
                  style={{ width: `${(point.clicks / peak) * 100}%`, minWidth: '2px' }}
                />
                <span className="text-stone-600">
                  {point.clicks} clicks · {point.conversions} conversions
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Your links</h2>
          {links.length === 0 && <p className="text-sm text-stone-600">No links yet.</p>}
          <ul className="divide-y divide-stone-100 text-sm">
            {links.map((link) => (
              <li key={link.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <div className="break-all font-mono">{link.url}</div>
                  <div className="text-stone-500">
                    {[link.productRef, link.campaignRef].filter(Boolean).join(' · ') ||
                      'Default link'}{' '}
                    · {link.status}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-stone-300 px-2 py-1 text-xs"
                  onClick={() => copy(link.url)}
                >
                  Copy link
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Commissions</h2>
          {commissions.length === 0 && (
            <p className="text-sm text-stone-600">No commissions yet.</p>
          )}
          <ul className="divide-y divide-stone-100 text-sm">
            {commissions.map((c) => (
              <li key={c.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="font-mono">{c.id}</span>
                <span>
                  {(c.amount / 100).toFixed(2)} {c.currency}
                </span>
                <span className="capitalize">{c.status}</span>
                <span className="text-stone-500">{new Date(c.created).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
