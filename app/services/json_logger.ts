import { appendFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export type JsonLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface JsonLogEntry {
  timestamp: string
  level: JsonLogLevel
  event?: string
  message?: string
  context?: Record<string, unknown>
  request?: Record<string, unknown>
  user?: Record<string, unknown>
  metadata?: Record<string, unknown>
  error?: {
    name?: string
    message?: string
    stack?: string
    code?: string | number
    cause?: unknown
  } | null
  [key: string]: unknown
}

export interface JsonLogOptions {
  level?: JsonLogLevel
  event?: string
  message?: string
  error?: unknown
  context?: Record<string, unknown>
  request?: Record<string, unknown>
  user?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export const DEFAULT_LOG_FILE = resolve(process.cwd(), 'storage', 'logs', 'app-events.jsonl')

function normalizeError(error: unknown) {
  if (!error) return null

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: 'code' in error ? (error as { code?: string | number }).code : undefined,
      cause: error.cause,
    }
  }

  if (typeof error === 'object') {
    const maybeError = error as Record<string, unknown>

    return {
      name: typeof maybeError.name === 'string' ? maybeError.name : 'Error',
      message: typeof maybeError.message === 'string' ? maybeError.message : JSON.stringify(error),
      stack: typeof maybeError.stack === 'string' ? maybeError.stack : undefined,
      code:
        typeof maybeError.code === 'string' || typeof maybeError.code === 'number'
          ? maybeError.code
          : undefined,
      cause: maybeError.cause,
    }
  }

  return {
    name: 'Error',
    message: String(error),
  }
}

export function createJsonLogEntry(options: JsonLogOptions = {}): JsonLogEntry {
  const {
    level = 'info',
    event,
    message,
    error,
    context = {},
    request = {},
    user = {},
    metadata = {},
  } = options

  return {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
    context: Object.keys(context).length ? context : undefined,
    request: Object.keys(request).length ? request : undefined,
    user: Object.keys(user).length ? user : undefined,
    metadata: Object.keys(metadata).length ? metadata : undefined,
    error: normalizeError(error),
  }
}

export async function writeJsonLog(
  entry: Record<string, unknown>,
  filePath: string = DEFAULT_LOG_FILE
): Promise<{ success: boolean; filePath: string }> {
  await mkdir(dirname(filePath), { recursive: true })
  await appendFile(filePath, `${JSON.stringify(entry)}\n`, 'utf8')

  return {
    success: true,
    filePath,
  }
}

export async function logJsonEvent(options: JsonLogOptions = {}) {
  const entry = createJsonLogEntry(options)
  await writeJsonLog(entry)
  return entry
}

export async function logJsonError(options: JsonLogOptions = {}) {
  return logJsonEvent({ level: 'error', ...options })
}
