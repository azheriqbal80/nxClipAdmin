import { authHandlers } from './auth'
import { configHandlers } from './config'
import { creatorsHandlers } from './creators'
import { exploreHandlers } from './explore'
import { healthHandlers } from './health'
import { moderationHandlers } from './moderation'
import { queuesHandlers } from './queues'

/** All MSW request handlers, composed per feature. */
export const handlers = [
  ...authHandlers,
  ...configHandlers,
  ...creatorsHandlers,
  ...exploreHandlers,
  ...healthHandlers,
  ...moderationHandlers,
  ...queuesHandlers,
]
