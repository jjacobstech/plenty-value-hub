import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import CollaborationAgreement from '#models/collaboration_agreement'
import InfluencerContent from '#models/influencer_content'

export default class InfluencerProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare displayName: string

  @column()
  declare bio: string | null

  @column()
  declare profileImageUrl: string | null

  @column()
  declare category: string // beauty, tech, lifestyle, gaming, fitness, etc.

  @column()
  declare niche: string | null

  @column()
  declare followerCount: number

  @column()
  declare engagementRate: number // 0-100

  @column()
  declare platforms: string // JSON: { instagram, tiktok, youtube, twitter, etc. }

  @column()
  declare platformFollowers: string // JSON: { instagram: 50000, tiktok: 100000, etc. }

  @column()
  declare verificationStatus: 'unverified' | 'pending' | 'verified' | 'suspended'

  @column()
  declare verificationDocuments: string | null // JSON array of document URLs

  @column()
  declare revenue30Days: number

  @column()
  declare revenue90Days: number

  @column()
  declare totalRevenue: number

  @column()
  declare averageCommissionRate: number

  @column()
  declare topProduct: string | null

  @column()
  declare conversionRate: number

  @column()
  declare audienceDemographics: string | null // JSON: age, gender, location distribution

  @column()
  declare bannerImageUrl: string | null

  @column()
  declare website: string | null

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare countryCode: string | null

  @column()
  declare isApproved: boolean

  @column()
  declare approvedAt: DateTime | null

  @column()
  declare approvedBy: number | null

  @column()
  declare rejectionReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => CollaborationAgreement, {
    foreignKey: 'influencerId',
  })
  declare collaborations: HasMany<typeof CollaborationAgreement>

  @hasMany(() => InfluencerContent, {
    foreignKey: 'influencerId',
  })
  declare content: HasMany<typeof InfluencerContent>
}
