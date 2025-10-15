# Quick Start: Authentication System

## 🚀 Getting Started in 3 Steps

### 1. Start Backend (with LocalStack)

```bash
cd /Users/sammuthu/Projects/cosmicboard-backend
./start.sh
```

✅ This automatically:
- Starts PostgreSQL
- Starts LocalStack (S3, SES)
- Generates Prisma client
- Starts backend on port 7779

### 2. Start Frontend

```bash
cd /Users/sammuthu/Projects/cosmicboard
npm run dev
```

✅ Frontend runs on port 7777

### 3. Use Account Switcher

Look for the **purple floating button** in the bottom-right corner!

## 📱 Available Test Accounts

| Email | Name | Browser/Device |
|-------|------|----------------|
| `nmuthu@gmail.com` | Nmuthu | Chrome, iOS |
| `sammuthu@me.com` | Sam Muthu | Safari, Android |

## 🎯 How to Switch Accounts

### Method 1: Visual UI (Recommended)
1. Click purple button in bottom-right
2. Select account
3. Done! No refresh needed

### Method 2: Keyboard Shortcut
- Mac: `Cmd+Shift+A`
- Windows/Linux: `Ctrl+Shift+A`

### Method 3: Browser Console
```javascript
// List accounts
devAuth.listAvailableUsers()

// Switch account
devAuth.switchToUser('nmuthu@gmail.com')
```

## 🔄 After Computer Restart

Just run:
```bash
cd cosmicboard-backend && ./start.sh
cd cosmicboard && npm run dev
```

Your auth tokens are automatically restored!

## ✨ Key Features

- ✅ **Instant Login**: No emails, no waiting
- ✅ **Persistent**: Works after restart
- ✅ **Visual UI**: Beautiful account switcher
- ✅ **Production-Ready**: Same code for dev and prod
- ✅ **Mobile Support**: Works on React Native

## 🐛 Troubleshooting

### "Token not working"
```bash
cd cosmicboard-backend
./start.sh
```

### "Account switcher not showing"
1. Check dev mode: Open console, should see "🔧 Auth Mode: DEVELOPMENT"
2. Check LocalStack: `docker ps | grep localstack`
3. Reload page

### "LocalStack not running"
```bash
docker start cosmicspace-localstack
docker start cosmicspace-postgres
```

## 📚 Full Documentation

See [AUTH-SYSTEM.md](./AUTH-SYSTEM.md) for complete documentation.

## 🎉 That's It!

You're ready to develop with seamless authentication!
