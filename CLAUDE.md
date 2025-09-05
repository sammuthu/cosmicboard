# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CosmicBoard is a Next.js-based task management application with AI-augmented features and a cosmic theme system. It's a personal portfolio project showcasing modern web development patterns and AI-assisted workflows.

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router, React 19, and Turbopack
- **Databases**: Dual support - MongoDB (Mongoose) and PostgreSQL (Prisma) - currently migrating from MongoDB to PostgreSQL
- **Styling**: Tailwind CSS v4 with custom cosmic theme system and animations
- **State Management**: Zustand, SWR for data fetching
- **UI Components**: Custom PrismCard glassmorphic design system, Radix UI, Lucide React icons
- **Markdown**: react-markdown with remark-gfm, Prism.js syntax highlighting
- **Analytics**: Vercel Analytics

## Development Commands

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

## Environment Setup

### Database Options

The project supports two database configurations:

1. **MongoDB** (legacy, being phased out):
```bash
# Connection string in .env
MONGODB_URI=mongodb://localhost:27017/cosmicboard
```

2. **PostgreSQL** (primary, via Docker):
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

### External Backend Support

The application can use either internal Next.js API routes or connect to an external backend:

```bash
# Optional: Use external backend API
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true
NEXT_PUBLIC_BACKEND_URL=http://localhost:7778
```

## Architecture

### Database Migration Status

**IMPORTANT**: The codebase is migrating from MongoDB to PostgreSQL. Current state:
- MongoDB models in `/src/models/` (Project, Task, Reference)
- Prisma schema in `/prisma/schema.prisma` for PostgreSQL
- Some API routes use Mongoose, others use Prisma
- Check individual API route implementations to determine which database is used

### Directory Structure
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - Reusable components using PrismCard design system
- `/src/models/` - Mongoose models (MongoDB - legacy)
- `/prisma/` - Prisma schema and migrations (PostgreSQL - current)
- `/src/lib/` - Database connections, utilities, API client
- `/src/hooks/` - Custom React hooks (keyboard shortcuts, etc.)
- `/src/types/` - TypeScript type definitions
- `/src/styles/` - Global styles and cosmic theme animations

### API Routes Pattern

RESTful endpoints under `/api/` with action-based nested routes:
- `/api/projects` - Project CRUD operations
- `/api/tasks` - Task management
- `/api/tasks/[id]/complete` - Complete a task
- `/api/tasks/[id]/delete` - Soft delete to recycle bin
- `/api/tasks/[id]/restore` - Restore from recycle bin
- `/api/tasks/[id]/purge` - Permanent deletion
- `/api/references` - Reference/documentation management
- `/api/export` and `/api/import` - Data backup/restore
- `/api/current-priority` - Current task priority management

### Key Architectural Patterns

1. **PrismCard Component Pattern**: All UI elements wrapped in glassmorphic PrismCard for consistent cosmic styling
2. **Soft Delete Pattern**: Tasks use status-based soft delete (ACTIVE/COMPLETED/DELETED)
3. **API Client Abstraction**: Centralized client in `/src/lib/api-client.ts` handles internal/external backend switching
4. **JSONB Metadata**: PostgreSQL JSONB fields for flexible schema extension
5. **Client-Side Rendering**: All interactive components use 'use client' directive

### Theme System

Complex cosmic theme architecture with:
- 5+ themes (sun, moon, universe, cosmic, galaxy, neptune)
- Dynamic CSS animations (floating, drifting, pulsing, particle effects)
- Theme persistence via localStorage
- Keyboard shortcuts for theme switching
- Custom animations in `/src/styles/globals.css`

### Advanced Features

1. **Keyboard Shortcuts**: 
   - `Cmd/Ctrl+K` - Global search
   - Theme switching shortcuts
   - Navigation shortcuts

2. **Search System**: Full-text search across tasks and projects with highlighting

3. **Data Portability**: Export/import all data as JSON for backup/migration

4. **Markdown Rendering**: Rich text with syntax highlighting for 100+ languages

## Database Schema

### PostgreSQL (Prisma) - Current
- **Project**: id, name, description, metadata (JSONB), timestamps
- **Task**: id, projectId, priority, status, content, metadata (JSONB), timestamps  
- **Reference**: id, projectId, title, url, description, metadata (JSONB), timestamps

### MongoDB (Mongoose) - Legacy
- Similar structure but using MongoDB ObjectIds and embedded documents

## Performance Considerations

- Database indexes on foreign keys and commonly queried fields
- SWR caching for API responses
- Turbopack for fast development builds
- Optimistic UI updates for better perceived performance

## TypeScript Configuration

- Strict mode enabled
- Path alias `@/*` maps to `./src/*`
- Target ES2017 with ESNext library features