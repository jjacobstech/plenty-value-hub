# Wallet & Payout System — Testing & Verification Guide

## Prerequisites

Before testing, ensure:

1. ✅ Run migrations: `node ace migration:run`
2. ✅ Database tables created (`wallets`, `wallet_transactions`, `payout_requests`)
3. ✅ Seed test data (vendor and affiliate users)
4. ✅ Dev server running: `node ace serve --hmr`
5. ✅ Payment system integrated (for creating test orders)

---

## Test Setup

### Create Test Users

For manual testing, you'll need:

1. **Vendor User**
   - Email: `vendor@test.com`
   - Password: any secure password
   - Role: vendor
   - Payout Method: Set in profile

2. **Affiliate User**
   - Email: `affiliate@test.com`
   - Password: any secure password
   - Role: affiliate
   - Payout Method: Set in profile

3. **Admin User**
   - Email: `admin@test.com`
   - Password: any secure password
   - Role: admin

4. **Consumer/Buyer User**
   - Email: `buyer@test.com`
   - Password: any secure password
   - Role: consumer

### Configure Payout Methods

Before requesting payouts, set up payout methods:

1. **For Vendor:**
   - Login as vendor
   - Navigate to `/vendor/profile`
   - Scroll to "Payout Method & Account Details"
   - Select method (e.g., "Direct Bank Transfer")
   - Enter sample account details
   - Save

2. **For Affiliate:**
   - Login as affiliate
   - Navigate to `/affiliate/profile`
   - Scroll to "Payout Method & Account Details"
   - Select method (e.g., "PayPal Account")
   - Enter sample PayPal email
   - Save

---

## Test Scenarios

### Scenario 1: Basic Wallet Creation & Balance Tracking

**Objective:** Verify wallets are created automatically and balances are tracked.

**Steps:**

1. Login as vendor
2. Navigate to `/vendor/earnings`
3. **Expected Result:**
   - Page loads successfully
   - Shows "Total Earned: $0.00"
   - Shows "Pending: $0.00"
   - Empty transaction history
   - Check database: `SELECT * FROM wallets WHERE user_id = <vendor_id>`
   - Expected: 1 row with `available_balance = 0` and `pending_balance = 0`

**Database Verification:**

```sql
SELECT * FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com');
-- Should show newly created wallet
```

---

### Scenario 2: Order Creation → Pending Balance

**Objective:** Verify pending balance is credited when order is created.

**Steps:**

1. Create a product as vendor (vendor @test.com)
   - Name: "Test Product"
   - Price: $50.00
   - Status: "approved"

2. Approve product as admin
   - Navigate to `/admin/products`
   - Approve the product

3. Create an order as buyer
   - Login as buyer
   - Navigate to `/marketplace`
   - Find "Test Product"
   - Initiate purchase (amount $50)
   - Complete payment flow
   - Order status should be "pending"

4. Check vendor wallet
   - Login as vendor
   - Navigate to `/vendor/earnings`
   - **Expected Result:**
     - Pending balance: $40.00 (after 10% platform fee, before affiliate commission)
     - Available balance: $0.00
     - Transaction history shows: "Pending sale — Test Product"

5. **Database Verification:**

```sql
SELECT * FROM wallet_transactions
WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com'))
ORDER BY created_at DESC;

-- Should have entry:
-- type: 'credit'
-- category: 'vendor_pending'
-- amount: 40.00 (or calculated vendor_payout)
-- description: 'Pending sale — Test Product'
```

---

### Scenario 3: Order Completion → Available Balance

**Objective:** Verify available balance is credited when order completes.

**Steps:**

1. From Scenario 2, vendor has pending balance of $40.00

2. Complete the order as admin
   - Login as admin
   - Navigate to `/admin/orders`
   - Find the order
   - Update status to "completed"
   - Save

3. Check vendor wallet
   - Login as vendor
   - Refresh `/vendor/earnings`
   - **Expected Result:**
     - Pending balance: $0.00 (cleared)
     - Available balance: $40.00 (moved from pending)
     - Two new transactions in history:
       - "Pending earnings cleared"
       - "Sale completed — Test Product"

4. **Database Verification:**

```sql
SELECT category, type, amount FROM wallet_transactions
WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com'))
ORDER BY created_at DESC LIMIT 5;

-- Should show clearing and crediting of available balance
```

---

### Scenario 4: Affiliate Commission Flow

**Objective:** Verify affiliate commission is tracked through pending → available.

**Steps:**

1. Create product with 10% affiliate commission setting
   - Affiliate commission rate: 5%

2. Create affiliate link as affiliate
   - Login as affiliate
   - Navigate to `/affiliate/links`
   - Generate link for "Test Product"

3. Create order using affiliate link
   - Login as buyer (different account)
   - Use affiliate link: `/ref/<link_code>`
   - Purchase product for $50

