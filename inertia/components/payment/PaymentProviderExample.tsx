/**
 * Payment Provider Integration Examples
 *
 * This file demonstrates how to use the payment provider logo system
 * in different contexts. Use these as reference for your implementation.
 */

import React, { useState } from 'react'
import { ProviderLogo, ProviderLogoInline, ProviderSelector } from './index'
import { type PaymentProviderId } from '#config/paymentProviders'

/**
 * Example 1: Payment Method Selector in Checkout
 */
export function CheckoutPaymentSelector() {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderId>('stripe')

  const handlePayment = async () => {
    console.log(`Processing payment with ${selectedProvider}`)
    // Call your payment API with selectedProvider
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Payment Method</h2>
        <ProviderSelector
          value={selectedProvider}
          onSelect={setSelectedProvider}
          showCurrencies
          label="Choose how to pay"
          description="Select your preferred payment provider"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Paying with <span className="font-semibold">{selectedProvider.toUpperCase()}</span>
        </p>
      </div>

      <button
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Proceed to Payment
      </button>
    </div>
  )
}

/**
 * Example 2: Payment Method Display in Order Summary
 */
export function OrderSummary() {
  const paymentMethod: PaymentProviderId = 'paypal'
  const amount = 99.99

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Order Summary</h3>

      <div className="border rounded-lg p-4 space-y-3">
        {/* Products */}
        <div className="flex justify-between text-sm">
          <span>Products</span>
          <span>${amount.toFixed(2)}</span>
        </div>

        {/* Payment Method with Logo */}
        <div className="border-t pt-3 flex items-center justify-between">
          <span className="text-sm font-medium">Payment Method</span>
          <div className="flex items-center gap-2">
            <ProviderLogoInline provider={paymentMethod} size={20} />
            <span className="text-sm">{paymentMethod}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-3 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">${amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Example 3: Payment Methods in Settings/Profile
 */
export function SavedPaymentMethods() {
  const methods: Array<{ id: string; provider: PaymentProviderId; last4: string }> = [
    { id: '1', provider: 'stripe', last4: '4242' },
    { id: '2', provider: 'paypal', last4: 'john@example.com' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Saved Payment Methods</h3>

      {methods.map((method) => (
        <div key={method.id} className="border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ProviderLogo provider={method.provider} size={28} />
            <div>
              <p className="font-medium">{method.provider}</p>
              <p className="text-sm text-gray-600">Ends in {method.last4}</p>
            </div>
          </div>

          <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
        </div>
      ))}
    </div>
  )
}

/**
 * Example 4: Payment Status / Success Page
 */
export function PaymentSuccess() {
  const provider: PaymentProviderId = 'flutterwave'
  const transactionId = 'TXN-2025-001234'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-green-100 rounded-full p-3">
            <ProviderLogo provider={provider} size={48} ariaLabel="Payment confirmed" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-green-600">Payment Successful</h2>
        <p className="text-gray-600">Your payment has been processed via {provider}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Transaction ID</span>
          <span className="font-mono">{transactionId}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Example 5: Provider Comparison Table
 */
export function ProviderComparison() {
  const providers: PaymentProviderId[] = ['stripe', 'paypal', 'flutterwave', 'paystack']

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Provider</th>
            <th className="text-left py-3 px-4">Fee</th>
            <th className="text-left py-3 px-4">Settlement</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <ProviderLogoInline provider={provider} size={24} />
                  <span className="capitalize">{provider}</span>
                </div>
              </td>
              <td className="py-3 px-4">2.9% + $0.30</td>
              <td className="py-3 px-4">1-3 days</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Example 6: Inline Payment Badge
 */
export function PaidBadge({ provider }: { provider: PaymentProviderId }) {
  return (
    <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
      <ProviderLogoInline provider={provider} size={14} />
      Paid
    </div>
  )
}

/**
 * Example 7: Provider Health Dashboard (Admin)
 */
export function ProviderHealthDashboard() {
  const status: Record<PaymentProviderId, 'healthy' | 'warning' | 'error'> = {
    stripe: 'healthy',
    paypal: 'warning',
    flutterwave: 'healthy',
    paystack: 'error',
  }

  const statusColors = {
    healthy: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    healthy: 'Operational',
    warning: 'Degraded',
    error: 'Down',
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Payment Gateway Status</h2>

      {(Object.entries(status) as [PaymentProviderId, string][]).map(([provider, state]) => (
        <div key={provider} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <ProviderLogo provider={provider} size={32} />
            <div>
              <p className="font-medium capitalize">{provider}</p>
              <p className="text-sm text-gray-600">Last checked 2 minutes ago</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[state as keyof typeof statusColors]}`}
          >
            {statusLabels[state as keyof typeof statusLabels]}
          </span>
        </div>
      ))}
    </div>
  )
}

export default CheckoutPaymentSelector
