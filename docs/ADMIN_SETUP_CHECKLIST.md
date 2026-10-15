# Admin Setup Checklist

**Use this to ensure your admin account is properly configured**

---

## 🚀 Quick Setup (5 minutes)

### ☐ Step 1: Verify Admin User Exists

**Option A: Via Database**

```sql
SELECT id, email, role, full_name FROM users WHERE role = 'admin';
```

**Expected:** Should return 1 row with `role = 'admin'`

**If empty:** Continue to Step 2

### ☐ Step 2: Create Admin Account

**Option A: Via Google OAuth (Recommended)**

1. Navigate to: `http://localhost:3333/admin/auth/login`
2. Look for "Set up admin account" button or Google sign-in option
3. Click to start OAuth flow
4. Complete Google authentication
5. Admin account created automatically ✅

**Option B: Via Database (Development Only)**

```sql
-- Get a user to convert to admin
SELECT id, email FROM users LIMIT 1;

-- Update to admin (replace with actual user ID)
UPDATE users SET role = 'admin' WHERE id = 1;
```

### ☐ Step 3: Verify Admin User

**Test 1: Check Auth Status**

```bash
curl http://localhost:3333/api/auth-status
```

**Expected Response:**

```json
{
  "isAuthenticated": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "fullName": "Admin User"
  }
}
```

**If role is not 'admin':** Go back to Step 1

### ☐ Step 4: Test Admin Access

**Test 2: Access Admin Endpoint**

```bash
curl http://localhost:3333/api/admin/site-settings
```

**Expected:** 200 OK with settings list

**If 403:** Your user role is not admin. Go back to Step 1.

### ☐ Step 5: Login via Web UI

1. Go to: `http://localhost:3333/admin/auth/login`
2. Click "Google Sign-In"
3. Complete OAuth (use same Google account as before)
4. Should redirect to: `http://localhost:3333/admin`

**If denied:** Role not set correctly. Check Step 1.

---

## 🧪 Full Verification Suite

### Frontend Access

- [ ] Can access `/admin` dashboard
- [ ] Can access `/admin/payment-settings`
- [ ] Can access `/admin/payouts`
- [ ] Can access `/admin/products`
- [ ] Can access `/admin/orders`

### API Access

- [ ] `GET /api/auth-status` returns admin role
- [ ] `GET /api/admin/stats` returns 200
- [ ] `GET /api/admin/site-settings` returns 200
- [ ] `POST /api/admin/site-settings` accepts data
- [ ] `GET /api/admin/payouts` returns 200

### Payment Settings Save

- [ ] Navigate to Admin → Payment Settings
- [ ] Change a setting
- [ ] Click "Save Payment Configuration"
- [ ] Verify success toast (not 403 error)

---

## 🐛 Troubleshooting

### Problem: Still Getting 403 After Setup

**Step 1: Verify Admin User**

```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

Must show: `role = 'admin'`

**Step 2: Check Auth Status**

```bash
curl http://localhost:3333/api/auth-status
```

Response must show: `"role": "admin"`

**Step 3: Clear Cache & Cookies**

- DevTools → Application → Clear site data
- Close browser completely
- Reopen and navigate to `/admin/auth/login`
- Sign in again

**Step 4: Check Server Logs**
Look for this in terminal:

```
[RoleMiddleware] Permission denied
  userRole: admin  ← Should be this
```

If `userRole` is not 'admin', go back to Step 1.

---

## 📊 Database Verification

### Check if admin exists

```sql
-- Count admins
SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin';
-- Expected: 1

-- See all user roles
SELECT role, COUNT(*) as count FROM users GROUP BY role;
-- Expected output:
-- role     | count
-- ---------|-------
-- admin    | 1
-- vendor   | X
-- affiliate| Y
-- consumer | Z
```

### Update user to admin (if needed)

```sql
-- Be very specific to avoid mistakes
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com'
  AND role != 'admin';  -- Safety: only if not already admin

-- Verify change
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

---

## 🔄 Common Issues

### Issue 1: "You do not have permission"

**Cause:** User role is not 'admin'

**Fix:**

```sql
SELECT role FROM users WHERE id = YOUR_USER_ID;
-- If not 'admin', update it
UPDATE users SET role = 'admin' WHERE id = YOUR_USER_ID;
```

### Issue 2: Session Lost

**Cause:** Session cookie not persisted

**Fix:**

1. Clear all cookies: DevTools → Application → Clear site data
2. Log out completely
3. Close browser
4. Reopen browser
5. Go to `/admin/auth/login`
6. Sign in again

### Issue 3: Wrong User Logged In

**Cause:** Logged in as vendor/affiliate instead of admin

**Fix:**

1. Go to regular user dashboard
2. Sign out
3. Go to `/admin/auth/login`
4. Sign in with admin Google account

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Admin user exists in database (`role = 'admin'`)
- [ ] Admin can access dashboard pages
- [ ] Admin can access API endpoints
- [ ] Payment settings save works
- [ ] All admin pages load without 403
- [ ] Error logging working (check console)
- [ ] Diagnostic endpoint functional
- [ ] Non-admin users properly denied (get 403)
- [ ] Role middleware logging to console

---

## 🎯 Success Criteria

You'll know it's working when:

✅ GET /api/auth-status shows `"role": "admin"`  
✅ Can access `/admin` dashboard without redirect  
✅ Payment settings page loads  
✅ Saving settings returns 200 (not 403)  
✅ Server console shows no [RoleMiddleware] errors  
✅ All admin pages accessible

---

## 📞 Need Help?

**Check these files:**

1. `ADMIN_AUTH_DEBUG_GUIDE.md` — Detailed troubleshooting
2. `ADMIN_403_FIX_SUMMARY.md` — What was fixed
3. Server console — Check for [RoleMiddleware] logs

**Run diagnostic:**

```bash
curl http://localhost:3333/api/auth-status
```

**Check database:**

```sql
SELECT id, email, role FROM users WHERE role = 'admin';
```

---

**Status:** ✅ Ready to Setup  
**Time Estimate:** 5-10 minutes  
**Complexity:** Low
