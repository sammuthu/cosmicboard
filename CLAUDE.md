# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Repository Structure

CosmicBoard consists of THREE separate repositories:
1. **Web Frontend** (THIS REPO): `/Users/sammuthu/Projects/cosmicboard` - Next.js web application
2. **Backend API**: `/Users/sammuthu/Projects/cosmicboard-backend` - Express.js API server on port 7779
3. **Mobile App**: `/Users/sammuthu/Projects/cosmicboard-mobile` - React Native (iOS & Android)

**DO NOT** create duplicate backends or mobile apps. Always use the existing repositories above.

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router, React 19, and Turbopack
- **Backend API**: All data operations handled via external backend service
- **Styling**: Tailwind CSS v4 with custom cosmic theme system and animations
- **State Management**: Zustand, SWR for data fetching
- **UI Components**: Custom PrismCard glassmorphic design system, Radix UI, Lucide React icons
- **Markdown**: react-markdown with remark-gfm, Prism.js syntax highlighting

## Development Commands

### Web Frontend (This Repository)
```bash
# Start development server on port 7777 with Turbopack
npm run dev

# Build production bundle
npm run build

# Start production server on port 7777
npm run start

# Run linting
npm run lint
```

### Testing Commands
```bash
# Run E2E tests with Playwright
npx playwright test

# Run specific test file
npx playwright test e2e/user-profile-network.spec.ts

# Run with UI mode for debugging
npx playwright test --ui

# Run with headed browser
npx playwright test --headed

# Generate test report
npx playwright show-report
```

### Backend API (cosmicboard-backend)
```bash
cd /Users/sammuthu/Projects/cosmicboard-backend
npm run dev  # Runs on port 7779
```

### Mobile App (cosmicboard-mobile)
```bash
cd /Users/sammuthu/Projects/cosmicboard-mobile
npm start    # Runs Expo on port 8082
```

## Testing Guidelines

- **Framework**: Playwright for E2E testing with automated screenshot verification
- **Test User**: Always use `nmuthu@gmail.com` for authentication tests
- **Authentication**: Tests automatically handle magic link flows
- **Screenshots**: Automatically captured during test runs - no manual intervention needed
- **Test Location**: All E2E tests in `/e2e/` directory
- **Configuration**: Playwright config at `/playwright.config.ts` with base URL `http://localhost:7777`

## Environment Configuration

The application uses a centralized environment configuration system in `/src/config/environment.ts`:

### Environment Modes
- **development**: Local development (port 7777 frontend, 7779 backend)
- **staging**: Staging deployment
- **production**: Production deployment

### Environment Variables
```bash
# .env.local configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true
NEXT_PUBLIC_BACKEND_URL=http://localhost:7779
```

### Environment-Aware API Routing
The `getApiEndpoint()` function in `/src/config/environment.ts` handles smart API routing:
- **Development with HTTPS domains** (cosmic.board, cosmicspace.app): Uses relative paths for nginx proxy
- **Development with localhost**: Direct backend connection to port 7779
- **Staging/Production**: Uses configured API URLs

### NGINX Proxy Setup (Development)
When accessing via HTTPS domains in development:
- Frontend: `https://cosmicspace.app` or `https://cosmic.board`
- Backend proxied through nginx: `/api` routes forwarded to `http://localhost:7779`
- **IMPORTANT**: nginx configs must be symlinked and restarted properly when modified

## Development Authentication (LocalStack)

When running with LocalStack in development mode, authentication is handled automatically:

- **Default User**: `nmuthu@gmail.com` is pre-seeded in the database
- **Auth Token**: `acf42bf1db704dd18e3c64e20f1e73da2f19f8c23cf3bdb7e23c9c2a3c5f1e2d` (seeded in DB)
- **Auto-Login**: Web frontend automatically authenticates using the seeded token - no manual login required
- **Mobile Sync**: Uses the exact same token and flow as the mobile app
- **Implementation**: See `/src/services/auth.service.ts` for auto-setup logic

