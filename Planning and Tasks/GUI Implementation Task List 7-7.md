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

### Task 2: Global Styling Setup
**Priority**: High  
**Location**: `app/globals.css`  
**Details**:
- [ ] Add CSS custom properties for brand colors:
  ```css
  :root {
    --primary-teal: #00707C;
    --accent-coral: #FF6A57;
    --neutral-white: #FFFFFF;
    --neutral-charcoal: #333333;
  }
  ```
- [ ] Update font-family to use system font stack:
  ```css
  body {
    font-family: system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  ```
- [ ] Create utility classes for common spacing and layout patterns

## Global Components Tasks

### Task 3: Create Header Component
**Priority**: High  
**Location**: `components/header.tsx`  
**Details**:
- [ ] Create new component file
- [ ] Add logo linking to home (use Next.js Link component)
- [ ] Create navigation with links: Home, About, Research, Purchase, Certification, Contact
- [ ] Import and place existing `AuthButton` component at top right
- [ ] Make header responsive with mobile menu
- [ ] Style with primary teal background

### Task 4: Create Footer Component
**Priority**: High  
**Location**: `components/footer.tsx`  
**Details**:
- [ ] Create new component file
- [ ] Add "Connect with us" section with email link and social icons
- [ ] Add secondary navigation: Privacy Policy, Accessibility, Terms of Service
- [ ] Add copyright line with current year
- [ ] Style with charcoal background and white text

### Task 5: Update Root Layout
**Priority**: High  
**Location**: `app/layout.tsx`  
**Details**:
- [ ] Import Header and Footer components
- [ ] Wrap children with Header above and Footer below
- [ ] Ensure proper spacing and layout structure

## Public Pages Tasks

### Task 6: Create Home Page
**Priority**: High  
**Location**: `app/page.tsx`  
**Details**:
- [ ] Update metadata:
  ```tsx
  export const metadata = {
    title: "SARE, See Yourself at Your Best",
    description: "Discover a research backed exercise that reveals your signature strengths and helps you live from your best self every day."
  }
  ```
- [ ] Create Hero section:
  - [ ] H1: "WHO ARE YOU AT YOUR BEST?"
  - [ ] Subline text
  - [ ] Begin button linking to `/auth/sign-up` (use conditional rendering based on auth state)
- [ ] Create "Extraordinary Moments" section with paragraph and Learn link to `/about`
- [ ] Create "What's Right for You" section with 4 cards:
  - Individual
  - Coaching or Team Workshop
  - Certified In-House Facilitator
  - Education
- [ ] Create "Discover Your Best Self" banner section
- [ ] Create "Proven and Positive" section with link to `/research`

### Task 7: Create About Page
**Priority**: Medium  
**Location**: `app/about/page.tsx`  
**Details**:
- [ ] Create folder `app/about`
- [ ] Create `page.tsx` file
- [ ] Set metadata:
  ```tsx
  export const metadata = {
    title: "About the SARE Exercise",
    description: "Learn what the SARE is, the science that supports it, and how it was developed."
  }
  ```
- [ ] Add content blocks as specified in plan
- [ ] Style with consistent spacing and typography

### Task 8: Create Research Page
**Priority**: Medium  
**Location**: `app/research/page.tsx`  
**Details**:
- [ ] Create folder `app/research`
- [ ] Create `page.tsx` file
- [ ] Set metadata:
  ```tsx
  export const metadata = {
    title: "Research Library",
    description: "Peer reviewed studies and white papers that underpin the SARE methodology."
  }
  ```
- [ ] Create filterable research list component (reuse table component pattern)
- [ ] Add topic filter sidebar
- [ ] Add callout linking back to Home research section

### Task 9: Create Purchase Page
**Priority**: Medium  
**Location**: `app/purchase/page.tsx`  
**Details**:
- [ ] Create folder `app/purchase`
- [ ] Create `page.tsx` file
- [ ] Set metadata:
  ```tsx
  export const metadata = {
    title: "Choose Your SARE Experience",
    description: "Compare individual, team, and facilitator options and get started today."
  }
  ```
- [ ] Create three primary product tiles plus education tile
- [ ] Implement sticky cart sidebar
- [ ] Add pricing and feature comparison

### Task 10: Create Certification Page
**Priority**: Medium  
**Location**: `app/certification/page.tsx`  
**Details**:
- [ ] Create folder `app/certification`
- [ ] Create `page.tsx` file
- [ ] Set metadata:
  ```tsx
  export const metadata = {
    title: "Get Certified to Facilitate the SARE",
    description: "Join a two and a half day workshop and bring SARE facilitation skills to your organisation."
  }
  ```
- [ ] Create FAQ accordion component
- [ ] Create contact form that posts to `certification_leads` table
- [ ] Add form validation and success messaging

### Task 11: Create Contact Page
**Priority**: Medium  
**Location**: `app/contact/page.tsx`  
**Details**:
- [ ] Create folder `app/contact`
- [ ] Create `page.tsx` file
- [ ] Set metadata:
  ```tsx
  export const metadata = {
    title: "Talk to Us",
    description: "Send a message to the SARE team."
  }
  ```
- [ ] Create form with name, email, and message fields
- [ ] Implement form submission to `contact_messages` table
- [ ] Add form validation and success messaging

## Legal Pages Tasks

### Task 12: Create Privacy Policy Page
**Priority**: Low  
**Location**: `app/privacy/page.tsx`  
**Details**:
- [ ] Create folder `app/privacy`
- [ ] Create `page.tsx` file
- [ ] Add privacy policy content
- [ ] Use single column layout

### Task 13: Create Accessibility Page
**Priority**: Low  
**Location**: `app/accessibility/page.tsx`  
**Details**:
- [ ] Create folder `app/accessibility`
- [ ] Create `page.tsx` file
- [ ] Add accessibility statement content
- [ ] Use single column layout

