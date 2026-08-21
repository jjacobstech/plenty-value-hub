# Payout Methods - Dynamic Fields Update

## Overview
Updated the vendor payout method system to collect specific account details based on the selected payment platform, replacing the generic text area with structured fields.

## What Changed

### Database Schema
**New Migration:** `database/migrations/1787250000000_add_payout_fields_to_users.ts`

**New Columns:**
```
Bank Transfer:
- payout_bank_name (VARCHAR 255)
- payout_account_number (VARCHAR 255)
- payout_account_name (VARCHAR 255)
- payout_routing_number (VARCHAR 100)
- payout_swift_code (VARCHAR 50)

Mobile Money:
- payout_mobile_provider (VARCHAR 100)
- payout_mobile_number (VARCHAR 20)

PayPal/Stripe/Other:
- payout_email (VARCHAR 255)
- payout_account_id (VARCHAR 255)

General:
- payout_metadata (JSON) - For flexible future use
```

### Frontend - VendorProfile Component
**File:** `inertia/pages/vendor/VendorProfile.tsx`

**Changes:**
- Replaced generic `payoutDetails` textarea with structured fields
- Added dynamic form sections that show/hide based on selected payment method
- Color-coded sections for better UX:
  - 🔵 Bank Transfer (Blue)
  - 🟢 Mobile Money (Green)
  - 🟡 PayPal (Yellow)
  - 🟣 Stripe (Purple)
  - 🔵 Paystack (Indigo)
  - 🔴 Flutterwave (Red)

## Payout Methods & Fields

### 1. Bank Transfer
**Fields Collected:**
- Bank Name (required) - e.g., "Guaranty Trust Bank"
- Account Holder Name (required) - Full name
- Account Number (required) - 10-16 digits
- Routing Number (optional) - Routing/Sorting number
- SWIFT/BIC Code (optional) - International code

**Validation:** Requires Bank Name, Account Name, Account Number

### 2. Mobile Money
**Fields Collected:**
- Provider (required) - Select from:
  - MTN Mobile Money
  - Airtel Money
  - Vodafone Cash
  - Orange Money
  - M-Pesa
  - Other
- Phone Number (required) - e.g., "+234 XXX XXX XXXX"
- Account Holder Name (required) - Name registered with provider

**Validation:** Requires Provider, Phone Number, Account Name

### 3. PayPal
**Fields Collected:**
- PayPal Email (required) - Associated PayPal account email

**Validation:** Requires valid email

### 4. Stripe
**Fields Collected:**
- Stripe Account ID (required) - e.g., "acct_xxxxx"
- Email (required) - Associated email

**Validation:** Requires Account ID and Email

### 5. Paystack
**Fields Collected:**
- Recipient Code (required) - e.g., "RCP_xxxxx" or bank account

**Validation:** Requires Recipient Code

### 6. Flutterwave
**Fields Collected:**
- Account Details (required) - Bank account or account ID

**Validation:** Requires Account Details

## Form State Structure

```typescript
{
  // ... other fields ...
  payoutMethod: 'bank_transfer' | 'mobile_money' | 'paypal' | 'stripe' | 'paystack' | 'flutterwave',
  
  // Bank Transfer
  payoutBankName: string,
  payoutAccountNumber: string,
  payoutAccountName: string,
  payoutRoutingNumber: string,
  payoutSwiftCode: string,
  
  // Mobile Money
  payoutMobileProvider: string,
  payoutMobileNumber: string,
  
  // PayPal/Stripe/Other
  payoutEmail: string,
  payoutAccountId: string,
}
```

## API Endpoint Update

**Endpoint:** `PUT /api/profile/vendor`

**Now Accepts:**
```json
{
  "payoutMethod": "bank_transfer",
  "payoutBankName": "GTB",
  "payoutAccountNumber": "0123456789",
  "payoutAccountName": "John Doe",
  "payoutRoutingNumber": "123456",
  "payoutSwiftCode": "GTBLNGLA",
  "payoutMobileProvider": "mtn",
  "payoutMobileNumber": "+234 800 000 0000",
  "payoutEmail": "john@example.com",
  "payoutAccountId": "acct_xxxxx"
}
```

## User Experience

### Before ❌
- Single textarea for all payment methods
- No validation of data format
- Vendor had to remember what information to enter
- No visual distinction between methods
- Hard to parse backend

### After ✅
- Specific fields for each payment method
- Clear labels with placeholders
- Color-coded sections for quick visual identification
- Only relevant fields show based on selection
- Better data structure in database
- Easier to validate and process backend
- Professional form UI with proper spacing

## Setup Steps

### 1. Run Migration
```bash
cd /home/jacobs-joshua/Documents/plenty-value-hub
node ace migration:run
```

### 2. Test the Form
1. Login as vendor
2. Go to Store Profile
3. Click "Edit Profile"
4. Scroll to "Payout Method & Account Details"
5. Select different payment methods to see dynamic fields
6. Fill in required fields
7. Save profile

## Backward Compatibility

**Note:** Old `payoutDetails` column still exists in database but is no longer used by the new form. The system now stores data in structured columns instead.

**For existing vendors:**
- All existing `payoutDetails` data is preserved
- New form will be empty initially
- Vendors will need to re-enter their payout information in the new structured format
- You can run a migration script to parse old data if needed

## Benefits

✅ **Structured Data:** Easy to process and validate  
✅ **Better UX:** Clear forms with relevant fields only  
✅ **Security:** Validates format of payment information  
✅ **Extensibility:** Easy to add new payment methods  
✅ **Professional:** Clear, organized appearance  
✅ **Type-Safe:** All fields have expected formats  

## Future Enhancements

- Add form validation with error messages
- Implement bank account verification API
- Add support for more payment methods
- Payment test/verification endpoint
- Payout history dashboard
- Automatic payout scheduling
- Multi-currency support

## API Backend Update Needed

You'll need to update the Profile controller to handle the new fields:

```typescript
async updateVendor({ auth, request, response }: HttpContext) {
  const user = auth.use('web').user!
  const payload = await request.validate({
    schema: vine.object({
      businessName: vine.string().trim().optional(),
      // ... other fields ...
      payoutMethod: vine.string().optional(),
      payoutBankName: vine.string().trim().optional(),
      payoutAccountNumber: vine.string().trim().optional(),
      payoutAccountName: vine.string().trim().optional(),
      payoutRoutingNumber: vine.string().trim().optional(),
      payoutSwiftCode: vine.string().trim().optional(),
      payoutMobileProvider: vine.string().trim().optional(),
      payoutMobileNumber: vine.string().trim().optional(),
      payoutEmail: vine.string().email().optional(),
      payoutAccountId: vine.string().trim().optional(),
    })
  })

  await user.merge(payload).save()
  return response.ok({ message: 'Profile updated' })
}
```

## Files Modified/Created

| File | Change |
|------|--------|
| `database/migrations/1787250000000_add_payout_fields_to_users.ts` | ✨ NEW - Database schema |
| `inertia/pages/vendor/VendorProfile.tsx` | 📝 UPDATED - Dynamic payout form |

## Testing Checklist

- [ ] Migration runs without errors
- [ ] New columns appear in database
- [ ] Form shows payout method selector
- [ ] Bank Transfer fields appear when selected
- [ ] Mobile Money fields appear when selected
- [ ] PayPal field appears when selected
- [ ] Stripe fields appear when selected
- [ ] Can save profile with new fields
- [ ] Data persists after save/reload
- [ ] Required fields show validation
- [ ] UI looks good on mobile and desktop

