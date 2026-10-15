import crypto from 'node:crypto'
import { customAlphabet } from 'nanoid'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import OrganisationApiKey from '#models/organisation_api_key'
import { publicId } from '#services/organisation/public_id'

const random = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32)
const KEY_PATTERN = /^pv_(test|live)_sk_[0-9A-Za-z]{32}$/

export function hashKey(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex')
}

/** Returns the mode a well-formed key claims, or null. The hash is still computed for malformed keys. */
export function parseKeyMode(secret: string): 'test' | 'live' | null {
  const match = KEY_PATTERN.exec(secret)
  return match ? (match[1] as 'test' | 'live') : null
}

export default class ApiKeyService {
  /** Creates a key. The secret is returned once and never stored. */
  static async create(
    organisationId: number,
    livemode: boolean,
    name: string,
    trx?: TransactionClientContract
  ): Promise<{ key: OrganisationApiKey; secret: string }> {
    const mode = livemode ? 'live' : 'test'
    const body = random()
    const secret = `pv_${mode}_sk_${body}`
    const key = await OrganisationApiKey.create(
      {
        publicId: publicId('key_'),
        organisationId,
        livemode,
        name,
        keyHash: hashKey(secret),
        prefix: `pv_${mode}_sk_${body.slice(0, 4)}`,
        last4: body.slice(-4),
      },
      { client: trx }
    )
    return { key, secret }
  }
}
