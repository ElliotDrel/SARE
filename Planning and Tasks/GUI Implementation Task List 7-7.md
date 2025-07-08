# SARE Platform Implementation Task List

Based on GUI Website Plan 7-7.md - Created for systematic implementation

## Prerequisites & Setup Tasks

### Task 1: Database Schema Setup ✅ COMPLETED
**Priority**: High  
**Location**: Supabase Dashboard  
**Details**:
- [x] Create `storytellers` table with columns:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to auth.users)
  - `name` (text, required)
  - `email` (text, required)
  - `phone` (text, optional)
  - `invite_token` (text, unique)
  - `invite_sent_at` (timestamp)
  - `story_submitted_at` (timestamp)
  - `created_at` (timestamp)
- [x] Create `stories` table with columns:
  - `id` (UUID, primary key)
  - `storyteller_id` (UUID, foreign key to storytellers)
  - `user_id` (UUID, foreign key to auth.users)
  - `story_part_1` (text, required)
  - `story_part_2` (text, optional)
  - `story_part_3` (text, optional)
  - `submitted_at` (timestamp)
- [x] Create `self_reflections` table with columns:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to auth.users)
  - `reflection_1` (text)
  - `reflection_2` (text)
  - `reflection_3` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- [x] Create `certification_leads` table with columns:
  - `id` (UUID, primary key)
  - `name` (text, required)
  - `email` (text, required)
  - `organization` (text)
  - `message` (text)
  - `created_at` (timestamp)
- [x] Create `contact_messages` table with columns:
  - `id` (UUID, primary key)
  - `name` (text, required)
  - `email` (text, required)
  - `message` (text, required)
  - `created_at` (timestamp)
- [x] Set up Row Level Security (RLS) policies for each table

**Completion Details**:
- Created SQL migration file: `supabase/migrations/001_create_sare_tables.sql`
- Created TypeScript types: `lib/supabase/types.ts`
- Created database utility functions: `lib/supabase/database.ts`
- Created test script: `scripts/test-database.ts`
- Created documentation: `supabase/migrations/README.md`
- Added automatic triggers for updating timestamps and story submission status

### Task 2: Global Styling Setup ✅ COMPLETED
**Priority**: High  
**Location**: `app/globals.css`  
**Details**:
- [x] Add CSS custom properties for brand colors:
  ```css
  :root {
    --primary-teal: #00707C;
    --accent-coral: #FF6A57;
    --neutral-white: #FFFFFF;
    --neutral-charcoal: #333333;
  }
  ```
- [x] Update font-family to use system font stack:
  ```css
  body {
    font-family: system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  ```
- [x] Create utility classes for common spacing and layout patterns

**Completion Details**:
- Created SARE brand color CSS custom properties with HSL values compatible with shadcn/ui
- Integrated brand colors into shadcn/ui theme variables for both light and dark modes
- Added system font stack to body element
- Created comprehensive utility classes including:
  - Brand color utilities (text, background, border)
  - Layout utilities (container-sare, section-spacing, card-spacing)
  - Typography utilities (heading-xl/lg/md/sm, body-lg/md)
- All utilities follow responsive design patterns with mobile-first approach

## Global Components Tasks

### Task 3: Create Header Component ✅ COMPLETED
**Priority**: High  
**Location**: `components/header.tsx`  
**Details**:
- [x] Create new component file
- [x] Add logo linking to home (use Next.js Link component)
- [x] Create navigation with links: Home, About, Research, Purchase, Certification, Contact
- [x] Import and place existing `AuthButton` component at top right
- [x] Make header responsive with mobile menu
- [x] Style with primary teal background

**Completion Details**:
- Created responsive header component with sticky positioning
- Implemented SARE logo as home link
- Added desktop navigation with all required links
- Integrated existing AuthButton component for authentication
- Created mobile-responsive hamburger menu with toggle functionality
- Applied primary teal background with accent coral hover states
- Used container-sare utility class for consistent spacing
- Added proper accessibility with menu icons from lucide-react

