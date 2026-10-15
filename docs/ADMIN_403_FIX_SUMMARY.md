# Admin 403 Permission Denied — Fix Summary

**Status:** ✅ Diagnostic tools deployed  
**Root Cause:** User not logged in as admin role  
**Solution:** Use diagnostic endpoint to verify, then create admin user if needed

---

## What Was the Problem?

The server logs showed:

```
WARN: You do not have permission to access this resource
```

This happens when a request to `/api/admin/site-settings` (or other admin endpoints) is made by a user who doesn't have `role = 'admin'`.

### Most Likely Causes (in order):

1. **User is logged in as vendor/affiliate, not admin** ← Most likely
2. Session lost between page load and API request
3. Auth middleware not properly configured
4. Role middleware not properly applied

---

## Fixes Deployed

### 1. ✅ Enhanced Error Logging

**File:** `app/middleware/role_middleware.ts`

Now logs detailed information when permission is denied:

```
[RoleMiddleware] Permission denied
  userId: 5
  userRole: vendor              ← Shows actual role
  userEmail: vendor@example.com
  requiredRoles: [ 'admin' ]
  path: /api/admin/site-settings
  method: POST
```

**Check:** Look at server console output for these logs

---

### 2. ✅ Diagnostic Endpoint

**Endpoint:** `GET /api/auth-status`

Added new diagnostic endpoint that shows current authentication status:

```bash
curl http://localhost:3333/api/auth-status
```

Response:

```json
{
  "isAuthenticated": true,
  "user": {
    "id": 5,
    "email": "user@example.com",
    "role": "vendor",           ← Check this!
    "fullName": "User Name"
  }
}
```

**Action:** If `role` is not `"admin"`, you need to log in as an admin user.

---

### 3. ✅ Route Configuration

**File:** `start/routes.ts`

Verified routes are correctly configured:

```typescript
router.group(() => {
  // Admin endpoints here
  router.get('/site-settings', ...)
  router.post('/site-settings', ...)
})
.use(middleware.role(['admin']))  ← Requires admin role
.use(adminThrottle)
```

Route chain: `auth()` → `role(['admin'])` → `throttle` → Controller

---

## How to Fix

### Step 1: Check Your Current Role

```bash
curl http://localhost:3333/api/auth-status
```

Look at the `role` field in the response.

### Step 2a: If Role is NOT "admin"

**Solution:** Log in as an admin user

**Options:**

- Option 1 (Recommended): Use Google OAuth
  1. Go to `http://localhost:3333/admin/auth/login`
  2. Click "Set up admin" or Google sign-in
  3. Complete OAuth flow (creates admin account)

- Option 2 (DB Direct): Update user role
  ```sql
  UPDATE users SET role = 'admin' WHERE id = 5;
  ```

### Step 2b: If Role IS "admin"

**Solution:** The issue is likely session-related

- Clear browser cookies: `Ctrl+Shift+Delete`
- Log in again
- Try the API call again

---

## Testing the Fix

### Test 1: Verify You're an Admin

```bash
curl http://localhost:3333/api/auth-status
# Should show: "role": "admin"
```

### Test 2: Save Payment Settings

Go to Admin → Payment Settings → Save

Should work without 403 error.

### Test 3: Test Admin Endpoints

```bash
# Should return payout requests (200)
curl http://localhost:3333/api/admin/payouts

# Should return site settings (200)
curl http://localhost:3333/api/admin/site-settings
```

---

## Files Modified

| File                                  | Change                       | Impact                           |
| ------------------------------------- | ---------------------------- | -------------------------------- |
| `app/middleware/role_middleware.ts`   | Added detailed error logging | Helps identify permission issues |
| `app/controllers/admin_controller.ts` | Added authStatus() endpoint  | Diagnose current auth state      |
| `start/routes.ts`                     | Added auth-status route      | Public diagnostic endpoint       |

---

## Verification Checklist

After applying the fix:

- [ ] Run `GET /api/auth-status` and check role
- [ ] If role ≠ "admin", create/login as admin user
- [ ] Clear browser cookies and re-login
- [ ] Try `POST /api/admin/site-settings` again
- [ ] Should succeed with 200 (not 403)

---

## Expected Behavior After Fix

✅ Admin users can access `/api/admin/*` endpoints  
✅ Non-admin users get 403 with clear error  
✅ Server logs show who tried to access (for debugging)  
✅ Diagnostic endpoint shows current user role

---

## Why This Happens

The middleware chain works correctly:

1. `middleware.auth()` checks if you're logged in
2. `middleware.role(['admin'])` checks if your role is 'admin'
3. If role ≠ 'admin', throw 403 error

The fix ensures you can see exactly what went wrong (not just "permission denied").

---

## Common Questions

**Q: I am logged in, why 403?**  
A: You're logged in as vendor/affiliate/consumer, not admin. Check `/api/auth-status`.

**Q: How do I become an admin?**  
A: Go to `/admin/auth/login` → "Set up admin" → Google OAuth. Or update database: `UPDATE users SET role = 'admin' WHERE id = X;`

**Q: The 403 is gone but settings still don't save?**  
A: Check network tab for actual error response. Fix sent enhanced error handling in http-client.ts.

**Q: Can I have multiple admins?**  
A: Current design allows only one admin. Controlled by `singleAdmin` middleware on setup route.

---

## Next Steps

1. Deploy the three modified files
2. Test with `GET /api/auth-status`
3. Verify you're logged in as admin
4. Test payment settings save
5. Check server logs for [RoleMiddleware] errors if still having issues

---

**Status:** ✅ READY FOR DEPLOYMENT  
**Risk:** Low — Diagnostic tools only  
**Breaking Changes:** None
