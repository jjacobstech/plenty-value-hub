import type { PageProps } from '@inertiajs/core'
import { type Data } from '@generated/data'
import { type PropsWithChildren } from 'react'
import { type JSONDataTypes } from '@adonisjs/core/types/transformers'

export type InertiaProps<T extends JSONDataTypes = {}> = PropsWithChildren<Data.SharedProps & T>

export type UserRole = 'admin' | 'vendor' | 'affiliate' | 'consumer'

/** The signed-in user as UserTransformer sends it to every page. */
export type AuthUser = {
  id: number
  email: string
  fullName: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
  initials: string
  profilePicture: string | null
  bio: string | null
  website: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  location: string | null
  phone: string | null
  niche?: string | null
  marketingChannels?: string[] | null
  businessName?: string | null
  businessDescription?: string | null
  businessLogo?: string | null
  coverBanner?: string | null
  productCategories?: string[] | null
}

/** Props that the Inertia middleware shares with every page (see app/middleware/inertia_middleware.ts). */
export type SharedPageProps = PageProps & {
  user?: AuthUser | null
  isOrganisation?: boolean
  currencySymbol: string
  systemCurrency: string
  flash?: { error?: string; success?: string }
}

/** A product as the marketplace and product cards receive it. The API sends some fields in both casings. */
export type ProductSummary = {
  id: number
  uuid?: string | null
  name: string
  description?: string | null
  category: string
  productType?: string | null
  price: number | string
  salePrice?: number | string | null
  sale_price?: number | string | null
  commissionRate?: number | string | null
  commission_rate?: number | string | null
  commission?: number | string | null
  gravityScore?: number | null
  rating?: number | string | null
  imageUrl?: string | null
  image_url?: string | null
  isFeatured?: boolean
  is_featured?: boolean
}

/** An affiliate link row as the affiliate pages receive it. Some fields come in both casings. */
export type AffiliateLinkRow = {
  id: number
  linkCode?: string | null
  link_code?: string | null
  product_name?: string | null
  status?: string | null
  clicks?: number | null
  conversions?: number | null
  revenue?: number | null
  commission_earned?: number | null
}

/** A payout request as the admin payouts page shows it. Money is a string, as the API sends it. */
export type PayoutRow = {
  id: number
  amount: string
  payoutMethod: string
  payoutDetails: string
  status: string
  adminNotes: string | null
  transferStatus?: string | null
  createdAt: string
  processedAt: string | null
  user: { id: number; fullName: string; email: string; role: string } | null
}
