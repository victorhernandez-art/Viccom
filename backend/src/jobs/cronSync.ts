import cron from 'node-cron'
import { runFullSync } from '../services/sync'
import { logger }      from '../utils/logger'

export function startCronJobs(): void {
  // Cada 15 minutos
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Cron triggered: starting scheduled sync')
    try {
      await runFullSync()
    } catch (err) {
      logger.error('Cron sync failed', { error: err instanceof Error ? err.message : err })
    }
  })

  logger.info('Cron job registered: sync every 15 minutes')
}
