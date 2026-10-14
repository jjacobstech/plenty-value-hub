import { Queue, Worker, type Job } from 'bullmq'
import env from '#start/env'
import { approveDueCommissions } from '#services/partner/commission_service'

export const PARTNER_QUEUE = 'partner-jobs'

const APPROVE_EVERY_MS = 10 * 60 * 1000

export function queueConnection() {
  return { host: env.get('QUEUE_REDIS_HOST'), port: env.get('QUEUE_REDIS_PORT'), maxRetriesPerRequest: null }
}

/** Runs one partner job by name. Each job is idempotent, so a retry or an overlap is safe. */
export async function runJob(name: string): Promise<number> {
  switch (name) {
    case 'approve-commissions':
      return approveDueCommissions()
    default:
      throw new Error(`Unknown partner job: ${name}`)
  }
}

/** Registers the recurring jobs. Upserting means restarts do not add duplicates. */
export async function scheduleRecurringJobs(connectionOptions = queueConnection()) {
  const queue = new Queue(PARTNER_QUEUE, { connection: connectionOptions })
  try {
    await queue.upsertJobScheduler('approve-commissions', { every: APPROVE_EVERY_MS }, { name: 'approve-commissions' })
  } finally {
    await queue.close()
  }
}

export function startWorker(connectionOptions = queueConnection()): Worker {
  return new Worker(PARTNER_QUEUE, (job: Job) => runJob(job.name), { connection: connectionOptions })
}
