import SiteSetting from '#models/site_setting'
import PaymentGatewayKey from '#models/payment_gateway_key'

export type PaymentProviderKey = 'manual' | 'stripe' | 'paystack' | 'flutterwave' | 'paypal'

export interface PaymentProviderConfig {
  key: PaymentProviderKey
  name: string
  label: string
  enabled: boolean
  publicKey?: string | null
  secretKey?: string | null
  webhookSecret?: string | null
  description?: string | null
}

export type SupportedCurrency = 'USD' | 'NGN' | 'EUR' | 'GBP' | 'KES' | 'GHS' | 'CAD' | 'AUD'

export interface PaymentSettingsConfig {
  activeProvider: PaymentProviderKey
  currency: SupportedCurrency
  currencySymbol: string
  providers: PaymentProviderConfig[]
}

export const CURRENCY_MAP: Record<SupportedCurrency, { symbol: string; label: string }> = {
  USD: { symbol: '$', label: 'USD ($) - US Dollar' },
  NGN: { symbol: '₦', label: 'NGN (₦) - Nigerian Naira' },
  EUR: { symbol: '€', label: 'EUR (€) - Euro' },
  GBP: { symbol: '£', label: 'GBP (£) - British Pound' },
  KES: { symbol: 'KSh', label: 'KES (KSh) - Kenyan Shilling' },
  GHS: { symbol: 'GH₵', label: 'GHS (GH₵) - Ghanaian Cedi' },
  CAD: { symbol: 'CA$', label: 'CAD (CA$) - Canadian Dollar' },
  AUD: { symbol: 'A$', label: 'AUD (A$) - Australian Dollar' },
}

export interface PaymentInitResult {
  provider: PaymentProviderKey
  reference: string
  redirectUrl?: string | null
  clientToken?: string | null
  publicKey?: string | null
  metadata?: Record<string, any>
}

export interface PaymentVerifyResult {
  verified: boolean
  reference: string
  amount?: number
  currency?: string
  provider: PaymentProviderKey
  providerReference?: string
  metadata?: Record<string, any>
}

export class PaymentService {
  static readonly defaultProviders: PaymentProviderConfig[] = [
    {
      key: 'manual',
      name: 'manual',
      label: 'Manual / Offline',
      enabled: true,
      description: 'Collect payments manually outside of an automated gateway.',
    },
    {
      key: 'stripe',
      name: 'stripe',
      label: 'Stripe',
      enabled: false,
      description: 'Use Stripe Checkout or payment intents.',
    },
    {
      key: 'paystack',
      name: 'paystack',
      label: 'Paystack',
      enabled: false,
      description: 'Use Paystack for card and bank payments.',
    },
    {
      key: 'flutterwave',
      name: 'flutterwave',
      label: 'Flutterwave',
      enabled: false,
      description: 'Use Flutterwave for local and international payments.',
    },
    {
      key: 'paypal',
      name: 'paypal',
      label: 'PayPal',
      enabled: false,
      description: 'Use PayPal as an alternative checkout option.',
    },
  ]

  static normalizeConfig(input?: Partial<PaymentSettingsConfig> | null): PaymentSettingsConfig {
    const providers = this.defaultProviders.map((provider) => ({ ...provider }))
    const configuredProviders = Array.isArray(input?.providers) ? input?.providers : []

    const providerMap = new Map(providers.map((provider) => [provider.key, provider]))

    configuredProviders.forEach((provider) => {
      if (!provider?.key) return
      const existing = providerMap.get(provider.key as PaymentProviderKey)
      if (!existing) return
      Object.assign(existing, {
        key: provider.key,
        name: provider.name || existing.name,
        label: provider.label || existing.label,
        enabled: typeof provider.enabled === 'boolean' ? provider.enabled : existing.enabled,
        publicKey: provider.publicKey ?? existing.publicKey ?? null,
        secretKey: provider.secretKey ?? existing.secretKey ?? null,
        webhookSecret: provider.webhookSecret ?? existing.webhookSecret ?? null,
        description: provider.description ?? existing.description ?? null,
      })
    })

    const currency: SupportedCurrency =
      input?.currency && CURRENCY_MAP[input.currency as SupportedCurrency]
        ? (input.currency as SupportedCurrency)
        : 'USD'

    const activeProvider = this.getValidProviderKey(input?.activeProvider, providers)
    const enabledProviders = providers.filter((provider) => provider.enabled)
    const resolvedActiveProvider = enabledProviders.some(
      (provider) => provider.key === activeProvider
    )
      ? activeProvider
      : enabledProviders[0]?.key || 'manual'

    return {
      activeProvider: resolvedActiveProvider as PaymentProviderKey,
      currency,
      currencySymbol: CURRENCY_MAP[currency].symbol,
      providers,
    }
  }

