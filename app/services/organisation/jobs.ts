import { Queue, Worker, type Job } from 'bullmq'
import env from '#start/env'
import { approveDueCommissions } from '#services/organisation/commission_service'
import { deliverDue } from '#services/organisation/webhook_delivery_service'
import { prune } from '#services/organisation/maintenance'

export const ORGANISATION_QUEUE = 'organisation-jobs'

const MINUTE_MS = 60 * 1000

export function queueConnection() {
  return { host: env.get('QUEUE_REDIS_HOST'), port: env.get('QUEUE_REDIS_PORT'), maxRetriesPerRequest: null }
}

/** Runs one organisation job by name. Each job is idempotent, so a retry or an overlap is safe. */
export async function runJob(name: string): Promise<unknown> {
  switch (name) {
    case 'approve-commissions':
      return approveDueCommissions()
    case 'deliver-webhooks':
      return deliverDue()
    case 'prune':
      return prune()
    default:
      throw new Error(`Unknown organisation job: ${name}`)
  }
}

/** Registers the recurring jobs. Upserting means restarts do not add duplicates. */
export async function scheduleRecurringJobs(connectionOptions = queueConnection()) {
  const queue = new Queue(ORGANISATION_QUEUE, { connection: connectionOptions })
  try {
    await queue.upsertJobScheduler('approve-commissions', { every: 10 * MINUTE_MS }, { name: 'approve-commissions' })
    await queue.upsertJobScheduler('deliver-webhooks', { every: MINUTE_MS }, { name: 'deliver-webhooks' })
    await queue.upsertJobScheduler('prune', { every: 24 * 60 * MINUTE_MS }, { name: 'prune' })
  } finally {
    await queue.close()
  }
}

export function startWorker(connectionOptions = queueConnection()): Worker {
  return new Worker(ORGANISATION_QUEUE, (job: Job) => runJob(job.name), { connection: connectionOptions })
}
