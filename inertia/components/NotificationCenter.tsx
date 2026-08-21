import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Bell, Trash2, CheckCheck, Check } from 'lucide-react'
import api from '@/api/http-client'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Notification {
  id: number
  uuid: string
  title: string
  message: string | null
  type: 'sale' | 'review' | 'message' | 'system'
  icon: string | null
  data: any | null
  isRead: boolean
  readAt: string | null
  actionUrl: string | null
  createdAt: string
  updatedAt: string
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/notifications')
      if (response.success) {
        setNotifications(response.data)
        const unread = response.data.filter((n: Notification) => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications/unread')
      if (response.success) {
        setUnreadCount(response.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      )
      await fetchUnreadCount()
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all')
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  // Delete notification
  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/api/notifications/${id}`)
      setNotifications(notifications.filter((n) => n.id !== id))
      await fetchUnreadCount()
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return

    try {
      await api.delete('/api/notifications')
      setNotifications([])
      setUnreadCount(0)
      toast.success('All notifications deleted')
    } catch (error) {
      toast.error('Failed to delete notifications')
    }
  }

  // Load notifications when sheet opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  // Initial load
  useEffect(() => {
    fetchUnreadCount()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-50 border-green-200'
      case 'review':
        return 'bg-blue-50 border-blue-200'
      case 'message':
        return 'bg-purple-50 border-purple-200'
      case 'system':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-0 right-0 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-96 flex flex-col">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between w-full pr-4">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} transition-colors ${
                    !notification.isRead ? 'ring-1 ring-blue-300' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {notification.icon && (
                      <span className="text-lg flex-shrink-0">{notification.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="p-1"
                        >
                          <Check className="w-4 h-4 text-blue-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {notification.actionUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => {
                        window.location.href = notification.actionUrl!
                        setOpen(false)
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={deleteAllNotifications}
            className="mt-4 w-full text-red-600 hover:text-red-700"
          >
            Clear all notifications
          </Button>
        )}
      </SheetContent>
    </Sheet>
  )
}
