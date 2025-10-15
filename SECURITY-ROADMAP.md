# CosmicBoard Security Implementation Roadmap

**Created**: October 13, 2025
**Motivation**: GitHub account compromise incident (October 12, 2025)
**Goal**: Ensure CosmicBoard users have enterprise-grade security protection

---

## Overview

Following the GitHub account compromise incident, we are implementing comprehensive security measures across all CosmicBoard projects (web, mobile, backend) to protect our users from similar threats.

---

## High Priority (Immediate - 1-2 weeks)

### 1. Two-Factor Authentication (2FA) 🔐
**Status**: 🔜 TO IMPLEMENT
**Impact**: HIGH - Prevents unauthorized access even if credentials are compromised

**Implementation Tasks**:
- [ ] Add TOTP (Time-based One-Time Password) support using `speakeasy` library
- [ ] Create 2FA enrollment flow with QR code generation
- [ ] Store encrypted 2FA secrets in User table
- [ ] Generate 10 recovery codes during enrollment
- [ ] Add 2FA verification step to magic link flow
- [ ] Create 2FA settings page in user profile
- [ ] Add "Verify with 2FA" prompt after magic link login
- [ ] Test 2FA with Google Authenticator, Authy, 1Password

**Backend Changes**:
- [ ] `User` model: Add `twoFactorSecret`, `twoFactorEnabled`, `recoveryCodes` fields
- [ ] `POST /api/auth/2fa/enable` - Start 2FA enrollment
- [ ] `POST /api/auth/2fa/verify` - Verify TOTP code
- [ ] `POST /api/auth/2fa/disable` - Disable 2FA with password confirmation
- [ ] `POST /api/auth/2fa/recovery` - Use recovery code for login

**Frontend Changes**:
- [ ] 2FA enrollment modal with QR code display
- [ ] 2FA verification input (6-digit code)
- [ ] Recovery codes download/print interface
- [ ] Security settings page with 2FA toggle
- [ ] Warning banners encouraging 2FA enrollment

**Files to Create/Modify**:
- `/Users/sammuthu/Projects/cosmicboard-backend/src/services/twoFactor.service.ts`
- `/Users/sammuthu/Projects/cosmicboard-backend/src/routes/auth.ts`
- `/Users/sammuthu/Projects/cosmicboard/src/components/TwoFactorEnrollment.tsx`
- `/Users/sammuthu/Projects/cosmicboard/src/components/TwoFactorVerification.tsx`
- `/Users/sammuthu/Projects/cosmicboard/src/app/settings/security/page.tsx`

---

### 2. Session Management & Active Device Tracking 📱
**Status**: 🔜 TO IMPLEMENT
**Impact**: HIGH - Users can monitor and revoke suspicious sessions

**Implementation Tasks**:
- [ ] Create `Session` table in database
- [ ] Track active sessions with device info (OS, browser, IP, location)
- [ ] Display active sessions in security dashboard
- [ ] Allow users to revoke individual sessions or "Sign out all devices"
- [ ] Email notifications when new device logs in
- [ ] Session expiry based on inactivity (configurable)
- [ ] Automatic session cleanup for old/expired sessions

**Backend Changes**:
- [ ] Create `Session` model: id, userId, deviceId, deviceName, ipAddress, lastActive, createdAt
- [ ] `GET /api/auth/sessions` - List active sessions
- [ ] `DELETE /api/auth/sessions/:id` - Revoke specific session
- [ ] `DELETE /api/auth/sessions/all` - Revoke all sessions except current
- [ ] Middleware to update `lastActive` on each request
- [ ] Background job to clean up expired sessions

**Frontend Changes**:
- [ ] Security dashboard showing active sessions
- [ ] Session card with device icon, location, last active time
- [ ] "Revoke" button for each session
- [ ] "Sign out all other devices" button
- [ ] Confirmation modal before revoking sessions

**Files to Create/Modify**:
- `/Users/sammuthu/Projects/cosmicboard-backend/prisma/schema.prisma` (add Session model)
- `/Users/sammuthu/Projects/cosmicboard-backend/src/services/session.service.ts`
- `/Users/sammuthu/Projects/cosmicboard-backend/src/routes/auth.ts`
- `/Users/sammuthu/Projects/cosmicboard/src/components/SecurityDashboard.tsx`
- `/Users/sammuthu/Projects/cosmicboard/src/components/ActiveSessionCard.tsx`

---

