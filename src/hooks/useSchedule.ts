import { useState, useEffect, useMemo } from 'react';
import type { WorkScheduleConfig, TimeSlot } from '../types/schedule';
import type { EmergencyOrder } from '../types/order';

const STORAGE_KEY = 'destaqueos_work_schedule_v1';

const DEFAULT_CONFIG: WorkScheduleConfig = {
  startHour: 7, // 7:00 AM
  endHour: 17, // 5:00 PM
  workDays: [1, 2, 3, 4, 5, 6, 0], // Lunes a Domingo activo
  lunchHour: 12, // 12:00 PM (12 a 13)
  lunchBreakEnabled: true,
  blockedSlots: ['12:00 PM'],
};

export function formatHour12(hour24: number): string {
  if (hour24 === 0) return '12:00 AM';
  if (hour24 < 12) return `${String(hour24).padStart(2, '0')}:00 AM`;
  if (hour24 === 12) return '12:00 PM';
  const h = hour24 - 12;
  return `${String(h).padStart(2, '0')}:00 PM`;
}

export function useSchedule(orders: EmergencyOrder[] = []) {
  const [config, setConfig] = useState<WorkScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Genera las franjas horarias configuradas para Mañana
  const timeSlots = useMemo<TimeSlot[]>(() => {
    const slots: TimeSlot[] = [];
    const tomorrowDayOfWeek = (new Date().getDay() + 1) % 7;
    const isTomorrowWorkingDay = config.workDays.includes(tomorrowDayOfWeek);

    if (!isTomorrowWorkingDay) {
      return [];
    }

    for (let hour = config.startHour; hour <= config.endHour; hour++) {
      const label = formatHour12(hour);
      const isLunch = config.lunchBreakEnabled && hour === config.lunchHour;
      const isManuallyBlocked = config.blockedSlots.includes(label);

      // Revisar si ya hay una orden agendada para esa hora
      const matchedOrder = orders.find(
        (o) =>
          o.urgencyLevel === 'manana' &&
          o.status !== 'cancelado' &&
          o.scheduledTime === label
      );

      const isBooked = Boolean(matchedOrder);
      const isAvailableForClient = !isLunch && !isManuallyBlocked && !isBooked;

      slots.push({
        hour24: hour,
        label,
        isLunch,
        isBooked,
        isManuallyBlocked,
        isAvailableForClient,
        bookedDetails: matchedOrder
          ? {
              customerName: matchedOrder.customerName,
              orderId: matchedOrder.id,
              serviceTitle: matchedOrder.serviceType,
            }
          : undefined,
      });
    }

    return slots;
  }, [config, orders]);

  const updateConfig = (updates: Partial<WorkScheduleConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const toggleWorkDay = (dayId: number) => {
    setConfig((prev) => {
      const exists = prev.workDays.includes(dayId);
      const newDays = exists
        ? prev.workDays.filter((d) => d !== dayId)
        : [...prev.workDays, dayId];
      return { ...prev, workDays: newDays };
    });
  };

  const toggleBlockSlot = (slotLabel: string) => {
    setConfig((prev) => {
      const exists = prev.blockedSlots.includes(slotLabel);
      const newBlocked = exists
        ? prev.blockedSlots.filter((s) => s !== slotLabel)
        : [...prev.blockedSlots, slotLabel];
      return { ...prev, blockedSlots: newBlocked };
    });
  };

  const setWorkingHours = (startHour: number, endHour: number) => {
    setConfig((prev) => ({ ...prev, startHour, endHour }));
  };

  const setLunchHour = (lunchHour: number) => {
    setConfig((prev) => ({ ...prev, lunchHour }));
  };

  const toggleLunchBreak = (enabled: boolean) => {
    setConfig((prev) => ({ ...prev, lunchBreakEnabled: enabled }));
  };

  return {
    config,
    timeSlots,
    updateConfig,
    toggleWorkDay,
    toggleBlockSlot,
    setWorkingHours,
    setLunchHour,
    toggleLunchBreak,
  };
}
