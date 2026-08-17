import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { createJsonLogEntry, writeJsonLog } from '../app/services/json_logger.ts'

test('json logger writes UTC timestamps and serialized error metadata', async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'pv-json-log-'))
  const logFile = path.join(tempDir, 'app-events.jsonl')

  const error = new Error('Disk full')
  error.stack = 'Error: Disk full\n    at test (file.ts:1:1)'

  const entry = createJsonLogEntry({
    level: 'error',
    event: 'payment_failed',
    message: 'Payment failed',
    error,
    context: { requestId: 'req_123', productId: 'prod_456' },
  })

  assert.match(entry.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  assert.equal(entry.level, 'error')
  assert.equal(entry.event, 'payment_failed')
  assert.equal(entry.message, 'Payment failed')
  assert.ok(entry.context)
  assert.equal(entry.context?.requestId, 'req_123')
  assert.ok(entry.error)
  assert.equal(entry.error?.message, 'Disk full')
  assert.ok(entry.error?.stack?.includes('Error: Disk full'))

  const result = await writeJsonLog(entry, logFile)

  assert.equal(result.success, true)

  const lines = readFileSync(logFile, 'utf8').trim().split('\n')
  const payload = JSON.parse(lines[0])

  assert.equal(payload.level, 'error')
  assert.equal(payload.event, 'payment_failed')
  assert.equal(payload.error.message, 'Disk full')
  assert.equal(payload.context.requestId, 'req_123')
  assert.equal(payload.timestamp, entry.timestamp)

  rmSync(tempDir, { recursive: true, force: true })
})
