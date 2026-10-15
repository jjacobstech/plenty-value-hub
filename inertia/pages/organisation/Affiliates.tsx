import { router } from '@inertiajs/react'
import OrganisationLayout, { card, subtle, type OrganisationRole } from '@/components/organisation/OrganisationLayout'

type AffiliateRow = {
  id: string
  externalUserId: string
  displayName: string | null
  status: string
  created: string
}

type AffiliatesProps = { affiliates: AffiliateRow[]; role: OrganisationRole; livemode: boolean }

export default function Affiliates({ affiliates, role, livemode }: AffiliatesProps) {
  const canManage = role === 'owner' || role === 'admin'
  return (
    <OrganisationLayout title="Affiliates" role={role} livemode={livemode}>
      <p className="mb-4 text-sm text-gray-600">
        Affiliates are created by your server with POST /api/v1/organisations/affiliates. Suspending one stops new
        links and new commissions.
      </p>
      <div className={card}>
        {affiliates.length === 0 && <p className="text-sm text-gray-600">No affiliates yet.</p>}
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Affiliate</th>
              <th>Your user id</th>
              <th>Status</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {affiliates.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="py-2">
                  {a.displayName ?? '—'} <span className="font-mono text-gray-500">{a.id}</span>
                </td>
                <td className="font-mono">{a.externalUserId}</td>
                <td className="capitalize">{a.status}</td>
                <td>{new Date(a.created).toLocaleDateString()}</td>
                <td className="text-right">
                  {canManage && a.status === 'active' && (
                    <button
                      type="button"
                      className={subtle}
                      onClick={() => router.post(`/organisation/affiliates/${a.id}/suspend`)}
                    >
                      Suspend
                    </button>
                  )}
                  {canManage && a.status === 'suspended' && (
                    <button
                      type="button"
                      className={subtle}
                      onClick={() => router.post(`/organisation/affiliates/${a.id}/reactivate`)}
                    >
                      Reactivate
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
