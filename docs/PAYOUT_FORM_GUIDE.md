# Payout Method Form - Visual Guide

## Form Structure

```
Store Profile Edit Mode
├─ Payout Method & Account Details Card
│
├─ Select Payout Method Dropdown
│  └─ [Bank Transfer ▼]
│
├─ PAYMENT METHOD-SPECIFIC SECTION (Shows/Hides)
│  └─ Colored background section with fields
│
└─ Save/Cancel Buttons
```

## Payment Method Sections

### 1. Bank Transfer (Blue Section)
```
┌─────────────────────────────────────────┐
│ 🔵 Bank Account Details                 │
├─────────────────────────────────────────┤
│                                         │
│ Bank Name *                             │
│ [Guaranty Trust Bank (GTB)            ] │
│                                         │
│ Account Holder Name *  │ Account No *  │
│ [John Doe            ] │ [0123456789  ]│
│                                         │
│ Routing/Sorting No     │ SWIFT/BIC Code│
│ [123456              ] │ [GTBLNGLA    ]│
│                                         │
└─────────────────────────────────────────┘
```

**Required Fields:** Bank Name, Account Name, Account Number

### 2. Mobile Money (Green Section)
```
┌─────────────────────────────────────────┐
│ 🟢 Mobile Money Details                 │
├─────────────────────────────────────────┤
│                                         │
│ Provider *            │ Phone Number *  │
│ [MTN Mobile Money ▼] │ [+234 800...  ] │
│                                         │
│ Account Holder Name *                   │
│ [John Doe                             ] │
│                                         │
└─────────────────────────────────────────┘
```

**Provider Options:**
- MTN Mobile Money
- Airtel Money
- Vodafone Cash
- Orange Money
- M-Pesa
- Other

**Required Fields:** Provider, Phone Number, Account Name

### 3. PayPal (Yellow Section)
```
┌─────────────────────────────────────────┐
│ 🟡 PayPal Account Details               │
├─────────────────────────────────────────┤
│                                         │
│ PayPal Email *                          │
│ [vendor@paypal.com                    ] │
│                                         │
└─────────────────────────────────────────┘
```

**Required Fields:** PayPal Email

### 4. Stripe (Purple Section)
```
┌─────────────────────────────────────────┐
│ 🟣 Stripe Account Details               │
├─────────────────────────────────────────┤
│                                         │
│ Stripe Account ID / Email *             │
│ [acct_xxxxx or connected@email.com   ] │
│                                         │
│ Email *                                 │
│ [your@email.com                       ] │
│                                         │
└─────────────────────────────────────────┘
```

**Required Fields:** Account ID, Email

### 5. Paystack (Indigo Section)
```
┌─────────────────────────────────────────┐
│ 🔵 Paystack Recipient Code              │
├─────────────────────────────────────────┤
│                                         │
│ Recipient Code *                        │
│ [RCP_xxxxx or bank account details    ] │
│                                         │
└─────────────────────────────────────────┘
```

**Required Fields:** Recipient Code

### 6. Flutterwave (Red Section)
```
┌─────────────────────────────────────────┐
│ 🔴 Flutterwave Account                  │
├─────────────────────────────────────────┤
│                                         │
│ Account Details *                       │
│ [Bank account or account ID           ] │
│                                         │
└─────────────────────────────────────────┘
```

**Required Fields:** Account Details

## User Flow

```
1. Vendor clicks "Edit Profile"
   └─ Form enters editing mode

2. Vendor scrolls to "Payout Method"
   └─ Shows dropdown and current method

3. Vendor selects payment method
   └─ Relevant fields appear immediately

4. Vendor fills in required fields
   ├─ Fields validate on blur
   └─ Placeholder text guides input

5. Vendor clicks "Save Changes"
   ├─ Data sent to backend with all fields
   ├─ Backend validates and saves
   └─ Success message shown

6. Profile updates
   └─ Payout info secured for future transactions
```