### Task 4: Create Footer Component ✅ COMPLETED
**Priority**: High  
**Location**: `components/footer.tsx`  
**Details**:
- [x] Create new component file
- [x] Add "Connect with us" section with email link and social icons
- [x] Add secondary navigation: Privacy Policy, Accessibility, Terms of Service
- [x] Add copyright line with current year
- [x] Style with charcoal background and white text

**Completion Details**:
- Created responsive footer component with 3-column grid layout
- Added "Connect with us" section with social media icons (Email, Twitter, LinkedIn, Facebook)
- Implemented secondary navigation with legal page links
- Added company information section with SARE description
- Created dynamic copyright line with current year
- Applied neutral-charcoal background with white text and accent-coral hover states
- Used container-sare utility class for consistent spacing
- Added proper accessibility with aria-labels for social icons
- Responsive design that stacks on mobile devices

### Task 5: Update Root Layout ✅ COMPLETED
**Priority**: High  
**Location**: `app/layout.tsx`  
**Details**:
- [x] Import Header and Footer components
- [x] Wrap children with Header above and Footer below
- [x] Ensure proper spacing and layout structure

**Completion Details**:
- Added Header and Footer component imports
- Created flex layout structure with min-h-screen for full viewport height
- Wrapped children in semantic `<main>` element with flex-1 to expand content area
- Preserved existing ThemeProvider, metadata, and font configurations
- Implemented proper sticky footer layout using flexbox
- Header positioned at top, Footer at bottom, main content fills remaining space

## Public Pages Tasks

### Task 6: Create Home Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/page.tsx`  
**Details**:
- [x] Update metadata:
  ```tsx
  export const metadata = {
    title: "SARE, See Yourself at Your Best",
    description: "Discover a research backed exercise that reveals your signature strengths and helps you live from your best self every day."
  }
  ```
- [x] Create Hero section:
  - [x] H1: "WHO ARE YOU AT YOUR BEST?"
  - [x] Subline text
  - [x] Begin button linking to `/auth/sign-up` (use conditional rendering based on auth state)
- [x] Create "Extraordinary Moments" section with paragraph and Learn link to `/about`
- [x] Create "What's Right for You" section with 4 cards:
  - Individual
  - Coaching or Team Workshop
  - Certified In-House Facilitator
  - Education
- [x] Create "Discover Your Best Self" banner section
- [x] Create "Proven and Positive" section with link to `/research`

**Completion Details**:
- Completely replaced starter template with SARE-specific home page
- Added SARE metadata with proper title and description
- Created hero section with gradient background using brand colors
- Implemented conditional authentication logic (shows dashboard link for logged-in users)
- Built responsive 4-card grid for "What's Right for You" section with feature lists
- Added accent coral banner section for "Discover Your Best Self"
- Created "Proven and Positive" section with research link
- Used all brand utility classes (container-sare, section-spacing, heading-xl, body-lg)
- Implemented proper responsive design with mobile-first approach
- Added hover effects and transitions for enhanced user experience

### Task 7: Create About Page ✅ COMPLETED
**Priority**: Medium  
**Location**: `app/about/page.tsx`  
**Details**:
- [x] Create folder `app/about`
- [x] Create `page.tsx` file
- [x] Set metadata:
  ```tsx
  export const metadata = {
    title: "About the SARE Exercise",
    description: "Learn what the SARE is, the science that supports it, and how it was developed."
  }
  ```
- [x] Add content blocks as specified in plan
- [x] Style with consistent spacing and typography

**Completion Details**:
- Created comprehensive About page explaining SARE methodology
- Added proper metadata for SEO and navigation
- Implemented 6 main content sections:
  - Hero section with page title and description
  - "What is SARE?" explanation section
  - "The Science Behind SARE" with research foundation cards
  - "How SARE Was Developed" with 3-step process timeline
  - "The SARE Process" banner with 4-step methodology
  - "Learn More" section with navigation links
- Used consistent brand styling with primary teal and accent coral colors
- Implemented responsive grid layouts and typography utilities
- Added cross-page navigation links to research and home pages
- Created educational content covering SARE definition, scientific backing, and development history