  static parseConfig(rawValue?: string | null): PaymentSettingsConfig {
    if (!rawValue) return this.normalizeConfig()

    try {
      const parsed = JSON.parse(rawValue) as Partial<PaymentSettingsConfig>
      return this.normalizeConfig(parsed)
    } catch {
      return this.normalizeConfig()
    }
  }

  static async getConfig(): Promise<PaymentSettingsConfig> {
    const setting = await SiteSetting.findBy('key', 'payment_settings')
    const baseConfig = this.parseConfig(setting?.value)

    try {
      const activeGatewayConfigs = await PaymentGatewayKey.query().where('is_active', true)
      const gatewayMap = new Map(activeGatewayConfigs.map((gateway) => [gateway.gateway, gateway]))

      for (const provider of baseConfig.providers) {
        const gateway = gatewayMap.get(provider.key)
        if (!gateway) continue

        provider.enabled = true
        provider.publicKey = gateway.publicKey ?? provider.publicKey ?? null
        provider.secretKey = gateway.secretKey ?? provider.secretKey ?? null
        provider.webhookSecret = gateway.webhookSecret ?? provider.webhookSecret ?? null
        if (gateway.merchantId) provider.merchantId = gateway.merchantId
      }

      const activeProvider = baseConfig.providers.find(
        (provider) => provider.key === baseConfig.activeProvider && provider.enabled
      )

      return {
        ...baseConfig,
        activeProvider: (activeProvider?.key as PaymentProviderKey) || 'manual',
      }
    } catch {
      return baseConfig
    }
  }

  static async saveConfig(input: Partial<PaymentSettingsConfig>): Promise<PaymentSettingsConfig> {
    const current = await this.getConfig()
    const mergedInput = {
      ...current,
      ...input,
      providers: input.providers || current.providers,
    }
    const normalized = this.normalizeConfig(mergedInput)
    const existing = await SiteSetting.findBy('key', 'payment_settings')

    if (existing) {
      existing.value = JSON.stringify(normalized)
      existing.label = 'Payment Settings'
      await existing.save()
      return normalized
    }

    await SiteSetting.create({
      key: 'payment_settings',
      label: 'Payment Settings',
      value: JSON.stringify(normalized),
    })
    return normalized
  }

  static async getActiveProvider(): Promise<PaymentProviderConfig> {
    const config = await this.getConfig()
    const provider = config.providers.find(
      (item) => item.key === config.activeProvider && item.enabled
    )
    return provider || this.defaultProviders.find((item) => item.key === 'manual')!
  }

  static async getEnabledProviders(): Promise<PaymentProviderConfig[]> {
    const config = await this.getConfig()
    return config.providers.filter((provider) => provider.enabled)
  }

  static async resolveCheckoutMethod(): Promise<{
    provider: PaymentProviderConfig
    settings: PaymentSettingsConfig
  }> {
    const settings = await this.getConfig()
    const provider = settings.providers.find(
      (item) => item.key === settings.activeProvider && item.enabled
    )
    return {
      provider: provider || this.defaultProviders.find((item) => item.key === 'manual')!,
      settings,
    }
  }

  /**
   * Get the public-safe config (strips secret keys) for the frontend
   */
  static async getPublicConfig(): Promise<{
    activeProvider: PaymentProviderKey
    currency: SupportedCurrency
    currencySymbol: string
    providers: Array<{
      key: PaymentProviderKey
      label: string
      enabled: boolean
      description?: string | null
      publicKey?: string | null
    }>
  }> {
    const config = await this.getConfig()
    return {
      activeProvider: config.activeProvider,
      currency: config.currency || 'USD',
      currencySymbol: config.currencySymbol || '$',
      providers: config.providers
        .filter((p) => p.enabled)
        .map((p) => ({
          key: p.key as PaymentProviderKey,
          label: p.label,
          enabled: p.enabled,
          description: p.description,
          publicKey: p.publicKey,
        })),
    }
  }

