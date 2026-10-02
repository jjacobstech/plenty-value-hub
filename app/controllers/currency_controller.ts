import CurrencySetting from '#models/currency_setting'
import CurrencyExchangeRate from '#models/currency_exchange_rate'
import RegionalPricing from '#models/regional_pricing'
import CurrencyService from '#services/currency_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class CurrencyController {
  /**
   * Get all active currencies
   * GET /api/currencies
   */
  async listCurrencies({ response }: HttpContext) {
    const currencies = await CurrencyService.getActiveCurrencies()

    return response.json({
      success: true,
      data: currencies.map((c) => ({
        code: c.currencyCode,
        name: c.currencyName,
        symbol: c.symbol,
        exchangeRate: c.exchangeRate,
        decimals: c.decimalPlaces,
        countries: c.countries ? JSON.parse(c.countries) : [],
        regions: c.regions ? JSON.parse(c.regions) : [],
      })),
    })
  }

  /**
   * Get currency details
   * GET /api/currencies/:code
   */
  async getCurrency({ params, response }: HttpContext) {
    try {
      const currency = await CurrencySetting.query()
        .where('currency_code', params.code.toUpperCase())
        .firstOrFail()

      return response.json({
        success: true,
        data: currency.serialize(),
      })
    } catch {
      return response.status(404).json({
        error: 'Currency not found',
      })
    }
  }

  /**
   * Convert amount between currencies
   * POST /api/currencies/convert
   */
  async convertCurrency({ request, response }: HttpContext) {
    const amount = request.input('amount')
    const fromCurrency = request.input('from')
    const toCurrency = request.input('to')

    if (!amount || !fromCurrency || !toCurrency) {
      return response.status(400).json({
        error: 'Missing required fields: amount, from, to',
      })
    }

    try {
      const converted = await CurrencyService.convertCurrency(amount, fromCurrency, toCurrency)

      return response.json({
        success: true,
        data: {
          fromAmount: amount,
          fromCurrency,
          toAmount: converted,
          toCurrency,
          rate: converted / amount,
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Conversion failed',
      })
    }
  }

  /**
   * Get exchange rate history
   * GET /api/currencies/rates/:from/:to
   */
  async getExchangeRateHistory({ params, request, response }: HttpContext) {
    const daysBack = request.input('days', 30)
    const startDate = DateTime.now().minus({ days: daysBack })

    try {
      const rates = await CurrencyExchangeRate.query()
        .where('from_currency', params.from.toUpperCase())
        .where('to_currency', params.to.toUpperCase())
        .where('timestamp', '>=', startDate.toSQL()!)
        .orderBy('timestamp', 'asc')
        .select('*')

      return response.json({
        success: true,
        data: rates.map((r) => ({
          timestamp: r.timestamp,
          rate: r.rate,
          source: r.source,
        })),
      })
    } catch {
      return response.status(400).json({
        error: 'Invalid currency codes',
      })
    }
  }

  /**
   * Get regional price for a product
   * GET /api/products/:id/price/:region
   */
  async getRegionalPrice({ params, response }: HttpContext) {
    try {
      const pricing = await CurrencyService.getRegionalPrice(
        params.id,
        params.region.toUpperCase()
      )

      return response.json({
        success: true,
        data: pricing,
      })
    } catch (error) {
      return response.status(404).json({
        error: error instanceof Error ? error.message : 'Pricing not found',
      })
    }
  }

  /**
   * Set regional pricing (vendor)
   * POST /api/products/:id/pricing
   */
  async setRegionalPricing({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can set pricing' })
    }

    const region = request.input('region')
    const currency = request.input('currency')
    const localPrice = request.input('local_price')

    if (!region || !currency || !localPrice) {
      return response.status(400).json({
        error: 'Missing required fields: region, currency, local_price',
      })
    }

    try {
      const pricing = await CurrencyService.setRegionalPricing(
        params.id,
        region.toUpperCase(),
        currency.toUpperCase(),
        localPrice,
        {
          basePrice: request.input('base_price'),
          strategy: request.input('strategy'),
          adjustment: request.input('adjustment'),
          taxRate: request.input('tax_rate'),
          discountRate: request.input('discount_rate'),
          shippingCost: request.input('shipping_cost'),
          demandMultiplier: request.input('demand_multiplier'),
        }
      )

      return response.json({
        success: true,
        message: 'Regional pricing set',
        data: pricing.serialize(),
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to set pricing',
      })
    }
  }

  /**
   * Get product pricing by region (admin)
   * GET /api/admin/products/:id/pricing
   */
  async listProductPricing({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin' && user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const pricings = await RegionalPricing.query()
        .where('product_id', params.id)
        .where('is_active', true)
        .select('*')

      return response.json({
        success: true,
        data: pricings.map((p) => ({
          region: p.region,
          currency: p.currency,
          basePrice: p.basePrice,
          localPrice: p.localPrice,
          taxRate: p.taxRate,
          discountRate: p.discountRate,
          shippingCost: p.shippingCost,
          strategy: p.pricingStrategy,
        })),
      })
    } catch {
      return response.status(404).json({
        error: 'Product not found',
      })
    }
  }

  /**
   * Update exchange rates (admin)
   * POST /api/admin/currencies/rates
   */
  async updateExchangeRates({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can update rates' })
    }

    const rates = request.input('rates')

    if (!Array.isArray(rates) || rates.length === 0) {
      return response.status(400).json({
        error: 'Invalid rates format. Expected array of {from, to, rate, source}',
      })
    }

    try {
      await CurrencyService.updateExchangeRates(rates)

      return response.json({
        success: true,
        message: `Updated ${rates.length} exchange rates`,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update rates',
      })
    }
  }

  /**
   * Format amount for display (utility)
   * POST /api/currencies/format
   */
  async formatAmount({ request, response }: HttpContext) {
    const amount = request.input('amount')
    const currency = request.input('currency')

    if (amount === undefined || !currency) {
      return response.status(400).json({
        error: 'Missing required fields: amount, currency',
      })
    }

    try {
      const formatted = await CurrencyService.formatCurrencyAmount(amount, currency.toUpperCase())

      return response.json({
        success: true,
        data: { formatted },
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Formatting failed',
      })
    }
  }

  /**
   * Check region support (utility)
   * GET /api/currencies/:code/regions
   */
  async getSupportedRegions({ params, response }: HttpContext) {
    try {
      const currency = await CurrencySetting.query()
        .where('currency_code', params.code.toUpperCase())
        .firstOrFail()

      const regions = currency.regions ? JSON.parse(currency.regions) : []
      const countries = currency.countries ? JSON.parse(currency.countries) : []

      return response.json({
        success: true,
        data: {
          currency: params.code.toUpperCase(),
          countries,
          regions,
        },
      })
    } catch {
      return response.status(404).json({
        error: 'Currency not found',
      })
    }
  }
}
