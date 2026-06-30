/**
 * AffiliateRedirect — Handles /ref/:link_code visits.
 * Tracks the click via backend, stores the link code in sessionStorage,
 * then redirects the visitor to the product page.
 */

import React, { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { apiClient } from '@/api/http-client'
import { Loader2 } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'

type AffiliateRedirectProps = {
  link_code: string
}

export default function AffiliateRedirect({ link_code }: AffiliateRedirectProps) {
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!link_code) {
      router.visit('/marketplace')
      return
    }

    apiClient
      .post('/affiliate-redirect', { link_code })
      .then((res: any) => {
        const { product_id } = res.data || res
        if (product_id) {
          // Store affiliate code so purchase flow can attribute it
          sessionStorage.setItem('pv_ref', link_code)
          router.visit(`/product/${product_id}`)
        } else {
          router.visit('/marketplace')
        }
      })
      .catch(() => {
        // Silently redirect even on error — don't block the user
        router.visit('/marketplace')
      })
  }, [link_code])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#81C14B' }} />
      <p className="text-sm text-muted-foreground">Redirecting you to the product…</p>
    </div>
  )
}

AffiliateRedirect.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
