# Command Reference Card

## 🚀 Quick Start (After Restart)

```bash
# 1. Backend (starts everything)
cd cosmicboard-backend && ./start.sh

# 2. Android port forwarding (if using Android)
adb reverse tcp:7779 tcp:7779

# 3. Choose your platform:
cd cosmicboard && npm run dev           # Web
cd cosmicboard-mobile && ./restart-ios.sh    # iOS
cd cosmicboard-mobile && ./start-android-interactive.sh  # Android
```

## 📱 iOS Specific

### Start iOS (Normal)
```bash
cd cosmicboard-mobile
npm start
# Press 'i'
```

### Start iOS (Fix "No script URL" error)
```bash
cd cosmicboard-mobile
./restart-ios.sh
```

### Clear iOS Cache
```bash
cd cosmicboard-mobile
rm -rf .expo node_modules/.cache ios/build
npx expo start --clear --ios
```

## 🤖 Android Specific

### Start Android
```bash
# 1. Set up port forwarding (once per restart)
adb reverse tcp:7779 tcp:7779

# 2. Start app
cd cosmicboard-mobile
./start-android-interactive.sh
```

### Check Android Connection
```bash
# From Mac
curl http://localhost:7779/api/health

# From emulator
adb shell curl http://localhost:7779/api/health
```

## 💻 Web Specific

### Start Web
```bash
cd cosmicboard
npm run dev
# Open http://localhost:7777
```

### Clear Web Cache
```bash
cd cosmicboard
rm -rf .next
npm run dev
```

## 🔧 Backend

### Start Backend
```bash
cd cosmicboard-backend
./start.sh
```

### Check Backend Status
```bash
curl http://localhost:7779/api/health
curl http://localhost:7779/api/auth/dev-accounts
```

### View Backend Logs
```bash
cd cosmicboard-backend
npm run dev:localstack
```

## 🐳 Docker

### Check Docker Status
```bash
docker ps
# Should see: cosmicspace-postgres, cosmicspace-localstack
```

### Restart Docker Containers
```bash
docker start cosmicspace-postgres
docker start cosmicspace-localstack
```

### View Docker Logs
```bash
docker logs cosmicspace-postgres
docker logs cosmicspace-localstack
```

## 🔍 Debugging

### Kill Stuck Processes
```bash
# Metro bundler (8081)
lsof -ti:8081 | xargs kill -9

# Backend (7779)
lsof -ti:7779 | xargs kill -9

# Web frontend (7777)
lsof -ti:7777 | xargs kill -9
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:7779/api/health

# Dev accounts
curl http://localhost:7779/api/auth/dev-accounts

# Dev login (web/mobile)
curl -X POST http://localhost:7779/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"nmuthu@gmail.com"}'
```

### Check Ports
```bash
lsof -i:7777  # Web frontend
lsof -i:7779  # Backend API
lsof -i:8081  # Metro bundler
lsof -i:5454  # PostgreSQL
lsof -i:4566  # LocalStack
```

## 🧹 Nuclear Options (When Nothing Works)

### Clear All Caches
```bash
# Web
cd cosmicboard
rm -rf .next node_modules
npm install

# Mobile
cd cosmicboard-mobile
rm -rf .expo node_modules ios/build android/build
npm install

# Backend
cd cosmicboard-backend
rm -rf node_modules
npm install
```

### Restart Everything
```bash
# 1. Kill all processes
lsof -ti:7777,7779,8081 | xargs kill -9

# 2. Restart Docker
docker restart cosmicspace-postgres cosmicspace-localstack

# 3. Start backend
cd cosmicboard-backend && ./start.sh

# 4. Start your app (web or mobile)
```

## 📊 Port Reference

| Service | Port | URL |
|---------|------|-----|
| Web Frontend | 7777 | http://localhost:7777 |
| Backend API | 7779 | http://localhost:7779 |
| Metro Bundler | 8081 | http://localhost:8081 |
| PostgreSQL | 5454 | postgresql://localhost:5454 |
| LocalStack | 4566 | http://localhost:4566 |

## 🎯 Common Workflows

### After Computer Restart
```bash
# Terminal 1
cd cosmicboard-backend && ./start.sh

# Terminal 2 (for Android)
adb reverse tcp:7779 tcp:7779

# Terminal 3
cd cosmicboard && npm run dev  # or mobile command
```

### Switching Devices
```bash
# Already running web? Just open mobile!
cd cosmicboard-mobile
./restart-ios.sh  # iOS
# OR
./start-android-interactive.sh  # Android (after adb reverse)
```

### Testing on All Platforms
```bash
# Terminal 1: Backend
cd cosmicboard-backend && ./start.sh

# Terminal 2: Web
cd cosmicboard && npm run dev

# Terminal 3: Mobile
adb reverse tcp:7779 tcp:7779  # Android only
cd cosmicboard-mobile && npm start
```

---

**💡 Tip**: Bookmark this file for quick command lookup!
