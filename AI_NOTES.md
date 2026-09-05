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

## 🚀 Últimos Cambios Implementados (Septiembre 2026)

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

### 3. Migración de Servidor de Despliegue (Netlify -> Vercel)
*   **Eliminación de `netlify.toml`:** Se removió la configuración obsoleta de Netlify para evitar redundancias, ya que Vercel utiliza automáticamente el archivo `next.config.ts` para la optimización de imágenes y rutas.
*   **Ajustes en Ficha de Producto ([page.tsx](file:///c:/xampp/htdocs/Viccom/app/\(public\)/producto/\[slug\]/page.tsx)):** Se modificó la documentación y comentarios internos para reflejar el uso del hosting en Vercel.
*   **Ficha Técnica Dinámica ([IcecatSpecs.tsx](file:///c:/xampp/htdocs/Viccom/components/product/IcecatSpecs.tsx)):** Se adaptó el componente para que muestre de forma dinámica la procedencia de la información (Open Icecat en caso de éxito, o el fallback local de CT si la API falla).

### 4. Rediseño Premium del Banner Principal (HeroBanner)
*   **Texto y Acciones Abajo ([HeroBanner.tsx](file:///c:/xampp/htdocs/Viccom/components/home/HeroBanner.tsx)):** Para no tapar los detalles de las imágenes diseñadas del banner, el subtítulo, descripción y llamados a la acción se mantienen abajo del slider, con espaciados y tipografías refinadas y botones con bordes suavizados (`rounded-xl`).
*   **Aspecto Responsivo y Controles:** Se optimizó el slider para usar una relación de aspecto de `aspect-[16/9] md:aspect-[3/1]` para una visualización correcta en móviles, y se estilizaron los controles de navegación (flechas en hover e indicadores dinámicos).

### 5. Soporte y Activación de Promociones del Proveedor (CT Internacional)
*   **Diagnóstico:** El catálogo presentaba dos problemas en las ofertas:
    1. El parser original solo buscaba `tipo === 'importe'`. Al flexibilizarlo, se descubrió que CT Internacional maneja dos tipos:
       - `tipo: 'importe'`: el campo `promocion` es el costo final en moneda (ej. $76.20).
       - `tipo: 'porcentaje'`: el campo `promocion` es el % de descuento (ej. 10%, 20%, 50%).
       Al tratarse ambos como importe monetario, productos con 50% de descuento (como el antivirus ESET `SOFEST3860` o impresoras) guardaban `costo_promocion = 50` pesos en vez del costo con 50% de descuento, vendiéndose a precios absurdos como $75.40 o $9.74 pesos.
    2. La base de datos descartaba las promociones evaluando `fecha_fin_oferta > NOW()`, mientras que CT enviaba fechas ya pasadas para promociones que mantenía activas en su feed diario.
*   **Correcciones Implementadas:**
    *   **Parser ([processCatalog.ts](file:///c:/xampp/htdocs/Viccom/backend/src/services/ctconnect/processCatalog.ts)):** Distingue explícitamente entre `porcentaje` ($costo = precio \times (1 - promo/100)$) e `importe` ($costo = promo$), validando que el costo calculado sea positivo y menor al precio de lista, y seleccionando la promoción de mayor descuento neto para el usuario.
    *   **Base de Datos ([recalcular_precios_masivo](file:///c:/xampp/htdocs/Viccom/database/migration_promocion_proveedor.sql)):** Se actualizó la función en Supabase para activar `en_oferta = TRUE` y calcular el `precio_antes` tachado automáticamente siempre que `costo_promocion > 0`, sin bloquear por fechas desfasadas del proveedor. Todos los precios de oferta y tachados han sido recalculados y normalizados.
    *   **Trigger de Protección Permanente ([migration_protect_promociones_trigger.sql](file:///c:/xampp/htdocs/Viccom/database/migration_protect_promociones_trigger.sql)):** Regla `BEFORE INSERT OR UPDATE` en PostgreSQL que previene que cualquier sincronizador desactualizado guarde porcentajes como importes monetarios, convirtiendo automáticamente el valor a costo con descuento neto.

### 6. Optimización Integral de Egress en Supabase (Límite Plan Gratuito 5GB)
*   **Ajuste del Cron (VPS):** Se modificó la frecuencia en [cronSync.ts](file:///c:/xampp/htdocs/Viccom/backend/src/jobs/cronSync.ts) de `*/15 * * * *` a `0 */3 * * *` (cada 3 horas), reduciendo las consultas periódicas en un 91.6% (de 96 a 8 ejecuciones diarias).
*   **Sincronización Inteligente (Smart Diff en [syncProducts.ts](file:///c:/xampp/htdocs/Viccom/backend/src/services/ctconnect/syncProducts.ts)):**
    *   Antes de cada inserción, se descarga un mapa mínimo en memoria (`sku_ct, costo_ct, costo_promocion, existencia_total, activo, descontinuado`).
    *   Se compara cada producto entrante: si no hay cambios en costo, oferta o existencia, **se omite del lote de upsert**.
    *   Reduce el payload transmitido a Supabase de ~15 MB a unos pocos KB por ciclo.
*   **Estrategia ISR y Caché de Vercel (Frontend Next.js):**
    *   Se eliminó `force-dynamic` en el catálogo público y se configuró `export const revalidate = 3600` (1 hora) en:
        *   `app/(public)/catalogo/page.tsx`
        *   `app/(public)/producto/[slug]/page.tsx`
        *   `app/(public)/page.tsx` (Home)
        *   `app/(public)/categoria/[[...slug]]/page.tsx`
        *   `app/(public)/marca/[slug]/page.tsx`
    *   Las páginas se sirven desde la CDN Edge de Vercel en caché, eliminando las consultas repetitivas a Supabase por cada visita de usuarios o bots.
*   **Podado de Consultas SQL:** Se reemplazó `select('*')` en todas las páginas públicas por proyecciones explícitas de columnas (`CATALOG_CARD_FIELDS`), evitando transferir campos pesados como descripciones completas, fichas técnicas y JSONs de especificaciones en listados y carruseles.

### 7. Buscador Optimizado de Categorías y Productos en Panel Comercial (/admin/configuracion)
*   **Búsqueda Instantánea en Cliente ([MarginSettings.tsx](file:///c:/xampp/htdocs/Viccom/components/admin/MarginSettings.tsx)):**
    *   Filtra en tiempo real (0ms de latencia) entre las 328 categorías activas normalizando acentos y minúsculas por `nombre`, jerarquía `path` (ej. `computadoras / laptops`) y `slug`.
    *   Permite escribir términos como `"lap"`, `"antivirus"`, `"monitor"`, `"brother"`, etc., mostrando inmediatamente solo las categorías relevantes sin necesidad de hacer scroll vertical extensivo.
*   **Búsqueda Semántica por Producto ([search-by-product/route.ts](file:///c:/xampp/htdocs/Viccom/app/api/admin/categories/search-by-product/route.ts)):**
    *   API debounced (280ms) que consulta productos activos por nombre o SKU (`SOFEST`, `ESET`, `ThinkPad`, `Inspiron`) y vincula sus categorías automáticamente, mostrando una etiqueta visual destacada: *"Coincide con producto: [Nombre del producto]"*.
*   **Filtros Rápidos y Acciones:**
    *   Pestañas para alternar entre: *Todas*, *Con margen personalizado* y *Con margen global*.
    *   Botón para restablecer categoría al margen global con 1 clic.
    *   Barra flotante inferior para guardar o forzar recálculo sin perder la posición de scroll.

### 8. Buscador en Vivo del Catálogo Público con Autocompletado y Multicampo
*   **Componente Dinámico ([HeaderSearch.tsx](file:///c:/xampp/htdocs/Viccom/components/layout/HeaderSearch.tsx)):**
    *   Integra autocompletado en vivo tipo e-commerce moderno al escribir 2 o más letras en la barra principal del encabezado (desktop y móvil).
    *   Muestra popover desplegable con:
        1. **Categorías coincidentes:** acceso directo con 1 clic a la categoría (ej. `"lap"` sugiere *Laptops*, *Laptops Gaming*).
        2. **Marcas sugeridas:** acceso directo a la marca (ej. `"dell"` sugiere marca *Dell*).
        3. **Productos destacados:** miniatura, título, SKU, precio público, badge de oferta si aplica y precio antes tachado.
        4. Botón inferior *"Ver todos los resultados para '[búsqueda]' →"*.
    *   Soporta navegación por teclado (`Escape` para cerrar, botón `X` de limpieza rápida).
*   **Búsqueda Multicampo ([route.ts](file:///c:/xampp/htdocs/Viccom/app/api/search/route.ts), [buscar/page.tsx](file:///c:/xampp/htdocs/Viccom/app/\(public\)/buscar/page.tsx), [catalogo/page.tsx](file:///c:/xampp/htdocs/Viccom/app/\(public\)/catalogo/page.tsx)):**
    *   Ahora busca simultáneamente por `nombre`, `sku_ct`, `subcategoria`, `marca_nombre` y `categoria_nombre`.
    *   En la página `/buscar`, muestra píldoras interactivas con categorías y marcas relacionadas encima de la cuadrícula de productos.

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
