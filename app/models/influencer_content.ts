import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import InfluencerProfile from '#models/influencer_profile'

export default class InfluencerContent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare influencerId: number

  @column()
  declare campaignId: number | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare contentType: 'post' | 'reel' | 'story' | 'video' | 'article' | 'live'

  @column()
  declare platform: string // instagram, tiktok, youtube, twitter, blog

  @column()
  declare contentUrl: string

  @column()
  declare thumbnailUrl: string | null

  @column()
  declare affiliateLink: string | null

  @column()
  declare status: 'draft' | 'scheduled' | 'published' | 'archived'

  @column()
  declare publishedAt: DateTime | null

  @column()
  declare views: number

  @column()
  declare likes: number

  @column()
  declare comments: number

  @column()
  declare shares: number

  @column()
  declare engagementRate: number

  @column()
  declare clicks: number

  @column()
  declare conversions: number

  @column()
  declare revenue: number

  @column()
  declare hashtags: string | null // JSON array

  @column()
  declare mentions: string | null // JSON array

  @column()
  declare linkedProducts: string | null // JSON array of product IDs

  @column()
  declare mediaAssets: string | null // JSON array of image/video URLs

  @column()
  declare performanceMetrics: string | null // JSON with detailed metrics

  @column()
  declare approvalStatus: 'pending' | 'approved' | 'rejected'

  @column()
  declare approvalNotes: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare isPaid: boolean

  @column()
  declare paidAmount: number

  @column()
  declare paymentStatus: 'pending' | 'processing' | 'paid' | 'failed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => InfluencerProfile, {
    foreignKey: 'influencerId',
  })
  declare influencer: BelongsTo<typeof InfluencerProfile>
}