  /**
   * Initialize a payment session with the chosen provider.
   * Returns information needed to redirect or embed the payment flow.
   */
  static async initializePayment(opts: {
    provider: PaymentProviderKey
    amount: number
    currency: string
    email: string
    reference: string
    productName: string
    callbackUrl?: string
  }): Promise<PaymentInitResult> {
    const config = await this.getConfig()
    const providerConfig = config.providers.find((p) => p.key === opts.provider && p.enabled)

    if (!providerConfig) {
      throw new Error(`Payment provider "${opts.provider}" is not enabled`)
    }

    switch (opts.provider) {
      case 'manual':
        return this.initManual(opts)
      case 'paystack':
        return this.initPaystack(providerConfig, opts)
      case 'flutterwave':
        return this.initFlutterwave(providerConfig, opts)
      case 'stripe':
        return this.initStripe(providerConfig, opts)
      case 'paypal':
        return this.initPayPal(providerConfig, opts)
      default:
        return this.initManual(opts)
    }
  }

  /**
   * Verify a payment by reference through the provider's API.
   */
  static async verifyPayment(
    provider: PaymentProviderKey,
    reference: string
  ): Promise<PaymentVerifyResult> {
    const config = await this.getConfig()
    const providerConfig = config.providers.find((p) => p.key === provider)

    if (!providerConfig) {
      return { verified: false, reference, provider }
    }

    switch (provider) {
      case 'manual':
        return { verified: true, reference, provider: 'manual' }
      case 'paystack':
        return this.verifyPaystack(providerConfig, reference)
      case 'flutterwave':
        return this.verifyFlutterwave(providerConfig, reference)
      case 'stripe':
        return this.verifyStripe(providerConfig, reference)
      case 'paypal':
        return this.verifyPayPal(providerConfig, reference)
      default:
        return { verified: false, reference, provider }
    }
  }

  // ─── Manual ──────────────────────────────────────────────────────────

  private static initManual(opts: {
    reference: string
    amount: number
    currency: string
  }): PaymentInitResult {
    return {
      provider: 'manual',
      reference: opts.reference,
      redirectUrl: null,
      clientToken: null,
      metadata: { message: 'Order placed. Complete payment offline.' },
    }
  }

  // ─── Paystack ────────────────────────────────────────────────────────

