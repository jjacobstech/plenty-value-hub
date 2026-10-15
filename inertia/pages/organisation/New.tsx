import { useForm } from '@inertiajs/react'
import OrganisationLayout, { button, card, input } from '@/components/organisation/OrganisationLayout'

export default function New() {
  const form = useForm({ name: '', domains: '' })

  return (
    <OrganisationLayout title="Create your organisation account" role="owner" livemode={false}>
      <form
        className={`${card} max-w-xl space-y-4`}
        onSubmit={(e) => {
          e.preventDefault()
          form.post('/organisation/new')
        }}
      >
        <p className="text-sm text-gray-600">
          You become the owner. You can add team members and create API keys once it is open.
        </p>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">Organisation name</span>
          <input
            className={input}
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            placeholder="Acme Media"
          />
          {form.errors.name && <span className="mt-1 block text-red-700">{form.errors.name}</span>}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">
            Redirect domains (optional, comma separated)
          </span>
          <input
            className={input}
            value={form.data.domains}
            onChange={(e) => form.setData('domains', e.target.value)}
            placeholder="shop.example.com"
          />
          {form.errors.domains && (
            <span className="mt-1 block text-red-700">{form.errors.domains}</span>
          )}
        </label>
        <button
          type="submit"
          className={button}
          disabled={form.processing || form.data.name.trim().length < 2}
        >
          Create organisation account
        </button>
      </form>
    </OrganisationLayout>
  )
}
