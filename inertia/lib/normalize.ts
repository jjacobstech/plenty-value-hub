/**
 * Bridges two backend inconsistencies:
 *   1. Serializer casing — camelCase vs snake_case reads that silently
 *      return `undefined` when guessed wrong.
 *   2. Postgres `decimal`/`numeric` columns arriving as strings, which
 *      breaks `.toFixed()`, arithmetic, and comparisons.
 *
 * Normalized objects carry BOTH casings so child components keep working
 * whichever convention they read.
 *
 * This is a bridge, not the destination. Once the model has `consume`
 * decorators on its decimal columns and the serializer casing is
 * consistent, delete this file and type the props directly.
 */

/* ------------------------------------------------------------------ */
/*  Primitives                                                        */
/* ------------------------------------------------------------------ */

/** First defined, non-null value among the candidate keys. */
export const pick = (obj: Record<string, any> | null | undefined, ...keys: string[]) => {
  if (!obj) return undefined
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return undefined
}

/** Coerce a possibly-string decimal to a number. */
export const num = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** Coerce to number or null, so a real `0` stays distinct from "absent". */
export const numOrNull = (value: unknown) => {
  if (value === undefined || value === null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type Product = {
  id: number
  name: string
  description: string | null
  shortDescription: string | null
  category: string
  productType: string | null
  price: number
  salePrice: number | null
  commissionRate: number
  gravityScore: number
  rating: number
  reviewCount: number
  avgEarningsPerSale: number | null
  conversionRate: number | null
  refundRate: number
  imageUrl: string | null
  vendorName: string | null
  isFeatured: boolean
  // snake_case mirrors and any extra backend fields
  [key: string]: any
}

export type Review = {
  id: number
  rating: number
  content: string
  reviewerName: string
  isVerifiedPurchase: boolean
  [key: string]: any
}

/* ------------------------------------------------------------------ */
/*  Normalizers                                                       */
/* ------------------------------------------------------------------ */

export function normalizeProduct(p: Record<string, any>): Product {
  const productType = pick(p, 'productType', 'product_type', 'type') ?? null
  const shortDescription = pick(p, 'shortDescription', 'short_description') ?? null

  const price = num(pick(p, 'price'))
  const salePrice = numOrNull(pick(p, 'salePrice', 'sale_price'))
  const commissionRate = num(pick(p, 'commissionRate', 'commission_rate'))
  const gravityScore = num(pick(p, 'gravityScore', 'gravity_score'))
  const rating = num(pick(p, 'rating', 'averageRating', 'average_rating'))
  const reviewCount = num(pick(p, 'reviewCount', 'review_count'))
  const avgEarningsPerSale = numOrNull(
    pick(p, 'avgEarningsPerSale', 'avg_earnings_per_sale', 'averageEarningsPerSale')
  )
  const conversionRate = numOrNull(pick(p, 'conversionRate', 'conversion_rate'))
  const refundRate = num(pick(p, 'refundRate', 'refund_rate'))

  const vendorRaw = pick(p, 'vendorName', 'vendor_name', 'vendor')
  const vendorName = typeof vendorRaw === 'object' ? (vendorRaw?.name ?? null) : (vendorRaw ?? null)

  const imageUrl =
    pick(
      p,
      'imageUrl',
      'image_url',
      'thumbnailUrl',
      'thumbnail_url',
      'coverImage',
      'cover_image',
      'image'
    ) ?? null

  const isFeatured = Boolean(pick(p, 'isFeatured', 'is_featured'))

  return {
    ...p,
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? null,
    category: p.category ?? '',

    // canonical camelCase
    shortDescription,
    productType,
    price,
    salePrice,
    commissionRate,
    gravityScore,
    rating,
    reviewCount,
    avgEarningsPerSale,
    conversionRate,
    refundRate,
    imageUrl,
    vendorName,
    isFeatured,

    // snake_case mirrors
    short_description: shortDescription,
    product_type: productType,
    sale_price: salePrice,
    commission_rate: commissionRate,
    gravity_score: gravityScore,
    review_count: reviewCount,
    avg_earnings_per_sale: avgEarningsPerSale,
    conversion_rate: conversionRate,
    refund_rate: refundRate,
    image_url: imageUrl,
    thumbnail_url: imageUrl,
    thumbnailUrl: imageUrl,
    vendor_name: vendorName,
    is_featured: isFeatured,
  }
}

export function normalizeReview(r: Record<string, any>): Review {
  const reviewerRaw = pick(r, 'reviewerName', 'reviewer_name', 'user', 'reviewer')
  const reviewerName =
    typeof reviewerRaw === 'object'
      ? (reviewerRaw?.fullName ?? reviewerRaw?.full_name ?? reviewerRaw?.name ?? 'Anonymous')
      : (reviewerRaw ?? 'Anonymous')

  const isVerifiedPurchase = Boolean(
    pick(r, 'isVerifiedPurchase', 'is_verified_purchase', 'verifiedPurchase')
  )

  return {
    ...r,
    id: r.id,
    rating: num(pick(r, 'rating')),
    content: r.content ?? '',
    reviewerName,
    isVerifiedPurchase,
    reviewer_name: reviewerName,
    is_verified_purchase: isVerifiedPurchase,
  }
}

/** Price actually charged — sale price when genuinely lower, else list price. */
export const effectivePrice = (p: Product) =>
  p.salePrice !== null && p.salePrice < p.price ? p.salePrice : p.price
