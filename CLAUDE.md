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
- **Databases**: Dual support - MongoDB (Mongoose) and PostgreSQL (Prisma) - currently migrating from MongoDB to PostgreSQL
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

# Start production server
npm run start

# Run linting
npm run lint

# Seed database with initial data
npm run seed

# Prisma commands (for PostgreSQL)
npx prisma generate     # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI
npx prisma db push      # Sync schema without migration
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

## Database Setup

### PostgreSQL (Primary - via Docker)
```bash
# Start PostgreSQL container
docker run -d --name cosmicboard_postgres \
  -e POSTGRES_DB=cosmicboard \
  -e POSTGRES_USER=cosmicuser \
  -e POSTGRES_PASSWORD=cosmic123! \
  -p 5432:5432 postgres:16-alpine

# Connection string in .env
DATABASE_URL=postgresql://cosmicuser:cosmic123!@localhost:5432/cosmicboard
```

### MongoDB (Legacy - being phased out)
```bash
# Connection string in .env
MONGODB_URI=mongodb://localhost:27017/cosmicboard
```

## External Backend Configuration

The application uses an external backend at `cosmicboard-backend`:

```bash
# Backend configuration (already set in .env.local)
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true
NEXT_PUBLIC_BACKEND_URL=http://localhost:7779
```

## Architecture Overview

### Database Migration Status
- MongoDB models in `/src/models/` (Project, Task, Reference) - legacy
- Prisma schema in `/prisma/schema.prisma` for PostgreSQL - current
- Media features exclusively use Prisma/PostgreSQL
- Check individual API route implementations to determine which database is used

### Key Directories
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - Reusable components using PrismCard design system
- `/src/components/media/` - Media management components
- `/src/models/` - Mongoose models (MongoDB - legacy)
- `/prisma/` - Prisma schema and migrations (PostgreSQL - current)
- `/src/lib/` - Database connections, utilities, API client
- `/src/config/` - Environment configuration
- `/src/hooks/` - Custom React hooks
- `/src/types/` - TypeScript type definitions
- `/src/styles/` - Global styles and cosmic theme animations
- `/public/uploads/` - Local storage for uploaded media files

### API Routes Pattern
RESTful endpoints under `/api/` with action-based nested routes:
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
3. **API Client Abstraction**: Centralized client in `/src/lib/api-client.ts` handles internal/external backend switching
4. **JSONB Metadata**: PostgreSQL JSONB fields for flexible schema extension
5. **Client-Side Rendering**: Interactive components use 'use client' directive

### Theme System
- 5+ cosmic themes (sun, moon, universe, cosmic, galaxy, neptune)
- Dynamic CSS animations (floating, drifting, pulsing, particle effects)
- Theme persistence via localStorage
- Custom animations in `/src/styles/globals.css`

## Advanced Features

1. **Keyboard Shortcuts**: 
   - `Cmd/Ctrl+K` - Global search
   - `Cmd/Ctrl+V` - Paste screenshots directly
   - Theme switching shortcuts

2. **Media Management**:
   - Photos: Grid gallery with lightbox viewer, thumbnails auto-generated
   - Screenshots: Paste from clipboard, timeline view, auto-naming
   - PDFs: In-app viewer with zoom and page navigation

3. **Search System**: Full-text search across tasks and projects with highlighting

4. **Data Portability**: Export/import all data as JSON for backup/migration

5. **Markdown Rendering**: Rich text with syntax highlighting for 100+ languages

## Database Schema

### PostgreSQL (Prisma) - Current
- **Project**: id, name, description, metadata (JSONB), timestamps
- **Task**: id, projectId, priority, status, content, metadata (JSONB), timestamps  
- **Reference**: id, projectId, title, url, description, metadata (JSONB), timestamps
- **Media**: id, projectId, type (photo/screenshot/pdf), name, url, thumbnailUrl, size, mimeType, metadata (JSONB), timestamps

### MongoDB (Mongoose) - Legacy
- Similar structure but using MongoDB ObjectIds and embedded documents

## Important Notes

- **WARNING**: Never run `prisma migrate reset` or any destructive migration commands without explicit permission
- Database indexes exist on foreign keys and commonly queried fields
- SWR caching for API responses
- Turbopack for fast development builds
- TypeScript strict mode enabled with path alias `@/*` mapping to `./src/*`
- Add to memory. "Always use Playwright framework for automated end to end testing and you should be taking screenshots automatically without manual intervention to verify the feature is working, and alway use the nmuthu@gmail.com  user for testing and the test should automatically populate and get the magic link for authentication"