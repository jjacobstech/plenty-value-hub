import crypto from 'node:crypto'
import { customAlphabet } from 'nanoid'

const random = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32)

/** whsec_ + 32 random characters. Shown to the partner once, then stored encrypted. */
export function generateSecret(): string {
  return `whsec_${random()}`
}

function hmac(secret: string, timestamp: number, rawBody: string): string {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
}

/** PV-Signature header. More than one secret (during rotation) gives more than one v1 value. */
export function signatureHeader(secrets: string[], rawBody: string, timestamp = Math.floor(Date.now() / 1000)): string {
  return [`t=${timestamp}`, ...secrets.map((secret) => `v1=${hmac(secret, timestamp, rawBody)}`)].join(',')
}

/**
 * Checks a PV-Signature header the way partners should. Accepts any v1 value that matches, and
 * rejects timestamps outside the tolerance (default 5 minutes) to stop replays.
 */
export function verifySignature(rawBody: string, header: string, secret: string, toleranceSeconds = 300, now = Math.floor(Date.now() / 1000)): boolean {
  let timestamp = 0
  const signatures: string[] = []
  for (const part of header.split(',')) {
    const [key, value] = part.trim().split('=')
    if (key === 't') timestamp = Number(value)
    if (key === 'v1') signatures.push(value)
  }
  if (!timestamp || Math.abs(now - timestamp) > toleranceSeconds) return false
  const expected = Buffer.from(hmac(secret, timestamp, rawBody))
  return signatures.some((sig) => {
    const candidate = Buffer.from(sig)
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
  })
}
