import type { HttpContext } from '@adonisjs/core/http'
import AffiliateLinkService from '#services/affiliate_link_service'
import AffiliateLink from '#models/affiliate_link'
import Conversion from '#models/conversion'
import Campaign from '#models/campaign'
import { DateTime } from 'luxon'

export default class AffiliateLinksController {
  /**
   * Create affiliate link (affiliate only)
   */
  async create({ request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'affiliate') {
      return response.unauthorized({ error: 'Only affiliates can create links' })
    }

    const { campaignId, customAlias, description, expiresAt } = request.only([
      'campaignId',
      'customAlias',
      'description',
      'expiresAt',
    ])

    try {
      const campaign = await Campaign.find(campaignId)
      if (!campaign) {
        return response.notFound({ error: 'Campaign not found' })
      }

      if (campaign.status !== 'active') {
        return response.badRequest({ error: 'Can only create links for active campaigns' })
      }

      const link = await AffiliateLinkService.createLink({
        affiliateId: user.id,
        campaignId,
        customAlias,
        description,
        expiresAt: expiresAt ? DateTime.fromISO(expiresAt) : undefined,
      })

      return response.created({ success: true, data: link })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create link'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * List affiliate links
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { campaignId } = request.qs()

    try {
      const links = await AffiliateLinkService.getAffiliateLinks(
        user.id,
        campaignId ? parseInt(campaignId) : undefined
      )

      return response.ok({ success: true, data: links })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch links'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get link details
   */
  async show({ params, auth, response }: HttpContext) {
    try {
      const link = await AffiliateLink.find(params.id)

      if (!link) {
        return response.notFound({ error: 'Link not found' })
      }

      if (link.affiliateId !== auth.user!.id && auth.user!.role !== 'admin') {
        return response.forbidden({ error: 'You do not have permission to view this link' })
      }

      return response.ok({ success: true, data: link })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch link'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Update affiliate link
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const link = await AffiliateLink.find(params.id)

      if (!link) {
        return response.notFound({ error: 'Link not found' })
      }

      if (link.affiliateId !== user.id && user.role !== 'admin') {
        return response.forbidden({ error: 'You cannot update this link' })
      }

      const { description } = request.only(['description'])

      await link.merge({ description }).save()

      return response.ok({ success: true, data: link })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update link'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Disable affiliate link
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const link = await AffiliateLink.find(params.id)

      if (!link) {
        return response.notFound({ error: 'Link not found' })
      }

      if (link.affiliateId !== user.id && user.role !== 'admin') {
        return response.forbidden({ error: 'You cannot disable this link' })
      }

      await AffiliateLinkService.disableLink(link.id)

      return response.ok({ success: true, message: 'Link disabled' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to disable link'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get link metrics
   */
  async metrics({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const link = await AffiliateLink.find(params.id)

      if (!link) {
        return response.notFound({ error: 'Link not found' })
      }

      if (link.affiliateId !== user.id && user.role !== 'admin') {
        return response.forbidden({ error: 'You cannot view this link metrics' })
      }

      const metrics = await AffiliateLinkService.getLinkMetrics(link.id)

      return response.ok({ success: true, data: metrics })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch metrics'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Track click (public endpoint)
   */
  async trackClick({ request, response }: HttpContext) {
    const { slug } = request.params()

    try {
      const link = await AffiliateLinkService.getLinkBySlug(slug)

      if (!link) {
        return response.notFound({ error: 'Link not found' })
      }

      const userAgent = request.header('user-agent') || ''
      const ipAddress = request.ip() || ''
      const referrer = request.header('referer') || ''

      const click = await AffiliateLinkService.recordClick(
        link.id,
        link.affiliateId,
        link.campaignId,
        {
          userAgent,
          ipAddress,
          referrer,
        }
      )

      return response.created({
        success: true,
        data: { clickId: click.clickId, slug: link.slug },
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to track click'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Report conversion from vendor
   */
  async reportConversion({ request, response }: HttpContext) {
    const { affiliateLinkId, clickId, orderValue, externalOrderId, externalConversionId } =
      request.only([
        'affiliateLinkId',
        'clickId',
        'orderValue',
        'externalOrderId',
        'externalConversionId',
      ])

    try {
      const link = await AffiliateLink.find(affiliateLinkId)

      if (!link) {
        return response.notFound({ error: 'Affiliate link not found' })
      }

      const conversion = await AffiliateLinkService.recordConversion(
        clickId,
        affiliateLinkId,
        link.affiliateId,
        link.campaignId,
        orderValue,
        externalOrderId,
        externalConversionId
      )

      return response.created({
        success: true,
        data: { conversionId: conversion.conversionId },
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to record conversion'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get conversions for link (affiliate)
   */
  async conversions({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const link = await AffiliateLink.find(params.id)

      if (!link) {
        return response.notFound({ error: 'Link not found' })
      }

      if (link.affiliateId !== user.id && user.role !== 'admin') {
        return response.forbidden({ error: 'You cannot view this link conversions' })
      }

      const conversions = await Conversion.query().where('affiliate_link_id', link.id)

      return response.ok({ success: true, data: conversions })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch conversions'
      return response.badRequest({ error: msg })
    }
  }
}