This matches the mobile app behavior - when LocalStack is detected, the frontend uses the pre-seeded development user without requiring manual authentication.

## Architecture Overview

### API Communication
- All data operations go through the external backend API
- Frontend uses centralized API client in `/src/lib/api-client.ts`
- No direct database connections from frontend
- Authentication handled by `/src/services/auth.service.ts` with magic link flow
- **Device Headers**: API client automatically sends device info headers (`X-Device-Type`, `X-Device-OS`, `X-Device-Identifier`, `X-Device-Name`)

### Key Directories
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - Reusable components using PrismCard design system
- `/src/components/media/` - Media management components
- `/src/lib/` - API client, utilities, and device info
- `/src/config/` - Environment configuration
- `/src/services/` - Authentication and other services
- `/src/contexts/` - React contexts (Auth, Theme)
- `/src/hooks/` - Custom React hooks
- `/src/types/` - TypeScript type definitions
- `/src/styles/` - Global styles and cosmic theme animations
- `/public/uploads/` - Local storage for uploaded media files
- `/e2e/` - Playwright E2E test files

### Backend API Endpoints
The external backend provides RESTful endpoints:
- `/api/projects` - Project CRUD operations
- `/api/tasks` - Task management
- `/api/tasks/[id]/complete` - Complete a task
- `/api/tasks/[id]/delete` - Soft delete to recycle bin
- `/api/tasks/[id]/restore` - Restore from recycle bin
- `/api/tasks/[id]/purge` - Permanent deletion
- `/api/references` - Reference/documentation management
- `/api/media` - Media listing and filtering
- `/api/media/upload` - File upload (photos, PDFs)
- `/api/media/screenshot` - Screenshot paste handling
- `/api/export` and `/api/import` - Data backup/restore
- `/api/auth/magic-link` - Send magic link for authentication
- `/api/auth/verify-link` - Verify magic link token
- `/api/auth/me` - Get current user profile
- `/api/themes` - Theme management

### Development Patterns

1. **PrismCard Component Pattern**: All UI elements wrapped in glassmorphic PrismCard (`/src/components/PrismCard.tsx`) for consistent cosmic styling with gradient borders and backdrop blur effects
2. **Soft Delete Pattern**: Tasks use status-based soft delete (ACTIVE/COMPLETED/DELETED)
3. **API Client Abstraction**: Centralized client in `/src/lib/api-client.ts` handles all backend communication with automatic auth headers
4. **Client-Side Rendering**: Interactive components use 'use client' directive
5. **Error Handling**: Consistent error handling with toast notifications via `sonner`
6. **Device Info**: Automatic device fingerprinting via `/src/lib/device-info.ts` sent with all API requests

### Theme System
- **Themes**: 8+ cosmic themes (sun, moon, daylight, universe, cosmic, galaxy, neptune, comet, earth, rocket, saturn, sparkle)
- **Dynamic CSS**: Animations (floating, drifting, pulsing, particle effects) in `/src/styles/globals.css`
- **Theme Context**: `/src/contexts/ThemeContext.tsx` manages active theme state
- **Persistence**: Theme stored in localStorage and backend database
- **Per-Device**: Themes can be set globally or per-device using device identifiers
- **Auto-Play**: First-time visitors see theme showcase animation

## Advanced Features

1. **Keyboard Shortcuts**:
   - `Cmd/Ctrl+K` - Global search
   - `Cmd/Ctrl+V` - Paste screenshots directly
   - `Cmd/Ctrl+N` - New project
   - Theme switching shortcuts

2. **Media Management**:
   - Photos: Grid gallery with lightbox viewer, thumbnails auto-generated
   - Screenshots: Paste from clipboard, timeline view, auto-naming
   - PDFs: In-app viewer with zoom and page navigation

3. **Search System**: Full-text search across tasks and projects with highlighting

4. **Data Portability**: Export/import all data as JSON for backup/migration

5. **Markdown Rendering**: Rich text with syntax highlighting for 100+ languages

