import { useForm, router } from '@inertiajs/react'
import OrganisationLayout, {
  button,
  card,
  input,
  subtle,
  type OrganisationRole,
} from '@/components/organisation/OrganisationLayout'

type Member = { id: number; email: string; name: string | null; role: OrganisationRole }

type TeamProps = { members: Member[]; role: OrganisationRole; livemode: boolean }

export default function Team({ members, role, livemode }: TeamProps) {
  const form = useForm({ email: '', role: 'developer' as 'admin' | 'developer' | 'viewer' })
  const canManage = role === 'owner' || role === 'admin'

  return (
    <OrganisationLayout title="Team" role={role} livemode={livemode}>
      {canManage && (
        <form
          className={`${card} mb-6 flex flex-wrap items-end gap-3`}
          onSubmit={(e) => {
            e.preventDefault()
            form.post('/organisation/team/invite', {
              preserveScroll: true,
              onSuccess: () => form.reset('email'),
            })
          }}
        >
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-gray-600">Email of an existing account</span>
            <input
              className={input}
              value={form.data.email}
              onChange={(e) => form.setData('email', e.target.value)}
            />
            {form.errors.email && <span className="text-red-700">{form.errors.email}</span>}
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Role</span>
            <select
              className={input}
              value={form.data.role}
              onChange={(e) =>
                form.setData('role', e.target.value as 'admin' | 'developer' | 'viewer')
              }
            >
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <button type="submit" className={button} disabled={form.processing || !form.data.email}>
            Add member
          </button>
        </form>
      )}
      <div className={card}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="py-2">{m.name ?? '—'}</td>
                <td>{m.email}</td>
                <td className="capitalize">{m.role}</td>
                <td className="text-right">
                  {canManage && m.role !== 'owner' && (
                    <button
                      type="button"
                      className={subtle}
                      onClick={() => router.post(`/organisation/team/${m.id}/remove`)}
                    >
                      Remove
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
