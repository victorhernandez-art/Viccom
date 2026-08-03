// ─────────────────────────────────────────────────────────────────────────────
// VICCOM SYNC SERVICE — Configuración de PM2
// ─────────────────────────────────────────────────────────────────────────────
// PM2 es el administrador de procesos que mantiene el backend siempre corriendo.
// Para iniciar:    pm2 start ecosystem.config.js
// Para detener:    pm2 stop viccom-sync
// Para ver logs:   pm2 logs viccom-sync
// Para monitoreo:  pm2 monit
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  apps: [
    {
      // Nombre del proceso en PM2
      name: 'viccom-sync',

      // Archivo compilado de JavaScript (resultado de npm run build)
      script: 'dist/index.js',

      // Directorio de trabajo
      cwd: __dirname,

      // Modo fork: correcto para una sola instancia en Windows
      // (cluster está pensado para balanceo de carga con múltiples instancias)
      exec_mode: 'fork',
      instances: 1,

      // Reiniciar automáticamente si el proceso muere
      autorestart: true,

      // Reiniciar si el proceso consume más de 500 MB de RAM
      max_memory_restart: '500M',

      // Esperar 3 segundos antes de reiniciar tras un fallo
      restart_delay: 3000,

      // Modo watch desactivado en producción (no reiniciar al cambiar archivos)
      watch: false,

      // Variables de entorno de producción (se leen de backend/.env automáticamente)
      env: {
        NODE_ENV: 'production',
      },

      // Configuración de logs
      out_file:  './logs/pm2-out.log',    // Logs normales
      error_file: './logs/pm2-error.log', // Logs de errores
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Combinar logs de salida y error en un solo archivo
      merge_logs: true,

      // Tiempo máximo de espera para que el proceso esté listo (30 segundos)
      listen_timeout: 30000,

      // Tiempo máximo para matar el proceso al detenerlo (10 segundos)
      kill_timeout: 10000,
    },
  ],
}
