# Wallet & Payout System Guide

## Overview

The Plenty Value Hub wallet and payout system manages earnings for vendors and affiliates through a dual-balance ledger system. This document covers the complete implementation, architecture, and usage.

---

## Architecture & Key Features

### 1. Dual-Balance Ledger

Each vendor/affiliate has two balance types:

- **Available Balance** — Funds ready to withdraw (completed orders)
- **Pending Balance** — Funds awaiting order confirmation
- **Currency** — USD (configurable per wallet)

### 2. Wallet Transaction Ledger

Immutable transaction log with categories:

| Category                  | Type   | Trigger                              |
| ------------------------- | ------ | ------------------------------------ |
| `vendor_pending`          | Credit | Order created (vendor)               |
| `vendor_pending_clear`    | Debit  | Order confirmed/cancelled            |
| `vendor_earning`          | Credit | Order completed (vendor payout)      |
| `vendor_refund`           | Debit  | Order refunded                       |
| `affiliate_pending`       | Credit | Order created (affiliate commission) |
| `affiliate_pending_clear` | Debit  | Order confirmed/cancelled            |
| `affiliate_earning`       | Credit | Order completed (commission)         |
| `affiliate_refund`        | Debit  | Order refunded                       |
| `payout_hold`             | Debit  | Payout requested                     |
| `payout_reversal`         | Credit | Payout rejected                      |

### 3. Payout Request Workflow

```
Pending → Approved → Paid
              ↓
           Rejected → (Funds refunded to available balance)
```

**Statuses:**

- `pending` — Awaiting admin review
- `approved` — Admin approved (optional step)
- `paid` — Admin marked as paid/processed
- `rejected` — Admin rejected (funds returned)

**Minimum amount:** $10

---

## Database Schema

### `wallets` Table

```sql
CREATE TABLE wallets (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  available_balance DECIMAL(12,2) DEFAULT 0,
  pending_balance DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
```

### `wallet_transactions` Table

```sql
CREATE TABLE wallet_transactions (
  id INTEGER PRIMARY KEY,
  wallet_id INTEGER NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  description TEXT,
  balance_after DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,

  UNIQUE(wallet_id, category, reference_type, reference_id),
  INDEX(wallet_id, created_at)
);
```

### `payout_requests` Table

```sql
CREATE TABLE payout_requests (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  wallet_id INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payout_method VARCHAR(50) NOT NULL,
  payout_details TEXT NOT NULL,
  status ENUM('pending','approved','paid','rejected') DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,

  INDEX(status, created_at),
  INDEX(user_id, created_at)
);
```

---

## Service Layer: WalletService

### Core Methods

#### 1. **getOrCreateWallet(userId)**

- Retrieves or creates user wallet
- Returns wallet object with balances

#### 2. **getSummary(userId)**

- Returns complete wallet snapshot:
  - `wallet` — Current balances
  - `transactions` — Last 50 transactions
  - `payoutRequests` — Last 20 payout requests
- Includes backfill for pre-ledger orders

#### 3. **handleOrderCreated(order)**

- Called when order status = 'pending'
- Credits `*_pending` to both vendor and affiliate (if applicable)
- Uses pending balance to avoid premature withdrawal

#### 4. **handleOrderCompleted(order)**

- Called when order status = 'completed'
- Clears pending balance
- Credits `*_earning` to available balance (actual earnings)

#### 5. **handleOrderCancelled(order)**

- Called when order status = 'cancelled'
- Debits pending balances (funds were never earned)

#### 6. **handleOrderRefunded(order)**

- Called when order is refunded
- Debits available balance (reverses the earning)

#### 7. **requestPayout(userId, amount)**

- Validates user has payout method configured
- Checks minimum amount ($10)
- Checks for existing pending request
- Creates PayoutRequest (moves funds to hold via transaction)
- Returns created payout object

#### 8. **updatePayoutStatus(payoutId, status, adminNotes)**

- Updates payout status (pending/approved → paid/rejected)
- If rejected: refunds available balance
- Timestamps `processedAt` when marked paid

#### 9. **listPayoutRequests(status?)**

- Lists all payout requests (admin)
- Optional filter by status
- Includes preloaded user data
- Ordered by newest first

### Private Methods (Transaction Helpers)

#### **applyWalletChange(userId, category, referenceType, referenceId, mutate)**

- Core transaction wrapper using database locking
- Prevents duplicate transactions via unique constraint
- Ensures atomic balance updates

#### **creditPending / clearPending / creditAvailable / debitAvailable**

- Semantic wrappers around applyWalletChange
- Handle both balance update and transaction logging

---

## API Endpoints

### User Endpoints

#### **GET /api/wallet**

- Auth required: vendor or affiliate
- Returns wallet summary (balances, transactions, payouts)
- Response:

