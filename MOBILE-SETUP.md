# Mobile App Setup & Troubleshooting

## Quick Fix for "Could not connect to development server"

### The Issue
The mobile apps show a red error screen saying they can't connect to the backend at `localhost:7779`.

### The Solution

#### For iOS

1. **Make sure backend is running**:
   ```bash
   cd /Users/sammuthu/Projects/cosmicboard-backend
   ./start.sh
   ```

2. **Start the mobile app**:
   ```bash
   cd /Users/sammuthu/Projects/cosmicboard-mobile
   npm start
   # Press 'i' for iOS simulator
   ```

3. **iOS automatically uses localhost** - No port forwarding needed!

#### For Android

Android requires port forwarding because the emulator's `localhost` is isolated.

1. **Make sure backend is running**:
   ```bash
   cd /Users/sammuthu/Projects/cosmicboard-backend
   ./start.sh
   ```

2. **Set up port forwarding** (run this once per computer restart):
   ```bash
   adb reverse tcp:7779 tcp:7779
   ```

3. **Start the mobile app**:
   ```bash
   cd /Users/sammuthu/Projects/cosmicboard-mobile
   ./start-android-interactive.sh
   ```

## Verifying Backend Connection

### Check if backend is accessible:

```bash
# From your Mac (should work)
curl http://localhost:7779/api/health

# From Android emulator (after adb reverse)
adb shell curl http://localhost:7779/api/health
```

If you get a JSON response, the backend is accessible!

## Auto-Login in Development

Both iOS and Android apps automatically log in with dev accounts:
- **iOS**: `nmuthu@gmail.com`
- **Android**: `sammuthu@me.com`

No manual login required in development mode!

## Common Issues & Fixes

### Issue 1: "Could not connect to development server"

**Cause**: Backend not running or port forwarding not set up.

**Fix**:
```bash
# Terminal 1: Start backend
cd cosmicboard-backend && ./start.sh

# Terminal 2: Set up Android port forwarding (if using Android)
adb reverse tcp:7779 tcp:7779

# Terminal 3: Start mobile app
cd cosmicboard-mobile && npm start
```

### Issue 2: Metro bundler exits immediately

**Cause**: Port 8081 already in use.

**Fix**:
```bash
# Kill the existing Metro process
lsof -ti:8081 | xargs kill -9

# Restart mobile app
npm start
```

### Issue 3: "Network request failed"

**Cause**: LocalStack or PostgreSQL not running.

**Fix**:
```bash
# Check Docker containers
docker ps

# Should see:
# - cosmicspace-postgres
# - cosmicspace-localstack

# If not, restart backend
cd cosmicboard-backend && ./start.sh
```

### Issue 4: Android emulator can't reach backend

**Cause**: Port forwarding not set up or backend not running.

**Fix**:
```bash
# 1. Check backend is running
curl http://localhost:7779/api/health

# 2. Set up port forwarding
adb reverse tcp:7779 tcp:7779

# 3. Verify from emulator
adb shell curl http://localhost:7779/api/health
```

### Issue 5: iOS simulator shows "No script URL provided" error

**Cause**: Metro bundler not running or not connected properly.

**Fix Option 1 - Use Restart Script (Recommended)**:
```bash
cd cosmicboard-mobile
./restart-ios.sh
# Automatically clears cache and starts fresh
```

**Fix Option 2 - Manual Steps**:
```bash
# 1. Kill Metro bundler
lsof -ti:8081 | xargs kill -9

# 2. Clear caches
cd cosmicboard-mobile
rm -rf .expo node_modules/.cache ios/build

# 3. Start fresh
npx expo start --clear --ios
```

### Issue 6: iOS simulator shows blank screen

**Cause**: App needs to reload.

**Fix**:
```bash
# In the Metro bundler terminal, press:
# 'r' to reload
# OR
# 'i' to restart iOS simulator
```

## Development Workflow

### Starting Everything Fresh

```bash
# Terminal 1: Backend
cd /Users/sammuthu/Projects/cosmicboard-backend
./start.sh

# Terminal 2: Web (optional)
cd /Users/sammuthu/Projects/cosmicboard
npm run dev

# Terminal 3: Mobile
cd /Users/sammuthu/Projects/cosmicboard-mobile

# For Android (requires port forwarding first):
adb reverse tcp:7779 tcp:7779
./start-android-interactive.sh

# For iOS (no port forwarding needed):
npm start
# Then press 'i'
```

### After Computer Restart

1. **Start Docker** (should auto-start, but verify):
   ```bash
   docker ps
   ```

2. **Start Backend** (auto-starts PostgreSQL and LocalStack):
   ```bash
   cd cosmicboard-backend && ./start.sh
   ```

3. **Set up Android port forwarding** (if using Android):
   ```bash
   adb reverse tcp:7779 tcp:7779
   ```

4. **Start Mobile App**:
   ```bash
   cd cosmicboard-mobile && npm start
   ```

## Testing Auth System

### Web
1. Open http://localhost:7777
2. Should auto-login as `nmuthu@gmail.com`
3. Click purple button (bottom-right) to switch accounts

### iOS
1. Starts in simulator
2. Auto-logs in as `nmuthu@gmail.com`
3. Go to Settings to switch accounts (future feature)

### Android
1. Starts in emulator
2. Auto-logs in as `sammuthu@me.com`
3. Go to Settings to switch accounts (future feature)

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 7779 | http://localhost:7779 |
| Web Frontend | 7777 | http://localhost:7777 |
| Metro Bundler | 8081 | http://localhost:8081 |
| PostgreSQL | 5454 | postgresql://localhost:5454 |
| LocalStack | 4566 | http://localhost:4566 |

## Debugging Tips

### View Backend Logs
```bash
cd cosmicboard-backend
npm run dev:localstack
```

### View Mobile App Logs
- **iOS**: Look at the terminal running Metro
- **Android**: Use `adb logcat` or Android Studio Logcat

### Check Network Requests
```bash
# Test backend from command line
curl http://localhost:7779/api/auth/dev-accounts

# Should return:
# {
#   "accounts": [
#     {"email": "nmuthu@gmail.com", "name": "Nmuthu"},
#     {"email": "sammuthu@me.com", "name": "Sam Muthu"}
#   ]
# }
```

### Clear All Caches (Nuclear Option)
```bash
# Mobile app
cd cosmicboard-mobile
rm -rf node_modules .expo ios/build android/build
npm install

# Web app
cd cosmicboard
rm -rf .next node_modules
npm install

# Backend
cd cosmicboard-backend
rm -rf node_modules
npm install
```

## Future Enhancements

The mobile apps will soon get:
- [ ] Visual account switcher (like the web version)
- [ ] Dev mode indicator
- [ ] One-tap account switching
- [ ] Auto-reconnect on network change

---

**Need Help?**
- Check backend logs: `cd cosmicboard-backend && ./start.sh`
- Check mobile logs: Look at Metro bundler output
- Verify Docker: `docker ps` (should see postgres & localstack)
- Test backend: `curl http://localhost:7779/api/health`
