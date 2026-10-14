import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import PartnerApiException from '#exceptions/partner_api_exception'

export const MAX_RANGE_DAYS = 366
export type GroupBy = 'none' | 'day' | 'product' | 'campaign' | 'affiliate'

type Totals = {
  clicks: number
  unique_clicks: number
  conversions: number
  conversion_rate: number
  commissions: Record<'pending' | 'approved' | 'paid' | 'reversed', { count: number; amount: number | null; currency: string | null }>
}

const emptyBucket = () => ({ count: 0, amount: 0, currencies: new Set<string>() })

/** Turns `from` and `to` (unix seconds) into a window. Defaults: the last 30 days. `to` is exclusive. */
export function parseWindow(rawFrom: unknown, rawTo: unknown, now = DateTime.now()) {
  const to = rawTo === undefined ? now : DateTime.fromSeconds(Number(rawTo))
  const from = rawFrom === undefined ? to.minus({ days: 30 }) : DateTime.fromSeconds(Number(rawFrom))
  if (!to.isValid || !from.isValid || to <= from) {
    throw new PartnerApiException('to must be after from.', 'invalid_request_error', 'parameter_invalid', 400, 'to')
  }
  if (to.diff(from, 'days').days > MAX_RANGE_DAYS) {
    throw new PartnerApiException(`The range can be at most ${MAX_RANGE_DAYS} days.`, 'invalid_request_error', 'parameter_invalid', 400, 'from')
  }
  return { from, to }
}

export function parseGroupBy(raw: unknown, allowed: GroupBy[]): GroupBy {
  const value = (raw ?? 'none') as GroupBy
  if (!allowed.includes(value)) {
    throw new PartnerApiException(`group_by must be one of ${allowed.join(', ')}.`, 'invalid_request_error', 'parameter_invalid', 400, 'group_by')
  }
  return value
}

/** SQL key expression per source table, for each group_by. */
const KEY: Record<GroupBy, { clicks: string; events: string; commissions: string }> = {
  none: { clicks: "'all'", events: "'all'", commissions: "'all'" },
  day: {
    clicks: "to_char(c.clicked_at at time zone 'UTC', 'YYYY-MM-DD')",
    events: "to_char(e.occurred_at at time zone 'UTC', 'YYYY-MM-DD')",
    commissions: "to_char(m.created_at at time zone 'UTC', 'YYYY-MM-DD')",
  },
  product: { clicks: 'c.product_ref', events: 'l.product_ref', commissions: 'l.product_ref' },
  campaign: { clicks: 'c.campaign_ref', events: 'l.campaign_ref', commissions: 'l.campaign_ref' },
  affiliate: { clicks: 'a.public_id', events: 'a.public_id', commissions: 'a.public_id' },
}

type Scope = { partnerId: number; livemode: boolean; from: DateTime; to: DateTime; affiliateId?: number }

