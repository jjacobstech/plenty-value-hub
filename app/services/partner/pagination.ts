import PartnerApiException from '#exceptions/partner_api_exception'

/** Parses `limit` (1 to 100, default 20). Anything else is a 400. */
export function parseLimit(raw: unknown): number {
  if (raw === undefined || raw === '') return 20
  const limit = Number(raw)
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new PartnerApiException('limit must be an integer from 1 to 100.', 'invalid_request_error', 'parameter_invalid', 400, 'limit')
  }
  return limit
}

/**
 * Cursor page over `id` ascending. `startingAfter` is a public id; it must belong to this partner
 * and mode, otherwise the page is a 400.
 */
export async function cursorPage<T extends { id: number; publicId: string }>(
  query: any,
  limit: number,
  startingAfter: string | undefined
): Promise<{ object: 'list'; data: T[]; has_more: boolean }> {
  if (startingAfter) {
    const cursor = await query.clone().where('public_id', startingAfter).select('id').first()
    if (!cursor) {
      throw new PartnerApiException('starting_after does not match a result.', 'invalid_request_error', 'parameter_invalid', 400, 'starting_after')
    }
    query = query.where('id', '>', cursor.id)
  }
  const rows: T[] = await query.orderBy('id', 'asc').limit(limit + 1)
  const hasMore = rows.length > limit
  return { object: 'list', data: rows.slice(0, limit), has_more: hasMore }
}
