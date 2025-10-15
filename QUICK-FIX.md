# Quick Fix: Get Everything Running

## 🚨 The Problems You're Seeing

1. **Web**: Redirects to "send magic link" page
2. **iOS**: Red error "Could not connect to development server"
3. **Android**: Red error "Could not connect to development server"

## ✅ The Fix (3 Steps)

### Step 1: Start Backend
```bash
cd /Users/sammuthu/Projects/cosmicboard-backend
./start.sh
```

Wait until you see: `✅ All services ready - Starting backend server`

### Step 2: Fix Android Port Forwarding (Android Only)
```bash
adb reverse tcp:7779 tcp:7779
```

### Step 3: Start Your App

**For Web**:
```bash
cd /Users/sammuthu/Projects/cosmicboard
npm run dev
# Open http://localhost:7777
# Should auto-login as nmuthu@gmail.com
```

**For iOS**:
```bash
cd /Users/sammuthu/Projects/cosmicboard-mobile

# Option 1: Use restart script (recommended if you see errors)
./restart-ios.sh

# Option 2: Normal start
npm start
# Then press 'i' for iOS simulator
# Auto-logs in as nmuthu@gmail.com
```

**For Android**:
```bash
cd /Users/sammuthu/Projects/cosmicboard-mobile
./start-android-interactive.sh
# Auto-logs in as sammuthu@me.com
```

## 🎯 What's New

### Web
- ✅ **Auto-login**: Opens directly to dashboard (no magic link!)
- ✅ **Account Switcher**: Click purple button in bottom-right corner
- ✅ **Keyboard Shortcut**: `Cmd+Shift+A` to switch accounts

### Mobile
- ✅ **Auto-login**: iOS uses nmuthu@gmail.com, Android uses sammuthu@me.com
- ✅ **No emails**: No magic links in dev mode
- ⚠️ **Requires**: Backend running + Android port forwarding

## 🔍 Verify It's Working

### Test Backend
```bash
curl http://localhost:7779/api/health
# Should return: {"status":"ok"}
```

### Test Dev Accounts
```bash
curl http://localhost:7779/api/auth/dev-accounts
# Should return list of 2 accounts
```

## 💡 After Restart

Just run these 3 commands:

```bash
# 1. Backend
cd cosmicboard-backend && ./start.sh

# 2. Android port forwarding (if using Android)
adb reverse tcp:7779 tcp:7779

# 3. Your app (web or mobile)
cd cosmicboard && npm run dev  # Web
# OR
cd cosmicboard-mobile && npm start  # Mobile
```

## 📚 Full Docs

- **Auth System**: See `AUTH-SYSTEM.md`
- **Mobile Setup**: See `MOBILE-SETUP.md`
- **Quick Start**: See `QUICK-START-AUTH.md`

---

That's it! Everything should work now. 🎉