```json
{
  "success": true,
  "data": {
    "wallet": { "availableBalance": "150.00", "pendingBalance": "25.50", ... },
    "transactions": [...],
    "payoutRequests": [...]
  }
}
```

#### **POST /api/wallet/payouts**

- Auth required: vendor or affiliate
- Body: `{ amount: number }`
- Creates payout request
- Response:

```json
{
  "success": true,
  "message": "Payout request submitted",
  "data": { "id": 1, "amount": "100.00", "status": "pending", ... }
}
```

### Admin Endpoints

#### **GET /api/admin/payouts?status=pending**

- Auth required: admin
- Optional query: `status` (pending, approved, paid, rejected, all)
- Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": "100.00",
      "status": "pending",
      "user": { "id": 5, "fullName": "John Doe", "email": "john@example.com", "role": "vendor" },
      ...
    }
  ]
}
```

#### **PUT /api/admin/payouts/:id**

- Auth required: admin
- Body: `{ status: 'approved'|'paid'|'rejected', adminNotes?: string }`
- Response:

```json
{
  "success": true,
  "message": "Payout approved",
  "data": { "id": 1, "status": "approved", ... }
}
```

---

## Pages & UI

### Vendor Earnings Page

- **Route:** `/vendor/earnings`
- **File:** `inertia/pages/vendor/VendorEarnings.tsx`
- **Features:**
  - Total earned (available balance)
  - Pending earnings (pending balance)
  - Affiliate commissions paid (summary)
  - Transaction history (recent orders)
  - Payout request history
  - Request payout button
  - Configured payout method display
  - Export to PDF

### Affiliate Earnings Page

- **Route:** `/affiliate/earnings`
- **File:** `inertia/pages/affiliate/AffiliateEarnings.tsx`
- **Features:**
  - Total earned (available balance)
  - Pending earnings (pending balance)
  - All-time links earned (summary)
  - Commission history (recent orders)
  - Payout request history
  - Request payout button
  - Configured payout method display
  - Export to PDF

### Admin Payout Management Page

- **Route:** `/admin/payouts`
- **File:** `inertia/pages/admin/AdminPayouts.tsx`
- **Features:**
  - Filter by status (all, pending, approved, paid, rejected)
  - User info, role, amount, method
  - Admin notes textarea
  - Action buttons: Approve, Mark Paid, Reject
  - Batch processing support

### Profile Pages

- **Vendor Profile:** `/vendor/profile` — Payout method setup
- **Affiliate Profile:** `/affiliate/profile` — Payout method setup
- **Files:**
  - `inertia/pages/vendor/VendorProfile.tsx`
  - `inertia/pages/affiliate/AffiliateProfile.tsx`
- **Features:**
  - Select payout method (dropdown)
  - Enter payout details (bank account, wallet address, etc.)
  - Save and update

---

## Payout Methods

The User model stores:

- `payoutMethod` (string, nullable) — e.g., 'bank_transfer', 'paypal', 'crypto'
- `payoutDetails` (string, nullable) — e.g., account number, email, wallet address

**Setup flow:**

1. User navigates to profile page
2. Selects payout method from dropdown
3. Enters payout details
4. Saves profile
5. Details stored in database
6. Used when creating payout requests

---

## Order Event Handlers

The wallet system integrates with the order lifecycle via OrderService:

```typescript
// When order is created (pending)
OrderService.handleOrderCreated(order)
  → WalletService.handleOrderCreated(order)
    → Credit vendor pending
    → Credit affiliate pending (if applicable)

// When order completes
OrderService.handleOrderCompleted(order)
  → WalletService.handleOrderCompleted(order)
    → Clear vendor pending
    → Credit vendor available
    → Clear affiliate pending
    → Credit affiliate available

// When order cancelled
OrderService.handleOrderCancelled(order)
  → WalletService.handleOrderCancelled(order)
    → Clear vendor pending
    → Clear affiliate pending

// When order refunded
OrderService.handleOrderRefunded(order)
  → WalletService.handleOrderRefunded(order)
    → Debit vendor available (reverse earning)
    → Debit affiliate available (reverse commission)
