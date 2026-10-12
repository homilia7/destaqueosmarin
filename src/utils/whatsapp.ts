import type { ServiceItem } from '../types/service';
import type { LocationData } from '../types/order';

interface OrderMessageParams {
  activeService: ServiceItem;
  urgency: 'inmediato' | 'hoy_mismo';
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
  customerName,
  customerPhone,
  finalAddress,
  finalLandmarks,
  location,
  finalMapsUrl,
}: OrderMessageParams): string {
  const message = `🚨 *SOLICITUD DE SERVICIO URGENTE - MAURICIO MARÍN* 🚨
🛠 *Servicio:* ${activeService.title}
⚡ *Prioridad:* ${urgency === 'inmediato' ? 'Urgencia inmediata (De ya para ya)' : 'Hoy mismo'}
👤 *Cliente:* ${customerName || 'Cliente Particular'}
📞 *Teléfono:* ${customerPhone || 'El de este chat'}
📍 *Dirección:* ${finalAddress}
🚩 *Señas exactas:* ${finalLandmarks || 'Coordinar por llamada'}
🗺 *Ruta GPS (Google Maps):* ${finalMapsUrl}
🚗 *Ruta GPS (Waze):* ${location.wazeUrl || 'Ruta generada con señas'}
Por favor confirmarme disponibilidad y tiempo estimado de llegada al camión/técnico.`;

  return `https://wa.me/50661141421?text=${encodeURIComponent(message)}`;
}
