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

# Test database schema and connectivity
npx tsx scripts/test-database.ts
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15+ with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components (New York style)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with cookie-based sessions
- **State Management**: React hooks and server components
- **PDF Generation**: pdf-lib for report generation
- **File Operations**: file-saver for download functionality
- **UI Components**: Radix UI primitives with shadcn/ui wrapper

### Database Schema
The platform uses five main tables:
- `storytellers`: Manages story contributors and their invitations
  - Supports both invited storytellers and registered storyteller users
  - Uses `storyteller_user_id` to link to auth.users when storytellers sign up
- `stories`: Stores collected stories (up to 3 parts each)
- `self_reflections`: User personal reflections (3 questions)
- `certification_leads`: Certification program inquiries
- `contact_messages`: General contact form submissions

All tables implement Row Level Security (RLS) policies for data protection.
Database includes automated triggers for:
- Updating `story_submitted_at` when stories are submitted
- Maintaining `updated_at` timestamps on self_reflections

### Key Directories

- `app/`: Next.js App Router pages and layouts
  - `auth/`: Authentication pages (login, sign-up, password reset)
  - `protected/`: Pages requiring authentication
    - `onboarding/`: Multi-step onboarding flow (intro, storytellers, send_collect, self_reflection, report)
  - `story_*/`: Story-related pages for public storyteller interactions
    - `story_invite/`: Landing page for storyteller invitations
    - `story_signup/`: Storyteller registration page
    - `story_submit/`: Story submission form
    - `story_thank_you/`: Post-submission confirmation
  - `about/`, `contact/`, `research/`: Public pages
- `components/`: React components
  - `ui/`: shadcn/ui components (New York style)
  - `tutorial/`: Onboarding tutorial components
  - Form components for authentication and data entry
- `lib/`: Utility functions and configurations
  - `supabase/`: Database client configurations and utilities
- `supabase/`: Database migrations and schema
- `scripts/`: Development utilities (database testing)

### Authentication Flow
- Uses Supabase Auth with cookie-based sessions via `@supabase/ssr`
- Middleware handles session refresh and route protection
- Protected routes redirect to `/auth/login` for unauthenticated users
- Three client configurations:
  - `client.ts`: Browser client
  - `server.ts`: Server-side client
  - `middleware.ts`: Middleware client with session management
- Dual user system:
  - Regular users: Create and manage story collection
  - Storytellers: Can optionally register to track their submissions

### Database Integration
- `lib/supabase/database.ts`: Database utility functions
- `lib/supabase/types.ts`: TypeScript interfaces for database tables
- All database operations use typed interfaces for type safety
- Functions handle CRUD operations for all entities
- Special functions for storyteller management:
  - `getStorytellerByToken()`: Token-based story submission
  - `getStorytellerByEmail()`: Email-based lookups
  - `getStorytellerDetails()`: View for storyteller user profiles
  - `checkOnboardingStatus()`: Progress tracking utility

### UI Components
- Built with shadcn/ui component library (New York style)
- Supports dark/light theme switching via `next-themes`
- Responsive design with Tailwind CSS
- Form components for authentication and data entry
- Uses Radix UI primitives for accessibility
- Lucide React for icons
- Components configured via `components.json` with path aliases

## Environment Variables

Required environment variables (copy from `.env.example`):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For local development, create `.env.local` file with these values.

## Database Development

### Running Migrations
Migrations are located in `supabase/migrations/` and should be applied through the Supabase dashboard or CLI.

Current migrations:
- `001_create_sare_tables.sql`: Creates all tables, RLS policies, and triggers
- `002_add_storyteller_user_id.sql`: Adds storyteller user linking
- `003_create_storyteller_details_view.sql`: Creates storyteller details view

### Database Schema Updates
- Update `lib/supabase/types.ts` when adding new tables or columns
- Add corresponding utility functions in `lib/supabase/database.ts`
- Create appropriate RLS policies for new tables
- Test changes using `scripts/test-database.ts`

## Key Features

### Story Collection System
- Users can invite storytellers via email with unique tokens
- Storytellers receive invitations and can submit stories without creating accounts
- Stories are linked to both the storyteller and requesting user
- Support for multi-part stories (up to 3 parts)
- Storytellers can optionally register to track their submissions

### Self-Reflection Module
- Users complete three reflection questions
- Reflections are stored per user (one set per user)
- Can be updated over time

### Report Generation
- PDF report generation using pdf-lib
- Includes collected stories and self-reflections
- Downloadable via file-saver

### Onboarding Flow
- Check if environment variables are configured
- Tutorial steps for connecting Supabase and signing up users
- Conditional rendering based on setup status
- Multi-step process: intro → storytellers → send_collect → self_reflection → report

## Development Notes

### Component Patterns
- Server Components for data fetching by default
- Client Components marked with `"use client"` when needed
- Form components handle their own state and validation
- Consistent error handling and loading states
- Action-based form submissions for server-side processing

### Database Patterns
- Use utility functions from `lib/supabase/database.ts` for database operations
- Always use typed interfaces for database operations
- Implement proper error handling for database calls
- Follow RLS policies for data access
- Use `Insert` types for creating new records
- Leverage database views for complex queries (e.g., `storyteller_details`)

### Styling Conventions
- Use Tailwind utility classes
- Leverage shadcn/ui components for consistency
- Support both light and dark themes
- Responsive design with mobile-first approach
- CSS variables for theming (defined in `globals.css`)

### File Structure Patterns
- Server Actions in dedicated `actions.ts` files
- Client components in separate files when interactivity is needed
- Form components separated from page components
- Utility functions centralized in `lib/utils.ts`

### Testing and Verification
- Use `scripts/test-database.ts` to verify database connectivity and operations
- No formal testing framework currently configured
- Manual testing through the application flow

### Configuration Files
- `components.json`: shadcn/ui configuration
- `tailwind.config.ts`: Tailwind CSS configuration with design tokens
- `next.config.ts`: Next.js configuration (minimal)
- `middleware.ts`: Route protection and session management