/** Computes totals for every group in one scope. Each source is one grouped SQL query. */
export async function computeStats(scope: Scope, groupBy: GroupBy) {
  const from = scope.from.toSQL()!
  const to = scope.to.toSQL()!
  const affiliateClause = scope.affiliateId !== undefined ? 'and {alias}.affiliate_id = ?' : ''
  const affiliateBinding = scope.affiliateId !== undefined ? [scope.affiliateId] : []
  const groups = new Map<string, Totals>()
  const ensure = (key: string) => {
    if (!groups.has(key)) {
      groups.set(key, {
        clicks: 0,
        unique_clicks: 0,
        conversions: 0,
        conversion_rate: 0,
        commissions: {
          pending: { count: 0, amount: 0, currency: null },
          approved: { count: 0, amount: 0, currency: null },
          paid: { count: 0, amount: 0, currency: null },
          reversed: { count: 0, amount: 0, currency: null },
        },
      })
    }
    return groups.get(key)!
  }

  // A whole-window query always has one row, even with no data.
  if (groupBy === 'none') ensure('all')

  // Clicks (and active affiliates, for the summary)
  const clicks = await db.rawQuery(
    `select ${KEY[groupBy].clicks} as k, count(*)::int as clicks, count(*) filter (where c.is_unique)::int as uniq,
            count(distinct c.affiliate_id)::int as active
     from partner_clicks c
     left join partner_affiliates a on a.id = c.affiliate_id
     where c.partner_id = ? and c.livemode = ? and c.clicked_at >= ? and c.clicked_at < ?
     ${affiliateClause.replace('{alias}', 'c')}
     group by k`,
    [scope.partnerId, scope.livemode, from, to, ...affiliateBinding]
  )
  let activeAffiliates = 0
  for (const row of clicks.rows) {
    const t = ensure(String(row.k))
    t.clicks = row.clicks
    t.unique_clicks = row.uniq
    activeAffiliates += row.active
  }

  // Attributed conversions (reversed and rejected events are not counted)
  const events = await db.rawQuery(
    `select ${KEY[groupBy].events} as k, count(*)::int as conversions
     from partner_events e
     left join partner_links l on l.id = e.link_id
     left join partner_affiliates a on a.id = e.affiliate_id
     where e.partner_id = ? and e.livemode = ? and e.status = 'attributed' and e.occurred_at >= ? and e.occurred_at < ?
     ${affiliateClause.replace('{alias}', 'e')}
     group by k`,
    [scope.partnerId, scope.livemode, from, to, ...affiliateBinding]
  )
  for (const row of events.rows) ensure(String(row.k)).conversions = row.conversions

  // Commissions by bucket and currency; paid is an approved commission with paid_at set
  const commissions = await db.rawQuery(
    `select ${KEY[groupBy].commissions} as k,
            case when m.status = 'reversed' then 'reversed'
                 when m.status = 'pending' then 'pending'
                 when m.status = 'approved' and m.paid_at is not null then 'paid'
                 when m.status = 'approved' then 'approved' end as bucket,
            m.currency, count(*)::int as cnt, coalesce(sum(m.amount), 0)::bigint as amt
     from partner_commissions m
     join partner_events e on e.id = m.event_id
     left join partner_links l on l.id = e.link_id
     left join partner_affiliates a on a.id = m.affiliate_id
     where m.partner_id = ? and m.livemode = ? and m.created_at >= ? and m.created_at < ?
     ${affiliateClause.replace('{alias}', 'm')}
     group by k, bucket, m.currency`,
    [scope.partnerId, scope.livemode, from, to, ...affiliateBinding]
  )
  const buckets = new Map<string, Map<string, ReturnType<typeof emptyBucket>>>()
  for (const row of commissions.rows) {
    if (!row.bucket) continue
    const key = String(row.k)
    ensure(key)
    if (!buckets.has(key)) buckets.set(key, new Map())
    const perBucket = buckets.get(key)!
    if (!perBucket.has(row.bucket)) perBucket.set(row.bucket, emptyBucket())
    const acc = perBucket.get(row.bucket)!
    acc.count += row.cnt
    acc.amount += Number(row.amt)
    acc.currencies.add(row.currency)
  }
  for (const [key, perBucket] of buckets) {
    for (const [bucket, acc] of perBucket) {
      const currencies = [...acc.currencies]
      // One currency per bucket gives a real total. Mixed currencies are not converted, so amount is null.
      groups.get(key)!.commissions[bucket as keyof Totals['commissions']] = {
        count: acc.count,
        amount: currencies.length === 1 ? acc.amount : null,
        currency: currencies.length === 1 ? currencies[0] : null,
      }
    }
  }

  for (const t of groups.values()) {
    t.conversion_rate = t.unique_clicks === 0 ? 0 : Math.round((t.conversions / t.unique_clicks) * 10000) / 10000
  }

  const rows = [...groups.entries()]
    .map(([key, totals]) => ({ key, totals }))
    .sort((a, b) => a.key.localeCompare(b.key))
  return { rows, activeAffiliates }
}

/** The totals for the whole window (one group, key "all"), plus the active affiliate count. */
export async function totalsFor(scope: Scope) {
  const { rows, activeAffiliates } = await computeStats(scope, 'none')
  return { totals: rows[0].totals, activeAffiliates }
}

/** Shapes the response: totals, and groups when asked for. */
export async function statsResponse(scope: Scope, groupBy: GroupBy, summary: boolean) {
  const { totals, activeAffiliates } = await totalsFor(scope)
  const response: Record<string, unknown> = {
    object: 'stats',
    from: Math.floor(scope.from.toSeconds()),
    to: Math.floor(scope.to.toSeconds()),
    totals: summary ? { ...totals, active_affiliates: activeAffiliates } : totals,
  }
  if (groupBy !== 'none') {
    const { rows } = await computeStats(scope, groupBy)
    response.groups = rows.map((r) => ({ key: r.key, ...r.totals }))
  }
  return response
}
