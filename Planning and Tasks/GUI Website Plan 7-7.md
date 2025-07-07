# Website Sitemap and Page Features for the SARE Platform (implementation friendly)

Displayed route names use underscores in place of hyphens to satisfy your no dash rule. In code, keep the current folder and file names that already contain hyphens so no refactor is required.

---

## Global Elements

### Header

* Logo at top left linking to home
* Primary navigation links: Home, About, Research, Purchase, Certification, Contact
* **AuthButton** component at top right (shows Log In or Log Out states automatically)

### Footer

* “Connect with us” text, email link, and social icons
* Secondary navigation: Privacy Policy, Accessibility, Terms of Service
* Copyright line

### Core Styles

* Primary color: Deep Teal `#00707C`
* Accent color: Warm Coral `#FF6A57`
* Neutral palette: White `#FFFFFF`, Charcoal `#333333`
* Font stack: system ui, Segoe UI, Helvetica Neue, Arial, sans serif

---

## Pages

### 1  Home `/`

* **Meta Title**: “SARE, See Yourself at Your Best”
* **Meta Description**: Discover a research backed exercise that reveals your signature strengths and helps you live from your best self every day.
* Sections

  * **Hero** headline “WHO ARE YOU AT YOUR BEST?” (h1), subline, Begin button that anchors to **/auth/sign\_up** if user is logged out
  * **Extraordinary Moments** paragraph and Learn link pointing to About
  * **What’s Right for You** cards (Individual, Coaching or Team Workshop, Certified In-House Facilitator, Education)
  * **Discover Your Best Self** banner showing positive psychology grounding
  * **Proven and Positive** short research overview linking to Research
  * Footer

### 2  About `/about`

* **Meta Title**: “About the SARE Exercise”
* **Meta Description**: Learn what the SARE is, the science that supports it, and how it was developed.
* Content blocks identical to previous plan
* Footer

### 3  Research `/research`

* **Meta Title**: “Research Library”
* **Meta Description**: Peer reviewed studies and white papers that underpin the SARE methodology.
* Filterable research list component (reuse existing table component pattern)
* Topic filter sidebar
* Callout linking back to Home research section

### 4  Purchase `/purchase`

* **Meta Title**: “Choose Your SARE Experience”
* **Meta Description**: Compare individual, team, and facilitator options and get started today.
* Three primary product tiles plus education tile
* Sticky cart sidebar
* Footer

### 5  Certification `/certification`

* **Meta Title**: “Get Certified to Facilitate the SARE”
* **Meta Description**: Join a two and a half day workshop and bring SARE facilitation skills to your organisation.
* FAQ accordion blocks
* Contact interest form posting to Supabase table **certification\_leads**
* Footer

### 6  Contact `/contact`

* **Meta Title**: “Talk to Us”
* **Meta Description**: Send a message to the SARE team.
* Three field form storing submissions in Supabase table **contact\_messages**
* Footer

---

## Authentication (reuses existing Supabase backed routes)

| User Facing Page | Displayed Path               | Corresponding Code Folder           |
| :--------------- | :--------------------------- | :---------------------------------- |
| Sign Up          | `/auth/sign_up`              | `app/auth/sign-up/page.tsx`         |
| Sign Up Success  | `/auth/sign_up_success`      | `app/auth/sign-up-success/page.tsx` |
| Log In           | `/auth/login`                | `app/auth/login/page.tsx`           |
| Forgot Password  | `/auth/forgot_password`      | `app/auth/forgot-password/page.tsx` |
| Update Password  | `/auth/update_password`      | `app/auth/update-password/page.tsx` |
| Confirm Email    | `/auth/confirm` (route only) | `app/auth/confirm/route.ts`         |

All forms already exist, so no new UI work is required.

---

## User Dashboard (protected)

### Dashboard `/protected`

* Greeting header with Supabase user email
* Cards

  * Stories collected out of goal ten (reads from **stories** table)
  * Self reflection status (reads from **self\_reflections** table)
  * Report generation status with View button if ready
* Quick links to Onboarding wizard steps

---

## Onboarding Wizard

Wizard pages live under `/protected/onboarding` to inherit the existing protected middleware.

| Step                     | Displayed Path                          | Key UI Elements                           | Notes                                                          |
| :----------------------- | :-------------------------------------- | :---------------------------------------- | :------------------------------------------------------------- |
| Intro                    | `/protected/onboarding/intro`           | Timeline graphic, Next button             | Pure content, no data                                          |
| Choose Storytellers      | `/protected/onboarding/storytellers`    | Table, Add Storyteller modal, Next button | CRUD to **storytellers** table                                 |
| Send and Collect Stories | `/protected/onboarding/send_collect`    | Progress bar, Resend buttons              | Uses Supabase functions for email, SMS                         |
| Self Reflection          | `/protected/onboarding/self_reflection` | Rich text boxes, Save button              | Writes to **self\_reflections** table                          |
| Report                   | `/protected/onboarding/report`          | Collapsible story sections, Export to PDF | Generates PDF client side with **pdf-lib** (already installed) |

---

## Storyteller Flow

| Page                | Displayed Path         | Purpose                            |
| :------------------ | :--------------------- | :--------------------------------- |
| Invite Landing      | `/story_invite?token=` | Shows invitee name, Sign Up button |
| Storyteller Sign Up | `/story_signup`        | Email, Password, Create account    |
| Story Submission    | `/story_submit`        | Three text areas, first required   |
| Thank You           | `/story_thank_you`     | Confirmation message               |

Data writes to **stories** table keyed by token.

---

## Legal Pages

* Privacy Policy `/privacy`
* Accessibility `/accessibility`
* Terms of Service `/terms`

Single column layout, footer included.

---

### Summary

This revised plan keeps every file path already present in your Next.js Supabase setup, places new pages inside existing protected and auth folders, and reuses current components wherever possible. No database schema changes are needed beyond the **storytellers**, **stories**, and **self\_reflections** tables referenced above, all of which were part of your original design notes.