4. Check affiliate wallet (pending)
   - Login as affiliate
   - Navigate to `/affiliate/earnings`
   - **Expected Result:**
     - Pending earnings: $2.50 (5% commission)
     - Available earnings: $0.00
     - Transaction shows commission pending

5. Complete order as admin
   - Update order status to "completed"

6. Check affiliate wallet (available)
   - Login as affiliate
   - Refresh `/affiliate/earnings`
   - **Expected Result:**
     - Pending earnings: $0.00
     - Available earnings: $2.50
     - Transactions show clearing and available credit

---

### Scenario 5: Payout Request Flow (Approval Path)

**Objective:** Verify complete payout request workflow with approval.

**Steps:**

1. Vendor has available balance of $40.00 (from Scenario 3)

2. Request payout as vendor
   - Login as vendor
   - Navigate to `/vendor/earnings`
   - Click "Request Payout" button
   - Enter amount: $25.00
   - Submit

3. **Expected Result:**
   - Toast message: "Payout request submitted"
   - Available balance: $15.00 (reduced by $25)
   - New row in "Recent Payout Requests" with status "pending"

4. **Database Verification:**

```sql
SELECT id, amount, status FROM payout_requests
WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com')
ORDER BY created_at DESC LIMIT 1;

-- Should show:
-- amount: 25.00
-- status: pending
-- Check wallet: available_balance should be 15.00
```

5. Admin approves payout
   - Login as admin
   - Navigate to `/admin/payouts`
   - Find vendor's payout request
   - Click "Approve" button (optional step)
   - Click "Mark Paid" button
   - Add admin notes (optional): "Paid to account"

6. **Expected Result (after approval):**
   - Payout status changes to "approved"
   - Admin notes saved

7. **Expected Result (after marked paid):**
   - Payout status changes to "paid"
   - `processedAt` timestamp set
   - Vendor can see status update on earnings page

8. **Final Verification:**

```sql
SELECT id, amount, status, processed_at, admin_notes FROM payout_requests
WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com')
ORDER BY created_at DESC LIMIT 1;

-- Should show:
-- status: paid
-- processed_at: current timestamp
-- admin_notes: 'Paid to account'
```

---

### Scenario 6: Payout Request Rejection

**Objective:** Verify rejected payout reverses funds to available balance.

**Steps:**

1. Vendor has available balance of $15.00 (from Scenario 5)

2. Request new payout
   - Click "Request Payout"
   - Enter amount: $10.00
   - Submit
   - Available balance becomes $5.00

3. Admin rejects payout
   - Login as admin
   - Navigate to `/admin/payouts`
   - Find the new payout request
   - Click "Reject" button
   - Add admin notes: "Account not verified"

4. **Expected Result:**
   - Payout status changes to "rejected"
   - Vendor's available balance RESTORED to $15.00 (refunded)
   - Transaction ledger shows "payout_reversal"

5. **Verification:**

```sql
-- Check payout request
SELECT status FROM payout_requests
WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com')
ORDER BY created_at DESC LIMIT 1;

-- Should show: status = 'rejected'

-- Check wallet available balance
SELECT available_balance FROM wallets
WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com');

-- Should be 15.00 (refunded)

-- Check reversal transaction
SELECT category, type, amount FROM wallet_transactions
WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'vendor@test.com'))
AND category = 'payout_reversal'
ORDER BY created_at DESC LIMIT 1;

-- Should exist with amount = 10.00
```

---

### Scenario 7: Minimum Payout Amount Validation

**Objective:** Verify minimum payout validation ($10).

**Steps:**

1. Login as vendor
2. Navigate to `/vendor/earnings`
3. Click "Request Payout"
4. Enter amount: $5.00 (below minimum)
5. **Expected Result:**
   - Error toast: "Minimum payout amount is $10"
   - No payout request created
   - Wallet balance unchanged

---

### Scenario 8: Insufficient Balance Validation

**Objective:** Verify system prevents payout with insufficient balance.

**Steps:**

1. Vendor has available balance of $15.00

2. Request payout
   - Amount: $20.00 (more than available)

3. **Expected Result:**
   - Error: "Insufficient available balance"
   - No payout request created
   - Balance unchanged

---

### Scenario 9: Payout Method Required Validation

**Objective:** Verify payout cannot be requested without configured method.

**Steps:**

1. Create new vendor account (without setting payout method)
2. Give vendor some available balance (via database or test data)
3. Try to request payout
4. **Expected Result:**
   - Error: "Configure your payout method in profile settings first"
   - Redirect to profile page or show error

---

### Scenario 10: Duplicate Payout Request Prevention

**Objective:** Verify user cannot have multiple pending payouts.

**Steps:**

