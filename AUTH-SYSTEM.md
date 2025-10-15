# Authentication System Documentation

## Overview

CosmicBoard uses a production-ready authentication system that seamlessly works in both development and production environments. The system is designed to eliminate the pain of managing auth tokens during development while maintaining security best practices for production.

## Architecture

### Key Features

1. **Environment-Based Authentication**
   - Automatic detection of development vs production mode
   - Different auth flows based on environment
   - No code changes needed when deploying to production

2. **Development Mode** (LocalStack detected)
   - ✅ Instant login with pre-seeded accounts
   - ✅ No email sending (bypasses magic link)
   - ✅ Visual account switcher UI
   - ✅ Persistent tokens across restarts
   - ✅ Never expires in dev mode

3. **Production Mode** (AWS/Real environment)
   - ✅ Secure JWT tokens (15min access, 7-day refresh)
   - ✅ Magic link via AWS SES
   - ✅ Automatic token refresh
   - ✅ HttpOnly cookies for web

### Technology Stack

- **Backend**: Express.js with Prisma ORM
- **Frontend**: Next.js 15 with React 19
- **Mobile**: React Native (same auth flow)
- **Tokens**: Long-lived dev tokens, JWT for production
- **Storage**: localStorage (web), SecureStore (mobile)

## Development Mode

### Prerequisites

1. LocalStack running (`docker ps | grep localstack`)
2. Backend started (`cd cosmicboard-backend && ./start.sh`)
3. Frontend running (`cd cosmicboard && npm run dev`)

### Pre-Configured Dev Accounts

Two test accounts are pre-seeded in the database:

| Account | Email | Name | Purpose |
|---------|-------|------|---------|
| Account 1 | nmuthu@gmail.com | Nmuthu | Primary dev account (Chrome, iOS) |
| Account 2 | sammuthu@me.com | Sam Muthu | Secondary account (Safari, Android) |

### Using the Account Switcher

#### Visual UI Method (Recommended)

1. Look for the **floating purple button** in bottom-right corner
2. Click it to open the account switcher
3. Select an account to instantly switch
4. No page refresh needed - auth updates automatically

**Keyboard Shortcut**: `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows/Linux)

#### Console Method (Legacy)

```javascript
// List available accounts
devAuth.listAvailableUsers()

// Switch to a specific account
devAuth.switchToUser('nmuthu@gmail.com')
devAuth.switchToUser('sammuthu@me.com')

// Check current tokens
devAuth.checkAuthTokens()

// Clear all tokens
devAuth.clearAuthTokens()
```

### How It Works (Development)

1. **Backend Detection**: Checks for LocalStack (`AWS_ENDPOINT` contains `localhost`)
2. **Dev Accounts**: Returns pre-configured tokens from `/config/auth.config.ts`
3. **Token Validation**: Backend accepts long-lived dev tokens (365 days)
4. **No Emails**: Magic link flow is completely bypassed in dev mode

### After Computer Restart

The system handles restarts gracefully:

1. **Backend**: `./start.sh` auto-starts PostgreSQL and LocalStack
2. **Tokens**: Persist in localStorage, automatically loaded
3. **Account Switcher**: Instantly available to switch accounts

## Production Mode

### How It Works (Production)

1. **Magic Link Flow**
   - User enters email
   - Backend generates secure token
   - Email sent via AWS SES
   - User clicks link to verify
   - Short-lived JWT tokens issued

2. **Token Management**
   - Access token: 15 minutes
   - Refresh token: 7 days
   - Automatic refresh before expiry
   - HttpOnly cookies for security

3. **Security**
   - No hardcoded tokens
   - Secrets in AWS Secrets Manager
   - Rate limiting on auth endpoints
   - CORS restricted to known domains

## API Endpoints

### Development Endpoints (Only in Dev Mode)

#### POST `/api/auth/dev-login`
Quick login without magic link.

**Request**:
```json
{
  "email": "nmuthu@gmail.com"
}
```

**Response**:
```json
{
  "user": {
    "id": "6b0a6f4f-002f-40cb-babe-95908a565f45",
    "email": "nmuthu@gmail.com",
    "name": "Nmuthu",
    "username": "nmuthu"
  },
  "tokens": {
    "accessToken": "03c053eada3696970cb3c7df426b27a7...",
    "refreshToken": "03c053eada3696970cb3c7df426b27a7...",
    "expiresIn": 31536000
  }
}
```

#### GET `/api/auth/dev-accounts`
List all available dev accounts.

**Response**:
```json
{
  "accounts": [
    {
      "email": "nmuthu@gmail.com",
      "name": "Nmuthu",
      "username": "nmuthu"
    },
    {
      "email": "sammuthu@me.com",
      "name": "Sam Muthu",
      "username": "sammuthu"
    }
  ]
}
```

### Production Endpoints (All Modes)

#### POST `/api/auth/magic-link`
Send magic link to email.

**Request**:
```json
{
  "email": "user@example.com",
  "isSignup": false
}
```

#### POST `/api/auth/verify-link`
Verify magic link token.

**Request**:
```json
{
  "token": "abc123..."
}
```

#### POST `/api/auth/refresh`
Refresh expired access token.

**Request**:
```json
{
  "refreshToken": "xyz789..."
}
```

#### GET `/api/auth/me`
Get current user profile (requires auth).

#### POST `/api/auth/logout`
Logout and invalidate tokens (requires auth).

## Frontend Integration

### Using Auth Context

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={() => login('user@example.com')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Manual Dev Login (For Scripts)

```typescript
import authService from '@/services/auth.service';

