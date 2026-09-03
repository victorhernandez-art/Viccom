import cron from 'node-cron'
import { runFullSync } from '../services/sync'
import { logger }      from '../utils/logger'

export function startCronJobs(): void {
  // Cada 3 horas
  cron.schedule('0 */3 * * *', async () => {
    logger.info('Cron triggered: starting scheduled sync')
    try {
      await runFullSync()
    } catch (err) {
      logger.error('Cron sync failed', { error: err instanceof Error ? err.message : err })
    }
  })

  logger.info('Cron job registered: sync every 3 hours (0 */3 * * *)')
}
