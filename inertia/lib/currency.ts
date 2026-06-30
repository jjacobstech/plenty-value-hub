/**
 * USD currency formatting utilities
 * Platform displays prices in USD for global reach across Africa and internationally.
 */

export const formatUSD = (amount, compact = false) => {
  if (amount === null || amount === undefined) return '$0'
  const num = Number(amount)
  if (Number.isNaN(num)) return '$0'

  if (compact) {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`
  }

  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export const formatUSDDecimal = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'
  const num = Number(amount)
  if (Number.isNaN(num)) return '$0.00'
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Aliases for backward compatibility — any import of formatNGN will now render USD
export const formatNGN = formatUSD
export const formatNGNDecimal = formatUSDDecimal
