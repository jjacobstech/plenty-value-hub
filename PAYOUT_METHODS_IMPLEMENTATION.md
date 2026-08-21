# Payout Methods Implementation - Admin-Managed Payouts

## Overview
This implementation collects account details from vendors and affiliates for different payout methods. The admin dashboard handles actual payout processing manually using these details.

## Database Schema

### New User Table Columns
```sql
-- Bank Transfer
payout_bank_name         VARCHAR(255) - Bank name
payout_account_number    VARCHAR(255) - Account number (10-16 digits)
payout_account_name      VARCHAR(255) - Account holder name
payout_routing_number    VARCHAR(100) - Routing/Sorting number
payout_swift_code        VARCHAR(50)  - SWIFT/BIC code

-- Mobile Money
payout_mobile_provider   VARCHAR(100) - Provider (MTN, Airtel, Vodafone, etc.)
payout_mobile_number     VARCHAR(20)  - Phone number

-- Universal
payout_email             VARCHAR(255) - Email address
payout_account_id        VARCHAR(255) - Account identifier (Stripe ID, etc.)
payout_metadata          JSON         - Flexible additional data

-- Main Method
payout_method            VARCHAR(50)  - Selected method
payout_details           TEXT         - Legacy field (still supported)
```

**Migration:** `database/migrations/1787250000000_add_payout_fields_to_users.ts`

## Supported Payout Methods

### 1. Bank Transfer ✅
**For:** Direct transfers to bank accounts
**Collected Fields:**
- Bank Name (required)
- Account Holder Name (required)
- Account Number (required)
- Routing/Sorting Number (optional)
- SWIFT/BIC Code (optional)

**Admin Workflow:** Use collected details to transfer funds directly to vendor bank account

### 2. Mobile Money ✅
**For:** MTN, Airtel, Vodafone, M-Pesa, Orange Money
**Collected Fields:**
- Provider (required) - Dropdown selection
- Phone Number (required)
- Account Holder Name (required)

**Admin Workflow:** Use provider + phone to transfer funds via mobile money

### 3. PayPal ✅
**For:** PayPal account payouts
**Collected Fields:**
- Email Address (required) - PayPal account email

**Admin Workflow:** Log into PayPal, use collected email to initiate payout

### 4. Stripe ✅
**For:** Stripe Connect recipients
**Collected Fields:**
- Account ID (required) - Stripe account identifier
- Associated Email (required)

**Admin Workflow:** Use Stripe account ID to facilitate payout via Stripe Connect

### 5. Paystack ✅
**For:** Paystack transfer recipients
**Collected Fields:**
- Bank Name (required)
- Account Name (required)
- Account Number (required)

**Admin Workflow:** Use collected bank details to create/identify Paystack transfer recipient and process payout

### 6. Flutterwave ✅
**For:** Flutterwave transfer recipients
**Collected Fields:**
- Bank Name (required)
- Account Name (required)
- Account Number (required)

**Admin Workflow:** Use collected bank details to create/identify Flutterwave transfer recipient and process payout

## Frontend Implementation

### Vendor Profile Form
**File:** `inertia/pages/vendor/VendorProfile.tsx`

Dynamic form that shows/hides relevant fields based on selected payment method:
- Method selector dropdown
- Conditional rendering of fields per method
- Color-coded sections for each method
- Help text and guidance for vendors

### Affiliate Profile Form
Similar structure for affiliates with same payout methods.

## Backend Implementation

### Controller Updates
**File:** `app/controllers/profile_controller.ts`

Both `updateVendor()` and `updateAffiliate()` methods now accept:
- payoutBankName
- payoutAccountNumber
- payoutAccountName
- payoutRoutingNumber
- payoutSwiftCode
- payoutMobileProvider
- payoutMobileNumber
- payoutEmail
- payoutAccountId
- payoutMethod

All fields are trimmed and undefined/null values are filtered out before saving.

### Database Schema
**File:** `database/schema.ts`

Updated `UserSchema` with all new payout fields.

### Model
**File:** `app/models/user.ts`