### 3. Security Audit Logs 📝
**Status**: 🔜 TO IMPLEMENT
**Impact**: MEDIUM - Enables forensic analysis after security incidents

**Implementation Tasks**:
- [ ] Create `AuditLog` table for security events
- [ ] Log authentication events (login, logout, failed attempts)
- [ ] Log account changes (email update, 2FA enable/disable, password change)
- [ ] Log permission changes (project visibility, sharing)
- [ ] Display audit logs in security dashboard
- [ ] Alert on suspicious patterns (multiple failed logins)

**Backend Changes**:
- [ ] Create `AuditLog` model: id, userId, eventType, ipAddress, deviceId, metadata, timestamp
- [ ] Service function `logSecurityEvent(userId, eventType, metadata)`
- [ ] `GET /api/audit-logs` - Retrieve user's security events
- [ ] Integration with existing auth and project routes

**Event Types to Track**:
- `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`
- `MAGIC_LINK_SENT`, `MAGIC_LINK_VERIFIED`
- `2FA_ENABLED`, `2FA_DISABLED`, `2FA_VERIFIED_SUCCESS`, `2FA_VERIFIED_FAILED`
- `SESSION_REVOKED`, `ALL_SESSIONS_REVOKED`
- `EMAIL_CHANGED`, `PROFILE_UPDATED`
- `PROJECT_VISIBILITY_CHANGED`, `PROJECT_SHARED`

**Files to Create/Modify**:
- `/Users/sammuthu/Projects/cosmicboard-backend/prisma/schema.prisma` (add AuditLog model)
- `/Users/sammuthu/Projects/cosmicboard-backend/src/services/audit.service.ts`
- `/Users/sammuthu/Projects/cosmicboard/src/components/AuditLogViewer.tsx`

---

## Medium Priority (2-4 weeks)

### 4. Rate Limiting ⏱️
**Status**: 🔜 TO IMPLEMENT
**Impact**: MEDIUM - Prevents brute force and DoS attacks

**Implementation Tasks**:
- [ ] Install `express-rate-limit` package
- [ ] Configure rate limits for authentication endpoints
- [ ] Per-IP rate limiting (5 login attempts per 15 minutes)
- [ ] Per-user rate limiting for API endpoints
- [ ] Custom error responses for rate limit violations
- [ ] Whitelist internal IPs for testing

**Backend Changes**:
- [ ] Add rate limiting middleware to `server.ts`
- [ ] Stricter limits on `/api/auth/*` endpoints
- [ ] Standard limits on other API endpoints
- [ ] Redis-backed rate limiting for production (optional)

**Files to Modify**:
- `/Users/sammuthu/Projects/cosmicboard-backend/src/server.ts`
- `/Users/sammuthu/Projects/cosmicboard-backend/src/middleware/rateLimiter.ts` (create)

---

### 5. Email Notifications for Security Events 📧
**Status**: 🔜 TO IMPLEMENT
**Impact**: MEDIUM - Users get alerted immediately to suspicious activity

**Implementation Tasks**:
- [ ] Set up email service (SendGrid, AWS SES, or similar)
- [ ] Create email templates for security events
- [ ] Send email on new device login
- [ ] Send email when 2FA is enabled/disabled
- [ ] Send email when email address is changed
- [ ] Send email when session is revoked remotely
- [ ] Allow users to configure email notification preferences

**Email Templates Needed**:
- New device login detected
- 2FA enabled/disabled
- Email address changed
- Password reset requested (future)
- All sessions signed out
- Suspicious login attempt blocked

**Backend Changes**:
- [ ] Create email service wrapper
- [ ] Email template rendering system
- [ ] `POST /api/notifications/send` - Internal email sending
- [ ] User preferences for email notifications

**Files to Create**:
- `/Users/sammuthu/Projects/cosmicboard-backend/src/services/email.service.ts`
- `/Users/sammuthu/Projects/cosmicboard-backend/src/templates/emails/` (email templates)

---

### 6. Automated Dependency Security Scanning 🔍
**Status**: 🔜 TO IMPLEMENT
**Impact**: MEDIUM - Catches vulnerabilities in third-party packages

**Implementation Tasks**:
- [ ] Set up GitHub Dependabot for all three repos
- [ ] Configure `npm audit` to run in CI/CD pipeline
- [ ] Weekly automated dependency updates
- [ ] Security alert notifications
- [ ] Document policy for handling security updates

