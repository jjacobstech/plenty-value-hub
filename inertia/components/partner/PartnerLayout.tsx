import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'

export type PartnerRole = 'owner' | 'admin' | 'developer' | 'viewer'

type PartnerLayoutProps = {
  title: string
  role: PartnerRole
  livemode: boolean
  children: ReactNode
}

const NAV = [
  { href: '/partner', label: 'Overview' },
  { href: '/partner/keys', label: 'API keys' },
  { href: '/partner/webhooks', label: 'Webhooks' },
  { href: '/partner/affiliates', label: 'Affiliates' },
  { href: '/partner/activity', label: 'Events & commissions' },
  { href: '/partner/program', label: 'Program' },
  { href: '/partner/team', label: 'Team' },
]

/** Shared frame for the developer portal: navigation, test/live switch and flash messages. */
export default function PartnerLayout({ title, role, livemode, children }: PartnerLayoutProps) {
  const { url, props } = usePage() as unknown as { url: string; props: { flash?: { error?: string; success?: string } } }
  const flash = props.flash

  const setMode = (mode: 'test' | 'live') => {
    router.post('/partner/mode', { mode })
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Head title={`${title} · Partner portal`} />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm font-semibold tracking-wide">Plenty Value · Partner portal</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-stone-300 px-2 py-0.5 text-xs uppercase tracking-wide text-stone-600">
              {role}
            </span>
            <div className="inline-flex overflow-hidden rounded-md border border-stone-300">
              <button
                type="button"
                onClick={() => setMode('test')}
                className={`px-3 py-1 ${!livemode ? 'bg-stone-900 text-white' : 'bg-white text-stone-700'}`}
              >
                Test
              </button>
              <button
                type="button"
                onClick={() => setMode('live')}
                className={`px-3 py-1 ${livemode ? 'bg-emerald-700 text-white' : 'bg-white text-stone-700'}`}
              >
                Live
              </button>
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 pb-2 text-sm">
          {NAV.map((item) => {
            const active = url === item.href || (item.href !== '/partner' && url.startsWith(item.href))
            return (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 ${active ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
              >
                {item.label}
              </a>
            )
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {flash?.error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{flash.error}</div>}
        {flash?.success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.success}</div>}
        <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
        {children}
      </main>
    </div>
  )
}

/** Shows a one-time secret with a copy button. Shown only in the response that created it. */
export function OneTimeSecret({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4">
      <div className="mb-1 text-sm font-medium text-amber-900">{label}</div>
      <div className="mb-2 text-sm text-amber-900">Copy this now. It cannot be shown again.</div>
      <code className="block break-all rounded bg-white px-3 py-2 font-mono text-sm">{value}</code>
      <button
        type="button"
        className="mt-2 rounded-md border border-amber-400 px-3 py-1 text-sm"
        onClick={() => {
          navigator.clipboard?.writeText(value).catch(() => undefined)
        }}
      >
        Copy
      </button>
    </div>
  )
}

export const card = 'rounded-lg border border-stone-200 bg-white p-4'
export const input = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm'
export const button = 'rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50'
export const subtle = 'rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700'
