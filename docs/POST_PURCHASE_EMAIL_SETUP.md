# Post-Purchase Email Notification System

## Overview
The system now sends comprehensive email notifications to both buyers and vendors after a purchase, including contact information and shipping details.

## What Changed

### 1. **Buyer's Receipt Email** (`resources/views/emails/order_confirmation.edge`)
**New Features:**
- ✅ Vendor/Seller Information section with:
  - Business Name (if available)
  - Vendor Email (clickable mailto link)
  - Vendor Phone Number (clickable tel link)
  - Vendor Location (if available)
- ✅ Styled in a blue box (`#e0f2fe` background) for easy visibility
- ✅ Gracefully handles missing vendor information (only shows available fields)

**Example Output:**
```
Seller Information
Business: John's Electronics
Email: john@example.com
Phone: +1-555-123-4567
Location: New York, USA
```

### 2. **Vendor's Sale Notification Email** (`resources/views/emails/vendor_order_notification.edge`)
**New Features:**
- ✅ Buyer's Shipping Information section with:
  - Full Address
  - City
  - State/Province
  - Country
  - Postal Code
  - Phone Number (clickable tel link)
- ✅ Styled in an amber/yellow box (`#fef3c7` background) for distinction
- ✅ 📦 Package icon in section header for visual clarity
- ✅ Gracefully handles missing shipping details (only shows provided fields)

**Example Output:**
```
📦 Buyer's Shipping Information
Address: 123 Main Street
City: New York
State/Province: NY
Country: United States
Postal Code: 10001
Phone: +1-555-987-6543
```

### 3. **NotificationService Enhancement** (`app/services/notification_service.ts`)
**Key Updates:**
- ✅ Added shipping details parsing logic:
  ```typescript
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
- ✅ Passes `shippingDetails` to vendor email template
- ✅ Vendor data automatically passed to buyer email (already existed, now documented)

## Email Flow

### When an order is completed:

1. **Buyer Email** receives:
   - Order confirmation with order details
   - Vendor's contact information (email, phone, business name, location)
   - Payment instructions (if manual payment)

2. **Vendor Email** receives:
   - Sale confirmation with payout information
   - Buyer's shipping address and contact details
   - Product and order information

3. **Admin Email** receives:
   - Order alert (unchanged)

4. **Affiliate Email** receives:
   - Commission notification (unchanged)

## Data Fields Used

### Buyer Email Template Requires:
- `order` - Order details
- `product` - Product information
- `vendor` - User model with: `businessName`, `email`, `phone`, `location`
- `manualInstructions` - Payment method details (for manual payments)
- `isManualPayment` - Boolean flag

### Vendor Email Template Requires:
- `order` - Order details
- `product` - Product information
- `shippingDetails` - Parsed shipping object with:
  - `address` (string, optional)
  - `city` (string, optional)
  - `state` (string, optional)
  - `country` (string, optional)
  - `postalCode` (string, optional)
  - `phone` (string, optional)

## Shipping Details Structure

Shipping details are stored as JSON in the `orders.shipping_details` column:

```json
{
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "country": "United States",
  "postalCode": "10001",
  "phone": "+1-555-987-6543"
}
```

This structure is validated using the `initializePaymentValidator` in `app/validators/payment.ts`.

## Testing the Implementation

### To test buyer emails:
1. Create an order with a vendor that has email, phone, business name, and location filled in
2. Complete payment
3. Check buyer's inbox for the order confirmation email
4. Verify vendor info is displayed correctly

### To test vendor emails:
1. Create an order with complete shipping details
2. Complete payment
3. Check vendor's inbox for the sale notification
4. Verify shipping information is displayed correctly

## Error Handling

- If shipping details cannot be parsed, an error is logged but emails are still sent without shipping info
- If vendor information is missing, those fields are simply omitted from the buyer's email
- If shipping details are missing, the vendor email is sent without the shipping section
- All email sending failures are caught and logged without interrupting the order completion process

## Future Enhancements

Consider these additions:
- Add buyer name/profile information to vendor email
- Include product images in emails
- Add tracking number field when available
- Send shipping status updates email
- Add email preferences/unsubscribe links
- Include order summary with itemized pricing breakdown
- Add return/refund policy information in buyer email

