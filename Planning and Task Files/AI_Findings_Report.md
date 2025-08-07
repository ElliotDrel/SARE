### High-level themes from recent commits
- **Storyteller portal + auth flow**: Added `AuthCallback` route, storyteller pages (`Welcome`, `Write`, `ThankYou`), magic-link invitations, and unified sign-in logic that detects storytellers.
- **Supabase policy and SQL iteration**: Multiple migrations for storyteller token access, reminder count function, story count function, and access tracking; added then removed `get_storyteller_by_email`; broadened RLS in places.
- **App structure and UX**: Introduced `ProtectedRoute`, `AuthenticatedLayout`, dashboard, invite tracking; refined toasts, progress timeline, and small UX polish.
- **Config hygiene**: Added `.env.example`, ignored `.env`, moved Vite dev port to 9783, optional Windows dependencies.

### Notable commits (latest first)
- ca66877 (2025-08-07): Update Supabase types; refactor `SelfReflection`.
- 00cc614 (2025-08-07): Remove deprecated `get_storyteller_by_email` SQL (function was added earlier the same day).
- d0cce6f (2025-08-07): Update storyteller navigation; add migrations:
  - `20250807000000_fix_storyteller_token_access_after_edit.sql`: Public read on `storytellers`, public update/read on `stories`, public ALL on `story_drafts`.
  - `20250807000001_fix_profiles_access_for_storytellers.sql`: Public read on `profiles`.
- ab94891, bd5e259 (2025-08-07): Refactor invitation status handling; enhance reminder flow.
- d64603c, 2e1334e (2025-08-07): Add `AuthCallback`, enhance `SignIn` for storytellers; migration to allow token access for return users; fix token-based access for storytellers.
- 18bf9ce (2025-08-06): Add storyteller portal, magic-link invite hooks, self-reflection feature; migrations for storyteller auth integration and reminder count.
- edde99a (2025-08-06): Implement `ProtectedRoute`, `AuthenticatedLayout`, dashboard, invite tracking; add profile/story hooks.
- Config commits (2025-08-06): `.env` hygiene, Vite port to 9783, ignore lockfile, docs.

### Risk and regression watch-outs from history
- **RLS weakening to public**:
  - `storytellers_public_read` (public SELECT),
  - `stories_public_update` (public UPDATE),
  - `stories_public_read` (public SELECT),
  - `story_drafts_public_access` (public ALL),
  - `profiles_public_read` (public SELECT).
  These bypass auth.uid() checks and allow unauthenticated reads/updates. If kept, ensure every query path enforces token checks at the DB layer (policies) not just in UI. Consider replacing with token-scoped, row-restricted policies instead of public.
- **Function churn**: `get_storyteller_by_email` added (206aebd) then removed (00cc614) the same day; confirm all call sites now use RPC or table queries consistently.
- **Auth metadata assumptions**: New storyteller flow relies on `user_metadata` fields in `AuthCallback` and email OTP metadata; ensure all email templates/providers preserve metadata and redirects.
- **Anon key in client**: `src/integrations/supabase/client.ts` has hard-coded anon key and URL; ensure this is intended for prod (recommend environment variables).

### If you want, I can
- Generate a short report linking each migration to the code paths it unlocks/guards.
- Propose safer RLS replacements for the public policies while keeping token-based access.

- Implemented: Pulled branch status and summarized last ~30 commits with changed files.
- Key insights: Major storyteller flow landed; several migrations relax RLS to public; cleanups and UX polish across auth and invites.

### Executive summary
- Critical risks: overly-permissive Supabase RLS policies, RPC/function drift (removed function still called), magic-link callback completeness, and missing gating of story visibility vs. stated business rules.
- High-impact UX/logic gaps: broken routes/links, CSV export crash on empty list, “single()” queries that assume uniqueness not enforced by schema.
- Maintainability: very large component files violating your ≤250-line rule, loose TS strictness, hard-coded Supabase URL/key.

### Detailed audit and second-pass findings

