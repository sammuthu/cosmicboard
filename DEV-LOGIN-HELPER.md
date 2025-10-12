# Development Login Helper

Since email sending is disabled/limited in development, use these methods to authenticate:

## Method 1: Magic Link from Console (Recommended)

### Step 1: Request Magic Link
In your browser, go to http://localhost:7777 and try to login with an email address.

### Step 2: Get Magic Link from Backend Logs
The magic link will be logged to the backend console:

```bash
tail -f /tmp/backend.log | grep -A 5 "MAGIC LINK"
```

You'll see output like:
```
===========================================
🔐 MAGIC LINK (Development Mode)
===========================================
Email: sammuthu@me.com
Magic Link: http://localhost:7777/auth?token=abc123...
Code: 123456
===========================================
```

### Step 3: Use the Magic Link
Copy the magic link URL and paste it into your browser. You'll be logged in!

---

## Method 2: Manual Token Setup (For Testing Multiple Accounts)

### For sammuthu@me.com:

1. **Get fresh tokens:**
```bash
curl -X POST http://localhost:7779/api/auth/setup-dev-auth \
  -H "Content-Type: application/json" \
  -d '{"email": "sammuthu@me.com"}'
```

2. **Copy the tokens from response and run in browser console:**
```javascript
// Replace with actual tokens from curl response
localStorage.setItem('auth_tokens', JSON.stringify({
  accessToken: "YOUR_ACCESS_TOKEN_HERE",
  refreshToken: "YOUR_REFRESH_TOKEN_HERE",
  expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
}));

localStorage.setItem('user', JSON.stringify({
  id: "c7e7967b-a27d-4932-82af-71dd4cadcb80",
  email: "sammuthu@me.com",
  name: "Sam Muthu",
  username: "sammuthu",
  avatar: null
}));

location.reload();
```

### For nmuthu@gmail.com:

1. **Get fresh tokens:**
```bash
curl -X POST http://localhost:7779/api/auth/setup-dev-auth \
  -H "Content-Type: application/json" \
  -d '{"email": "nmuthu@gmail.com"}'
```

2. **Run in browser console with the new tokens**

---

## Method 3: Quick Browser Console Login

Run this in your browser console to request and auto-apply tokens:

```javascript
// For sammuthu@me.com
fetch('http://localhost:7779/api/auth/setup-dev-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'sammuthu@me.com' })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('auth_tokens', JSON.stringify({
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }));
  localStorage.setItem('user', JSON.stringify(data.user));
  console.log('✅ Logged in as:', data.user.email);
  location.reload();
});
```

```javascript
// For nmuthu@gmail.com
fetch('http://localhost:7779/api/auth/setup-dev-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'nmuthu@gmail.com' })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('auth_tokens', JSON.stringify({
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }));
  localStorage.setItem('user', JSON.stringify(data.user));
  console.log('✅ Logged in as:', data.user.email);
  location.reload();
});
```

---

## Testing Cross-Account Discover Feed

### Setup:
1. **Chrome**: Login as nmuthu@gmail.com
2. **Safari**: Login as sammuthu@me.com

### Test Flow:
1. In Safari (sammuthu@me.com): Create new PUBLIC projects/tasks/notes
2. In Chrome (nmuthu@gmail.com): Go to Discover tab
3. Refresh and see sammuthu@me.com's new PUBLIC content appear!

---

## Troubleshooting

### Page keeps logging me out:
- Clear localStorage: `localStorage.clear()`
- Make sure backend is running on port 7779
- Check browser console for errors

### Magic link not working:
- Make sure you copied the complete token from backend logs
- Token expires in 15 minutes, request a new one if needed
- Check that backend is running

### Still auto-logging in:
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache
- Try incognito/private window

---

## Why No Email Sending?

Gmail has daily sending limits that have been exceeded. The email service is configured correctly, but Gmail blocks sends after ~500 emails/day.

In development, this is fine because:
- Magic links are logged to console
- You can copy them from `/tmp/backend.log`
- No need to check email

In production, you would:
- Use a transactional email service (SendGrid, Mailgun, AWS SES)
- Or configure Gmail with proper app password and limits
