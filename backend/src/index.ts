import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors    from 'cors'
import { startCronJobs } from './jobs/cronSync'
import { runFullSync }   from './services/sync'
import { logger }        from './utils/logger'

const app  = express()
const PORT = Number(process.env.PORT ?? 3001)

app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? '*' }))
app.use(express.json())

// ── Autenticación simple por Bearer token ───────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.SYNC_SECRET
  const auth   = req.headers.authorization

  if (!secret || auth !== `Bearer ${secret}`) {
    res.status(401).json({ success: false, error: 'No autorizado' })
    return
  }
  next()
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'viccom-sync', timestamp: new Date().toISOString() })
})

// ── Disparar sincronización manual ───────────────────────────────────────────
app.post('/sync/trigger', requireAuth, async (_req, res) => {
  logger.info('Manual sync triggered via API')

  // Responder inmediatamente y ejecutar en background
  res.json({ success: true, message: 'Sincronización iniciada en background.' })

  runFullSync().catch(err => {
    logger.error('Error in manual sync', { error: err instanceof Error ? err.message : err })
  })
})

// ── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Sync service started on port ${PORT}`)
  startCronJobs()
})