  private static async initPaystack(
    config: PaymentProviderConfig,
    opts: {
      amount: number
      currency: string
      email: string
      reference: string
      callbackUrl?: string
    }
  ): Promise<PaymentInitResult> {
    if (!config.secretKey) throw new Error('Paystack secret key is not configured')

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: opts.email,
        amount: Math.round(opts.amount * 100), // kobo/cents
        currency: opts.currency,
        reference: opts.reference,
        callback_url: opts.callbackUrl,
      }),
    })

    const data = (await res.json()) as any

    if (!data?.status) {
      throw new Error(data?.message || 'Paystack initialization failed')
    }

    return {
      provider: 'paystack',
      reference: opts.reference,
      redirectUrl: data.data?.authorization_url,
      publicKey: config.publicKey,
      clientToken: data.data?.access_code,
    }
  }

  private static async verifyPaystack(
    config: PaymentProviderConfig,
    reference: string
  ): Promise<PaymentVerifyResult> {
    if (!config.secretKey) return { verified: false, reference, provider: 'paystack' }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${config.secretKey}` },
    })

    const data = (await res.json()) as any
    const success = data?.data?.status === 'success'

    return {
      verified: success,
      reference,
      amount: data?.data?.amount ? data.data.amount / 100 : undefined,
      currency: data?.data?.currency,
      provider: 'paystack',
      providerReference: data?.data?.reference,
    }
  }

  // ─── Flutterwave ────────────────────────────────────────────────────

  private static async initFlutterwave(
    config: PaymentProviderConfig,
    opts: {
      amount: number
      currency: string
      email: string
      reference: string
      productName: string
      callbackUrl?: string
    }
  ): Promise<PaymentInitResult> {
    if (!config.secretKey) throw new Error('Flutterwave secret key is not configured')

    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: opts.reference,
        amount: opts.amount,
        currency: opts.currency,
        redirect_url: opts.callbackUrl,
        customer: { email: opts.email },
        customizations: { title: opts.productName },
      }),
    })

    const data = (await res.json()) as any

    if (data?.status !== 'success') {
      throw new Error(data?.message || 'Flutterwave initialization failed')
    }

    return {
      provider: 'flutterwave',
      reference: opts.reference,
      redirectUrl: data.data?.link,
      publicKey: config.publicKey,
    }
  }

  private static async verifyFlutterwave(
    config: PaymentProviderConfig,
    reference: string
  ): Promise<PaymentVerifyResult> {
    if (!config.secretKey) return { verified: false, reference, provider: 'flutterwave' }

    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
      { headers: { Authorization: `Bearer ${config.secretKey}` } }
    )

    const data = (await res.json()) as any
    const success = data?.data?.status === 'successful'

    return {
      verified: success,
      reference,
      amount: data?.data?.amount,
      currency: data?.data?.currency,
      provider: 'flutterwave',
      providerReference: data?.data?.flw_ref,
    }
  }

  // ─── Stripe ──────────────────────────────────────────────────────────

  private static async initStripe(
    config: PaymentProviderConfig,
    opts: {
      amount: number
      currency: string
      email: string
      reference: string
      productName: string
      callbackUrl?: string
    }
  ): Promise<PaymentInitResult> {
    if (!config.secretKey) throw new Error('Stripe secret key is not configured')

    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('customer_email', opts.email)
    params.append('client_reference_id', opts.reference)
    params.append('line_items[0][price_data][currency]', opts.currency.toLowerCase())
    params.append('line_items[0][price_data][unit_amount]', String(Math.round(opts.amount * 100)))
    params.append('line_items[0][price_data][product_data][name]', opts.productName)
    params.append('line_items[0][quantity]', '1')
    params.append('success_url', `${opts.callbackUrl || '/'}?session_id={CHECKOUT_SESSION_ID}`)
    params.append('cancel_url', opts.callbackUrl || '/')

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(config.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = (await res.json()) as any

    if (data?.error) {
      throw new Error(data.error.message || 'Stripe session creation failed')
    }

    return {
      provider: 'stripe',
      reference: opts.reference,
      redirectUrl: data.url,
      clientToken: data.id,
      publicKey: config.publicKey,
    }
  }

  private static async verifyStripe(
    config: PaymentProviderConfig,
    reference: string
  ): Promise<PaymentVerifyResult> {
    if (!config.secretKey) return { verified: false, reference, provider: 'stripe' }

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions?client_reference_id=${reference}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(config.secretKey + ':').toString('base64')}`,
        },
      }
    )

    const data = (await res.json()) as any
    const session = data?.data?.[0]
    const success = session?.payment_status === 'paid'

    return {
      verified: success,
      reference,
      amount: session?.amount_total ? session.amount_total / 100 : undefined,
      currency: session?.currency?.toUpperCase(),
      provider: 'stripe',
      providerReference: session?.id,
    }
  }

  // ─── PayPal ──────────────────────────────────────────────────────────

  private static async getPayPalAccessToken(config: PaymentProviderConfig): Promise<string> {
    if (!config.publicKey || !config.secretKey) {
      throw new Error('PayPal client credentials are not configured')
    }

    const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.publicKey}:${config.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const data = (await res.json()) as any
    if (!data?.access_token) throw new Error('Failed to get PayPal access token')
    return data.access_token
  }

  private static async initPayPal(
    config: PaymentProviderConfig,
    opts: {
      amount: number
      currency: string
      reference: string
      productName: string
      callbackUrl?: string
    }
  ): Promise<PaymentInitResult> {
    const token = await this.getPayPalAccessToken(config)

    const res = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: opts.reference,
            description: opts.productName,
            amount: { currency_code: opts.currency, value: opts.amount.toFixed(2) },
          },
        ],
        application_context: {
          return_url: opts.callbackUrl || '/',
          cancel_url: opts.callbackUrl || '/',
        },
      }),
    })

    const data = (await res.json()) as any
    const approveLink = data?.links?.find((l: any) => l.rel === 'approve')?.href

    return {
      provider: 'paypal',
      reference: opts.reference,
      redirectUrl: approveLink || null,
      clientToken: data?.id,
    }
  }

  private static async verifyPayPal(
    config: PaymentProviderConfig,
    reference: string
  ): Promise<PaymentVerifyResult> {
    try {
      const token = await this.getPayPalAccessToken(config)

      const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${reference}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = (await res.json()) as any
      const success = data?.status === 'COMPLETED' || data?.status === 'APPROVED'
      const unit = data?.purchase_units?.[0]

      return {
        verified: success,
        reference,
        amount: unit?.amount?.value ? Number.parseFloat(unit.amount.value) : undefined,
        currency: unit?.amount?.currency_code,
        provider: 'paypal',
        providerReference: data?.id,
      }
    } catch {
      return { verified: false, reference, provider: 'paypal' }
    }
  }

  private static getValidProviderKey(
    activeProvider: string | undefined,
    providers: PaymentProviderConfig[]
  ): PaymentProviderKey {
    const candidate = activeProvider as PaymentProviderKey | undefined
    if (!candidate) return 'manual'
    return providers.some((provider) => provider.key === candidate) ? candidate : 'manual'
  }
}
