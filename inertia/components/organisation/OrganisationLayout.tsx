import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export type OrganisationRole = 'owner' | 'admin' | 'developer' | 'viewer'

type OrganisationLayoutProps = {
  title: string
  role: OrganisationRole
  livemode: boolean
  children: ReactNode
}

/** The portal sits inside the same dashboard shell as the vendor and affiliate areas. Navigation lives in its sidebar. */
export default function OrganisationLayout({ title, role, livemode, children }: OrganisationLayoutProps) {
  const { props } = usePage() as unknown as {
    props: { flash?: { error?: string; success?: string } }
  }
  const flash = props.flash

  const setMode = (mode: 'test' | 'live') => {
    router.post('/organisation/mode', { mode })
  }

  return (
    <>
      <Head title={`${title} · Organisation portal`} />
      <DashboardLayout role="organisation">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#001845' }}>
              {title}
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs uppercase tracking-wide text-gray-600">
                {role}
              </span>
              <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 bg-white">
                <button
                  type="button"
                  onClick={() => setMode('test')}
                  className={`px-3 py-1.5 font-medium ${!livemode ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  style={!livemode ? { backgroundColor: '#001845' } : undefined}
                >
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => setMode('live')}
                  className={`px-3 py-1.5 font-medium ${livemode ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  style={livemode ? { backgroundColor: '#81C14B' } : undefined}
                >
                  Live
                </button>
              </div>
            </div>
          </div>
          {flash?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {flash.error}
            </div>
          )}
          {flash?.success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {flash.success}
            </div>
          )}
          {children}
        </div>
      </DashboardLayout>
    </>
  )
}

/** Shows a one-time secret with a copy button. Shown only in the response that created it. */
export function OneTimeSecret({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
      <div className="mb-1 text-sm font-semibold text-amber-900">{label}</div>
      <div className="mb-2 text-sm text-amber-900">Copy this now. It cannot be shown again.</div>
      <code className="block break-all rounded-md bg-white px-3 py-2 font-mono text-sm">
        {value}
      </code>
      <button
        type="button"
        className="mt-3 rounded-md border border-amber-400 px-3 py-1 text-sm font-medium hover:bg-amber-100"
        onClick={() => {
          navigator.clipboard?.writeText(value).catch(() => undefined)
        }}
      >
        Copy
      </button>
    </div>
  )
}

export const card = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm'
export const input =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001845]/20'
export const button =
  'rounded-md px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 bg-[#001845]'
export const subtle =
  'rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50'