Updated with `@column()` declarations for each new payout field.

## Admin Dashboard

The admin dashboard will need to display:
1. List of pending payout requests
2. Vendor/affiliate details including their selected payout method
3. All relevant account details based on selected method
4. Manual actions to:
   - Approve/reject payout
   - Mark as paid
   - Add notes

## Data Structure for Admin

When admin views a pending payout, they'll see:
```
{
  id: 123,
  vendor: {
    name: "John Doe",
    payoutMethod: "bank_transfer",
    payoutBankName: "Guaranty Trust Bank",
    payoutAccountNumber: "1234567890",
    payoutAccountName: "John Doe",
    payoutRoutingNumber: "123456",
    payoutSwiftCode: "GTBLNGLA"
  },
  amount: 50000,
  status: "pending",
  requestedAt: "2024-01-15"
}
```

Or for Paystack:
```
{
  id: 124,
  vendor: {
    name: "Jane Smith",
    payoutMethod: "paystack",
    payoutBankName: "Access Bank",
    payoutAccountNumber: "0123456789",
    payoutAccountName: "Jane Smith"
  },
  amount: 30000,
  status: "pending"
}
```

## Payout Request Model

**File:** `app/models/payout_request.ts`

Stores:
- userId (vendor/affiliate)
- walletId
- amount
- payoutMethod (copies from user)
- payoutDetails (copies user's account info as JSON or text)
- status: pending | approved | paid | rejected
- adminNotes
- processedAt

## Migration Instructions

1. **Create Migration:**
   ```bash
   node ace make:migration add_payout_fields_to_users
   ```

2. **Run Migration:**
   ```bash
   node ace migration:run
   ```

3. **Update Schema & Model:**
   - ✅ Already done: Updated `database/schema.ts`
   - ✅ Already done: Updated `app/models/user.ts`
   - ✅ Already done: Updated `app/controllers/profile_controller.ts`

## Frontend to Backend Flow

1. **Vendor edits profile** in `VendorProfile.tsx`
2. **Form sends** all payout fields to `/api/profile/vendor`
3. **Controller** receives and saves to database
4. **Admin Dashboard** retrieves and displays for payout processing
5. **Admin manually processes** via payment platform
6. **Admin marks as paid** in system

## Next Steps

1. ✅ Update VendorProfile form with all 6 methods
2. ✅ Update backend controllers
3. ✅ Update User model & schema
4. ✅ Run migration
5. **TODO:** Create Admin Dashboard for payout requests
6. **TODO:** Add payout request list view in admin
7. **TODO:** Add payout detail view with all account info
8. **TODO:** Add mark as paid/rejected functionality
9. **TODO:** Add email notifications for vendor payout status

## Testing Checklist

- [ ] Vendor can select each payout method
- [ ] Correct fields appear for each method
- [ ] Form validation works (required fields)
- [ ] Data saves to database correctly
- [ ] Admin can view vendor payout details
- [ ] Data retrieval shows all fields properly
- [ ] Mobile money fields work (provider dropdown)
- [ ] Email fields validate correctly
- [ ] Routing number is optional for bank transfer
- [ ] SWIFT code is optional for bank transfer


---

## Update: Manual/Offline & Paystack Specific Forms

### Changes Made (Latest Session)

#### 1. Dropdown Options Updated
- **Old:** "Bank Transfer" 
- **New:** "Manual/Offline (Bank Transfer)" - clearer naming for offline manual payouts
- Paystack now has its own dedicated form section (separate from bank transfer)

#### 2. Form Behavior
- **Manual/Offline** → Shows bank transfer form (Bank name, account number, account holder, routing number, SWIFT code)
- **Mobile Money** → Shows mobile money form (provider dropdown, phone number, account holder)
- **PayPal** → Shows PayPal form (email)
- **Stripe** → Shows Stripe form (account ID + email)
- **Paystack** → Shows Paystack-specific form (bank name, account number, account holder)
- **Flutterwave** → Shows Flutterwave form (bank name, account number, account holder)

#### 3. Backend
Controller accepts both `bank_transfer` and `manual_offline` values - both work identically and store bank account details.

**File:** `inertia/pages/vendor/VendorProfile.tsx`
```jsx
// Dropdown now shows:
<option value="manual_offline">Manual/Offline (Bank Transfer)</option>
<option value="paystack">Paystack</option>

// Bank transfer form shows when:
{(form.payoutMethod === 'bank_transfer' || form.payoutMethod === 'manual_offline') && (
  // Bank account fields...
)}

// Paystack form shows when:
{form.payoutMethod === 'paystack' && (
  // Paystack fields...
)}
```

### User Experience
1. Vendors see clear "Manual/Offline (Bank Transfer)" option for direct bank transfers
2. When Paystack is selected, they see Paystack-specific form
3. All other methods have their dedicated forms
4. Form fields appear/disappear based on selection
5. Admin can view collected details per vendor based on their chosen method

### Data Flow for Admin
- **Manual/Offline payouts:** Admin sees bank account details and manually transfers funds
- **Paystack payouts:** Admin sees bank details and uses Paystack API/dashboard to process
- Same pattern for all other methods



---

## Final Update: Synced Payout Methods & Cleaned Fields

### Changes Made (Latest Session)

#### 1. Created Shared Constants
**File:** `inertia/constants/payout-methods.ts`

Centralized payout method definitions used across both vendor and affiliate profiles:

```typescript
export const PAYOUT_METHODS = [
  { key: 'bank', label: 'Bank' },
  { key: 'mobile_money', label: 'Mobile Money' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'paystack', label: 'Paystack' },
  { key: 'flutterwave', label: 'Flutterwave' },
]

export const MOBILE_MONEY_PROVIDERS = [
  { key: 'mtn', label: 'MTN Mobile Money' },
  { key: 'airtel', label: 'Airtel Money' },
  // ... more providers
]
```

#### 2. Updated Both Profiles
- **VendorProfile.tsx** - Updated to use shared constants
- **AffiliateProfile.tsx** - Updated to use shared constants + proper payout forms

#### 3. Removed Fields
- ✅ Removed SWIFT code field
- ✅ Removed Routing number field
- ✅ Both forms now only collect: Bank name, Account number, Account holder name

#### 4. Changed Naming
- **Old:** "Manual/Offline (Bank Transfer)"
- **New:** "Bank"

#### 5. Form Syncing
Now both vendor and affiliate profiles:
- Use the same PAYOUT_METHODS list
- Use the same MOBILE_MONEY_PROVIDERS list
- Show/hide fields identically
- Have consistent UI/UX

### Before vs After

**Before:**
```
Dropdown options: Bank Transfer, Mobile Money, PayPal, Stripe, Paystack, Flutterwave
Bank form fields: Bank name, Account holder, Account number, Routing number, SWIFT code
```

**After:**
```
Dropdown options: Bank, Mobile Money, PayPal, Stripe, Paystack, Flutterwave (all synced)
Bank form fields: Bank name, Account holder, Account number (only essentials)
```

### Files Changed
1. ✅ `inertia/constants/payout-methods.ts` - NEW
2. ✅ `inertia/pages/vendor/VendorProfile.tsx` - Updated
3. ✅ `inertia/pages/affiliate/AffiliateProfile.tsx` - Updated
4. ✅ `app/controllers/profile_controller.ts` - Already supports all fields
5. ✅ `database/schema.ts` - Already has all columns
6. ✅ `app/models/user.ts` - Already has all fields

### Key Benefits
- **Centralized:** All payout method options defined in one place
- **Consistent:** Same options and behavior in vendor + affiliate profiles
- **Clean:** Removed unnecessary fields (SWIFT, routing)
- **Easy to maintain:** Add new payout method → Update one file
- **Frontend-backend aligned:** Both use same structure

### To Add a New Payout Method
1. Add to `PAYOUT_METHODS` in `inertia/constants/payout-methods.ts`
2. Add corresponding form section in VendorProfile & AffiliateProfile
3. Add database columns if needed (via migration)
4. Update controller to handle the fields

