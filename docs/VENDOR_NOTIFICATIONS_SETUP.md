# Vendor Notification System

## Overview
Vendors now receive real-time in-app notifications when their products are purchased. The system includes:
- ✅ In-app notification center in the dashboard header
- ✅ Database persistence for notification history
- ✅ Email notifications (existing system)
- ✅ Read/unread status tracking
- ✅ Notification deletion and management

## What's New

### 1. **Notifications Table**
**File:** `database/migrations/1787200000000_create_notifications_table.ts`

**Schema:**
- `id` - Primary key
- `uuid` - UUID identifier
- `user_id` - Foreign key to users table
- `type` - Notification type (sale, review, message, system)
- `title` - Notification title
- `message` - Optional message content
- `icon` - Emoji or icon identifier
- `data` - JSON object with extra context (orderId, productId, amount, etc.)
- `is_read` - Boolean flag for read status
- `read_at` - Timestamp when marked as read
- `action_url` - Link to relevant page
- `created_at` / `updated_at` - Timestamps

**Indexes:** `user_id`, `is_read`, `created_at`

### 2. **Notification Model**
**File:** `app/models/notification.ts`

**Key Methods:**
```typescript
// Create a notification
await Notification.createNotification({
  userId: vendorId,
  type: 'sale',
  title: 'New Sale: Product Name',
  message: 'You made a sale! Order #123 for $99.99',
  icon: '🎉',
  data: {
    orderId: order.id,
    productId: product.id,
    amount: order.vendorPayout,
  },
  actionUrl: '/vendor/orders/123',
})

// Mark as read
notification.markAsRead()
await notification.save()
```

### 3. **Notifications Controller**
**File:** `app/controllers/notifications_controller.ts`

**API Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | Get all notifications (paginated, limited to 50) |
| GET | `/api/notifications/unread` | Get unread notification count |
| GET | `/api/notifications/:id` | Get specific notification |
| PATCH | `/api/notifications/:id/read` | Mark single notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/notifications/:id` | Delete single notification |
| DELETE | `/api/notifications` | Delete all notifications |

All endpoints require authentication.

### 4. **Notification Center Component**
**File:** `inertia/components/NotificationCenter.tsx`

**Features:**
- Bell icon with unread badge in header
- Slide-out sheet showing all notifications
- Color-coded by type:
  - 🎉 Sales: Green background
  - ⭐ Reviews: Blue background
  - 💬 Messages: Purple background
  - 📢 System: Amber background
- Individual mark-as-read buttons
- "Mark all read" quick action
- Delete individual notifications
- "Clear all" bulk delete
- Timestamps in relative format
- Click-through links to view details
- Auto-refresh every 30 seconds for unread count

### 5. **NotificationService Enhancement**
**File:** `app/services/notification_service.ts`

**New Functionality:**
When an order is completed, the vendor now receives:
1. Email notification (existing)
2. In-app notification (new):
   ```typescript
   await Notification.createNotification({
     userId: vendorId,
     type: 'sale',
     title: `New Sale: ${product.name}`,
     message: `You made a sale! Order #${order.orderNumber} for $${order.vendorPayout}`,
     icon: '🎉',
     data: {
       orderId: order.id,
       productId: product.id,
       amount: order.vendorPayout,
     },
     actionUrl: `/vendor/orders/${order.id}`,
   })
   ```

### 6. **Dashboard Layout Update**
**File:** `inertia/components/layout/DashboardLayout.tsx`

**Changes:**
- Imported NotificationCenter component
- Added `<NotificationCenter />` to header navigation
- Positioned between user info and logout button
- Shows unread count badge on bell icon

## Flow Diagram

```
Product Purchase Completed
         ↓
Order marked as 'completed'
         ↓
WebhookController.completeOrderByReference()
         ↓
NotificationService.notifyOrderCompleted()
         ↓
         ├─→ Email: order_confirmation (buyer)
         ├─→ Email: vendor_order_notification (vendor)
         ├─→ Email: admin_order_notification (admin)
         ├─→ Email: affiliate_commission_notification (affiliate)
         └─→ IN-APP: Notification.createNotification() (vendor)
                      ↓
                   Database stored
                      ↓
                   Shows in notification center
```

## Usage Examples

### For Vendors
1. **View Notifications:**
   - Click the bell icon (🔔) in dashboard header
   - Shows unread count badge
   - Opens slide-out notification panel

2. **Mark as Read:**
   - Click check mark on individual notification
   - Or click "Mark all read" for all notifications

3. **Delete Notifications:**
   - Click trash icon on individual notification
   - Or click "Clear all notifications" at bottom

4. **View Order Details:**
   - Click "View Details" button on sale notification
   - Navigates to order page

### For Developers

**Create a notification programmatically:**
```typescript
import Notification from '#models/notification'

