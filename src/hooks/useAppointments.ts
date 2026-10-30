import { useState, useEffect, useCallback, useRef } from 'react';
import { Appointment, AppointmentStatus, CreateAppointmentDto } from '../types/appointment';
import { api } from '../services/api';
import { playNotificationChime } from '../utils/soundAlert';

export function useAppointments(isPollingActive = true) {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('destaqueos_appointments_v2') || localStorage.getItem('royalty_appointments');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newAppointmentAlert, setNewAppointmentAlert] = useState<Appointment | null>(null);
  const previousIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const fetchAppointments = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await api.getAppointments();
      
      // Detectar si hay citas nuevas para disparar alerta sonora y toast
      if (!isFirstLoadRef.current && isBackground) {
        const newApps = data.filter((app) => !previousIdsRef.current.has(app.id));
        if (newApps.length > 0) {
          playNotificationChime();
          setNewAppointmentAlert(newApps[0]);
        }
      }

      previousIdsRef.current = new Set(data.map((a) => a.id));
      isFirstLoadRef.current = false;
      setAppointments(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Error fetching appointments:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Polling inteligente con detección de visibilidad de pestaña (Anti-Drain Polling)
  useEffect(() => {
    fetchAppointments(false);

    if (!isPollingActive) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          fetchAppointments(true);
        }
      }, 15000); // 15 segundos racional
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchAppointments(true);
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAppointments, isPollingActive]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const updated = await api.updateAppointmentStatus(id, status);
    if (updated) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };

  const updateService = async (id: string, service_type: string) => {
    const updated = await api.updateAppointmentService(id, service_type);
    if (updated) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };

  const updatePayment = async (
    id: string, 
    amount: number, 
    payment_method: string, 
    payment_breakdown?: any[]
  ) => {
    const updated = await api.updateAppointmentPayment(id, amount, payment_method, payment_breakdown);
    if (updated) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };

  const createAppointment = async (dto: CreateAppointmentDto) => {
    const created = await api.createAppointment(dto);
    if (created) {
      setAppointments((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
    }
    return created;
  };

  const dismissAlert = () => setNewAppointmentAlert(null);

  return {
    appointments,
    loading,
    lastUpdated,
    newAppointmentAlert,
    dismissAlert,
    refresh: () => fetchAppointments(false),
    createAppointment,
    updateStatus,
    updateService,
    updatePayment
  };
}
