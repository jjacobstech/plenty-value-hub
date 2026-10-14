import { customAlphabet } from 'nanoid'

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 20)

/** Prefixed public id, e.g. `aff_3kP9...`. The API never exposes numeric ids. */
export function publicId(prefix: string): string {
  return prefix + nano()
}
