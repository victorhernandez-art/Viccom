import * as ftp  from 'basic-ftp'
import * as fs   from 'fs'
import * as path from 'path'
import { logger } from '../../utils/logger'

const TMP_DIR = path.join(process.cwd(), 'tmp')

export async function downloadCatalog(): Promise<{ filePath: string; fileName: string }> {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true })
  }

  if (process.env.CT_API_URL) {
    return downloadCatalogFromApi()
  }

  return downloadCatalogFromFtp()
}

async function downloadCatalogFromApi(): Promise<{ filePath: string; fileName: string }> {
  const fileName = `ct-catalog-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const filePath = path.join(TMP_DIR, fileName)

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (process.env.CT_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.CT_API_TOKEN}`
  }

  logger.info('Downloading catalog from CT JSON API')

  const response = await fetch(process.env.CT_API_URL!, { headers })
  if (!response.ok) {
    throw new Error(`CT API responded ${response.status}: ${await response.text()}`)
  }

  const raw = await response.text()
  JSON.parse(raw)
  fs.writeFileSync(filePath, raw, 'utf-8')

  logger.info(`Downloaded CT API catalog to: ${filePath}`)
  return { filePath, fileName }
}

async function downloadCatalogFromFtp(): Promise<{ filePath: string; fileName: string }> {
  const client = new ftp.Client(30000)
  client.ftp.verbose = process.env.NODE_ENV === 'development'

  try {
    await client.access({
      host:     process.env.CT_FTP_HOST!,
      user:     process.env.CT_FTP_USER!,
      password: process.env.CT_FTP_PASS!,
      secure:   false,
    })

    logger.info('FTP connected to CT Connect')

    // Cambiar al directorio configurado
    const targetDir = process.env.CT_FTP_PATH ?? '/'
    logger.info(`Changing FTP directory to: ${targetDir}`)
    await client.cd(targetDir)

    // Listar archivos y obtener el más reciente
    const list = await client.list()
    const jsonFiles = list
      .filter(f => f.name.endsWith('.json') || f.name.endsWith('.JSON'))
      .sort((a, b) => (b.modifiedAt?.getTime() ?? 0) - (a.modifiedAt?.getTime() ?? 0))

    if (jsonFiles.length === 0) {
      throw new Error(`No se encontraron archivos JSON en el directorio FTP: ${targetDir}`)
    }

    const remoteFile = jsonFiles[0]
    const fileName   = `ct-catalog-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const filePath   = path.join(TMP_DIR, fileName)

    logger.info(`Downloading remote: ${remoteFile.name} to local: ${fileName}`)
    await client.downloadTo(filePath, remoteFile.name)
    logger.info(`Downloaded to: ${filePath}`)

    return { filePath, fileName }
  } finally {
    client.close()
  }
}
