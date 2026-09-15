/** Single source of truth for runtime data mode.
 *
 * The app runs against the LIVE gateway by default. MSW mocks are opt-in via
 * `VITE_ENABLE_MOCKS=true` — used by the e2e suite (playwright.config sets it)
 * and for offline development. */
export const MOCKS_ON =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true'