#### 1) Supabase RLS and data exposure
- Current
  - Recent migrations introduce public access in multiple areas:
    ```
    CREATE POLICY "storytellers_public_read" ON storytellers
        FOR SELECT USING (TRUE);
    ...
    CREATE POLICY "stories_public_update" ON stories
        FOR UPDATE USING (TRUE);
    ...
    CREATE POLICY "stories_public_read" ON stories  
        FOR SELECT USING (TRUE);
    ...
    CREATE POLICY "story_drafts_public_access" ON story_drafts
        FOR ALL USING (TRUE);
    ```
    ```
    CREATE POLICY "profiles_public_read" ON profiles
        FOR SELECT USING (TRUE);
    ```
  - Prior restrictive policies were dropped selectively; some older policies remain, but OR-semantics mean any permissive policy grants access.
  - The anon key is hard-coded in the client and committed:
    ```
    const supabaseUrl = "https://fapgoifqhtoryzykziye.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";  // committed
    ```
- Intended
  - Only token-holders (valid, unexpired) and owners should read limited storyteller fields; stories should be viewable by owners only after business-rule gates (goal met + reflection done); drafts writable only by token-holders for their own draft; profiles not globally readable.
- Issues
  - Anyone with the public anon key can read profiles/storytellers and update stories/drafts across the project.
- Fix
  - Remove public policies; replace with token-scoped, row-restricted policies that:
    - SELECT storyteller rows only when valid `invitation_token` matches AND not expired; restrict returned columns to minimal fields.
    - For `stories`, enforce owner SELECT only when `can_view_stories(auth.uid())` is true. No public UPDATE.
    - For `story_drafts`, restrict INSERT/UPDATE/SELECT to rows whose `storytellers.invitation_token` matches a provided request token (e.g., via a SECURITY DEFINER RPC that validates token).
    - Revert `profiles_public_read`; provide a narrow RPC that returns only `display_name`/names for a given storyteller’s `user_id` with token validation.
  - Move Supabase URL/key to environment variables (Vite env) and stop committing keys.

#### 2) Business rule: gating story visibility
- Current
  - The rule (“Users cannot read collected stories until goal met AND reflection complete”) is documented but not enforced in DB; `useStories` simply selects submitted stories:
    ```
    .from("stories").select(`*, storytellers (*)`)
    .eq("user_id", user.id).eq("status", "submitted")
    ```
- Intended
  - Stories should be blocked until `can_view_stories(user_id)` returns true.
- Fix
  - Update the `stories` SELECT RLS to `USING (auth.uid() = user_id AND can_view_stories(auth.uid()))`.
  - Optional: in UI, call `useCanViewStories()` to toggle any prefetch of stories.

#### 3) RPC/function drift (removed function still called)
- Current
  - `get_storyteller_by_email` was removed (00cc614), but the app still calls it in sign-in flow:
    ```
    const { data: storytellers, error } = await supabase
      .rpc('get_storyteller_by_email', { target_email: email });
    ```
- Intended
  - Use a current, supported method to detect storyteller emails (direct SELECT with constraints or a replacement RPC).
- Fix
  - Reintroduce the RPC or replace the call with a safe `SELECT` on `storytellers` with the necessary fields and error handling.

#### 4) Magic-link callback completeness
- Current
  - The callback does not call `exchangeCodeForSession()` for code-based redirects; OTP links may work if they include `#access_token`, but code-based links could fail.
    ```
    const { data, error } = await supabase.auth.getSession();
    ```
  - Storyteller invitation emails redirect directly to `/storyteller/welcome?token=...` (not `/auth/callback`), relying on automatic session parsing; this is fragile across provider/template changes.
- Intended
  - Robustly complete auth for both hash and code flows, in one place.
- Fix
  - In `AuthCallback`, call `await supabase.auth.exchangeCodeForSession()` when `code`/`token_hash` is present; consider routing all magic links through `/auth/callback` for consistency.

#### 5) Token expiration not checked in AuthCallback
- Current
  - For storyteller routing, `AuthCallback` fetches storyteller by `invitation_token` but does not check `token_expires_at`:
    ```
    const { data: storyteller } = await supabase
      .from('storytellers').select('*')
      .eq('invitation_token', tokenToUse).single();
    ```
- Intended
  - Expired tokens should be rejected early (consistent with `useStorytellerByToken`, which checks expiry).
- Fix
  - Add `.gt('token_expires_at', new Date().toISOString())` to the query, or use the same hook logic for consistency.

#### 6) Stories per storyteller: schema vs. code assumption
- Current
  - Code assumes one story per storyteller and uses `.single()`:
    ```
    .from("stories").select('*').eq('storyteller_id', storytellerId).single();
    ```
  - Schema has no unique constraint on `stories.storyteller_id`.
- Intended
  - Enforce one final submission per storyteller (plus drafts), or explicitly support multiples.
