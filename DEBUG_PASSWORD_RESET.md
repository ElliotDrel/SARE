# Password Reset Debug Guide

## Current Implementation Flow

1. **User requests reset** at `/auth/forgot-password`
2. **System sends email** with link to `/auth/confirm?token_hash=...&type=recovery&next=/auth/update-password`
3. **User clicks link** → goes to `/auth/confirm` route
4. **Confirm route** verifies token and redirects to `/auth/update-password`
5. **Update password page** validates session and shows form
6. **User updates password** and gets redirected to login

## Debug Steps

### Step 1: Check Email Sending
```bash
# Check browser console when submitting forgot password form
# Look for these logs:
# - "Sending password reset for: [email]"
# - "Redirect URL: [url]"
# - "Password reset email sent successfully"
```

### Step 2: Check Email Reception
- Check email inbox and spam folder
- Verify email contains link to `/auth/confirm`
- Link should have parameters: `token_hash`, `type=recovery`, `next`

### Step 3: Check Confirm Route
```bash
# Check browser console when clicking email link
# Look for these logs:
# - "Auth confirm - Type: recovery Token hash: present"
# - "Password recovery confirmed, redirecting to update-password"
```

### Step 4: Check Update Password Page
```bash
# Check browser console on update password page
# Look for these logs:
# - "Checking session for password update..."
# - "Valid session found: [email]"
# - "Updating password..."
# - "Password updated successfully"
```

## Common Issues and Solutions

### Issue 1: "Invalid or missing authentication parameters"
**Cause**: Email link is malformed or incomplete
**Solution**: 
- Check email service configuration
- Verify redirect URL is correct
- Check for URL encoding issues

### Issue 2: "Token has expired"
**Cause**: Reset link is older than 1 hour
**Solution**: 
- Request new password reset
- Check email for more recent links

### Issue 3: "Invalid token"
**Cause**: Token has already been used or is invalid
**Solution**: 
- Request new password reset
- Don't reuse old links

### Issue 4: "No valid session found"
**Cause**: Session wasn't properly established by confirm route
**Solution**: 
- Check confirm route logs
- Verify token verification succeeded
- Check middleware configuration

## Manual Testing

### Test 1: Complete Flow
1. Go to `/auth/forgot-password`
2. Enter valid email
3. Check email for reset link
4. Click reset link
5. Verify redirect to update password page
6. Enter new password
7. Verify redirect to login
8. Login with new password

### Test 2: Invalid Email
1. Go to `/auth/forgot-password`
2. Enter non-existent email
3. Should show success message (security feature)
4. No email should be received

### Test 3: Expired Link
1. Get a password reset link
2. Wait 1+ hours or use old link
3. Click link
4. Should show error page with helpful message

## Environment Check

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url (for email links)
```

### Supabase Configuration
1. Check Auth settings in Supabase dashboard
2. Verify redirect URLs are configured
3. Check email templates are enabled
4. Verify rate limiting settings

## Browser Console Commands

### Check Current Session
```javascript
// Run in browser console
const { createClient } = await import('/lib/supabase/client');
const supabase = createClient();
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('Error:', error);
```

### Test Password Update
```javascript
// Run in browser console (only works with valid session)
const { createClient } = await import('/lib/supabase/client');
const supabase = createClient();
const { error } = await supabase.auth.updateUser({ password: 'newpassword123' });
console.log('Update result:', error || 'Success');
```

## Network Tab Debugging

### Check API Calls
1. Open browser dev tools → Network tab
2. Filter by "Fetch/XHR"
3. Look for calls to Supabase auth endpoints
4. Check request/response details

### Expected API Calls
1. **Password reset request**: `POST /auth/v1/recover`
2. **Token verification**: `POST /auth/v1/verify`
3. **Password update**: `PUT /auth/v1/user`

## Supabase Dashboard Debugging

### Check Auth Logs
1. Go to Supabase dashboard
2. Navigate to Authentication → Logs
3. Look for password reset events
4. Check for error messages

### Check User Records
1. Go to Authentication → Users
2. Find the test user
3. Check last sign in time
4. Verify email confirmation status

## Production Considerations

### Email Service
- Ensure email service is properly configured
- Check email deliverability
- Verify email templates are working
- Test with different email providers

### Domain Configuration
- Verify `NEXT_PUBLIC_SITE_URL` matches production domain
- Check SSL certificates
- Ensure redirect URLs are whitelisted in Supabase

### Rate Limiting
- Check if rate limiting is blocking requests
- Verify IP whitelist if applicable
- Monitor for abuse patterns

## Troubleshooting Commands

### Clear Browser Storage
```javascript
// Clear all auth-related storage
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

### Force Session Refresh
```javascript
// Force refresh auth session
const { createClient } = await import('/lib/supabase/client');
const supabase = createClient();
await supabase.auth.refreshSession();
```

### Check Middleware
- Verify middleware is not blocking auth routes
- Check route protection configuration
- Ensure `/auth/confirm` and `/auth/update-password` are accessible

## Success Indicators

### What Should Work
- ✅ Password reset email sent without errors
- ✅ Email received with valid link
- ✅ Link redirects to update password page
- ✅ Update password form appears
- ✅ Password update succeeds
- ✅ Redirect to login with success message
- ✅ Login with new password works

### What Should Fail Gracefully
- ✅ Invalid email shows success (security)
- ✅ Expired links show helpful error
- ✅ Used links show helpful error
- ✅ Invalid passwords show validation errors
- ✅ Network errors show retry options