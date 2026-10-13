export interface WorkScheduleConfig {
  startHour: number; // Ej. 7 para 7:00 AM
  endHour: number; // Ej. 17 para 5:00 PM
  workDays: number[]; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  lunchHour: number; // Ej. 12 para 12:00 PM
  lunchBreakEnabled: boolean;
  blockedSlots: string[]; // Ej. ['12:00 PM', '01:00 PM'] bloqueadas manualmente
}

export interface TimeSlot {
  hour24: number;
  label: string; // Ej. "07:00 AM", "12:00 PM", "02:00 PM"
  isLunch: boolean; // Si es hora de almuerzo (Privado para el dueño)
  isBooked: boolean; // Si ya fue reservada por una orden real
  isManuallyBlocked: boolean; // Si el dueño la bloqueó manualmente
  isAvailableForClient: boolean; // Para el cliente: true solo si no está ocupada ni en almuerzo
  bookedDetails?: {
    customerName: string;
    orderId: string;
    serviceTitle: string;
  };
}

export const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 0, name: 'Domingo', short: 'Dom' },
];
