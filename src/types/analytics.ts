export type TimeFilter = 'dia' | 'semana' | 'mes' | 'todos';

export type TrafficEventType = 'visita' | 'clic_llamada' | 'clic_whatsapp' | 'reserva_gps';

export interface TrafficEvent {
  id: string;
  timestamp: string; // ISO date string
  type: TrafficEventType;
  source: 'google_ads' | 'organico' | 'directo';
}

export interface FunnelStats {
  totalVisits: number;
  adsVisits: number;
  callClicks: number;
  whatsappClicks: number;
  gpsReservations: number;
  totalConversions: number;
  conversionRate: number;
  adsClientsCount: number;
}
