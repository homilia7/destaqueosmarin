import type { ServiceType } from './service';

export type OrderStatus = 'pendiente' | 'en_camino' | 'en_progreso' | 'completado' | 'cancelado';

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  addressText: string;
  landmarks: string; // Señas costarricenses
  googleMapsUrl: string;
  wazeUrl: string;
  accuracyMeters?: number;
}

export type LeadSource = 'google_ads' | 'organico' | 'directo' | 'recomendacion';

export interface EmergencyOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
  urgencyLevel: 'inmediato' | 'hoy_mismo' | 'programado';
  location: LocationData;
  status: OrderStatus;
  source: LeadSource;
  notes?: string;
  estimatedAmount?: number;
  paymentMethod?: 'sinpe' | 'efectivo' | 'pendiente';
}
