import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** MSW worker for the browser (dev only). Started in app/main.tsx. */
export const worker = setupWorker(...handlers)