```

---

## Testing Checklist

### Setup

- [ ] Vendor creates payout method in profile
- [ ] Affiliate creates payout method in profile

### Earnings Flow

- [ ] Create order with vendor and affiliate
- [ ] Verify pending balances appear immediately
- [ ] Complete order (update status to completed)
- [ ] Verify available balance increases
- [ ] Verify pending balance decreases
- [ ] Check transaction ledger for all entries

### Payout Request Flow

- [ ] Navigate to earnings page
- [ ] Click "Request Payout" button
- [ ] Enter valid amount ($10+)
- [ ] Verify payout request appears in history
- [ ] Verify available balance decreases (moved to hold)
- [ ] Check admin payouts page
- [ ] Admin approves payout request
- [ ] Verify status updates to "approved"
- [ ] Admin marks paid
- [ ] Verify status updates to "paid"

### Rejection Flow

- [ ] Request new payout
- [ ] Admin rejects instead of approving
- [ ] Verify payout status = "rejected"
- [ ] Verify available balance restored
- [ ] Check transaction ledger for reversal entry

### Refund Flow

- [ ] Create completed order
- [ ] Verify available balance increases
- [ ] Process refund on order
- [ ] Verify available balance decreases
- [ ] Verify refund transaction in ledger

### Validation

- [ ] Prevent payout without payout method configured
- [ ] Prevent payout below $10 minimum
- [ ] Prevent payout with insufficient balance
- [ ] Prevent multiple pending payouts
- [ ] Verify unique constraint on transactions (no duplicates)
- [ ] Verify database locking prevents race conditions

### Admin Features

- [ ] Filter payouts by status
- [ ] Add admin notes on payout
- [ ] Approve then mark paid (2-step flow)
- [ ] Reject with notes
- [ ] View user details in payout row

---

## Configuration & Deployment

### Environment Variables

```env
# No specific wallet env vars required
# Uses existing APP_KEY, DATABASE_URL
```

### Migration Commands

```bash
# Run migrations
node ace migration:run

# Fresh database
node ace migration:fresh --seed
```

### Model Relationships

- Wallet → User (one-to-one)
- Wallet → WalletTransaction (one-to-many)
- Wallet → PayoutRequest (one-to-many)
- PayoutRequest → User (many-to-one)

---

## Common Workflows

### Vendor Workflow

1. Add products to marketplace
2. Customer purchases product
3. Order pending → Vendor sees pending balance
4. Order completes → Vendor sees available balance increase
5. Vendor sets payout method in profile
6. Vendor requests payout on earnings page
7. Admin approves and marks paid
8. Vendor sees "paid" status

### Affiliate Workflow

1. Generate affiliate links in dashboard
2. Customer uses link, makes purchase
3. Order pending → Affiliate sees pending commission
4. Order completes → Affiliate sees available commission increase
5. Affiliate sets payout method in profile
6. Affiliate requests payout on earnings page
7. Admin approves and marks paid
8. Affiliate sees "paid" status

### Admin Workflow

1. Navigate to Admin Payout Management page
2. View pending payout requests
3. Filter by status or search user
4. Review payout method details
5. Add optional admin notes
6. Approve request (optional)
7. Mark paid
8. Verify transaction processed

---

## Security Considerations

### Data Integrity

- ✅ Database locking prevents race conditions
- ✅ Unique constraints prevent duplicate transactions
- ✅ Decimal.js for precision (no float rounding errors)
- ✅ Idempotent operations (can retry safely)

### Access Control

- ✅ Role-based access (vendor/affiliate only)
- ✅ User isolation (only see own wallet)
- ✅ Admin-only payout approval

### Validation

- ✅ Minimum payout amount ($10)
- ✅ Balance checks before debit
- ✅ Payout method required before request
- ✅ Status validation (only valid transitions)

---

## Troubleshooting

### Issue: Available balance doesn't increase after order completion

- **Cause:** Order status not properly updated or WalletService not called
- **Fix:** Check OrderService integration, verify handleOrderCompleted called
- **Debug:** Check wallet_transactions ledger for entry

### Issue: Payout request fails with insufficient balance error

- **Cause:** Pending balance not cleared before available credited
- **Fix:** Verify handleOrderCompleted clears pending first
- **Debug:** Check pending vs available balance split

### Issue: Duplicate transactions appearing

- **Cause:** Order event handler called multiple times
- **Fix:** Check unique constraint, verify idempotent operations
- **Debug:** Check database constraint violations in logs

### Issue: Admin payout approval doesn't reflect on user page

- **Cause:** Page not refreshing or cache issue
- **Fix:** Call `window.location.reload()` after payout update
- **Debug:** Check API response, verify status updated in DB

---

## Future Enhancements

- [ ] Automatic payout processing (webhooks to payment provider)
- [ ] Payout history export (CSV, JSON)
- [ ] Batch payout processing for admins
- [ ] Multiple payout methods per user
- [ ] Payout scheduling (e.g., automatic on 1st of month)
- [ ] Tax form generation (1099-NEC for US affiliates)
- [ ] Dispute/appeal process for rejected payouts
- [ ] Wallet transfer between users (internal transfers)
- [ ] Tiered payout minimums by user role/performance
- [ ] Payout analytics dashboard

---

## Support

For questions or issues with the wallet system:

1. Check this guide and troubleshooting section
2. Review transaction ledger in database
3. Check admin logs for errors
4. Verify all order event handlers are wired up
5. Run manual tests from Testing Checklist above
