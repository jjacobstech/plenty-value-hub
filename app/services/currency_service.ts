import CurrencySetting from '#models/currency_setting'
import CurrencyExchangeRate from '#models/currency_exchange_rate'
import RegionalPricing from '#models/regional_pricing'
import { DateTime } from 'luxon'

export default class CurrencyService {
  /**
   * Get base currency
   */
  static async getBaseCurrency(): Promise<CurrencySetting> {
    return CurrencySetting.query()
      .where('is_base_currency', true)
      .firstOrFail()
  }

  /**
   * Convert amount from one currency to another
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount

    const baseCurrency = await this.getBaseCurrency()

    // Get exchange rates
    const fromRate = await CurrencyExchangeRate.query()
      .where('from_currency', baseCurrency.currencyCode)
      .where('to_currency', fromCurrency)
      .orderBy('created_at', 'desc')
      .first()

    const toRate = await CurrencyExchangeRate.query()
      .where('from_currency', baseCurrency.currencyCode)
      .where('to_currency', toCurrency)
      .orderBy('created_at', 'desc')
      .first()

    if (!fromRate || !toRate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`)
    }

    // Convert: amount -> base -> target
    const inBase = amount / fromRate.rate
    const inTarget = inBase * toRate.rate

    return Math.round(inTarget * 100) / 100
  }

  /**
   * Get regional price for a product
   */
  static async getRegionalPrice(
    productId: number,
    region: string
  ): Promise<any> {
    const now = DateTime.now()

    const pricing = await RegionalPricing.query()
      .where('product_id', productId)
      .where('region', region)
      .where('is_active', true)
      .where('valid_from', '<=', now.toSQL()!)
      .where((query) => {
        query.whereNull('valid_until').orWhere('valid_until', '>=', now.toSQL()!)
      })
      .first()

    if (!pricing) {
      throw new Error(`No regional pricing found for product ${productId} in ${region}`)
    }

    const currency = await CurrencySetting.query()
      .where('currency_code', pricing.currency)
      .firstOrFail()

    return {
      basePrice: pricing.basePrice,
      localPrice: pricing.localPrice,
      currency: pricing.currency,
      symbol: currency.symbol,
      taxRate: pricing.taxRate,
      tax: (pricing.localPrice * pricing.taxRate) / 100,
      discountRate: pricing.discountRate || 0,
      discount: pricing.discountRate ? (pricing.localPrice * pricing.discountRate) / 100 : 0,
      shippingCost: pricing.shippingCost || 0,
      totalPrice: this.calculateTotalPrice(
        pricing.localPrice,
        pricing.taxRate,
        pricing.discountRate || 0,
        pricing.shippingCost || 0
      ),
    }
  }

  /**
   * Calculate total price with tax, discount, and shipping
   */
  private static calculateTotalPrice(
    basePrice: number,
    taxRate: number,
    discountRate: number,
    shippingCost: number
  ): number {
    const tax = (basePrice * taxRate) / 100
    const discount = (basePrice * discountRate) / 100
    return basePrice + tax - discount + shippingCost
  }

  /**
   * Update exchange rates
   */
  static async updateExchangeRates(rates: Array<{
    from: string
    to: string
    rate: number
    source: string
  }>): Promise<void> {
    for (const rateData of rates) {
      await CurrencyExchangeRate.create({
        fromCurrency: rateData.from,
        toCurrency: rateData.to,
        rate: rateData.rate,
        source: rateData.source,
        timestamp: DateTime.now(),
      })
    }

    // Update currency settings with latest rates
    for (const rateData of rates) {
      const currency = await CurrencySetting.query()
        .where('currency_code', rateData.to)
        .first()

      if (currency) {
        currency.exchangeRate = rateData.rate
        currency.lastRateUpdateAt = DateTime.now()
        currency.rateSource = rateData.source
        await currency.save()
      }
    }
  }

  /**
   * Set regional pricing for a product
   */
  static async setRegionalPricing(
    productId: number,
    region: string,
    currency: string,
    localPrice: number,
    options?: {
      basePrice?: number
      strategy?: 'fixed' | 'percentage' | 'dynamic'
      adjustment?: number
      taxRate?: number
      discountRate?: number
      shippingCost?: number
      demandMultiplier?: number
      validFrom?: DateTime
      validUntil?: DateTime
    }
  ): Promise<RegionalPricing> {
    const existing = await RegionalPricing.query()
      .where('product_id', productId)
      .where('region', region)
      .where('currency', currency)
      .where('is_active', true)
      .first()

    if (existing) {
      existing.localPrice = localPrice
      existing.basePrice = options?.basePrice || localPrice
      existing.pricingStrategy = options?.strategy || 'fixed'
      existing.adjustment = options?.adjustment || null
      existing.taxRate = options?.taxRate || 0
      existing.discountRate = options?.discountRate || null
      existing.shippingCost = options?.shippingCost || null
      existing.demandMultiplier = options?.demandMultiplier || 1
      existing.validFrom = options?.validFrom || DateTime.now()
      existing.validUntil = options?.validUntil || null

      await existing.save()
      return existing
    }

    return RegionalPricing.create({
      productId,
      region,
      currency,
      basePrice: options?.basePrice || localPrice,
      localPrice,
      pricingStrategy: options?.strategy || 'fixed',
      adjustment: options?.adjustment || null,
      taxRate: options?.taxRate || 0,
      discountRate: options?.discountRate || null,
      shippingCost: options?.shippingCost || null,
      demandMultiplier: options?.demandMultiplier || 1,
      validFrom: options?.validFrom || DateTime.now(),
      validUntil: options?.validUntil || null,
    })
  }

  /**
   * Get currency formatting for display
   */
  static async formatCurrencyAmount(
    amount: number,
    currencyCode: string
  ): Promise<string> {
    const currency = await CurrencySetting.query()
      .where('currency_code', currencyCode)
      .firstOrFail()

    const formatted = amount
      .toFixed(currency.decimalPlaces)
      .replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
      .replace('.', currency.decimalSeparator)

    return currency.symbolPosition === 'before'
      ? `${currency.symbol}${formatted}`
      : `${formatted}${currency.symbol}`
  }

  /**
   * Get list of active currencies
   */
  static async getActiveCurrencies(): Promise<CurrencySetting[]> {
    return CurrencySetting.query()
      .where('is_active', true)
      .orderBy('currency_code', 'asc')
  }

  /**
   * Check if region is valid for currency
   */
  static async isRegionSupported(region: string, currency: string): Promise<boolean> {
    const currencySetting = await CurrencySetting.query()
      .where('currency_code', currency)
      .first()

    if (!currencySetting || !currencySetting.regions) {
      return false
    }

    const regions = JSON.parse(currencySetting.regions)
    return regions.includes(region)
  }
}
