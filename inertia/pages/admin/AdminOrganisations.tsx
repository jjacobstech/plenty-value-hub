import { useForm, router } from '@inertiajs/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { button, card, input, subtle } from '@/components/organisation/OrganisationLayout'

type OrganisationRow = { id: string; name: string; status: 'active' | 'suspended'; contactEmail: string; members: number; created: string }

type AdminOrganisationsProps = { organisations: OrganisationRow[] }

export default function AdminOrganisations({ organisations }: AdminOrganisationsProps) {
  const form = useForm({ name: '', owner_email: '', domains: '' })

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-6xl space-y-6 p-4">
        <h1 className="text-2xl font-semibold">Organisations</h1>
        <form
          className={`${card} grid gap-3 md:grid-cols-3`}
          onSubmit={(e) => {
            e.preventDefault()
            form.post('/admin/organisations', { preserveScroll: true, onSuccess: () => form.reset() })
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block text-stone-600">Organisation name</span>
            <input className={input} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
            {form.errors.name && <span className="text-red-700">{form.errors.name}</span>}
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-stone-600">Owner email (existing account)</span>
            <input className={input} value={form.data.owner_email} onChange={(e) => form.setData('owner_email', e.target.value)} />
            {form.errors.owner_email && <span className="text-red-700">{form.errors.owner_email}</span>}
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-stone-600">Redirect domains (comma separated)</span>
            <input className={input} value={form.data.domains} onChange={(e) => form.setData('domains', e.target.value)} />
          </label>
          <div className="md:col-span-3">
            <button type="submit" className={button} disabled={form.processing}>Create organisation</button>
          </div>
        </form>

        <div className={card}>
          {organisations.length === 0 && <p className="text-sm text-stone-600">No organisations yet.</p>}
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-stone-500">
              <tr><th className="py-2">Name</th><th>Id</th><th>Contact</th><th>Members</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {organisations.map((p) => (
                <tr key={p.id} className="border-t border-stone-100">
                  <td className="py-2">{p.name}</td>
                  <td className="font-mono">{p.id}</td>
                  <td>{p.contactEmail}</td>
                  <td>{p.members}</td>
                  <td className="capitalize">{p.status}</td>
                  <td className="text-right">
                    {p.status === 'active'
                      ? <button type="button" className={subtle} onClick={() => router.post(`/admin/organisations/${p.id}/suspend`)}>Suspend</button>
                      : <button type="button" className={subtle} onClick={() => router.post(`/admin/organisations/${p.id}/reactivate`)}>Reactivate</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
