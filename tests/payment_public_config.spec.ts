import test from 'node:test'
import assert from 'node:assert/strict'

import { PaymentService } from '../app/services/payment_service.ts'

test('PaymentService.getPublicConfig returns enabled payment methods only', async () => {
  const config = await PaymentService.getPublicConfig()

  assert.ok(config)
  assert.ok(Array.isArray(config.providers))
  assert.ok(config.providers.every((provider) => provider.enabled === true))
  assert.ok(config.providers.length > 0)
})