await Notification.createNotification({
  userId: 5,
  type: 'sale',
  title: 'New Order Received',
  message: 'Product X sold for $50',
  icon: '🎉',
  data: { orderId: 123 },
  actionUrl: '/vendor/orders/123',
})
```

**Fetch vendor notifications:**
```typescript
const notifications = await Notification.query()
  .where('user_id', vendorId)
  .orderBy('created_at', 'desc')
  .limit(50)
```

**Get unread count:**
```typescript
const unreadCount = await Notification.query()
  .where('user_id', vendorId)
  .where('is_read', false)
  .count('*')
```

## Database Setup

**To run migrations and create the table:**
```bash
cd /home/jacobs-joshua/Documents/plenty-value-hub
node ace migration:run
```

**To check migration status:**
```bash
node ace migration:status
```

**To rollback if needed:**
```bash
node ace migration:rollback
```

## API Usage Examples

### Fetch all notifications
```bash
curl -X GET http://localhost:3333/api/notifications \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 5,
      "type": "sale",
      "title": "New Sale: iPhone 15",
      "message": "You made a sale! Order #ORD-001 for $799.99",
      "icon": "🎉",
      "data": {
        "orderId": 10,
        "productId": 42,
        "amount": "799.99"
      },
      "isRead": false,
      "readAt": null,
      "actionUrl": "/vendor/orders/10",
      "createdAt": "2024-08-20T10:30:00.000Z",
      "updatedAt": "2024-08-20T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### Get unread count
```bash
curl -X GET http://localhost:3333/api/notifications/unread \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "unreadCount": 3
}
```

### Mark notification as read
```bash
curl -X PATCH http://localhost:3333/api/notifications/1/read \
  -H "Authorization: Bearer <token>"
```

### Mark all as read
```bash
curl -X PATCH http://localhost:3333/api/notifications/read-all \
  -H "Authorization: Bearer <token>"
```

### Delete notification
```bash
curl -X DELETE http://localhost:3333/api/notifications/1 \
  -H "Authorization: Bearer <token>"
```

## Testing

### Test Flow
1. Login as vendor
2. Create a product
3. Purchase the product (as buyer)
4. Complete payment
5. Check vendor dashboard header
6. Click bell icon to view notification

### Expected Behavior
- Bell icon shows badge with unread count
- Notification appears in the center with:
  - 🎉 Sale notification icon
  - Product name in title
  - Order number and amount
  - "View Details" button
- Vendor can mark as read or delete
- Notification is stored in database

## Architecture

**Tech Stack:**
- Backend: AdonisJS
- Database: SQL (Lucid ORM)
- Frontend: React + TypeScript
- UI Components: shadcn/ui
- State: React hooks (useState, useEffect)
- Date formatting: date-fns
- Toast notifications: sonner

**Key Design Decisions:**
1. **Persistent Storage:** All notifications stored in DB for history
2. **Real-time Badge:** Polling every 30 seconds for unread count
3. **User Isolation:** Vendor only sees their own notifications
4. **Type System:** TypeScript for Notification model
5. **Error Handling:** Try-catch blocks with logging and user feedback
6. **Authorization:** Vendor can only access their own notifications

## Future Enhancements

Consider adding:
1. **Push Notifications:** Browser push notifications
2. **Email Digest:** Daily/weekly email summary
3. **Notification Preferences:** Settings to control notification types
4. **Real-time Updates:** WebSocket for instant notification delivery
5. **Notification History:** Archive old notifications
6. **Advanced Filtering:** Filter by type, date range, read status
7. **Batch Operations:** Select multiple and bulk actions
8. **Search:** Search notifications by content

## Troubleshooting

### Notifications not appearing
1. Check if notification creation is being called:
   ```
   grep -r "createNotification" app/services/
   ```
2. Check database table exists:
   ```
   node ace migration:status
   ```
3. Check user_id matches current vendor ID
4. Check browser console for API errors

### Unread badge not updating
1. Ensure `fetchUnreadCount()` is being called
2. Check API endpoint returns correct data
3. Clear browser cache and refresh

### Notifications visible for other vendors
1. Verify `where('user_id', user.id)` in controller
2. Check API authorization middleware
3. Confirm user is authenticated

## Security Considerations

✅ **Implemented:**
- User authentication required for all endpoints
- User can only access their own notifications
- User ID verification in controller
- SQL injection prevention (ORM)
- CSRF protection (AdonisJS middleware)

⚠️ **Consider for Production:**
- Rate limiting on notification endpoints
- Notification encryption (if sensitive data)
- Audit logging for notification access
- GDPR compliance (data retention policy)