### Task 8: Create Research Page ✅ COMPLETED
**Priority**: Medium  
**Location**: `app/research/page.tsx`  
**Details**:
- [x] Create folder `app/research`
- [x] Create `page.tsx` file
- [x] Set metadata:
  ```tsx
  export const metadata = {
    title: "Research Library",
    description: "Peer reviewed studies and white papers that underpin the SARE methodology."
  }
  ```
- [x] Create filterable research list component (reuse table component pattern)
- [x] Add topic filter sidebar
- [x] Add callout linking back to Home research section

**Completion Details**:
- Created comprehensive research library with 8 sample research items
- Implemented interactive topic filter sidebar with 7 categories
- Built filterable research list using card components for better readability
- Added research type badges (peer-reviewed, white-paper, case-study) with brand colors
- Created sticky sidebar with research statistics overview
- Implemented responsive grid layout (sidebar + main content)
- Added callout section linking back to home page and sign-up
- Used client-side filtering for immediate user feedback
- Included academic-style metadata (authors, journal, year, abstract)
- Applied consistent brand styling and typography utilities


### Task 11: Create Contact Page ✅ COMPLETED
**Priority**: Medium  
**Location**: `app/contact/page.tsx`  
**Details**:
- [x] Create folder `app/contact`
- [x] Create `page.tsx` file
- [x] Set metadata:
  ```tsx
  export const metadata = {
    title: "Talk to Us",
    description: "Send a message to the SARE team."
  }
  ```
- [x] Create form with name, email, and message fields
- [x] Implement form submission to `contact_messages` table
- [x] Add form validation and success messaging

**Completion Details**:
- Created comprehensive contact page with hero section and form
- Implemented server action for form submission to contact_messages table
- Added proper form validation with required field checking
- Created success state with redirect and confirmation message
- Built responsive form layout with name/email grid and message textarea
- Added "Other Ways to Connect" section with navigation cards
- Applied consistent brand styling and typography utilities
- Used existing ContactMessageInsert type for type safety
- Implemented proper error handling and user feedback
- Added cross-page navigation to research, about, and sign-up pages

## User Dashboard Tasks

### Task 15: Update Protected Dashboard ✅ PARTIALLY COMPLETED
**Priority**: High  
**Location**: `app/protected/page.tsx`  
**Details**:
- [x] Add greeting header displaying user email from Supabase auth
- [x] Create "Stories Collected" card:
  - [x] Query `stories` table for count
  - [x] Display progress toward goal of 10
- [x] Create "Self Reflection Status" card:
  - [x] Query `self_reflections` table
  - [x] Show completion status
- [x] Create "Report Generation Status" card:
  - [x] Check if self-reflection is complete
  - [x] Show View button if ready
- [x] Add quick links to onboarding wizard steps
- [ ] Additional dashboard features (if any) remain to be implemented

## Onboarding Wizard Tasks

### Task 16: Create Onboarding Intro Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/protected/onboarding/intro/page.tsx`  
**Details**:
- [x] Create folder structure `app/protected/onboarding/intro`
- [x] Create `page.tsx` file
- [x] Add timeline graphic showing all steps
- [x] Add explanatory content
- [x] Add Next button linking to `/protected/onboarding/storytellers`

### Task 17: Create Choose Storytellers Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/protected/onboarding/storytellers/page.tsx`  
**Details**:
- [x] Create folder `app/protected/onboarding/storytellers`
- [x] Create `page.tsx` file
- [x] Create table component to display storytellers
- [x] Create "Add Storyteller" modal with form:
  - [x] Name field (required)
  - [x] Email field (required)
  - [x] Phone field (optional)
- [x] Implement CRUD operations for `storytellers` table
- [x] Generate unique invite tokens
- [x] Add Next button when at least one storyteller added

### Task 18: Create Send and Collect Stories Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/protected/onboarding/send_collect/page.tsx`  
**Details**:
- [x] Create folder `app/protected/onboarding/send_collect`
- [x] Create `page.tsx` file
- [x] Display list of storytellers with status
- [x] Show progress bar for stories collected
- [x] Add Resend buttons for each storyteller
- [x] Implement basic email sending functionality (with timestamp tracking)
- [x] Add Next button when stories threshold met

