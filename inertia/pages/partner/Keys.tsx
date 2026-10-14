import { useForm, router } from '@inertiajs/react'
import PartnerLayout, { OneTimeSecret, button, card, input, subtle, type PartnerRole } from '@/components/partner/PartnerLayout'

type KeyRow = { id: string; name: string; prefix: string; last4: string; created: string; lastUsedAt: string | null; revokedAt: string | null }

type KeysProps = { keys: KeyRow[]; livemode: boolean; role: PartnerRole; newSecret: string | null }

export default function Keys({ keys, livemode, role, newSecret }: KeysProps) {
  const form = useForm({ name: '' })
  const canManage = role !== 'viewer'

  return (
    <PartnerLayout title="API keys" role={role} livemode={livemode}>
      {newSecret && <OneTimeSecret label={`New ${livemode ? 'live' : 'test'} secret key`} value={newSecret} />}
      {canManage && (
        <form
          className={`${card} mb-6 flex flex-wrap items-end gap-3`}
          onSubmit={(e) => {
            e.preventDefault()
            form.post('/partner/keys', { preserveScroll: true, onSuccess: () => form.reset() })
          }}
        >
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-stone-600">Key name</span>
            <input className={input} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Production server" />
          </label>
          <button type="submit" className={button} disabled={form.processing || !form.data.name}>
            Create {livemode ? 'live' : 'test'} key
          </button>
          {form.errors.name && <p className="w-full text-sm text-red-700">{form.errors.name}</p>}
        </form>
      )}
      <div className={card}>
        {keys.length === 0 && <p className="text-sm text-stone-600">No keys yet.</p>}
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-stone-500">
            <tr><th className="py-2">Name</th><th>Key</th><th>Created</th><th>Last used</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-stone-100">
                <td className="py-2">{k.name}</td>
                <td className="font-mono">{k.prefix}…{k.last4}</td>
                <td>{new Date(k.created).toLocaleDateString()}</td>
                <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}</td>
                <td>{k.revokedAt ? 'Revoked' : 'Active'}</td>
                <td className="text-right">
                  {canManage && !k.revokedAt && (
                    <button type="button" className={subtle} onClick={() => router.post(`/partner/keys/${k.id}/revoke`)}>
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PartnerLayout>
  )
}
