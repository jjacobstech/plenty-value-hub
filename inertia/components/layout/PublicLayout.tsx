import type { SharedPageProps } from '@/types'
import React, { type ReactNode } from 'react'
import { usePage, router } from '@inertiajs/react'
import Navbar from './Navbar'
import Footer from './Footer'
import { CURRENCY_SYMBOLS } from '@/lib/currency'

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { user, currencySymbol, systemCurrency } = usePage<SharedPageProps>().props
  const symbol = currencySymbol || (systemCurrency ? CURRENCY_SYMBOLS[systemCurrency] : '$') || '$'

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).__currencySymbol = symbol
    }
  }, [symbol])

  const handleLogout = () => {
    router.post('/logout')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ?? null} onLogout={handleLogout} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