1. Vendor with $50 available balance
2. Request payout: $20 (status: pending)
3. Try to request second payout: $15
4. **Expected Result:**
   - Error: "You already have a pending payout request"
   - Second request not created

---

### Scenario 11: Order Cancellation → Balance Reversal

**Objective:** Verify pending balance is cleared on order cancellation.

**Steps:**

1. Create and confirm order (status: pending)
   - Vendor has $50 pending
   - Available: $0

2. Cancel the order as buyer
3. Vendor refreshes earnings page
4. **Expected Result:**
   - Pending balance: $0
   - Available balance: $0 (pending was removed, not credited)
   - Transaction shows "pending cleared"

---

### Scenario 12: Order Refund → Available Balance Debit

**Objective:** Verify refund removes from available balance.

**Steps:**

1. Create order, complete it (vendor has $50 available)
2. Process refund on order as admin
3. Vendor checks earnings page
4. **Expected Result:**
   - Available balance: $0 (reduced from $50)
   - New transaction: "Refund reversal" (debit)

---

### Scenario 13: Transaction Ledger Uniqueness

**Objective:** Verify no duplicate transactions for same order event.

**Steps:**

1. Create order
2. Run order completion handler twice (test idempotency)
3. Check wallet_transactions ledger
4. **Expected Result:**
   - Single entry per transaction (unique constraint enforces this)
   - No duplicates
   - Database error if duplicate attempted

**Database Check:**

```sql
SELECT category, reference_type, reference_id, COUNT(*) as count
FROM wallet_transactions
GROUP BY category, reference_type, reference_id
HAVING count > 1;

-- Should return no rows (no duplicates)
```

---

### Scenario 14: Admin Payout Management Page

**Objective:** Verify admin UI for managing payouts.

**Steps:**

1. Login as admin
2. Navigate to `/admin/payouts`
3. **Expected Result:**
   - Filter dropdown shows: All, Pending, Approved, Paid, Rejected
   - Table displays payout requests with:
     - User name and email
     - Role
     - Amount
     - Payout method
     - Account details (masked or truncated)
     - Status badge
     - Action buttons

4. Filter by "pending"
   - **Expected:** Only pending payouts shown

5. Filter by "paid"
   - **Expected:** Only paid payouts shown

6. Click on a pending payout row
   - **Expected:** Can edit admin notes and change status

---

### Scenario 15: Database Integrity Checks

**Objective:** Verify data integrity and constraints.

**Steps:**

1. **Check Foreign Key Constraints:**

```sql
-- All wallet_transactions should reference existing wallet
SELECT wt.id FROM wallet_transactions wt
LEFT JOIN wallets w ON wt.wallet_id = w.id
WHERE w.id IS NULL;

-- Should return 0 rows
```

2. **Check Unique Constraint:**

```sql
-- No duplicate transactions (same wallet, category, reference)
SELECT wallet_id, category, reference_type, reference_id, COUNT(*)
FROM wallet_transactions
GROUP BY wallet_id, category, reference_type, reference_id
HAVING COUNT(*) > 1;

-- Should return 0 rows
```

3. **Check Balance Consistency:**

```sql
-- Recalculate balance from transactions
SELECT
  w.id,
  w.available_balance,
  (SELECT SUM(CASE WHEN category LIKE '%available' AND type = 'credit' THEN amount
                  WHEN category LIKE '%available' AND type = 'debit' THEN -amount
                  ELSE 0 END)
   FROM wallet_transactions
   WHERE wallet_id = w.id) as calculated_available
FROM wallets w;

-- All calculated should match actual balance
```

4. **Check Payout Request Amounts:**

```sql
-- Ensure all payout amounts are > 0 and <= 2 decimal places
SELECT id, amount FROM payout_requests
WHERE amount <= 0 OR amount != ROUND(amount, 2);

-- Should return 0 rows
```

---

## Performance Testing

### Scenario 16: Large Transaction Volume

**Objective:** Test wallet performance with many transactions.

**Steps:**

1. Create vendor with 1000 completed orders
2. Load earnings page
3. **Measure:**
   - Page load time (target: < 2 seconds)
   - Database query time
   - Transaction list rendering

**Optimization Checks:**

- ✅ Queries use indexes (check `wallet_id`, `created_at`)
- ✅ Transaction history limited to 50 items
- ✅ Pagination implemented if needed

---

## Security Testing

### Scenario 17: Role-Based Access Control

**Steps:**

1. **Wallet endpoint access:**
   - Consumer tries to access `/api/wallet`
   - Expected: 403 Forbidden

2. **Payout request (non-vendor/affiliate):**
   - Admin tries to request payout via API
   - Expected: 403 Forbidden

3. **Admin endpoints:**
   - Vendor tries to access `/api/admin/payouts`
   - Expected: 403 Forbidden

