# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the SARE (Stories, Analyses, Reports, and Evaluations) Platform - a Next.js application built with Supabase that helps users collect stories from storytellers, perform self-reflections, and generate comprehensive reports. The platform facilitates structured story collection through email invitations and provides tools for personal reflection and analysis.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15+ with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with cookie-based sessions
- **State Management**: React hooks and server components

### Database Schema
The platform uses five main tables:
- `storytellers`: Manages story contributors and their invitations
- `stories`: Stores collected stories (up to 3 parts each)
- `self_reflections`: User personal reflections (3 questions)
- `certification_leads`: Certification program inquiries
- `contact_messages`: General contact form submissions

All tables implement Row Level Security (RLS) policies for data protection.

### Key Directories

- `app/`: Next.js App Router pages and layouts
  - `auth/`: Authentication pages (login, sign-up, password reset)
  - `protected/`: Pages requiring authentication
- `components/`: React components
  - `ui/`: shadcn/ui components
  - `tutorial/`: Onboarding tutorial components
- `lib/`: Utility functions and configurations
  - `supabase/`: Database client configurations and utilities
- `supabase/`: Database migrations and schema

### Authentication Flow
- Uses Supabase Auth with cookie-based sessions via `@supabase/ssr`
- Middleware handles session refresh and route protection
- Protected routes redirect to `/auth/login` for unauthenticated users
- Three client configurations:
  - `client.ts`: Browser client
  - `server.ts`: Server-side client
  - `middleware.ts`: Middleware client with session management

### Database Integration
- `lib/supabase/database.ts`: Database utility functions
- `lib/supabase/types.ts`: TypeScript interfaces for database tables
- All database operations use typed interfaces for type safety
- Functions handle CRUD operations for all entities

### UI Components
- Built with shadcn/ui component library
- Supports dark/light theme switching via `next-themes`
- Responsive design with Tailwind CSS
- Form components for authentication and data entry

## Environment Variables

Required environment variables (copy from `.env.example`):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Development

### Running Migrations
Migrations are located in `supabase/migrations/` and should be applied through the Supabase dashboard or CLI.

### Database Schema Updates
- Update `lib/supabase/types.ts` when adding new tables or columns
- Add corresponding utility functions in `lib/supabase/database.ts`
- Create appropriate RLS policies for new tables

## Key Features

### Story Collection System
- Users can invite storytellers via email with unique tokens
- Storytellers receive invitations and can submit stories without creating accounts
- Stories are linked to both the storyteller and requesting user
- Support for multi-part stories (up to 3 parts)

### Self-Reflection Module
- Users complete three reflection questions
- Reflections are stored per user (one set per user)
- Can be updated over time

### Onboarding Flow
- Check if environment variables are configured
- Tutorial steps for connecting Supabase and signing up users
- Conditional rendering based on setup status

## Development Notes

### Component Patterns
- Server Components for data fetching by default
- Client Components marked with `"use client"` when needed
- Form components handle their own state and validation
- Consistent error handling and loading states

### Database Patterns
- Use utility functions from `lib/supabase/database.ts` for database operations
- Always use typed interfaces for database operations
- Implement proper error handling for database calls
- Follow RLS policies for data access

### Styling Conventions
- Use Tailwind utility classes
- Leverage shadcn/ui components for consistency
- Support both light and dark themes
- Responsive design with mobile-first approach

### Testing Database Connection
Use `scripts/test-database.ts` to verify database connectivity and operations.