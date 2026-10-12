import type { ServiceType } from './service';

import type { LeadSource } from './order';

export interface ClientRecord {
  id: string;
  fullName: string;
  phone: string;
  cantonDistrict: string;
  exactAddress: string;
  serviceType: ServiceType;
  source: LeadSource;
  lastServiceDate: string; // ISO date string YYYY-MM-DD
  recommendedCycleMonths: number; // 6 para grasa, 12 para tanque séptico
  notes?: string;
  totalSpent: number;
}

export interface ClientReminder {
  client: ClientRecord;
  monthsElapsed: number;
  isDue: boolean;
  dueDate: string;
  recommendedAction: string;
  prefilledWhatsAppMessage: string;
}
