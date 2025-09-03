# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CosmicBoard is a Next.js-based task management application with AI-augmented features. It's a personal portfolio project showcasing AI-assisted development workflows.

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router and React 19
- **Styling**: Tailwind CSS v4 with Typography plugin
- **Database**: MongoDB with Mongoose ODM
- **State Management**: Zustand
- **UI Components**: Custom components with Radix UI, Lucide React icons
- **Markdown**: react-markdown with remark-gfm and Prism.js for syntax highlighting
- **Analytics**: Vercel Analytics

## Development Commands

```bash
# Start development server on port 7777
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Seed database with initial data
npm run seed
```

## Architecture

### Directory Structure
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - Reusable React components (PrismCard, ProjectCard, SearchModal, etc.)
- `/src/models/` - Mongoose models (Project, Task, Reference)
- `/src/lib/` - Utilities and database connection
- `/src/hooks/` - Custom React hooks
- `/src/types/` - TypeScript type definitions

### Database Models

The application uses MongoDB with three main models:
- **Project**: Contains name, description, timestamps
- **Task**: Linked to projects, includes priority, status, content
- **Reference**: Associated with projects for documentation links

### API Routes Pattern

All API endpoints follow RESTful conventions under `/api/`:
- `/api/projects` - CRUD operations for projects
- `/api/tasks` - Task management with search, complete, delete, restore
- `/api/references` - Reference management
- `/api/export` and `/api/import` - Data backup/restore functionality
- `/api/current-priority` - Current task priority management

### Key Features

1. **Theme System**: Multiple cosmic themes with localStorage persistence
2. **Search Modal**: Global search with keyboard shortcut (Cmd/Ctrl+K)
3. **Task Management**: Full CRUD with soft delete and recycle bin
4. **Data Portability**: Export/import functionality for all data
5. **Markdown Rendering**: Rich text support with syntax highlighting

### Component Patterns

- Uses custom `PrismCard` wrapper for consistent glassmorphic styling
- Components follow client-side rendering pattern with 'use client' directive
- State management via React hooks and SWR for data fetching
- Toast notifications using Sonner library

### Database Connection

MongoDB connection is managed through `/src/lib/db.ts` with connection pooling for serverless environments. Default connection string: `mongodb://localhost:27017/cosmicboard`

## TypeScript Configuration

- Strict mode enabled
- Path alias `@/*` maps to `./src/*`
- Target ES2017 with ESNext library features