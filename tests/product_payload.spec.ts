import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeProductPayload } from './helpers/productPayload.js'

test('normalizeProductPayload converts vendor form keys to backend contract', () => {
  const payload = normalizeProductPayload(
    {
      name: 'Test product',
      description: 'A detailed description for the product',
      short_description: 'A short description',
      category: 'technology',
      product_type: 'digital',
      price: '49.99',
      sale_price: '39.99',
      commission_rate: '25',
      image_url: 'https://example.com/product.jpg',
      recurring_billing: true,
      billing_cycle: 'monthly',
    },
    { id: 42, fullName: 'Jane Vendor' }
  )

  assert.equal(payload.name, 'Test product')
  assert.equal(payload.shortDescription, 'A short description')
  assert.equal(payload.productType, 'digital')
  assert.equal(payload.salePrice, 39.99)
  assert.equal(payload.commissionRate, 25)
  assert.equal(payload.imageUrl, 'https://example.com/product.jpg')
  assert.equal(payload.vendorId, 42)
  assert.equal(payload.vendorName, 'Jane Vendor')
  assert.equal(payload.billingCycle, 'monthly')
  assert.equal(payload.recurringBilling, true)
})