4. **User isolation:**
   - Vendor A tries to see Vendor B's wallet via API
   - Expected: Only sees own wallet

### Scenario 18: Data Validation

**Steps:**

1. **Negative amount:**
   - POST `/api/wallet/payouts` with `amount: -100`
   - Expected: Validation error

2. **String amount:**
   - POST `/api/wallet/payouts` with `amount: "abc"`
   - Expected: Validation error

3. **Precision testing:**
   - Create order with $99.99 amount
   - Verify wallet balance maintains precision (no rounding errors)

---

## Testing Checklist

### Backend Tests

- [ ] Wallet creation on first access
- [ ] Pending balance credited on order creation
- [ ] Pending cleared and available credited on order completion
- [ ] Pending cleared on order cancellation
- [ ] Available debited on order refund
- [ ] Affiliate commission tracked correctly
- [ ] Payout request validates minimum ($10)
- [ ] Payout request validates balance
- [ ] Payout request validates payout method configured
- [ ] Payout request prevents duplicates
- [ ] Payout approval updates status
- [ ] Payout paid updates status and processedAt
- [ ] Payout rejection reverses funds
- [ ] Transaction ledger is immutable
- [ ] No duplicate transactions (unique constraint)
- [ ] Database locking prevents race conditions
- [ ] Decimal precision maintained throughout

### Frontend Tests

- [ ] Affiliate earnings page displays wallet data
- [ ] Vendor earnings page displays wallet data
- [ ] Payout request button enabled when balance available
- [ ] Payout request button disabled when no method configured
- [ ] Payout history displays status badges correctly
- [ ] Admin payout page filters work correctly
- [ ] Admin payout page action buttons work
- [ ] Profile pages allow payout method configuration
- [ ] Profile saves payout method and details

### API Tests

- [ ] `GET /api/wallet` returns summary for vendor/affiliate
- [ ] `POST /api/wallet/payouts` creates request with validation
- [ ] `GET /api/admin/payouts` lists all payouts with filtering
- [ ] `PUT /api/admin/payouts/:id` updates status
- [ ] Role-based access control enforced
- [ ] User isolation enforced (users can't see others' data)

### Integration Tests

- [ ] Order flow: created → pending → completed → wallet credited
- [ ] Payout flow: request → approve → paid
- [ ] Payout flow: request → rejected → funds refunded
- [ ] Affiliate link tracking → order → commission credited
- [ ] Refund flow: refund order → wallet debited

---

## Troubleshooting Failed Tests

### Issue: Wallet balance doesn't increase

**Debug Steps:**

1. Check order status: `SELECT status FROM orders WHERE id = <id>;`
2. Check WalletService handler is called in OrderService
3. Check transaction ledger: `SELECT * FROM wallet_transactions WHERE wallet_id = <id>;`
4. Check for errors in application logs

### Issue: Payout request fails with "invalid amount"

**Debug Steps:**

1. Verify validator accepts number type
2. Check frontend sends number not string
3. Check amount >= 10 and > 0
4. Check Decimal precision in service

### Issue: Admin approval button doesn't update

**Debug Steps:**

1. Check admin role: `SELECT role FROM users WHERE id = <id>;`
2. Check endpoint auth middleware
3. Verify payout status is 'pending' or 'approved' (cannot update from other states)
4. Check API response in browser DevTools Network tab

### Issue: Duplicate transactions appearing

**Debug Steps:**

1. Check OrderService event handlers aren't called twice
2. Verify unique constraint on wallet_transactions
3. Check database logs for constraint violations
4. Review recent code changes to order completion logic

---

## Performance Benchmarks

Expected query times (development SQLite):

| Query                 | Time    |
| --------------------- | ------- |
| Get wallet balance    | < 10ms  |
| List 50 transactions  | < 20ms  |
| Get wallet summary    | < 50ms  |
| List admin payouts    | < 100ms |
| Create payout request | < 50ms  |
| Update payout status  | < 30ms  |

---

## Deployment Checklist

Before deploying to production:

- [ ] Database migrations tested and reversible
- [ ] All validators in place
- [ ] Error handling implemented
- [ ] Logging in place for payout requests
- [ ] Rate limiting on payout endpoints
- [ ] Security checks verified (role-based access, validation)
- [ ] Performance tested with realistic data volume
- [ ] Backups of wallet data tested
- [ ] Audit trail for payout approvals
- [ ] Email notifications configured (optional)
- [ ] Documentation updated
- [ ] Team trained on admin payout management

---

## Support & Questions

For issues or questions:

1. Refer to WALLET_PAYOUT_GUIDE.md for architecture details
2. Check this testing guide for reproduction steps
3. Review database logs for transaction details
4. Check application logs for error messages
5. Run manual SQL queries to verify data integrity