**Completion Details**:
- Created comprehensive send and collect stories page with full functionality
- Implemented 3-card progress dashboard showing stories collected, invites sent, and responses received
- Built storytellers list with detailed status indicators (Not invited, Invite sent, Story received)
- Added send/resend invite functionality with loading states and timestamp tracking
- Created progress bar showing stories collected vs goal (10 stories)
- Implemented conditional Next button that appears when user has ≥1 story
- Added loading states, error handling, and responsive design
- Used consistent brand styling with primary-teal and accent-coral colors
- Included empty state handling for users with no storytellers
- Applied proper database integration with Supabase client and getStoryCount function

### Task 19: Create Self Reflection Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/protected/onboarding/self_reflection/page.tsx`  
**Details**:
- [x] Create folder `app/protected/onboarding/self_reflection`
- [x] Create `page.tsx` file
- [x] Create form with three rich text areas
- [x] Implement save functionality to `self_reflections` table
- [x] Add auto-save feature
- [x] Add progress indicator
- [x] Add Next button when reflections saved

**Completion Details**:
- Created comprehensive self reflection page with 3 detailed reflection questions
- Implemented auto-save functionality with 2-second debounce for better UX
- Added progress tracking card showing completion status (X/3 reflections completed)
- Built real-time save status indicators (saving, saved, error states)
- Created upsert functionality for updating existing reflections
- Added conditional "Generate Your Report" button that appears when all 3 reflections are complete
- Implemented character count and completion status for each reflection
- Added loading states and proper error handling
- Used consistent brand styling with primary-teal and accent-coral colors
- Applied responsive design with mobile-first approach
- Integrated with existing database functions (upsertSelfReflection, getSelfReflection)
- Created meaningful reflection questions focused on peak performance, natural talents, and impact

### Task 20: Create Report Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/protected/onboarding/report/page.tsx`  
**Details**:
- [x] Create folder `app/protected/onboarding/report`
- [x] Create `page.tsx` file
- [x] Query and display all collected stories
- [x] Create collapsible sections for each story
- [x] Display self-reflections
- [x] Implement PDF export using pdf-lib (installed) and file-saver
- [x] Add download button for PDF

**Completion Details**:
- Created responsive report page with server-side data fetching for user, self-reflections, and stories.
- Implemented a client component to display the report, including self-reflections and an accordion for stories.
- Added a "Download as PDF" button that generates a PDF of the report on the client-side using `pdf-lib`.
- Used `file-saver` to trigger the download of the generated PDF.
- Ensured the UI matches the existing brand styles and is fully responsive.

## Storyteller Flow Tasks

### Task 21: Create Story Invite Landing Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/story_invite/page.tsx`  
**Details**:
- [x] Create folder `app/story_invite`
- [x] Create `page.tsx` file
- [x] Parse token from URL query parameter
- [x] Validate token against `storytellers` table
- [x] Display invitee name
- [x] Add Sign Up button linking to `/auth/sign-up` with token

**Completion Details**:
- Created a server component to handle the story invite landing page.
- The page fetches a storyteller using a token from the URL search parameters.
- If the token is valid, it displays a welcome message with the storyteller's name.
- A button links the storyteller to the sign-up page, passing the token forward to associate their new account with the invite.
- If the token is invalid or missing, it displays an appropriate error message.
- The page uses existing shadcn/ui components for a consistent look and feel.

### Task 22: Create Storyteller Sign Up Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/story_signup/page.tsx`  
**Details**:
- [x] Create folder `app/story_signup`
- [x] Create `page.tsx` file
- [x] Create form with email and password fields
- [x] Validate token from query parameter
- [x] Create Supabase auth account
- [x] Link account to storyteller record
- [x] Redirect to `/story_submit` after successful signup