**Files to Create**:
- `/Users/sammuthu/Projects/cosmicboard/.github/dependabot.yml`
- `/Users/sammuthu/Projects/cosmicboard-backend/.github/dependabot.yml`
- `/Users/sammuthu/Projects/cosmicboard-mobile/.github/dependabot.yml`

---

## Low Priority (4+ weeks)

### 7. Database Automated Backups 💾
**Status**: 🔜 TO IMPLEMENT
**Impact**: LOW (already have manual backup process) - But critical for disaster recovery

**Implementation Tasks**:
- [ ] Set up automated daily PostgreSQL backups
- [ ] Store backups in S3 or similar cloud storage
- [ ] Implement backup rotation (keep 7 daily, 4 weekly, 12 monthly)
- [ ] Test backup restoration process quarterly
- [ ] Document backup and restore procedures

---

### 8. CSRF Token Protection 🛡️
**Status**: 🔜 TO IMPLEMENT
**Impact**: LOW - Already using SameSite cookies, but CSRF tokens add extra layer

**Implementation Tasks**:
- [ ] Generate CSRF tokens for state-changing operations
- [ ] Validate CSRF tokens on POST/PUT/DELETE requests
- [ ] Include CSRF token in form submissions
- [ ] Handle token rotation on session changes

---

### 9. File Upload Virus Scanning 🦠
**Status**: 🔜 TO IMPLEMENT
**Impact**: LOW - Current file type restrictions are adequate, but scanning adds defense in depth

**Implementation Tasks**:
- [ ] Integrate ClamAV or similar virus scanner
- [ ] Scan all uploaded files before storing
- [ ] Quarantine suspicious files
- [ ] Alert administrators of malware detection
- [ ] Log all scan results

---

## Completed ✅

### GitHub Account Security (Development Accounts)
- ✅ Enabled 2FA on new GitHub account (cosmicflow-space)
- ✅ Created comprehensive backup strategy
- ✅ Documented incident response procedure
- ✅ Created security analysis workflow
- ✅ All repositories migrated to secure account

### Existing Security Measures
- ✅ Magic link authentication (passwordless)
- ✅ Secure token generation (`crypto.randomBytes`)
- ✅ Token expiration (90-day default)
- ✅ Input validation with TypeScript + Zod
- ✅ Authorization checks on protected operations
- ✅ CORS restrictions to known domains
- ✅ Prisma ORM (prevents SQL injection)
- ✅ React XSS protection (auto-escaping)
- ✅ HTTPS in production
- ✅ Environment variable management
- ✅ File type and size validation on uploads
- ✅ Soft deletes for data recovery

---

## Metrics & Success Criteria

### Security Metrics to Track
1. **2FA Adoption Rate**: Target 80% of active users within 3 months
2. **Failed Login Attempts**: Track and alert on anomalies
3. **Session Duration**: Average session length and inactivity timeouts
4. **Security Event Volume**: Monitor audit log activity
5. **Dependency Vulnerabilities**: Zero high/critical vulnerabilities

### User Education Metrics
1. **Security Dashboard Visits**: Track user engagement
2. **2FA Enrollment Completion Rate**: Measure funnel drop-off
3. **Security Notification Open Rate**: Email engagement
4. **Session Revocations**: Proactive security actions by users

---

## Testing Strategy

### Security Testing Checklist
- [ ] Penetration testing after 2FA implementation
- [ ] Session hijacking prevention verification
- [ ] Brute force attack testing with rate limiting
- [ ] XSS vulnerability scanning
- [ ] SQL injection testing (should be prevented by Prisma)
- [ ] CSRF attack simulation
- [ ] File upload security testing
- [ ] Email notification delivery testing

---

## Documentation

### User-Facing Documentation Needed
- [ ] How to enable 2FA guide
- [ ] How to use recovery codes
- [ ] Managing active sessions tutorial
- [ ] Security best practices for users
- [ ] What to do if account is compromised

### Developer Documentation Needed
- [ ] Security architecture overview
- [ ] Authentication flow diagrams
- [ ] Audit logging implementation guide
- [ ] Incident response runbook
- [ ] Backup and restore procedures

---

## Notes

- **Priority Ordering**: Based on likelihood of attack and impact on users
- **Timeline**: Aggressive but achievable with focused effort
- **Dependencies**: 2FA must be implemented before session management
- **Mobile App**: Many features (2FA, session management) need mobile implementation too
- **Backward Compatibility**: Ensure existing users can continue using app during rollout

---

**Last Updated**: October 13, 2025
**Owner**: Sam Muthu
**Status**: In Planning → Implementation Starting
