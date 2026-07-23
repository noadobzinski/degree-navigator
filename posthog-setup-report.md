# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Decree Yale degree navigator. Changes were made across 8 files: the root shell now wraps the app in `PostHogProvider` (with a `/ingest` reverse proxy configured in `vite.config.ts`), users are identified on sign-in and sign-up using their Supabase user ID, returning visitors are re-identified on every authenticated page load, and `posthog.reset()` is called on sign-out. Ten meaningful user-action events are now captured across the authentication, profile setup, course management, schedule planning, and major exploration flows. A singleton `posthog-node` client is available at `src/utils/posthog-server.ts` for future server-side tracking.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User successfully creates a new account via the email signup form. | `src/routes/login.tsx` |
| `user_signed_in` | User successfully signs in with email and password. | `src/routes/login.tsx` |
| `password_reset_requested` | User submits the forgot-password form to receive a reset link. | `src/routes/login.tsx` |
| `profile_saved` | User saves their degree profile including major, degree type, certificates, and class year. | `src/routes/_authenticated/settings.tsx` |
| `major_previewed` | User clicks a major card in the Major Explorer to view its requirements. | `src/routes/_authenticated/majors.tsx` |
| `course_added` | User adds a course to their course list from the catalog browser. | `src/routes/_authenticated/courses.tsx` |
| `course_removed` | User removes a course from their course list. | `src/routes/_authenticated/courses.tsx` |
| `course_status_updated` | User changes the status of a course (planned, in_progress, completed). | `src/routes/_authenticated/courses.tsx` |
| `planner_course_added` | User adds a course to a specific semester in the schedule planner. | `src/routes/_authenticated/planner.tsx` |
| `degree_audit_viewed` | User views the degree audit dashboard with an active major selected. | `src/routes/_authenticated/dashboard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/496886/dashboard/1892238)
- [User signups and sign-ins (wizard)](https://us.posthog.com/project/496886/insights/THntraoR)
- [Onboarding funnel: signup → profile saved → course added (wizard)](https://us.posthog.com/project/496886/insights/qOe0UOTK)
- [Course activity trend (wizard)](https://us.posthog.com/project/496886/insights/inkLNwKa)
- [Majors previewed by department (wizard)](https://us.posthog.com/project/496886/insights/FQs9sH74)
- [Degree audit engagement (wizard)](https://us.posthog.com/project/496886/insights/j04cVsH3)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the `_authenticated.tsx` layout already does this via `useEffect`, but verify it fires before any events on the first authenticated page load.
- [ ] Supabase data sources were found in this project. Run `npx @posthog/wizard warehouse` to connect them to PostHog's data warehouse for richer cross-source analytics.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
