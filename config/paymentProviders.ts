/**
 * Payment Providers Registry
 *
 * Centralized configuration for all supported payment providers.
 * Includes branding constraints, supported currencies, and feature flags.
 *
 * IMPORTANT: Logo files must be provided as official SVGs at:
 * - public/logos/stripe.svg
 * - public/logos/paypal.svg
 * - public/logos/flutterwave.svg
 * - public/logos/paystack.svg
 *
 * See public/logos/README.md for brand guidelines and file sources.
 */

export type PaymentProviderId = 'stripe' | 'paypal' | 'flutterwave' | 'paystack'

export interface PaymentProviderConfig {
  /** Unique provider identifier */
  id: PaymentProviderId

  /** Display name for UI */
  displayName: string

  /** List of supported ISO currency codes */
  supportedCurrencies: string[]

  /** Whether this provider is enabled for transactions */
  enabled: boolean

  /** Minimum clear space around logo (% of logo height) */
  minClearSpace: number

  /** Minimum recommended height for logo in pixels */
  minHeight: number

  /** Maximum recommended height for logo in pixels */
  maxHeight: number

  /** Brand color (primary) for use in UI contexts */
  brandColor: string

  /** Alternative brand color (secondary) */
  brandColorAlt?: string

  /** Description for accessibility */
  description: string

  /** URL to provider's documentation */
  docsUrl: string
}

export const PAYMENT_PROVIDERS: Record<PaymentProviderId, PaymentProviderConfig> = {
  stripe: {
    id: 'stripe',
    displayName: 'Stripe',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'AED', 'ZAR', 'NGN'],
    enabled: true,
    minClearSpace: 25,
    minHeight: 24,
    maxHeight: 120,
    brandColor: '#635BFF',
    description: 'Stripe payment processing',
    docsUrl: 'https://stripe.com/docs/branding/stripe-brand-resources',
  },

  paypal: {
    id: 'paypal',
    displayName: 'PayPal',
    supportedCurrencies: [
      'USD',
      'EUR',
      'GBP',
      'AUD',
      'JPY',
      'CAD',
      'CHF',
      'CNY',
      'INR',
      'MXN',
      'ZAR',
      'NGN',
    ],
    enabled: true,
    minClearSpace: 25,
    minHeight: 24,
    maxHeight: 120,
    brandColor: '#003087',
    brandColorAlt: '#009cde',
    description: 'PayPal digital payments',
    docsUrl: 'https://www.paypal.com/en/business/tools/brand-guidance',
  },

  flutterwave: {
    id: 'flutterwave',
    displayName: 'Flutterwave',
    supportedCurrencies: ['NGN', 'GHS', 'KES', 'RWF', 'UGX', 'ZAR', 'TZS', 'USD', 'EUR'],
    enabled: true,
    minClearSpace: 25,
    minHeight: 24,
    maxHeight: 120,
    brandColor: '#F00075',
    description: 'Flutterwave African payments',
    docsUrl: 'https://developer.flutterwave.com/docs/brand-guidelines',
  },

  paystack: {
    id: 'paystack',
    displayName: 'Paystack',
    supportedCurrencies: ['NGN', 'USD', 'ZAR', 'KES', 'GHS', 'UGX', 'RWF', 'TZS'],
    enabled: true,
    minClearSpace: 25,
    minHeight: 24,
    maxHeight: 120,
    brandColor: '#0EA5E9',
    description: 'Paystack payment gateway',
    docsUrl: 'https://paystack.com/brand',
  },
}

/**
 * Get provider config by ID with type safety
 */
export function getProviderConfig(id: PaymentProviderId): PaymentProviderConfig {
  const config = PAYMENT_PROVIDERS[id]
  if (!config) {
    throw new Error(`Unknown payment provider: ${id}`)
  }
  return config
}

/**
 * Get all enabled providers
 */
export function getEnabledProviders(): PaymentProviderConfig[] {
  return Object.values(PAYMENT_PROVIDERS).filter((p) => p.enabled)
}

/**
 * Check if a provider supports a currency
 */
export function providerSupportsCurrency(providerId: PaymentProviderId, currency: string): boolean {
  const config = getProviderConfig(providerId)
  return config.supportedCurrencies.includes(currency.toUpperCase())
}

/**
 * Clamp logo height to provider's recommended range
 */
export function getClampedLogoHeight(
  providerId: PaymentProviderId,
  requestedHeight: number
): number {
  const config = getProviderConfig(providerId)
  return Math.max(config.minHeight, Math.min(config.maxHeight, requestedHeight))
}
