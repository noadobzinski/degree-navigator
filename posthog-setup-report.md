# PostHog post-wizard report

The wizard has completed a full PostHog integration for Decree — a Yale College degree navigator built on TanStack Start. PostHog is initialized client-side via `PostHogProvider` in the root shell, with a Vite reverse proxy routing `/ingest/*` traffic. A singleton `posthog-node` client handles server-side tracking from TanStack Start server functions. Users are identified by their Supabase user ID on sign-in and sign-up. 12 events are captured across 6 files covering the entire user journey from sign-up through degree audit.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User creates a new account via email | `src/routes/login.tsx` |
| `user_signed_in` | User signs in via email or Google | `src/routes/login.tsx` |
| `dashboard_viewed` | Authenticated user loads their degree audit — top of audit funnel | `src/routes/_authenticated/dashboard.tsx` |
| `profile_saved` | User saves degree configuration (major, degree, certificates, etc.) | `src/routes/_authenticated/settings.tsx` |
| `double_major_enabled` | User enables double major in Settings | `src/routes/_authenticated/settings.tsx` |
| `course_added` | User adds a course from the catalog browser (client-side) | `src/routes/_authenticated/courses.tsx` |
| `course_removed` | User removes a course from their list | `src/routes/_authenticated/courses.tsx` |
| `course_status_updated` | User changes a course's status (planned / in_progress / completed) | `src/routes/_authenticated/courses.tsx` |
| `major_previewed` | User clicks a major card in the Major Explorer | `src/routes/_authenticated/majors.tsx` |
| `major_set_as_primary` | User clicks "Set as my major" from the Major Explorer | `src/routes/_authenticated/majors.tsx` |
| `profile_updated` | Server-side confirmation of profile persisted to DB | `src/lib/audit.functions.ts` |
| `course_added` | Server-side confirmation of course persisted to DB | `src/lib/audit.functions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/496886/dashboard/1797049)
- [New user sign-ups](https://us.posthog.com/project/496886/insights/ST1Lan19)
- [Sign-up to audit funnel](https://us.posthog.com/project/496886/insights/9rQXpqRS)
- [Course activity trend](https://us.posthog.com/project/496886/insights/H5nfUBPA)
- [Major exploration engagement](https://us.posthog.com/project/496886/insights/VDc03ooe)
- [Degree audit engagement](https://us.posthog.com/project/496886/insights/1wZ63fmU)

## Verify before merging

- [ ] Run a full production build (`bun run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `posthog.identify()` is only called on fresh email login/signup. Consider calling it in the root `beforeLoad` when a Supabase session is already present, so returning users are identified on every session start.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