### Task 14: Create Terms of Service Page
**Priority**: Low  
**Location**: `app/terms/page.tsx`  
**Details**:
- [ ] Create folder `app/terms`
- [ ] Create `page.tsx` file
- [ ] Add terms of service content
- [ ] Use single column layout

## User Dashboard Tasks

### Task 15: Update Protected Dashboard
**Priority**: High  
**Location**: `app/protected/page.tsx`  
**Details**:
- [ ] Add greeting header displaying user email from Supabase auth
- [ ] Create "Stories Collected" card:
  - [ ] Query `stories` table for count
  - [ ] Display progress toward goal of 10
- [ ] Create "Self Reflection Status" card:
  - [ ] Query `self_reflections` table
  - [ ] Show completion status
- [ ] Create "Report Generation Status" card:
  - [ ] Check if self-reflection is complete
  - [ ] Show View button if ready
- [ ] Add quick links to onboarding wizard steps

## Onboarding Wizard Tasks

### Task 16: Create Onboarding Intro Page
**Priority**: High  
**Location**: `app/protected/onboarding/intro/page.tsx`  
**Details**:
- [ ] Create folder structure `app/protected/onboarding/intro`
- [ ] Create `page.tsx` file
- [ ] Add timeline graphic showing all steps
- [ ] Add explanatory content
- [ ] Add Next button linking to `/protected/onboarding/storytellers`

### Task 17: Create Choose Storytellers Page
**Priority**: High  
**Location**: `app/protected/onboarding/storytellers/page.tsx`  
**Details**:
- [ ] Create folder `app/protected/onboarding/storytellers`
- [ ] Create `page.tsx` file
- [ ] Create table component to display storytellers
- [ ] Create "Add Storyteller" modal with form:
  - [ ] Name field (required)
  - [ ] Email field (required)
  - [ ] Phone field (optional)
- [ ] Implement CRUD operations for `storytellers` table
- [ ] Generate unique invite tokens
- [ ] Add Next button when at least one storyteller added

### Task 18: Create Send and Collect Stories Page
**Priority**: High  
**Location**: `app/protected/onboarding/send_collect/page.tsx`  
**Details**:
- [ ] Create folder `app/protected/onboarding/send_collect`
- [ ] Create `page.tsx` file
- [ ] Display list of storytellers with status
- [ ] Show progress bar for stories collected
- [ ] Add Resend buttons for each storyteller
- [ ] Implement Supabase Edge Functions for email/SMS sending
- [ ] Add Next button when stories threshold met

### Task 19: Create Self Reflection Page
**Priority**: High  
**Location**: `app/protected/onboarding/self_reflection/page.tsx`  
**Details**:
- [ ] Create folder `app/protected/onboarding/self_reflection`
- [ ] Create `page.tsx` file
- [ ] Create form with three rich text areas
- [ ] Implement save functionality to `self_reflections` table
- [ ] Add auto-save feature
- [ ] Add progress indicator
- [ ] Add Next button when reflections saved

### Task 20: Create Report Page
**Priority**: High  
**Location**: `app/protected/onboarding/report/page.tsx`  
**Details**:
- [ ] Create folder `app/protected/onboarding/report`
- [ ] Create `page.tsx` file
- [ ] Query and display all collected stories
- [ ] Create collapsible sections for each story
- [ ] Display self-reflections
- [ ] Implement PDF export using pdf-lib (already installed)
- [ ] Add download button for PDF

## Storyteller Flow Tasks

### Task 21: Create Story Invite Landing Page
**Priority**: High  
**Location**: `app/story_invite/page.tsx`  
**Details**:
- [ ] Create folder `app/story_invite`
- [ ] Create `page.tsx` file
- [ ] Parse token from URL query parameter
- [ ] Validate token against `storytellers` table
- [ ] Display invitee name
- [ ] Add Sign Up button linking to `/story_signup` with token

### Task 22: Create Storyteller Sign Up Page
**Priority**: High  
**Location**: `app/story_signup/page.tsx`  
**Details**:
- [ ] Create folder `app/story_signup`
- [ ] Create `page.tsx` file
- [ ] Create form with email and password fields
- [ ] Validate token from query parameter
- [ ] Create Supabase auth account
- [ ] Link account to storyteller record
- [ ] Redirect to `/story_submit` after successful signup

### Task 23: Create Story Submission Page
**Priority**: High  
**Location**: `app/story_submit/page.tsx`  
**Details**:
- [ ] Create folder `app/story_submit`
- [ ] Create `page.tsx` file
- [ ] Create form with three text areas:
  - [ ] First area required
  - [ ] Second and third optional
- [ ] Save submission to `stories` table
- [ ] Update storyteller record with submission timestamp
- [ ] Redirect to thank you page after submission

### Task 24: Create Story Thank You Page
**Priority**: High  
**Location**: `app/story_thank_you/page.tsx`  
**Details**:
- [ ] Create folder `app/story_thank_you`
- [ ] Create `page.tsx` file
- [ ] Display confirmation message
- [ ] Provide link to return home

## Component Reuse Tasks

### Task 25: Create Reusable Form Components
**Priority**: Medium  
**Location**: `components/forms/`  
**Details**:
- [ ] Create `FormField` component with label and error handling
- [ ] Create `FormTextArea` component
- [ ] Create `FormSubmitButton` component with loading state
- [ ] Ensure consistent styling across all forms

### Task 26: Create Card Component Variants
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

- Each task should be completed and tested before moving to the next
- Use existing components and patterns where possible to maintain consistency
- Follow the file naming conventions already established in the codebase
- Ensure all database operations include proper error handling
- Keep components under 250 lines as per user rules 