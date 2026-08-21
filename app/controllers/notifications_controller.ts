import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import logger from '@adonisjs/core/services/logger'

export default class NotificationsController {
  /**
   * GET /api/notifications
   * Get all notifications for the authenticated user
   */
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      if (!user) {
        return response.unauthorized({ error: 'Not authenticated' })
      }

      const notifications = await Notification.query()
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')
        .limit(50)

      return response.ok({
        success: true,
        data: notifications,
        total: notifications.length,
      })
    } catch (error) {
      logger.error('Failed to fetch notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        error: 'Failed to fetch notifications',
      })
    }
  }

  /**
   * GET /api/notifications/unread
   * Get unread notification count
   */
  async getUnreadCount({ auth, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      if (!user) {
        return response.unauthorized({ error: 'Not authenticated' })
      }

      const count = await Notification.query()
        .where('user_id', user.id)
        .where('is_read', false)
        .count('* as total')
        .first()

      return response.ok({
        success: true,
        unreadCount: count?.$extras.total || 0,
      })
    } catch (error) {
      logger.error('Failed to fetch unread count', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        error: 'Failed to fetch unread count',
      })
    }
  }

  /**
   * GET /api/notifications/:id
   * Get a specific notification
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      if (!user) {
        return response.unauthorized({ error: 'Not authenticated' })
      }

      const notification = await Notification.findOrFail(params.id)

      if (notification.userId !== user.id) {
        return response.forbidden({ error: 'Not authorized' })
      }

      return response.ok({
        success: true,
        data: notification,
      })
    } catch (error) {
      logger.error('Failed to fetch notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(404).json({
        success: false,
        error: 'Notification not found',
      })
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead({ auth, params, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      if (!user) {
        return response.unauthorized({ error: 'Not authenticated' })
      }

      const notification = await Notification.findOrFail(params.id)

      if (notification.userId !== user.id) {
        return response.forbidden({ error: 'Not authorized' })
      }

      notification.markAsRead()
      await notification.save()

      return response.ok({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      })
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
      })
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead({ auth, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      if (!user) {
        return response.unauthorized({ error: 'Not authenticated' })
      }

      await Notification.query()
        .where('user_id', user.id)
        .where('is_read', false)
        .update({
          is_read: true,
          read_at: new Date(),
        })

      return response.ok({
        success: true,
        message: 'All notifications marked as read',
      })
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read',
      })
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      if (!user) {
        return response.unauthorized({ error: 'Not authenticated' })
      }

      const notification = await Notification.findOrFail(params.id)

      if (notification.userId !== user.id) {
        return response.forbidden({ error: 'Not authorized' })
      }

      await notification.delete()

      return response.ok({
        success: true,
        message: 'Notification deleted',
      })
    } catch (error) {
      logger.error('Failed to delete notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        error: 'Failed to delete notification',
      })
    }
  }

  /**
   * DELETE /api/notifications
   * Delete all notifications for user
   */
  async destroyAll({ auth, response }: HttpContext) {
    try {
      const user = auth.use('web').user
      if (!user) {
        return response.unauthorized({ error: 'Not authenticated' })
      }

      await Notification.query().where('user_id', user.id).delete()

      return response.ok({
        success: true,
        message: 'All notifications deleted',
      })
    } catch (error) {
      logger.error('Failed to delete all notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        success: false,
        error: 'Failed to delete all notifications',
      })
    }
  }
}
