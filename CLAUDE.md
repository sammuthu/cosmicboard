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

## External Backend Configuration

The application uses an external backend at `cosmicboard-backend`:

```bash
# Backend configuration (already set in .env.local)
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true
NEXT_PUBLIC_BACKEND_URL=http://localhost:7779
```

## Development Authentication (LocalStack)

When running with LocalStack in development mode, authentication is handled automatically:

- **Default User**: `nmuthu@gmail.com` is pre-seeded in the database
- **Auth Token**: `acf42bf1db704dd18e3c64e20f1e73da2f19f8c23cf3bdb7e23c9c2a3c5f1e2d` (seeded in DB)
- **Auto-Login**: Web frontend automatically authenticates using the seeded token - no manual login required
- **Mobile Sync**: Uses the exact same token and flow as the mobile app

This matches the mobile app behavior - when LocalStack is detected, the frontend uses the pre-seeded development user without requiring manual authentication.

## Architecture Overview

### API Communication
- All data operations go through the external backend API
- Frontend uses centralized API client in `/src/lib/api-client.ts`
- No direct database connections from frontend
- Authentication handled by `/src/services/auth.service.ts` with magic link flow

### Key Directories
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - Reusable components using PrismCard design system
- `/src/components/media/` - Media management components
- `/src/lib/` - API client and utilities
- `/src/config/` - Environment configuration
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

### Development Patterns

1. **PrismCard Component Pattern**: All UI elements wrapped in glassmorphic PrismCard for consistent cosmic styling
2. **Soft Delete Pattern**: Tasks use status-based soft delete (ACTIVE/COMPLETED/DELETED)
3. **API Client Abstraction**: Centralized client in `/src/lib/api-client.ts` handles all backend communication
4. **Client-Side Rendering**: Interactive components use 'use client' directive
5. **Error Handling**: Consistent error handling with toast notifications via `sonner`

### Theme System
- 8+ cosmic themes (sun, moon, daylight, universe, cosmic, galaxy, neptune, comet)
- Dynamic CSS animations (floating, drifting, pulsing, particle effects)
- Theme persistence via localStorage
- Custom animations in `/src/styles/globals.css`

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

## Data Models (managed by backend)

- **Project**: id, name, description, metadata, timestamps
- **Task**: id, projectId, priority, status, content, metadata, timestamps
- **Reference**: id, projectId, title, url, description, category, tags, metadata, timestamps
- **Media**: id, projectId, type (photo/screenshot/pdf), name, url, thumbnailUrl, size, mimeType, metadata, timestamps

## Important Notes

- SWR caching for API responses with automatic revalidation
- Turbopack for fast development builds (significantly faster than webpack)
- TypeScript strict mode enabled with path alias `@/*` mapping to `./src/*`
- Environment-aware API routing with automatic backend selection
- Development authentication helper in `/src/lib/dev-auth-helper.ts` for testing
- Media files stored locally in `/public/uploads/` with automatic thumbnail generation