6. **Network Features**:
   - User profiles with avatars
   - Network sidebar for connections
   - Invite system

## Shared Projects & Visibility System

### Visibility Levels
Projects support three visibility levels controlled via the VisibilityDropdown component:
- **PRIVATE** (🔒): Only the owner can view
- **CONTACTS** (👥): Owner and their contacts (coming soon)
- **PUBLIC** (🌍): Everyone can view

### Implementation
1. **Frontend Components**:
   - `/src/components/VisibilityDropdown.tsx` - Reusable dropdown for quick visibility changes
   - Used in ProjectCard (list view) and project details page header
   - Optimistic updates with error rollback

2. **Backend Access Control**:
   - `GET /api/projects/:id` - Allows viewing public projects by any authenticated user
   - `GET /api/projects/:projectId/tasks` - Respects project visibility for task access
   - Returns `isOwner: boolean` to indicate if viewer is the owner
   - Returns 403 Forbidden for private projects accessed by non-owners

3. **Discover Feed**:
   - `/api/discover` - Shows public content from all users (excluding viewer's own content)
   - Uses ContentVisibility table for efficient querying
   - Supports infinite scroll with cursor-based pagination
   - Click on PROJECT cards navigates to read-only view for non-owners

4. **ContentVisibility Sync**:
   - All visibility changes automatically sync to ContentVisibility table
   - Ensures discover feed stays up-to-date with project visibility
   - Implemented in `/Users/sammuthu/Projects/cosmicboard-backend/src/routes/projects.ts`

### Current Capabilities (Read-Only Sharing)
✅ **Implemented**:
- View public projects and their details
- View tasks within public projects
- Project cards in discover feed are clickable
- Access control enforced at API level

### Future Operations (To Be Implemented)
🔜 **Planned Features**:
- **Comment on shared projects**: Add comments/feedback on public projects
- **Amplify/Like**: Show appreciation for shared content
- **Bookmark**: Save public projects to personal collection
- **Fork/Clone**: Create personal copy of public project structure
- **Suggest edits**: Propose changes to public projects (owner approval)
- **Subscribe**: Get notifications when public project is updated
- **Share metrics**: View engagement stats (views, likes, comments) on your public projects
- **Collaboration**: Invite specific users to co-edit (beyond public visibility)
- **CONTACTS visibility**: Share with your contact list only

### Technical Notes
- Visibility changes trigger upsertContentVisibility() to sync changes
- Frontend uses optimistic updates for instant feedback
- Backend enforces permissions on all project-related endpoints
- Non-owners see read-only view (no edit/delete actions)

## Data Models (managed by backend)

- **Project**: id, name, description, priority (SUPERNOVA/STELLAR/NEBULA), visibility (PUBLIC/CONTACTS/PRIVATE), metadata, timestamps
- **Task**: id, projectId, priority, status, content, metadata, timestamps
- **Reference**: id, projectId, title, url, description, category, tags, metadata, timestamps
- **Media**: id, projectId, type (photo/screenshot/pdf), name, url, thumbnailUrl, size, mimeType, metadata, timestamps
- **User**: id, email, name, username, avatar, bio, deviceId, timestamps
- **Theme**: id, userId, themeId, isGlobal, deviceType, customizations, timestamps
- **ContentVisibility**: id, contentType, contentId, visibility, ownerId, timestamps - Central table tracking visibility of all shareable content

## Security Guidelines

**CRITICAL**: Security is paramount. Every feature must be built with security-first approach to protect our users.

### Authentication & Authorization

1. **Magic Link Authentication**:
   - ✅ Passwordless authentication reduces credential theft risk
   - ✅ Magic link tokens expire after use or timeout
   - ✅ Tokens are cryptographically secure (generated via `crypto.randomBytes`)
   - ⚠️ **NEVER** log authentication tokens in production
   - ⚠️ **NEVER** include tokens in error messages or client-side JavaScript

2. **Session Management**:
   - ✅ Use secure, httpOnly cookies for session tokens
   - ✅ Implement session expiration (90-day default for dev tokens)
   - ✅ Rotate tokens on privilege escalation
   - ✅ Implement logout functionality that invalidates all tokens
   - ⚠️ **NEVER** store sensitive tokens in localStorage or sessionStorage

3. **Multi-Factor Authentication (2FA)**:
   - 🔜 **TO IMPLEMENT**: Add 2FA support for user accounts
   - 🔜 Time-based OTP (TOTP) or SMS-based verification
   - 🔜 Recovery codes for account access if 2FA device is lost
   - 🔜 Force 2FA for accounts with elevated privileges

### API Security

1. **Input Validation**:
   - ✅ Validate ALL user inputs on both client and server
   - ✅ Use TypeScript types and Zod schemas for validation
   - ⚠️ **NEVER** trust client-side validation alone
   - ⚠️ Sanitize inputs before database operations
   - ⚠️ Validate file uploads (type, size, content)

2. **Authorization Checks**:
   - ✅ Verify user ownership before CRUD operations
   - ✅ Check project visibility before allowing access
   - ✅ Implement role-based access control (RBAC)
   - ⚠️ **NEVER** rely on client-side permission checks only
   - ⚠️ **ALWAYS** verify permissions on the backend

3. **Rate Limiting**:
   - 🔜 **TO IMPLEMENT**: Add rate limiting to API endpoints
   - 🔜 Prevent brute force attacks on authentication
   - 🔜 Protect against DoS attacks
   - 🔜 Implement per-IP and per-user rate limits

4. **CORS Configuration**:
   - ✅ Restrict CORS to known domains only
   - ⚠️ **NEVER** use `Access-Control-Allow-Origin: *` in production
   - ✅ Validate Origin header on sensitive operations
   - Current allowed origins: localhost:7777, cosmic.board, cosmicspace.app

### Data Protection

1. **Sensitive Data Handling**:
   - ⚠️ **NEVER** log sensitive user data (emails, tokens, passwords)
   - ⚠️ **NEVER** expose user emails in public APIs
   - ✅ Use environment variables for secrets (API keys, database credentials)
   - ✅ Implement proper `.gitignore` to exclude `.env` files
   - ✅ Redact sensitive data in error messages

2. **Database Security**:
   - ✅ Use parameterized queries (Prisma ORM prevents SQL injection)
   - ✅ Implement soft deletes for data recovery
   - ✅ Encrypt sensitive fields at rest
   - 🔜 **TO IMPLEMENT**: Regular automated backups
   - 🔜 **TO IMPLEMENT**: Audit logs for sensitive operations

3. **File Upload Security**:
   - ✅ Validate file types (allow photos, PDFs only)
   - ✅ Limit file sizes (prevent storage exhaustion)
   - ✅ Store files outside web root when possible
   - 🔜 **TO IMPLEMENT**: Virus scanning for uploaded files
   - ⚠️ **NEVER** execute uploaded files
   - ⚠️ **NEVER** trust file extensions alone (check MIME types)

### Frontend Security

1. **XSS Prevention**:
   - ✅ React escapes output by default
   - ⚠️ **NEVER** use `dangerouslySetInnerHTML` without sanitization
   - ✅ Use DOMPurify for sanitizing HTML if needed
   - ✅ Validate and sanitize markdown content
   - ⚠️ Be cautious with `eval()`, `Function()`, `innerHTML`

2. **CSRF Protection**:
   - 🔜 **TO IMPLEMENT**: CSRF tokens for state-changing operations
   - ✅ Use SameSite cookies
   - ✅ Verify Origin/Referer headers

3. **Client-Side Storage**:
   - ⚠️ **NEVER** store authentication tokens in localStorage
   - ⚠️ **NEVER** store sensitive user data client-side
   - ✅ Use httpOnly cookies for authentication
   - ✅ Clear sensitive data on logout

### Infrastructure Security

1. **HTTPS/TLS**:
   - ✅ Use HTTPS in production (cosmic.board, cosmicspace.app)
   - ✅ Enforce TLS 1.2+ minimum
   - ⚠️ **NEVER** send credentials over HTTP
   - ✅ Use HSTS headers in production

2. **Environment Separation**:
   - ✅ Separate development, staging, and production environments
   - ✅ Use different credentials for each environment
   - ✅ Never use production credentials in development
   - ✅ LocalStack for AWS services in development

3. **Dependency Security**:
   - 🔜 **TO IMPLEMENT**: Regular `npm audit` and dependency updates
   - 🔜 Use Dependabot for automated security updates
   - ⚠️ Review dependencies before adding them
   - ⚠️ Avoid unmaintained packages

### Incident Response

1. **Security Monitoring**:
   - 🔜 **TO IMPLEMENT**: Log all authentication attempts
   - 🔜 Monitor for suspicious activity patterns
   - 🔜 Alert on multiple failed login attempts
   - 🔜 Track API abuse and anomalies

2. **Breach Response Plan**:
   - 📋 **DOCUMENTED**: Immediately rotate all credentials
   - 📋 Disconnect compromised systems from network
   - 📋 Perform comprehensive security analysis
   - 📋 Create full backups before remediation
   - 📋 Notify affected users if data breach occurs
   - 📋 Document incident timeline and lessons learned

3. **Account Recovery**:
   - 🔜 **TO IMPLEMENT**: Secure account recovery flow
   - 🔜 Email verification for password resets
   - 🔜 Security questions or backup codes
   - 🔜 Account lockout after multiple failed attempts

### User Education

1. **Security Features to Implement**:
   - 🔜 2FA enrollment prompts for all users
   - 🔜 Password strength indicators (when implemented)
   - 🔜 Security dashboard showing active sessions
   - 🔜 Email notifications for security events (new login, password change)
   - 🔜 Option to review and revoke active sessions

2. **Best Practices**:
   - Encourage users to enable 2FA
   - Provide security tips in onboarding
   - Warn users about phishing attempts
   - Regular security reminders in app

### Code Review Checklist

Before merging any code, verify:
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Authorization checks on protected operations
- [ ] Sensitive data not logged or exposed
- [ ] Dependencies are up-to-date and secure
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive info
- [ ] File uploads properly validated
- [ ] SQL injection prevention (use Prisma ORM)
- [ ] XSS prevention (avoid dangerouslySetInnerHTML)

### Security Lessons Learned

**GitHub Account Compromise (October 12, 2025)**:
- ✅ Importance of 2FA for all accounts
- ✅ Regular security audits and monitoring
- ✅ Immediate response plan (disconnect, backup, analyze)
- ✅ Multiple backup strategies (local + cloud)
- ✅ Documentation of security incidents
- ✅ Apply same security standards to user accounts

**Action Items from Incident**:
1. ✅ Enable 2FA on all development accounts
2. 🔜 Implement 2FA for CosmicBoard users
3. 🔜 Add session management and active device tracking
4. 🔜 Implement security audit logs
5. 🔜 Add email notifications for security events
6. 🔜 Create user security dashboard

### Security Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Security Best Practices**: https://nodejs.org/en/docs/guides/security/
- **Next.js Security Headers**: https://nextjs.org/docs/advanced-features/security-headers
- **GitHub Security**: https://docs.github.com/en/code-security

## Important Notes

- **SWR caching** for API responses with automatic revalidation
- **Turbopack** for fast development builds (significantly faster than webpack)
- **TypeScript strict mode** enabled with path alias `@/*` mapping to `./src/*`
- **Environment-aware API routing** with automatic backend selection based on domain/protocol
- **Development authentication helper** in `/src/lib/dev-auth-helper.ts` for testing
- **Media files** stored locally in `/public/uploads/` with automatic thumbnail generation
- **Device fingerprinting** creates consistent device IDs based on user agent, screen resolution, color depth, and timezone
- **CORS configuration** allows multiple origins including localhost, cosmic.board, and cosmicspace.app domains
