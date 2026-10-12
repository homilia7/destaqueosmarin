# 🚰 Sistema Web Destaqueos Mauricio Marín 🇨🇷

Sistema integral de captación de emergencias 24/7, geolocalización GPS estilo Uber, caja de pagos SINPE/Efectivo, CRM de recordatorios preventivos y módulo de Google Ads.

## 🚀 Cómo ejecutar en tu computadora:
```bash
npm run dev
```
Luego abre `http://localhost:5180` en tu navegador (se abrirá automáticamente al ejecutar npm run dev).

## 📱 Módulos Principales:
1. **Landing de Emergencia:**
   - Botón de llamada al **6114-1421**.
   - Selector de servicios (Destaqueos, Tanques sépticos, Trampas de grasa, Drenajes).
   - Selector GPS en vivo con botones de **Waze** y **Google Maps** (estilo Uber).
   - Envío de pedido formateado a WhatsApp.
2. **Panel Operativo de Mauricio (Botón 'Modo Técnico' o 'Panel Operativo'):**
   - **Radar de Emergencias:** Ve las solicitudes de los clientes y abre la ruta en Waze/Maps para manejar hacia el sitio.
   - **Caja SINPE & Efectivo:** Registro de pagos, validador de número de comprobante SINPE y control de gastos de diesel.
   - **CRM y Recordatorios:** Alertas automáticas para enviar mensajes de mantenimiento preventivo a los 6 y 12 meses por WhatsApp.
   - **Generador de Recibos Digitales:** Envío de comprobante por WhatsApp al cliente con garantía de servicio.
   - **Google Ads & Maps:** Costos por clic (CPC) para Costa Rica, palabras clave de urgencia y palabras negativas obligatorias.
