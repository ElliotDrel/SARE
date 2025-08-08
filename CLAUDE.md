# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SARE (Strengths in Action Reflection Experience) is a React TypeScript application that helps users collect positive stories from people who know them, reflect on those stories, and receive a strengths report. Built with Vite, React, TypeScript, shadcn/ui, Tailwind CSS, and Supabase.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Supabase Database Commands
- `npx supabase db push --linked` - Apply migrations to cloud database
- `npx supabase db push --linked --dry-run` - Preview migrations without applying
- `npx supabase migration list --linked` - View migration status
- `npx supabase migration new <name>` - Create new migration file
- `npx supabase migration repair --status reverted <migration_id>` - Repair migration status

#### Supabase CLI Prerequisites
- Authentication required: `npx supabase login` (one-time setup)
- Database password in environment: Set `SUPABASE_DB_PASSWORD` in `.env` file  
- Project linked to cloud database (ref: `fapgoifqhtoryzykziye`)
- Use migrations for repeatable, tracked database changes

### Package Management
- Uses npm (package-lock.json present)

## Architecture Overview

### Core Structure
- **Frontend**: React 18 with TypeScript in strict mode (some strict checks disabled in tsconfig.json)
- **Routing**: React Router DOM with BrowserRouter
- **State Management**: TanStack Query for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom configuration
- **Database**: Supabase for backend services

### Key Directories
- `src/components/` - React components including extensive shadcn/ui library
- `src/pages/` - Route components (Index, About, SignIn, SignUp, NotFound)
- `src/hooks/` - Custom hooks including useAuth and toast hooks
- `src/integrations/supabase/` - Supabase client and type definitions
- `src/lib/` - Utility functions
- `supabase/` - Database migrations and configuration

### Application Flow
The app follows a multi-stage user journey:
1. **Learn and Prepare** - User learns who to ask and how
2. **Collect Stories** - User invites storytellers and tracks responses
3. **Self Reflection** - User completes guided reflection (unlocks after story target met)
4. **Strengths Report** - Compiled report with user reflection and all stories

### Key Business Rules
- Users cannot read collected stories until the defined collection goal is met AND reflection is complete
- Default collection goal is 10 stories (configurable within allowed range)
- Story access is gated to preserve research integrity

## Configuration Details

### Path Aliases
- `@/` maps to `./src/` (configured in vite.config.ts and tsconfig.json)

### Development Setup
- Vite dev server runs on `::` (all interfaces) port 8080
- Hot reload enabled with React SWC plugin
- Component tagger enabled in development mode only

### TypeScript Configuration
- Uses project references with separate app and node configs
- Some strict checks disabled for flexibility (noImplicitAny, strictNullChecks, etc.)
- Base URL set to "." with path mapping

### Database & Backend
- Supabase integration with typed client and backend services
- Client configured with public URL and anon key
- Migrations located in `supabase/migrations/` for schema changes

## Development Notes

### Component Architecture
- Extensive shadcn/ui component library in `src/components/ui/`
- Custom components for business logic (Header, Footer, JourneyOverview, ProgressTimeline)
- Toast notifications using both radix toast and sonner

### Authentication
- Custom useAuth hook for authentication state
- Supabase handles auth backend
- Sign in/up pages implemented

### Styling Approach
- Tailwind CSS with custom configuration
- Component variants using class-variance-authority
- Responsive design patterns throughout

### State Management Pattern
- TanStack Query for server state caching and synchronization
- React hooks for local component state
- Context providers for global UI state (tooltips, toasts)

## Important Files to Understand
- `src/App.tsx` - Main app component with routing setup
- `src/integrations/supabase/client.ts` - Database client configuration
- `vite.config.ts` - Build tool configuration
- `package.json` - Dependencies and scripts