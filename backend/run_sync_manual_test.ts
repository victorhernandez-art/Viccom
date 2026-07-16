import 'dotenv/config'
import { runFullSync } from './src/services/sync'

async function test() {
  console.log('Iniciando runFullSync localmente...')
  try {
    await runFullSync()
    console.log('runFullSync completado exitosamente.')
  } catch (error) {
    console.error('Error capturado en el test:', error)
  }
}

test()
