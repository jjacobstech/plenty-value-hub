import { useForm, router } from '@inertiajs/react'
import OrganisationLayout, {
  OneTimeSecret,
  button,
  card,
  input,
  subtle,
  type OrganisationRole,
} from '@/components/organisation/OrganisationLayout'

type Endpoint = {
  id: string
  url: string
  description: string | null
  status: 'enabled' | 'disabled'
  events: string[]
  failingSince: string | null
}
type Delivery = {
  id: number
  endpoint: string
  type: string
  status: string
  attempt: number
  responseStatus: number | null
  excerpt: string | null
  nextAttemptAt: string | null
}

type WebhooksProps = {
  endpoints: Endpoint[]
  deliveries: Delivery[]
  role: OrganisationRole
  livemode: boolean
  newSecret: string | null
}

export default function Webhooks({
  endpoints,
  deliveries,
  role,
  livemode,
  newSecret,
}: WebhooksProps) {
  const form = useForm({ url: '', events: '', description: '' })
  const canManage = role !== 'viewer' && role !== undefined

  return (
    <OrganisationLayout title="Webhooks" role={role} livemode={livemode}>
      {newSecret && <OneTimeSecret label="Signing secret for this endpoint" value={newSecret} />}

      {canManage && (
        <form
          className={`${card} mb-6 grid gap-3 md:grid-cols-2`}
          onSubmit={(e) => {
            e.preventDefault()
            form.post('/organisation/webhooks', { preserveScroll: true })
          }}
        >
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block text-gray-600">Endpoint URL</span>
            <input
              className={input}
              value={form.data.url}
              onChange={(e) => form.setData('url', e.target.value)}
              placeholder="https://example.com/plenty-value/webhooks"
            />
            {form.errors.url && <span className="text-red-700">{form.errors.url}</span>}
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">
              Events (comma separated, blank for all)
            </span>
            <input
              className={input}
              value={form.data.events}
              onChange={(e) => form.setData('events', e.target.value)}
              placeholder="commission.approved, commission.reversed"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Description</span>
            <input
              className={input}
              value={form.data.description}
              onChange={(e) => form.setData('description', e.target.value)}
            />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className={button} disabled={form.processing || !form.data.url}>
              Add endpoint
            </button>
            <button
              type="button"
              className={subtle}
              onClick={() => router.post('/organisation/webhooks/test')}
            >
              Send test event
            </button>
          </div>
        </form>
      )}

      <div className={`${card} mb-6`}>
        <h2 className="mb-2 font-semibold">Endpoints</h2>
        {endpoints.length === 0 && <p className="text-sm text-gray-600">No endpoints yet.</p>}
        <ul className="divide-y divide-gray-100 text-sm">
          {endpoints.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <div className="font-mono break-all">{e.url}</div>
                <div className="text-gray-500">
                  {e.id} · {e.status}
                  {e.failingSince ? ' · failing' : ''} · {e.events.join(', ')}
                </div>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={subtle}
                    onClick={() => router.post(`/organisation/webhooks/${e.id}/rotate`)}
                  >
                    Rotate secret
                  </button>
                  {e.status === 'enabled' ? (
                    <button
                      type="button"
                      className={subtle}
                      onClick={() => router.post(`/organisation/webhooks/${e.id}/disable`)}
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={subtle}
                      onClick={() => router.post(`/organisation/webhooks/${e.id}/enable`)}
                    >
                      Enable
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={card}>
        <h2 className="mb-2 font-semibold">Deliveries</h2>
        {deliveries.length === 0 && <p className="text-sm text-gray-600">No deliveries yet.</p>}
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Event</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Response</th>
              <th>Next try</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 align-top">
                <td className="py-2">{d.type}</td>
                <td className="capitalize">{d.status}</td>
                <td>{d.attempt}</td>
                <td className="max-w-xs break-all text-gray-600">
                  {d.responseStatus ?? '—'} {d.excerpt ? `· ${d.excerpt.slice(0, 120)}` : ''}
                </td>
                <td>{d.nextAttemptAt ? new Date(d.nextAttemptAt).toLocaleString() : '—'}</td>
                <td className="text-right">
                  {canManage && d.status !== 'pending' && (
                    <button
                      type="button"
                      className={subtle}
                      onClick={() => router.post(`/organisation/deliveries/${d.id}/resend`)}
                    >
                      Resend
                    </button>
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
