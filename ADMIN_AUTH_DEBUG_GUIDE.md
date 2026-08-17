# Admin Authentication Debug Guide

**Date:** August 6, 2026  
**Issue:** 403 Permission Denied errors on admin routes  
**Status:** Debugging in progress

---

## Quick Diagnosis Steps

### Step 1: Check Your Current Auth Status

```bash
curl http://localhost:3333/api/auth-status
```

Expected response:

```json
{
  "isAuthenticated": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "fullName": "Admin Name"
  }
}
```

If `role` is not `"admin"`, that's your problem!

---

## Common Issues & Solutions

### Issue 1: User is Not an Admin

**Symptom:** GET /api/auth-status returns `"role": "vendor"` or `"role": "affiliate"`

**Solution:** You need to be logged in as an admin user. Admin users are created only via the Google OAuth flow at `/admin/auth/setup/google`.

**Fix:**

1. Make sure you have an admin user in your database:

```sql
SELECT * FROM users WHERE role = 'admin';
```

2. If no admin exists, start the setup:
   - Go to `http://localhost:3333/admin/auth/login`
   - Click "Set up admin account" or "Google Sign-In"
   - Complete Google OAuth flow

3. If admin exists but you're not logged in as them:
   - Log out from current session
   - Go to `http://localhost:3333/admin/auth/login`
   - Sign in with your admin Google account

---

### Issue 2: Session Not Persisted

**Symptom:** Can access `/admin/payment-settings` page but API calls return 403

**Solution:** The page load authenticates you, but the API call loses the session.

**Fix:**

1. Check browser cookies:
   - DevTools → Application → Cookies
   - Look for `XSRF-TOKEN` and session cookie
   - Both should be present

2. Verify CSRF token is being sent:
   - Open DevTools → Network
   - Find the failing POST request
   - Check headers: `X-XSRF-TOKEN` should be present

3. If cookies are missing:
   - Clear browser cache: `Ctrl+Shift+Delete`
   - Log in again at `/admin/auth/login`
   - Verify cookies appear

---

### Issue 3: Wrong Guard Used

**Symptom:** Auth status shows you're logged in but still getting 403

**Solution:** The AdminAuth middleware might be using wrong guard

**Fix:** Check that requests are using 'web' guard. In http-client.ts, the session should be using the 'web' guard.

---

## Testing the Fix

### Test 1: Check Auth Status (No Admin Required)

```bash
# Should work for any authenticated user
curl http://localhost:3333/api/auth-status

# Response shows current user role
# If role is "admin", proceed to Test 2
```

### Test 2: Access Admin Endpoint (Admin Required)

```bash
# Should only work if role is "admin"
curl http://localhost:3333/api/admin/site-settings

# If 403, you're not an admin
# If 200, you are an admin
```

### Test 3: Save Payment Settings

```bash
# Full flow test
curl -X POST http://localhost:3333/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <token_from_cookie>" \
  -d '{
    "key": "payment_settings",
    "label": "Payment Settings",
    "value": {"activeProvider": "manual", "currency": "USD", "providers": []}
  }'

# Should return 200 with saved settings
```

---

## Debug Logging

### Where to Look

**Server logs** (terminal running `node ace serve`):

```
[RoleMiddleware] Permission denied
  userId: 1
  userRole: vendor          ← This is the problem!
  userEmail: test@example.com
  requiredRoles: [ 'admin' ]
  path: /api/admin/site-settings
  method: POST
```

**Browser DevTools** (Network tab):

- Check failed request headers
- Look for `X-XSRF-TOKEN` header
- Check response body for error details

---

## How to Create an Admin User

### Option 1: Google OAuth (Recommended)

1. Navigate to `http://localhost:3333/admin/auth/login`
2. Click "Set up admin account" or Google sign-in button
3. Complete Google OAuth flow
4. Admin user created automatically

### Option 2: Direct Database (Development Only)

```sql
INSERT INTO users (
  email,
  full_name,
  password,
  role,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'admin@example.com',
  'Admin User',
  'hashed_password_here',  -- Use a hashed password
  'admin',
  datetime('now'),
  datetime('now'),
  datetime('now')
);
```

**Warning:** Don't use plaintext passwords in production!

---

## Middleware Chain for Admin API Routes

```
Request to /api/admin/site-settings (POST)
    ↓
1. middleware.auth() — Checks if user is authenticated
    ├─ If not authenticated: 401 Unauthorized
    └─ If authenticated: Continue
    ↓
2. middleware.role(['admin']) — Checks if user.role === 'admin'
    ├─ If role ≠ 'admin': 403 Permission Denied
    │   └─ (This is where you're failing!)
    └─ If role === 'admin': Continue
    ↓
3. adminThrottle — Rate limiting
    ├─ If exceeded: 429 Too Many Requests
    └─ If OK: Continue
    ↓
4. Controller action (SiteSettings.upsert)
    ↓
200 Success or error response
```

---

## Environment Check

### Verify Routes Are Registered

```bash
# In AdonisJS REPL
node ace repl

# Check if route exists
> const Route = require('@adonisjs/core/services/route').default
> const routes = Route.toJSON()
> routes.filter(r => r.pattern.includes('site-settings'))
```

---

## Fix Checklist

- [ ] Verify user is logged in as admin (GET /api/auth-status)
- [ ] Check user.role === "admin" in response
- [ ] Verify cookies present in browser
- [ ] Verify XSRF-TOKEN header sent in requests
- [ ] Check server logs for [RoleMiddleware] errors
- [ ] Confirm routes are correctly configured
- [ ] Test with curl before testing with UI

---

## If Problem Persists

1. **Check server logs** for [RoleMiddleware] errors
   - Shows actual userRole being used

2. **Verify admin user exists**

   ```sql
   SELECT id, email, role FROM users WHERE role = 'admin';
   ```

3. **Check session is being maintained**
   - DevTools → Application → Cookies
   - Look for session cookie (ADONIS_SESSION or similar)

4. **Test with simpler endpoint**

   ```bash
   # This doesn't require admin role
   curl http://localhost:3333/api/auth-status
   ```

5. **Check for role mismatch**
   - If user has 'ADMIN' (uppercase), middleware expects 'admin' (lowercase)
   - Database value must be lowercase

---

## Performance Notes

- New diagnostic endpoint is very lightweight
- No database queries required
- Safe to leave in production (doesn't expose sensitive info)

---

## Next Steps

1. Run the diagnostic: `GET /api/auth-status`
2. Check the user role in response
3. If role is "admin", problem is elsewhere
4. If role is not "admin", create new admin user
5. Test again: `POST /api/admin/site-settings`

---

**For More Help:**

- Check server logs (console output)
- Review middleware chain (listed above)
- Verify user table has correct role value
- Test with diagnostic endpoint first
