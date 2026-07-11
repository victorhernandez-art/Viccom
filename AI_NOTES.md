# Proyecto Viccom E-commerce — Notas de Desarrollo e IA

Este archivo contiene el resumen de la arquitectura, variables de entorno y el historial de modificaciones recientes del proyecto **Viccom** para no perder el hilo de lo trabajado al cambiar entre proyectos.

---

## 🛠️ Arquitectura y Tecnologías
El proyecto consta de dos partes principales que interactúan con **Supabase** como base de datos y Backend-as-a-Service:

1.  **Frontend (Raíz):**
    *   **Framework:** Next.js (App Router) con TypeScript y TailwindCSS.
    *   **Rutas:**
        *   `app/(public)/` — Catálogo público, búsqueda, marcas y ficha de producto.
        *   `app/admin/` — Panel administrativo para configurar márgenes, sincronización y precios.
    *   **Librerías principales:** Client y Server de Supabase (`@supabase/ssr`), Radix UI, Lucide React.
2.  **Backend de Sincronización (en [backend/](file:///c:/xampp/htdocs/Viccom/backend)):**
    *   **Framework:** Node.js + Express + TypeScript.
    *   **Propósito:** Sincronizar periódicamente el stock y costos desde el catálogo FTP de **CT Internacional** (CT Connect) mediante un cron programado (`node-cron`).
3.  **Base de Datos (Supabase PostgreSQL):**
    *   Ubicada en la nube de Supabase. El código SQL local para reconstruir o migrar la base de datos está en [database/schema.sql](file:///c:/xampp/htdocs/Viccom/database/schema.sql).

---

## 🚀 Últimos Cambios Implementados (Julio 2026)

### 1. Cálculo de Precios e Impuestos (IVA al 16%)
*   **Base de Datos SQL ([schema.sql](file:///c:/xampp/htdocs/Viccom/database/schema.sql)):**
    *   Actualizamos la función `calcular_precio_publico` y la lógica de recálculo masivo para sumar de forma automática el **16% de IVA** al costo del proveedor CT antes de aplicar el margen de ganancia configurado:
        $$\text{Precio Final} = \text{ROUND}((\text{costo\_ct} \times 1.16) \times (1 + \text{margen} / 100), 2)$$
    *   Se ajustó el trigger de auditoría para registrar correctamente el costo anterior sin IVA en el historial de precios (`price_history`).
*   **Motor Frontend ([pricing.ts](file:///c:/xampp/htdocs/Viccom/lib/pricing.ts)):**
    *   Se adaptaron las funciones `calcularPrecioPublico` y `calcularCostoDesdePrecio` en TypeScript para replicar con exactitud la fórmula matemática de la base de datos PostgreSQL, garantizando simulaciones idénticas en el Backoffice.

### 2. Galería de Múltiples Ángulos y Fichas Técnicas con Open Icecat (Gratuito)
*   **Configuración ([.env.local](file:///c:/xampp/htdocs/Viccom/.env.local)):**
    *   Se añadió la variable de entorno `NEXT_PUBLIC_ICECAT_USERNAME=openicecat-free`.
*   **Carrusel de Fotos Adicionales ([IcecatGallery.tsx](file:///c:/xampp/htdocs/Viccom/components/product/IcecatGallery.tsx)):**
    *   Componente cliente de React que utiliza el código de barras (`UPC/GTIN`) del producto para buscar imágenes alternativas en los servidores de Open Icecat.
    *   Si se obtienen múltiples imágenes, las renderiza en un carrusel interactivo con miniaturas táctiles. Si falla la búsqueda, el componente usa de forma segura la imagen original de CT Connect como fallback sin lanzar errores.
*   **Especificaciones Técnicas ([IcecatSpecs.tsx](file:///c:/xampp/htdocs/Viccom/components/product/IcecatSpecs.tsx)):**
    *   Componente que estructura las especificaciones detalladas del producto (procesador, memoria, dimensiones, etc.) en tablas minimalistas.
*   **Página del Producto ([page.tsx](file:///c:/xampp/htdocs/Viccom/app/\(public\)/producto/\[slug\]/page.tsx)):**
    *   Se acoplaron ambos componentes para que carguen de forma asíncrona al abrir un producto.

---

## ☁️ Guía Básica de Supabase para el Proyecto
Supabase es la base de datos en la nube que alimenta este sitio. Aquí tienes algunos conceptos clave:

1.  **Tablas Clave:**
    *   `products`: Catálogo principal de productos sincronizados de CT Internacional.
    *   `settings`: Ajustes globales como `margen_global` (por defecto `30%`).
    *   `categories`: Categorías de productos. Admite márgenes específicos (`margen_override`) que anulan el global.
    *   `price_history`: Auditoría histórica de cambios de costos y precios.
2.  **Políticas RLS (Row Level Security):**
    *   Protegen las tablas. Los clientes sólo pueden leer datos (`SELECT`), mientras que el panel administrativo y el backend de sincronización tienen permisos de escritura (`INSERT/UPDATE`) usando la clave de servicio protegida.
3.  **Mantenimiento de Funciones y Triggers:**
    *   Si deseas realizar un cambio en el esquema de la base de datos, modifícalo en [schema.sql](file:///c:/xampp/htdocs/Viccom/database/schema.sql) y luego ejecútalo en el **Editor SQL** del panel de control de Supabase.

---
*Nota: Lee y actualiza este archivo en cada sesión de desarrollo para mantener al día el estado de avance del e-commerce.*
