import { router } from '@inertiajs/react'
import OrganisationLayout, { card, subtle, type OrganisationRole } from '@/components/organisation/OrganisationLayout'

type EventRow = {
  id: string
  event_id: string
  type: string
  status: string
  reason: string | null
  affiliate: string | null
  amount: number | null
  currency: string | null
  commission: string | null
  occurred_at: number
}
type CommissionRow = {
  id: string
  event: string | null
  affiliate: string | null
  amount: number
  currency: string
  status: string
  hold_until: number
}

type ActivityProps = {
  events: EventRow[]
  commissions: CommissionRow[]
  status: string
  role: OrganisationRole
  livemode: boolean
}

const FILTERS = ['', 'attributed', 'unattributed', 'rejected', 'reversed', 'pending', 'approved']

export default function Activity({ events, commissions, status, role, livemode }: ActivityProps) {
  const canManage = role === 'owner' || role === 'admin'
  return (
    <OrganisationLayout title="Events & commissions" role={role} livemode={livemode}>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <a
            key={f || 'all'}
            href={f ? `/organisation/activity?status=${f}` : '/organisation/activity'}
            className={`rounded-md border px-3 py-1 ${status === f ? 'border-[#001845] bg-[#001845] text-white' : 'border-gray-300 bg-white'}`}
          >
            {f || 'All'}
          </a>
        ))}
      </div>

      <h2 className="mb-2 font-semibold">Events</h2>
      <div className={`${card} mb-8 overflow-x-auto`}>
        {events.length === 0 && <p className="text-sm text-gray-600">No events for this filter.</p>}
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Your event id</th>
              <th>Type</th>
              <th>Status</th>
              <th>Affiliate</th>
              <th>Occurred</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-gray-100">
                <td className="py-2 font-mono">{e.event_id}</td>
                <td>{e.type}</td>
                <td className="capitalize">
                  {e.status}
                  {e.reason ? ` · ${e.reason}` : ''}
                </td>
                <td className="font-mono text-xs">{e.affiliate ?? '—'}</td>
                <td>{new Date(e.occurred_at * 1000).toLocaleString()}</td>
                <td className="text-right">
                  {canManage && e.status === 'attributed' && (
                    <button
                      type="button"
                      className={subtle}
                      onClick={() =>
                        router.post(`/organisation/events/${e.id}/reverse`, {
                          reason: 'Reversed in the portal',
                        })
                      }
                    >
                      Reverse
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 font-semibold">Commissions</h2>
      <div className={`${card} overflow-x-auto`}>
        {commissions.length === 0 && (
          <p className="text-sm text-gray-600">No commissions for this filter.</p>
        )}
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Commission</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Hold ends</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="py-2 font-mono">{c.id}</td>
                <td>
                  {(c.amount / 100).toFixed(2)} {c.currency}
                </td>
                <td className="capitalize">{c.status}</td>
                <td>{new Date(c.hold_until * 1000).toLocaleDateString()}</td>
                <td className="space-x-2 text-right">
                  {canManage && c.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className={subtle}
                        onClick={() => router.post(`/organisation/commissions/${c.id}/approve`)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={subtle}
                        onClick={() =>
                          router.post(`/organisation/commissions/${c.id}/reject`, {
                            reason: 'Rejected in the portal',
                          })
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OrganisationLayout>
  )
}
