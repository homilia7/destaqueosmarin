import { useState, useEffect, useCallback, useRef } from 'react';
import { SavedQuoteEntry, JobQuote } from '../types/quote';
import { Appointment } from '../types/appointment';
import { api } from '../services/api';

const HISTORY_STORAGE_KEY = 'destaqueos_saved_quotes_history';

export function useQuotes(isPollingActive = true) {
  const [quotes, setQuotes] = useState<SavedQuoteEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchQuotes = useCallback(async (isBackground = false) => {
    if (isFetchingRef.current) return;
    if (!isBackground) setLoading(true);
    isFetchingRef.current = true;

    try {
      const remote = await api.getQuotes();
      if (Array.isArray(remote) && remote.length > 0) {
        const mapped: SavedQuoteEntry[] = remote.map((q: any) => ({
          id: q.id,
          appointmentId: q.appointment_id || undefined,
          fileName: q.file_name || `Cotizacion-${q.quote_number}`,
          savedAt: q.created_at || new Date().toISOString(),
          totalAmount: Number(q.total_amount) || 0,
          clientName: q.client_name || 'Cliente Particular',
          workReference: q.work_reference || 'Trabajo Técnico',
          status: (q.status as 'por_enviar' | 'enviada') || 'por_enviar',
          sentAt: q.status === 'enviada' ? (q.updated_at || null) : null,
          viewCount: Number(q.view_count) || 0,
          isDownloaded: Boolean(q.is_downloaded),
          downloadedAt: q.downloaded_at ? new Date(q.downloaded_at).toLocaleString('es-CR') : null,
          shareUrl: `${window.location.origin}/cotizacion/${q.id}`,
          quoteData: {
            id: q.id,
            appointmentId: q.appointment_id || undefined,
            quoteNumber: q.quote_number,
            date: q.date,
            status: (q.status as 'por_enviar' | 'enviada') || 'por_enviar',
            companyName: q.company_name || 'Destaqueos y Tanques Sépticos Mauricio Marín',
            companyLogoUrl: '/camion-destaqueos.png',
            customLogoUrl: null,
            clientName: q.client_name || '',
            clientLocation: q.client_location || '',
            clientPhone: q.client_phone || '',
            workReference: q.work_reference || '',
            scopeItems: typeof q.scope_items === 'string' 
              ? (() => { try { return JSON.parse(q.scope_items); } catch { return []; } })() 
              : (q.scope_items || []),
            laborCost: Number(q.labor_cost) || 0,
            materialsCost: Number(q.materials_cost) || 0,
            materialsDetail: q.materials_detail || '',
            applyIVA: Boolean(q.apply_iva),
            ivaRate: 0.13,
            deliveryTime: q.delivery_time || '1 día hábil',
            paymentTerms: '100% contra entrega y satisfacción al cliente',
            checkpoints: {
              paymentOnDelivery: true,
              satisfactionGuarantee: true,
              certifiedMaterials: true,
              noHiddenCosts: true
            },
            responsibleName: q.responsible_name || 'Mauricio Marín',
            responsibleTitle: 'Especialista en Tanques Sépticos y Destaqueos',
            responsiblePhone: q.responsible_phone || '6114-1421',
            instagramUrl: '',
            whatsappUrl: 'https://wa.me/50661141421',
            emailContact: 'mauriciomarin@gmail.com',
            websiteUrl: 'https://destaqueosmarin.pages.dev',
            createdAt: q.created_at || new Date().toISOString()
          }
        }));

        setQuotes((prev) => {
          const remoteIds = new Set(mapped.map((m) => m.id));
          const localOnly = prev.filter((p) => !remoteIds.has(p.id));
          const merged = [...mapped, ...localOnly];
          try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (err) {
      console.warn('Error fetching quotes in useQuotes:', err);
    } finally {
      isFetchingRef.current = false;
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Escuchar evento personalizado cuando se guarda una cotización en el editor
  useEffect(() => {
    const handleQuotesUpdated = () => {
      try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setQuotes(parsed);
          }
        }
      } catch (e) {}
      fetchQuotes(true);
    };

    window.addEventListener('destaqueos_quotes_updated', handleQuotesUpdated);
    window.addEventListener('storage', handleQuotesUpdated);

    return () => {
      window.removeEventListener('destaqueos_quotes_updated', handleQuotesUpdated);
      window.removeEventListener('storage', handleQuotesUpdated);
    };
  }, [fetchQuotes]);

  // Polling inteligente con detección de visibilidad de pestaña
  useEffect(() => {
    fetchQuotes(false);

    if (!isPollingActive) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          fetchQuotes(true);
        }
      }, 30000);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchQuotes(true);
        startPolling();
      } else if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchQuotes, isPollingActive]);

  // Función utilitaria para encontrar la cotización creada por el admin para una cita específica
  const findQuoteForAppointment = useCallback((appointment: Appointment): SavedQuoteEntry | undefined => {
    if (!quotes || quotes.length === 0 || !appointment) return undefined;

    // 1. Por ID directo de la cita (appointment_id)
    const byAppId = quotes.find((q) => 
      q.appointmentId === appointment.id || 
      q.quoteData?.appointmentId === appointment.id ||
      (q as any).appointment_id === appointment.id
    );
    if (byAppId) return byAppId;

    // 2. Por coincidencia de teléfono (últimos 8 dígitos para Costa Rica)
    const appPhone = (appointment.client_phone || '').replace(/\D/g, '').slice(-8);
    if (appPhone.length >= 7) {
      const byPhone = quotes.find((q) => {
        const qPhone = (q.quoteData?.clientPhone || (q as any).client_phone || '').replace(/\D/g, '').slice(-8);
        return qPhone === appPhone;
      });
      if (byPhone) return byPhone;
    }

    // 3. Por coincidencia exacta o cercana del nombre del cliente
    const appName = (appointment.client_name || '').trim().toLowerCase();
    if (appName.length >= 3) {
      const byName = quotes.find((q) => {
        const qName = (q.clientName || q.quoteData?.clientName || (q as any).client_name || '').trim().toLowerCase();
        return qName === appName;
      });
      if (byName) return byName;
    }

    return undefined;
  }, [quotes]);

  return {
    quotes,
    loading,
    refreshQuotes: fetchQuotes,
    findQuoteForAppointment
  };
}