// Dev login
const result = await authService.devLogin('nmuthu@gmail.com');
if (result.success) {
  console.log('Logged in as:', result.user.name);
}

// Get dev accounts
const accounts = await authService.getDevAccounts();
console.log('Available accounts:', accounts);
```

## Mobile App Integration

The mobile app uses the same auth system:

1. **Dev Mode**: Uses same `/api/auth/dev-login` endpoint
2. **Production**: Uses magic link with 6-digit code input
3. **Storage**: SecureStore for tokens (iOS Keychain, Android Keystore)

### Mobile Dev Login

```typescript
import authService from './services/auth.service';

// Dev login (mobile)
const result = await authService.devLogin('nmuthu@gmail.com');
if (result.success) {
  // Store in SecureStore
  await SecureStore.setItemAsync('auth_tokens', JSON.stringify(result.tokens));
  await SecureStore.setItemAsync('user', JSON.stringify(result.user));
}
```

## Configuration Files

### Backend Config: `/cosmicboard-backend/src/config/auth.config.ts`

```typescript
export const authConfig = {
  mode: 'development',  // Auto-detected
  accessTokenExpiry: '365d',  // Long-lived in dev
  refreshTokenExpiry: '365d',
  devAccounts: [...],  // Pre-configured accounts
  emailProvider: 'console',  // No emails in dev
};
```

### Frontend Config: `/cosmicboard/src/config/environment.ts`

```typescript
export const getApiEndpoint = (endpoint: string) => {
  // Auto-detects dev vs prod and routes correctly
  if (isDevelopment) {
    return `http://localhost:7779/api${endpoint}`;
  }
  return `${config.apiUrl}/api${endpoint}`;
};
```

## Security Considerations

### Development Mode

✅ **Safe**:
- Dev tokens only work with LocalStack
- Automatically disabled in production
- No real user data in dev database

⚠️ **Important**:
- Dev tokens are safe to commit (only work locally)
- Never use dev mode with production data
- Always test production auth flow before deployment

### Production Mode

✅ **Secure**:
- Short-lived JWT tokens
- HttpOnly cookies prevent XSS
- CORS restricted to known domains
- Rate limiting on auth endpoints
- Secrets in AWS Secrets Manager

⚠️ **Required**:
- Set `JWT_SECRET` environment variable
- Configure AWS SES for email sending
- Enable HTTPS/TLS in production
- Use AWS Secrets Manager for keys

## Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure `JWT_SECRET` (strong random string)
- [ ] Set up AWS SES for email sending
- [ ] Configure production domains in CORS
- [ ] Test magic link flow end-to-end
- [ ] Verify token expiry and refresh
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

## Troubleshooting

### Token Not Working After Restart

**Web**:
```bash
# Clear localStorage and re-login
devAuth.clearAuthTokens()
devAuth.switchToUser('nmuthu@gmail.com')
```

**Mobile**:
```bash
# Clear SecureStore and re-login
import * as SecureStore from 'expo-secure-store';
await SecureStore.deleteItemAsync('auth_tokens');
await SecureStore.deleteItemAsync('user');
```

### LocalStack Not Running

```bash
# Check if running
docker ps | grep localstack

# Restart LocalStack
cd cosmicboard-backend
./start.sh

# Or manually
docker start cosmicspace-localstack
```

### Account Switcher Not Showing

1. Check you're in development mode: `process.env.NODE_ENV === 'development'`
2. Verify LocalStack is running
3. Clear browser cache and reload
4. Check console for errors

### Backend Not Detecting Dev Mode

1. Verify `AWS_ENDPOINT` contains `localhost` in `.env.localstack`
2. Restart backend: `./start.sh`
3. Check backend logs for "🔧 Auth Mode: DEVELOPMENT"

## Comparison: Old vs New System

| Feature | Old System | New System |
|---------|-----------|-----------|
| Dev Login | Manual localStorage setup | Visual account switcher |
| Token Management | 90-day expiry, manual refresh | Never expires in dev |
| Account Switching | Console commands only | UI + Console + Keyboard shortcut |
| After Restart | Tokens lost, manual re-login | Auto-persisted, instant recovery |
| Production Parity | Different code paths | Same code, different config |
| Mobile Support | Separate implementation | Unified implementation |
| Security | Tokens in code | Config-based, auto-disabled |

## Future Enhancements

🔜 **Planned Features**:
- [ ] 2FA support (TOTP)
- [ ] Session management dashboard
- [ ] Active device tracking
- [ ] Email notifications for security events
- [ ] Social login (Google, GitHub)
- [ ] Biometric authentication (mobile)

## References

- Backend config: `/cosmicboard-backend/src/config/auth.config.ts`
- Backend routes: `/cosmicboard-backend/src/routes/auth.ts`
- Frontend service: `/cosmicboard/src/services/auth.service.ts`
- Account switcher: `/cosmicboard/src/components/DevAccountSwitcher.tsx`
- Auth context: `/cosmicboard/src/contexts/AuthContext.tsx`

---

**Last Updated**: 2025-10-15
**Version**: 2.0.0 (Production-Ready Dev Mode)
