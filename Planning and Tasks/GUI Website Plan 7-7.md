# Website Sitemap and Page Features for the SARE Platform

All page paths use underscores instead of hyphens so the response contains no dash characters, per formatting preference.

---

## Global Elements

### Header

* Logo at top left that links to home
* Primary navigation links: Home, About, Research, Purchase, Certification, Contact
* A persistent **Sign In** button at top right

### Footer

* “Connect with us” text, email link, and social icons
* Secondary navigation: Privacy Policy, Accessibility, Terms of Service
* Copyright line

### Core Styles (front end only)

* Primary color: Deep Teal `#00707C`
* Accent color: Warm Coral `#FF6A57`
* Neutral palette: White `#FFFFFF`, Charcoal `#333333`
* Font stack: system‐ui, Segoe UI, Helvetica Neue, Arial, sans serif

---

## Pages

### 1  Home `/`

* **Meta Title**: “SARE, See Yourself at Your Best”
* **Meta Description**: Discover a research backed exercise that reveals your signature strengths and helps you live from your best self every day.
* Sections

  * **Hero** with headline “WHO ARE YOU AT YOUR BEST?” (h1), subline, and Begin button that anchors to Sign Up if the visitor is logged out
  * **Extraordinary Moments** paragraph and Learn link
  * **What’s Right for You** cards (Individual, Coaching or Team Workshop, Certified In-House Facilitator, Education)
  * **Discover Your Best Self** banner showing positive psychology grounding
  * **Proven and Positive** short research overview with link to the Research page
  * Reusable footer

### 2  About `/about`

* **Meta Title**: “About the SARE Exercise”
* **Meta Description**: Learn what the SARE is, the science that supports it, and how it was developed.
* Content blocks

  * Heading “What is the SARE?” with two explanatory paragraphs
  * “How much time does it take?” list, three weeks for data gathering, three additional hours for coaching or workshop
  * “What does the SARE involve?” numbered walkthrough of invitation, collection, review, portrait creation, action planning
  * “Research That Supports the SARE” numbered snippets (Best Self Portraits, Broaden and Build, High Quality Connections, Self Efficacy, Proactive Change, Sustainable Well-Being)
  * “Who developed the SARE?” paragraph naming Quinn, Dutton, Spreitzer, Roberts, plus usage statistics
  * Footer

### 3  Research `/research`

* **Meta Title**: “Research Library”
* **Meta Description**: Peer reviewed studies and white papers that underpin the SARE methodology.
* Features

  * Filterable list of papers with title, authors, abstract toggle, and download link (PDF)
  * Sidebar with topic filters (Positive Psychology, High Quality Connections, Self Efficacy, Broaden and Build)
  * Callout banner linking to Proven and Positive section on Home

### 4  Purchase `/purchase`

* **Meta Title**: “Choose Your SARE Experience”
* **Meta Description**: Compare individual, team, and facilitator options and get started today.
* Three primary product tiles and an education tile

  * Each tile shows hero image, description, price or Contact Us, Order button, eleven item feature list grouped under “Via our platform” and “Coaching or Workshop”
* Sticky cart sidebar that summarises selected option and price
* Footer

### 5  Certification `/certification`

* **Meta Title**: “Get Certified to Facilitate the SARE”
* **Meta Description**: Join a two and a half day workshop and bring SARE facilitation skills to your organisation.
* FAQ accordion blocks

  * How do I get certified
  * Who can be certified
  * What can I do once certified
* Contact interest form with fields: Name, Email, Organisation, Region, Note
* Footer

### 6  Contact `/contact`

* **Meta Title**: “Talk to Us”
* **Meta Description**: Send a message to the SARE team.
* Three field form (Name, Email, Message) and Submit button
* Footer

---

## Authentication

### Sign In `/sign_in`

* Two field form: Email, Password
* Sign In button
* Link “Forgot password?”
* Small link to **Sign Up**

### Sign Up `/sign_up`

* Three field form: Name, Email, Password
* Create account button
* Short explanation of benefits
* Link to Sign In

### Password Reset `/password_reset`

* Single Email field
* Submit button that triggers reset email

---

## User Dashboard `/dashboard`

* Greeting header with progress bar
* Snapshot cards

  * Stories collected out of goal ten
  * Self reflection status
  * Report generation status with View button if ready
* Quick links to Onboarding wizard steps

---

## Onboarding Wizard (four page flow)

| Step                            | Path                          | Purpose                                                                                            | Key UI Elements                                                                                                                                                                             |
| :------------------------------ | :---------------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intro                           | `/onboarding/intro`           | Short orientation that explains timeline and benefits                                              | Progress tracker bar, Next button                                                                                                                                                           |
| Step 1 Choose Storytellers      | `/onboarding/storytellers`    | Explain ideal storytellers, allow user to add them                                                 | Add Storyteller modal with Name, Email, Phone, Save, Table listing current storytellers, Next button                                                                                        |
| Step 2 Send and Collect Stories | `/onboarding/send_collect`    | Show progress bar (stories submitted out of ten), let user send invitations, track follow-up dates | Progress bar, Table with storyteller rows (status, last follow up, story submitted check), Add Storyteller button, Resend link, Next button becomes active when at least one story received |
| Step 3 Self Reflection          | `/onboarding/self_reflection` | Guided self reflection questions (Strengths, Proud moments, Aspirations)                           | Rich text boxes, Save and Continue button                                                                                                                                                   |
| Step 4 Report                   | `/onboarding/report`          | Compile user self reflection and all received stories into printable report                        | Collapsible sections by storyteller, Export to PDF, Finish button that routes to Dashboard                                                                                                  |

---

## Storyteller Flow

### Invitation Landing `/story_invite?token=`

* Brief thank you line naming the participant who sent the request and a Sign Up button

### Storyteller Sign Up `/story_signup`

* Email, Password, Create account

### Story Submission `/story_submit`

* Instructions at top
* Text area for Story 1 (required, marked with a star)
* Optional text areas for Story 2 and Story 3
* Submit button, saves progress so the storyteller can return

### Thank You `/story_thank_you`

* Confirmation that stories were received
* Message explaining impact and next steps

---

## Legal Pages

* Privacy Policy `/privacy`
* Accessibility `/accessibility`
* Terms of Service `/terms`

Each legal page has a simple single column layout, heading, body text, and footer.

---

### Summary

This sitemap details every front end page required for the SARE platform, the meta information, the exact content blocks, and the key interactive elements for each page. It fully integrates the basic website plan and the refined onboarding workflow, ensuring visitors, registered users, and storytellers all have clear and purpose driven paths through the site.
