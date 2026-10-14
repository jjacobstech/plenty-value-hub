import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

/** Deletes expired idempotency keys (after 24 hours) and deliveries older than 30 days. */
export async function prune(now: DateTime = DateTime.now()) {
  const idempotencyKeys = await db.from('partner_idempotency_keys').where('expires_at', '<', now.toSQL()!).delete()
  const deliveries = await db.from('partner_webhook_deliveries').where('created_at', '<', now.minus({ days: 30 }).toSQL()!).delete()
  return { idempotencyKeys, deliveries }
}
