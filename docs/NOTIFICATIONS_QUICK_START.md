# Vendor Notifications - Quick Start Guide

## What's New
✅ Vendors get in-app notifications when products are purchased  
✅ Bell icon in dashboard header shows unread count  
✅ Full notification history stored in database  
✅ Email + in-app notifications sent together  

## Files Created

### Backend
```
app/
  ├── models/
  │   └── notification.ts                 (Notification model)
  ├── controllers/
  │   └── notifications_controller.ts     (API endpoints)
  └── services/
      └── notification_service.ts         (UPDATED - creates in-app notifications)

database/
  └── migrations/
      └── 1787200000000_create_notifications_table.ts (Database schema)

start/
  └── routes.ts                           (UPDATED - added notification routes)
```

### Frontend
```
inertia/
  ├── components/
  │   ├── NotificationCenter.tsx          (New notification UI component)
  │   └── layout/
  │       └── DashboardLayout.tsx         (UPDATED - added NotificationCenter)
  └── types/                              (TypeScript types)
```

## Setup Steps

### 1. Run Migration
```bash
cd /home/jacobs-joshua/Documents/plenty-value-hub
node ace migration:run
```

### 2. Restart Your App
```bash
npm run dev
# or
yarn dev
```

### 3. Test It
- Login as vendor
- Create a product
- Make a purchase
- Complete payment
- Check bell icon in dashboard

## API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`).

### Get All Notifications
```
GET /api/notifications
Response: { success: true, data: [...], total: number }
```

### Get Unread Count
```
GET /api/notifications/unread
Response: { success: true, unreadCount: number }
```

### Mark as Read
```
PATCH /api/notifications/:id/read
Response: { success: true, message: "Notification marked as read" }
```

### Mark All as Read
```
PATCH /api/notifications/read-all
Response: { success: true, message: "All notifications marked as read" }
```

### Delete Notification
```
DELETE /api/notifications/:id
Response: { success: true, message: "Notification deleted" }
```

### Delete All Notifications
```
DELETE /api/notifications
Response: { success: true, message: "All notifications deleted" }
```

## When Notifications Are Sent

### Order Completed → Vendor Gets:

**Email Notification**
- Subject: `🎉 You made a sale! Order #123 (Product Name)`
- Contains: Order details + Buyer shipping info
- Sent to: `vendor.email`

**In-App Notification** ← NEW!
- Title: `New Sale: Product Name`
- Message: `You made a sale! Order #123 for $99.99`
- Icon: 🎉
- Link: `/vendor/orders/123`
- Stored in: `notifications` table

## Notification Types

```typescript
type NotificationType = 'sale' | 'review' | 'message' | 'system'
```

Currently implemented: **`sale`**

For future use:
- `review` - New product review
- `message` - Direct message
- `system` - Platform announcements

## Notification Center UI

### Location
Top right of vendor dashboard header, next to user profile

### Features
- 🔔 Bell icon
- 🔴 Red badge showing unread count
- 📋 Slide-out panel (from right side)
- 🎨 Color-coded by type:
  - Sales: Green
  - Reviews: Blue
  - Messages: Purple
  - System: Amber

### Actions
- Click notification to view (shows link button)
- Click ✓ to mark as read
- Click 🗑️ to delete
- "Mark all read" - quick action
- "Clear all notifications" - bulk delete

## Database Schema

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36),
  user_id INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  icon VARCHAR(10),
  data JSON,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP NULL,
  action_url VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (is_read),
  INDEX (created_at)
);
```

## Creating Notifications Programmatically

```typescript
import Notification from '#models/notification'

// Example: Create a sale notification
await Notification.createNotification({
  userId: vendorId,
  type: 'sale',
  title: `New Sale: iPhone 15`,
  message: `Order #ORD-001 for $799.99`,
  icon: '🎉',
  data: {
    orderId: 10,
    productId: 42,
    amount: '799.99',
  },
  actionUrl: '/vendor/orders/10',
})
```

## Common Tasks

### Get unread notifications only
```typescript
const unread = await Notification.query()
  .where('user_id', vendorId)
  .where('is_read', false)
  .orderBy('created_at', 'desc')
```

### Mark all notifications as read
```typescript
await Notification.query()
  .where('user_id', vendorId)
  .where('is_read', false)
  .update({
    is_read: true,
    read_at: new Date(),
  })
```

### Delete old notifications (>30 days)
```typescript
import { DateTime } from 'luxon'

await Notification.query()
  .where('user_id', vendorId)
  .where('created_at', '<', DateTime.now().minus({ days: 30 }).toSQL())
  .delete()
```

## Testing Checklist

- [ ] Migration ran successfully (`node ace migration:status`)
- [ ] Notification table created in database
- [ ] NotificationCenter component imports without errors
- [ ] Dashboard shows bell icon in header
- [ ] Bell icon shows badge when logged in as vendor
- [ ] Create product and purchase it
- [ ] Complete payment
- [ ] New sale notification appears
- [ ] Notification shows correct data
- [ ] Can mark as read
- [ ] Can delete notification
- [ ] Can mark all as read
- [ ] Can clear all notifications
- [ ] Unread count badge updates

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bell icon not showing | Check NotificationCenter import in DashboardLayout |
| Notifications not created | Check NotificationService.notifyOrderCompleted() |
| 404 on API endpoints | Check routes.ts has notification routes |
| Database errors | Run `node ace migration:run` |
| Unread count not updating | Check browser DevTools Console for errors |
| Notifications for wrong user | Check userId in notification creation |

## Code Locations

| Feature | File |
|---------|------|
| Notification model | `app/models/notification.ts` |
| API endpoints | `app/controllers/notifications_controller.ts` |
| Routes | `start/routes.ts` (search for `/api/notifications`) |
| Service | `app/services/notification_service.ts` |
| UI Component | `inertia/components/NotificationCenter.tsx` |
| Dashboard layout | `inertia/components/layout/DashboardLayout.tsx` |
| Migration | `database/migrations/1787200000000_create_notifications_table.ts` |

## Performance Notes

- Notifications limited to 50 per request
- Indexed by: `user_id`, `is_read`, `created_at`
- Unread count polling: 30 seconds
- No real-time updates (polling-based)

## Next Steps

For production deployment:
1. ✅ Run migrations
2. ✅ Test with sample purchases
3. ✅ Monitor database growth
4. Consider: Push notifications
5. Consider: WebSocket for real-time updates
6. Consider: Notification preferences UI