**Completion Details**:
- Created a client component for the sign-up page at `app/story_signup/page.tsx` with a nested form component.
- Implemented a server action in `app/story_signup/actions.ts` to handle the sign-up logic securely.
- The server action validates the invite token, creates a new user via Supabase Auth, and links the new auth user's ID to the corresponding `storytellers` record.
- Upon successful sign-up and linking, the invite token is cleared from the database to prevent reuse.
- The user is then redirected to the `/story_submit` page to continue the flow.
- The form uses `useFormState` for handling states and displaying errors returned from the server action.

### Task 23: Create Story Submission Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/story_submit/page.tsx`  
**Details**:
- [x] Create folder `app/story_submit`
- [x] Create `page.tsx` file
- [x] Create form with three text areas:
  - [x] First area required
  - [x] Second and third optional
- [x] Save submission to `stories` table
- [x] Update storyteller record with submission timestamp
- [x] Redirect to thank you page after submission

**Completion Details**:
- Created a secure data-fetching pipeline using a database view (`storyteller_details`) and a `SECURITY DEFINER` function to safely get the main user's email.
- The main page component at `app/story_submit/page.tsx` authenticates the storyteller, fetches their details, and checks if a story has already been submitted.
- The page displays a dynamic title indicating who the story is for (e.g., "Share your story about user@example.com").
- A client-side form at `app/story_submit/form.tsx` uses `useFormState` to handle UI and validation.
- A server action at `app/story_submit/actions.ts` securely processes the form, creates the story record in the database, and redirects to the thank you page.
- The database schema includes an automatic trigger that updates the `story_submitted_at` timestamp on the `storytellers` record upon successful story insertion.

### Task 24: Create Story Thank You Page ✅ COMPLETED
**Priority**: High  
**Location**: `app/story_thank_you/page.tsx`  
**Details**:
- [x] Create folder `app/story_thank_you`
- [x] Create `page.tsx` file
- [x] Display confirmation message
- [x] Provide link to return home

**Completion Details**:
- Created a simple, centered confirmation page at `app/story_thank_you/page.tsx`.
- The page displays a clear "Thank You" message and a success icon.
- It includes a button that provides an easy way for the user to navigate back to the home page.

## Component Reuse Tasks

### Task 25: Create Reusable Form Components ⬜ PENDING
**Priority**: Medium  
**Location**: `components/forms/`  
**Details**:
- [ ] Create `FormField` component with label and error handling
- [ ] Create `FormTextArea` component
- [ ] Create `FormSubmitButton` component with loading state
- [ ] Ensure consistent styling across all forms

### Task 26: Create Card Component Variants ⬜ PENDING
**Priority**: Medium  
**Location**: Update `components/ui/card.tsx`  
**Details**:
- [ ] Add variant props for different card styles
- [ ] Create hover effects for interactive cards
- [ ] Ensure responsive behavior

## Testing & Deployment Tasks

### Task 27: Test Authentication Flow
**Priority**: High  
**Details**:
- [ ] Test sign up process
- [ ] Test login/logout
- [ ] Test password reset flow
- [ ] Verify protected routes redirect properly
- [ ] Test storyteller authentication flow

### Task 28: Test Database Operations
**Priority**: High  
**Details**:
- [ ] Test all CRUD operations for each table
- [ ] Verify RLS policies work correctly
- [ ] Test data relationships
- [ ] Ensure proper error handling

### Task 29: Responsive Design Testing
**Priority**: Medium  
**Details**:
- [ ] Test all pages on mobile devices
- [ ] Test tablet breakpoints
- [ ] Verify navigation menu works on all screen sizes
- [ ] Check form usability on mobile

### Task 30: Final Deployment Checklist
**Priority**: Low  
**Details**:
- [ ] Update environment variables
- [ ] Configure Supabase production instance
- [ ] Set up proper email configuration
- [ ] Configure domain and SSL
- [ ] Set up monitoring and analytics
- [ ] Create backup procedures

## Notes

- The onboarding intro and storytellers steps are implemented, but the rest of the onboarding flow and storyteller flow pages are not yet present in the codebase.
- Each task should be completed and tested before moving to the next
- Use existing components and patterns where possible to maintain consistency
- Follow the file naming conventions already established in the codebase
- Ensure all database operations include proper error handling
- Keep components under 250 lines as per user rules 