# 📋 HISTORIAL DE CAMBIOS - DESTAQUEOS MAURICIO MARÍN

Este documento es la **Memoria Protegida** del proyecto. Todas las funcionalidades registradas aquí se consideran inmutables y no deben ser revertidas ni borradas por asistentes de IA.

---

## 🚀 [2026-10-12] - Inicialización y Versión 1.0 (Sistema Integral de Emergencias y Control)
- **Estado:** ✅ Completado y Verificado
- **Arquitectura:** React 19 + TypeScript + Vite + Tailwind CSS v4 + ARQMODULAR (<180 líneas por componente).
- **Módulos Implementados:**
  1. **Landing de Emergencia 24/7:** Botón directo de llamada rápida al 6114-1421 y WhatsApp preconfigurado con tiempos de llegada garantizados.
  2. **Selector de Ubicación GPS Tipo Uber:**
     - Detección automática de coordenadas GPS (`navigator.geolocation`) de alta precisión.
     - Campo de señas costarricenses y dirección manual.
     - Botones de 1 toque para abrir la ruta en **Waze** (`https://waze.com/ul?ll=...`) y **Google Maps** (`https://www.google.com/maps/dir/...`).
     - Botón de WhatsApp con coordenadas exactas integradas.
  3. **Radar Operativo de Emergencias (Panel Admin):**
     - Lista de solicitudes en tiempo real para Mauricio mientras conduce.
     - Botón directo "Navegar con Waze / Google Maps" tipo Uber Driver.
  4. **Caja y Control de Ingresos SINPE Móvil & Efectivo:**
     - Registro de pagos SINPE con número de comprobante para evitar estafas.
     - Registro de efectivo y gastos de ruta (diesel).
     - Cierre y balance diario automatizado.
  5. **CRM de Clientes & Alertas de Mantenimiento Preventivo (6 y 12 meses):**
     - Directorio de clientes con teléfonos y servicios previos.
     - Cálculo automático de mantenimientos vencidos (tanques sépticos y trampas de grasa).
     - Disparador de WhatsApp para re-contratación con 1 clic.
  6. **Generador de Recibos Digitales Express:** Generación de comprobante formal para clientes vía WhatsApp.
  7. **Guía de Estrategia Google Ads y SEO Local (Google Maps):** Campañas de búsqueda, llamadas y palabras clave negativas.

---

## 🚀 [2026-10-12] - Versión 1.1 (Etiquetado y Analítica de Tráfico Google Ads)
- **Estado:** ✅ Completado y Verificado
- **Módulos Implementados:**
  1. **Etiquetado de Clientes de Google Ads:** Badge visual `[Google Ads]` en clientes y solicitudes de emergencias activas.
  2. **Filtros Temporales (Día, Semana, Mes, Todos):** Selector de rango de tiempo para evaluar la adquisición de clientes.
  3. **Embudo de Métricas en Vivo (`AdsAnalyticsView`):**
     - Total de visitas a la web y visitas específicas desde Google Ads.
     - Clics en el botón de llamada directa al 6114-1421.
     - Reservas y solicitudes enviadas con coordenadas GPS por WhatsApp.
     - Cálculo de la tasa de conversión porcentual real (visitas vs contactos).
  4. **Filtro de Origen en CRM:** Posibilidad de ver "Todos los clientes" o "Solo clientes que llegaron por Google Ads".

