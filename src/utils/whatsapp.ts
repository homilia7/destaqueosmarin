import type { ServiceItem } from '../types/service';
import type { LocationData } from '../types/order';

interface OrderMessageParams {
  activeService: ServiceItem;
  urgency: 'inmediato' | 'hoy_mismo' | 'manana';
  scheduledTime?: string;
  customerName: string;
  customerPhone: string;
  finalAddress: string;
  finalLandmarks: string;
  location: LocationData;
  finalMapsUrl: string;
}

export function buildWhatsAppEmergencyMessage({
  activeService,
  urgency,
  scheduledTime,
  customerName,
  customerPhone,
  finalAddress,
  finalLandmarks,
  location,
  finalMapsUrl,
}: OrderMessageParams): string {
  const priorityText =
    urgency === 'inmediato'
      ? '⚡ Urgencia inmediata (¡Urgencia Ya!)'
      : urgency === 'manana'
      ? `📅 Programado para Mañana a las ${scheduledTime || 'por confirmar'}`
      : '🕒 Hoy mismo programado';

  const message = `🚨 *SOLICITUD DE SERVICIO - MAURICIO MARÍN* 🚨
🛠 *Servicio:* ${activeService.title}
⚡ *Prioridad:* ${priorityText}
${urgency === 'manana' && scheduledTime ? `⏰ *Hora Reservada:* ${scheduledTime}\n` : ''}👤 *Cliente:* ${customerName || 'Cliente Particular'}
📞 *Teléfono:* ${customerPhone || 'El de este chat'}
📍 *Dirección:* ${finalAddress}
🚩 *Señas exactas:* ${finalLandmarks || 'Coordinar por llamada'}
🗺 *Ruta GPS (Google Maps):* ${finalMapsUrl}
🚗 *Ruta GPS (Waze):* ${location.wazeUrl || 'Ruta generada con señas'}
Por favor confirmarme disponibilidad y agendamiento.`;

  return `https://wa.me/50661141421?text=${encodeURIComponent(message)}`;
}
