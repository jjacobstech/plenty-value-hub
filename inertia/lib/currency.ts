/**
 * Dynamic currency formatting utilities
 * Platform displays prices formatted according to admin settings or provided currency parameters.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  NGN: '₦',
  EUR: '€',
  GBP: '£',
  KES: 'KSh',
  GHS: 'GH₵',
  CAD: 'CA$',
  AUD: 'A$',
}

export const getActiveCurrencySymbol = (): string => {
  if (typeof window !== 'undefined') {
    // 1. Check window.__inertia_page
    const winProp = (window as any)?.__inertia_page?.props?.currencySymbol
    if (winProp) return winProp

    // 2. Check Inertia root element dataset / page data
    const appEl = document.getElementById('app')
    if (appEl?.dataset?.page) {
      try {
        const pageData = JSON.parse(appEl.dataset.page)
        if (pageData?.props?.currencySymbol) {
          return pageData.props.currencySymbol
        }
      } catch {}
    }
  }
  return '$'
}

export const formatCurrency = (amount: any, currencySymbol?: string, compact = false) => {
  const symbol = currencySymbol || getActiveCurrencySymbol()
  if (amount === null || amount === undefined) return `${symbol}0`
  const num = Number(amount)
  if (Number.isNaN(num)) return `${symbol}0`

  if (compact) {
    if (num >= 1_000_000) return `${symbol}${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${symbol}${(num / 1_000).toFixed(1)}K`
  }

  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export const formatUSD = (amount: any, compact = false, currencySymbol?: string) =>
  formatCurrency(amount, currencySymbol, compact)

export const formatUSDDecimal = (amount: any, currencySymbol?: string) => {
  const symbol = currencySymbol || getActiveCurrencySymbol()
  if (amount === null || amount === undefined) return `${symbol}0.00`
  const num = Number(amount)
  if (Number.isNaN(num)) return `${symbol}0.00`
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Aliases for backward compatibility
export const formatNGN = formatUSD
export const formatNGNDecimal = formatUSDDecimal