## Database Storage

### Before (Old System)
```sql
users
├─ payout_method: "bank_transfer"
└─ payout_details: "Bank: GTB, Account: 0123456789, ..."
                   (free text, hard to parse)
```

### After (New System)
```sql
users
├─ payout_method: "bank_transfer"
├─ payout_bank_name: "Guaranty Trust Bank"
├─ payout_account_number: "0123456789"
├─ payout_account_name: "John Doe"
├─ payout_routing_number: "123456"
└─ payout_swift_code: "GTBLNGLA"
   (structured, easy to validate and process)
```

## Color Coding

| Method | Color | Hex | Use |
|--------|-------|-----|-----|
| Bank Transfer | Blue | #EFF6FF | Local/International |
| Mobile Money | Green | #F0FDF4 | Africa-focused |
| PayPal | Yellow | #FEFCE8 | Global |
| Stripe | Purple | #FAF5FF | Tech-focused |
| Paystack | Indigo | #EEF2FF | Africa-focused |
| Flutterwave | Red | #FEF2F2 | Africa-focused |

## Field Validation

### Bank Transfer
```
✓ Bank Name
  - Not empty
  - 1-255 characters
  
✓ Account Name
  - Not empty
  - 1-255 characters
  
✓ Account Number
  - Not empty
  - Numeric or alphanumeric
  - 10-16 characters typically
```

### Mobile Money
```
✓ Provider
  - Must select from dropdown
  
✓ Phone Number
  - Valid phone format
  - Country code recommended
  
✓ Account Name
  - Not empty
  - Matches registration name
```

### PayPal
```
✓ Email
  - Valid email format
  - Associated with PayPal
```

### Stripe
```
✓ Account ID
  - Format: acct_xxxxx or email
  
✓ Email
  - Valid email format
```

## Responsive Design

```
MOBILE (< 640px)
└─ All fields stacked vertically
   ├─ Full width inputs
   └─ Easy thumb access

TABLET (640px - 1024px)
└─ 2-column grid where applicable
   ├─ Provider and Phone side-by-side
   └─ Better space usage

DESKTOP (> 1024px)
└─ Optimal 2-column layout
   ├─ Clear label-field pairs
   └─ Professional appearance
```

## Example Filled Form

### Bank Transfer Example
```
┌──────────────────────────────────┐
│ Select Payout Method             │
│ [Bank Transfer              ▼]   │
│                                  │
│ 🔵 Bank Account Details          │
│                                  │
│ Bank Name *                      │
│ [Guaranty Trust Bank (GTB)     ] │
│                                  │
│ Account Holder Name  │ Account No│
│ [Chidi Okonkwo     ] │ [007...  ]│
│                                  │
│ Routing/Sorting    │ SWIFT/BIC   │
│ [070123             │ GTBLNGLA   ]│
│                                  │
│         [Save] [Cancel]          │
└──────────────────────────────────┘
```

### Mobile Money Example
```
┌──────────────────────────────────┐
│ Select Payout Method             │
│ [Mobile Money               ▼]   │
│                                  │
│ 🟢 Mobile Money Details          │
│                                  │
│ Provider *                       │
│ [MTN Mobile Money           ▼]   │
│                                  │
│ Phone Number *                   │
│ [+234 803 123 4567           ]   │
│                                  │
│ Account Holder Name *            │
│ [Ama Okoye                    ]   │
│                                  │
│         [Save] [Cancel]          │
└──────────────────────────────────┘
```

## Features

✅ **Dynamic Display** - Only show relevant fields  
✅ **Color-Coded** - Quick visual identification  
✅ **Required Markers** - Clear which fields are mandatory  
✅ **Helpful Placeholders** - Guide user input  
✅ **Responsive** - Works on all devices  
✅ **Structured Data** - Easy backend processing  
✅ **Extensible** - Easy to add payment methods  
✅ **Professional** - Polished UX  

