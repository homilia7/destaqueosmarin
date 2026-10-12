import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TimeFilter, TrafficEvent, FunnelStats } from '../types/analytics';

const ANALYTICS_STORAGE_KEY = 'destaqueos_analytics_v1';

const generateSeedEvents = (): TrafficEvent[] => {
  const events: TrafficEvent[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  // Eventos de hoy
  for (let i = 0; i < 24; i++) {
    events.push({ id: `e-today-${i}`, timestamp: new Date(now - i * 1800000).toISOString(), type: 'visita', source: i % 2 === 0 ? 'google_ads' : 'organico' });
  }
  for (let i = 0; i < 7; i++) {
    events.push({ id: `e-call-${i}`, timestamp: new Date(now - i * 3600000).toISOString(), type: 'clic_llamada', source: 'google_ads' });
  }
  for (let i = 0; i < 5; i++) {
    events.push({ id: `e-book-${i}`, timestamp: new Date(now - i * 5000000).toISOString(), type: 'reserva_gps', source: 'google_ads' });
  }

  // Eventos de días anteriores de la semana/mes
  for (let d = 1; d <= 25; d++) {
    for (let k = 0; k < 12; k++) {
      events.push({
        id: `e-past-${d}-${k}`,
        timestamp: new Date(now - d * dayMs - k * 3600000).toISOString(),
        type: k % 4 === 0 ? 'clic_llamada' : k % 5 === 0 ? 'reserva_gps' : 'visita',
        source: k % 3 === 0 ? 'google_ads' : 'organico',
      });
    }
  }
  return events;
};

export function useAnalytics() {
  const [events, setEvents] = useState<TrafficEvent[]>(() => {
    const saved = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : generateSeedEvents();
  });

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('dia');

  useEffect(() => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const trackEvent = useCallback((type: TrafficEvent['type']) => {
    const isGoogleAds = window.location.search.includes('utm_source=google') ||
                        window.location.search.includes('gclid') ||
                        localStorage.getItem('traffic_source') === 'google_ads';

    const newEvent: TrafficEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type,
      source: isGoogleAds ? 'google_ads' : 'organico',
    };
    setEvents((prev) => [newEvent, ...prev]);
  }, []);

  const stats = useMemo<FunnelStats>(() => {
    const now = new Date();
    const filtered = events.filter((e) => {
      const eventDate = new Date(e.timestamp);
      const diffMs = now.getTime() - eventDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeFilter === 'dia') return diffDays <= 1;
      if (timeFilter === 'semana') return diffDays <= 7;
      if (timeFilter === 'mes') return diffDays <= 30;
      return true; // todos
    });

    const totalVisits = filtered.filter((e) => e.type === 'visita').length;
    const adsVisits = filtered.filter((e) => e.type === 'visita' && e.source === 'google_ads').length;
    const callClicks = filtered.filter((e) => e.type === 'clic_llamada').length;
    const whatsappClicks = filtered.filter((e) => e.type === 'clic_whatsapp').length;
    const gpsReservations = filtered.filter((e) => e.type === 'reserva_gps').length;

    const totalConversions = callClicks + whatsappClicks + gpsReservations;
    const conversionRate = totalVisits > 0 ? Math.round((totalConversions / totalVisits) * 1000) / 10 : 0;

    return {
      totalVisits,
      adsVisits,
      callClicks,
      whatsappClicks,
      gpsReservations,
      totalConversions,
      conversionRate,
      adsClientsCount: gpsReservations + Math.round(callClicks * 0.7),
    };
  }, [events, timeFilter]);

  return {
    events,
    stats,
    timeFilter,
    setTimeFilter,
    trackEvent,
  };
}
