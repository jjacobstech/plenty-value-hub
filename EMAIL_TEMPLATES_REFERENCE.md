# Email Templates Quick Reference

## Files Modified

| File | Purpose | Changes |
|------|---------|---------|
| `resources/views/emails/order_confirmation.edge` | Buyer receipt email | ✅ Added seller information section with contact details |
| `resources/views/emails/vendor_order_notification.edge` | Vendor sale notification | ✅ Added buyer shipping information section |
| `app/services/notification_service.ts` | Email notification service | ✅ Added shipping details parsing and passing to templates |

## Email Templates Overview

### 1. Buyer's Order Confirmation Email
**File:** `resources/views/emails/order_confirmation.edge`
**Sent to:** `order.buyerEmail`
**Trigger:** Order completed
**Subject:** `Order #{orderNumber} Confirmed — Plenty Value`

**Content sections:**
- ✅ Order Details (Number, Product, Amount, Status)
- ✅ **Seller Information** (NEW)
  - Business Name
  - Email (clickable)
  - Phone (clickable)
  - Location
- ✅ Manual Payment Instructions (if applicable)

**Styling:**
- Seller info box: Blue background (`#e0f2fe`) with left border (`#0284c7`)
- Responsive design for mobile

---

### 2. Vendor's Sale Notification Email
**File:** `resources/views/emails/vendor_order_notification.edge`
**Sent to:** `vendor.email`
**Trigger:** Order completed
**Subject:** `🎉 You made a sale! Order #{orderNumber} ({productName})`

**Content sections:**
- ✅ Header with "Congratulations! You Made a Sale"
- ✅ Payout Amount highlight
- ✅ Order Details (Product, Order Number, Price, Buyer Email)
- ✅ **Buyer's Shipping Information** (NEW)
  - Address
  - City
  - State/Province
  - Country
  - Postal Code
  - Phone (clickable)

**Styling:**
- Payout amount: Green highlight (`#f0fdf4`)
- Shipping info box: Amber/yellow background (`#fef3c7`) with left border (`#f59e0b`)
- 📦 Package icon for visual hierarchy

---

### 3. Admin Order Notification Email
**File:** `resources/views/emails/admin_order_notification.edge`
**Sent to:** Admin users
**Trigger:** Order completed
**Status:** Unchanged from original

---

### 4. Affiliate Commission Notification Email
**File:** `resources/views/emails/affiliate_commission_notification.edge`
**Sent to:** Affiliate user (if applicable)
**Trigger:** Order completed with affiliate
**Status:** Unchanged from original

---

## Implementation Details

### NotificationService Method
```typescript
static async notifyOrderCompleted(order: Order, product: Product)
```

**Key additions:**
```typescript
// Parse shipping details if available
let shippingDetails: any = null
if (order.shippingDetails) {
  try {
    shippingDetails =
      typeof order.shippingDetails === 'string'
        ? JSON.parse(order.shippingDetails)
        : order.shippingDetails
  } catch (err) {
    console.error('[NotificationService] Failed to parse shipping details:', err)
  }
}
```

**Vendor email sending (updated):**
```typescript
await mail.send((message) => {
  message
    .to(vendor.email)
    .subject(`🎉 You made a sale! Order #${order.orderNumber} (${product.name})`)
    .htmlView('emails/vendor_order_notification', {
      order: serializedOrder,
      product: serializedProduct,
      shippingDetails,  // NEW - parsed shipping details
    })
})
```

---

## Edge Template Syntax Reference

### Conditional rendering:
```edge
@if(vendor)
  <!-- shown only if vendor exists -->
  @if(vendor.email)
    <!-- shown only if vendor has email -->
  @end
@end
```

### Property access:
```edge
{{ vendor.businessName }}      <!-- Display property -->
{{ order.vendorPayout }}        <!-- Nested property access -->
```

### Clickable links:
```edge
<!-- Email link -->
<a href="mailto:{{ vendor.email }}">{{ vendor.email }}</a>

<!-- Phone link -->
<a href="tel:{{ shippingDetails.phone }}">{{ shippingDetails.phone }}</a>
```

---

## Testing Commands

### View email logs:
```bash
# Check mail service logs in development
grep -r "Failed to notify" storage/logs/
```

### Trigger test order:
```bash
# Use payment controller endpoint
POST /api/payments/initialize
{
  "productId": 1,
  "email": "buyer@example.com",
  "paymentProvider": "manual",
  "shippingDetails": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "phone": "+1-555-123-4567"
  }
}
```

---

## Color Reference

| Usage | Background | Border | Text | Hex Values |
|-------|-----------|--------|------|-----------|
| Seller Info | Light Blue | Blue | Dark Slate | `#e0f2fe` / `#0284c7` / `#0c4a6e` |
| Shipping Info | Light Amber | Amber | Dark Brown | `#fef3c7` / `#f59e0b` / `#92400e` |
| Payout Highlight | Light Green | Green | Dark Green | `#f0fdf4` / `#bbf7d0` / `#15803d` |

---

## Database Schema

**Order shipping_details column:**
```sql
ALTER TABLE orders ADD shipping_details JSON NULL;
```

**Validation schema** (`app/validators/payment.ts`):
```typescript
shippingDetails: vine
  .object({
    address: vine.string().trim().optional(),
    city: vine.string().trim().optional(),
    state: vine.string().trim().optional(),
    country: vine.string().trim().optional(),
    postalCode: vine.string().trim().optional(),
    phone: vine.string().trim().optional(),
  })
  .optional(),
```