- Fix
  - Add a unique constraint on `stories(storyteller_id)` if single submission is the rule; otherwise, change queries to `.limit(1)` and handle multiples in UI.

#### 7) CSV export throws when no storytellers
- Current
  - Export builds header from `Object.keys(csvData[0])` without guarding empty arrays:
    ```
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    ```
- Intended
  - Export should gracefully handle empty lists or disable the button.
- Fix
  - Disable export if `storytellers.length === 0`, or guard with a fallback header.

#### 8) Broken routes/links and missing views
- Current
  - Header/footer link to routes that don’t exist (`/research`, `/faq`, `/contact`, `/privacy`, `/terms`):
    ```
    <Link to="/research">...</Link> <Link to="/faq">...</Link>
    ```
    ```
    /research, /faq, /contact, /privacy, /terms
    ```
  - Dashboard points to a `/app/report` route that’s commented out, causing a 404.
  - NotFound uses `<a href="/">` (full reload) instead of `<Link>`.
    ```
    <a href="/" ...>Return to Home</a>
    ```
- Intended
  - No dead links; soft navigation to home; report route implemented or hidden.
- Fix
  - Add placeholder pages or remove links; use `<Link to="/">` in `NotFound`; hide report CTA until implemented.

#### 9) Magic-link flows split across routes
- Current
  - New invite flows go to `/storyteller/welcome?token=...`; return flows go to `/auth/callback?...`.
- Intended
  - A single callback handler minimizes edge cases.
- Fix
  - Consolidate email redirect to `/auth/callback` and route onward based on `type`/token.

#### 10) Secrets and environment handling
- Current
  - Supabase URL and anon key are committed:
    ```
    const supabaseUrl = "...";
    const supabaseAnonKey = "...";
    ```
- Intended
  - Use `import.meta.env` variables and avoid committing keys; use `.env` with Vite’s `VITE_` prefix.
- Fix
  - Load from env; commit only `.env.example`.

#### 11) TypeScript strictness and ESLint
- Current
  - `tsconfig.app.json` and `tsconfig.json` disable strictness and unused checks; ESLint disables no-unused-vars:
    ```
    "strict": false, "noUnusedLocals": false, "noUnusedParameters": false
    ```
    ```
    "@typescript-eslint/no-unused-vars": "off"
    ```
- Intended
  - Stricter settings to catch regressions early.
- Fix
  - Gradually re-enable strictness per package/dir, starting with hooks and pages.

#### 12) Large files violating your ≤250-line rule
- Current
  - `InviteTrack.tsx` (~860 lines), `StorytellerWrite.tsx` (~400), `Dashboard.tsx` (~340).
- Intended
  - Each file ≤250 lines.
- Fix
  - Extract subcomponents (forms, tables, dialogs), and move data operations to hooks/services.

#### 13) Inconsistent token lifecycle management
- Current
  - `cleanup_expired_tokens()` updates tokens for `access_method='pending'` only; not scheduled/invoked in app.
- Intended
  - Expired tokens consistently invalidated; deterministic refresh strategy.
- Fix
  - Extend function or create separate RPC to rotate/expire tokens for all relevant methods; schedule via Supabase cron or call on-demand from backend.

#### 14) Sign-in UX gaps
- Current
  - “Forgot password” links to `/forgot-password` (no route).
- Intended
  - Implement route or remove link.
- Fix
  - Add page and flow using Supabase `resetPasswordForEmail`, or hide until ready.

#### 15) Minor robustness
- Current
  - `AuthCallback` relies on session being immediately available; no retry logic.
  - `NotFound` logs to console in production.
- Intended
  - Tolerant callback handling; avoid noisy prod logs.
- Fix
  - Add a short retry or `onAuthStateChange` fallback in the callback; use a logger with levels or remove console.error in prod.

### Prioritized remediation
- Critical (Security/data):
  - Replace public RLS with token/owner-scoped policies; enforce `can_view_stories` in `stories` RLS.
  - Move Supabase keys to env; stop committing anon key.
- High (Correctness/UX):
  - Fix `get_storyteller_by_email` call; update `AuthCallback` to handle code exchange and token expiration; unify magic-link redirect.
  - Implement/disable missing routes; fix `NotFound` navigation; guard CSV export on empty.
  - Add uniqueness constraint for `stories(storyteller_id)` or support multiples end-to-end.
- Medium (Quality):
  - Split large components; tighten TS and ESLint gradually.
  - Token lifecycle: extend cleanup and schedule.


