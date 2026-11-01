import { Hono } from 'hono'
import { billsRouter } from './routes/bills'
import { healthRouter } from './routes/health'
import { homesRouter } from './routes/homes'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// Mount feature routers
app.route('/api/health', healthRouter)
app.route('/api/homes', homesRouter)
app.route('/api/bills', billsRouter)

// Global not found handler
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Global error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

export default app
