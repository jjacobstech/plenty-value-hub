import env from '#start/env'

export const paymentConfig = {
  defaultProvider: env.get('PAYMENT_DEFAULT_PROVIDER') || 'manual',
  currency: env.get('PAYMENT_CURRENCY') || 'USD',
  webhookUrl: env.get('PAYMENT_WEBHOOK_URL_BASE') || 'http://localhost:3333/api/payments/webhook',

  providers: {
    manual: {
      enabled: true,
      name: 'manual',
      label: 'Manual / Offline',
      description: 'Manual checkout without an automated gateway',
    },

    stripe: {
      enabled: true,
      name: 'stripe',
      label: 'Stripe',
      description: 'Accept credit cards and digital wallets globally via Stripe',
      publicKey: env.get('STRIPE_PUBLIC_KEY'),
      secretKey: env.get('STRIPE_SECRET_KEY'),
      webhookSecret: env.get('STRIPE_WEBHOOK_SECRET'),
      apiVersion: '2024-01-01',
      timeout: 30000,
    },

    paystack: {
      enabled: true,
      name: 'paystack',
      label: 'Paystack',
      description: 'Accept cards, mobile money, and bank transfers across Africa',
      publicKey: env.get('PAYSTACK_PUBLIC_KEY'),
      secretKey: env.get('PAYSTACK_SECRET_KEY'),
      webhookSecret: env.get('PAYSTACK_WEBHOOK_SECRET'),
      apiBaseUrl: 'https://api.paystack.co',
      timeout: 30000,
    },

    flutterwave: {
      enabled: true,
      name: 'flutterwave',
      label: 'Flutterwave',
      description: 'Accept multi-currency payments globally via Flutterwave',
      publicKey: env.get('FLUTTERWAVE_PUBLIC_KEY'),
      secretKey: env.get('FLUTTERWAVE_SECRET_KEY'),
      webhookSecret: env.get('FLUTTERWAVE_WEBHOOK_SECRET'),
      encryptionKey: env.get('FLUTTERWAVE_ENCRYPTION_KEY'),
      apiBaseUrl: 'https://api.flutterwave.com/v3',
      timeout: 30000,
    },

    paypal: {
      enabled: true,
      name: 'paypal',
      label: 'PayPal',
      description: 'Accept PayPal wallet payments and credit cards worldwide',
      clientId: env.get('PAYPAL_CLIENT_ID'),
      clientSecret: env.get('PAYPAL_CLIENT_SECRET'),
      webhookId: env.get('PAYPAL_WEBHOOK_ID'),
      mode: env.get('PAYPAL_MODE') || 'sandbox',
      apiBaseUrl:
        env.get('PAYPAL_MODE') === 'live'
          ? 'https://api.paypal.com'
          : 'https://api.sandbox.paypal.com',
      timeout: 30000,
    },
  },

  // Webhook endpoints for each provider
  webhookEndpoints: {
    stripe: '/api/payments/webhook/stripe',
    paystack: '/api/payments/webhook/paystack',
    flutterwave: '/api/payments/webhook/flutterwave',
    paypal: '/api/payments/webhook/paypal',
  },

  // Retry configuration
  retryPolicy: {
    maxRetries: 3,
    retryDelay: 1000, // ms
    backoffMultiplier: 2,
  },

  // Payment limits
  limits: {
    minAmount: 100, // cents
    maxAmount: 10000000, // cents (100,000 in currency units)
    dailyLimit: 500000000, // cents
  },

  // Supported currencies per provider
  supportedCurrencies: {
    stripe: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'NGN', 'KES', 'GHS'],
    paystack: ['NGN', 'USD', 'KES', 'GHS'],
    flutterwave: ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'GHS', 'ZAR', 'CAD', 'AUD'],
    paypal: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'NGN', 'KES'],
  },
}

export type PaymentProvider = keyof typeof paymentConfig.providers
export type PaymentCurrency = string

export interface PaymentProviderConfig {
  enabled: boolean
  name: string
  label: string
  description: string
  publicKey?: string
  secretKey?: string
  webhookSecret?: string
  [key: string]: any
}
