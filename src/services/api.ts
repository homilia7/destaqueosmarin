import { 
  Appointment, 
  AppointmentStatus, 
  AvailabilityResponse, 
  CreateAppointmentDto, 
  DEFAULT_SERVICES,
  GlobalSettings, 
  ServiceItem,
  TimeSlot, 
  WorkDay 
} from '../types/appointment';
import { Review, CreateReviewDTO } from '../types/review';
import { getTodayDateString, getTomorrowDateString, formatTime12h } from '../utils/dateFormatter';

const STORAGE_KEYS = {
  SETTINGS: 'destaqueos_settings_v2',
  WORK_DAYS: 'destaqueos_work_days_v2',
  APPOINTMENTS: 'destaqueos_appointments_v2',
  SERVICES: 'destaqueos_services_v2',
  REVIEWS: 'destaqueos_reviews_v2'
};

const DEFAULT_SETTINGS: GlobalSettings = {
  slot_duration_minutes: 120, // 2 Horas
  max_daily_appointments: 4,
  default_start_time: '07:00',
  default_end_time: '17:00',
  admin_pin_hash: '1234'
};

function getInitialDemoAppointments(): Appointment[] {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  return [
    {
      id: 'demo-app-1',
      client_name: 'Carlos Montero Vargas',
      client_phone: '8844-1234',
      client_address: 'San José, Escazú, 200m Norte de Multiplaza',
      service_type: 'Limpieza de Tanques Sépticos',
      problem_description: 'Tanque séptico lleno al límite con malos olores en el jardín. Se requiere camión cisterna de alto vacío para vaciado y desinfección completa.',
      appointment_date: today,
      start_time: '08:00',
      end_time: '10:00',
      latitude: 9.9324,
      longitude: -84.1432,
      photo_keys: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
      ],
      photos_deleted: 0,
      status: 'confirmed',
      amount_collected: 85000,
      payment_method: 'sinpe',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'demo-app-2',
      client_name: 'Soda El Buen Sabor (Doña Marta)',
      client_phone: '6102-9988',
      client_address: 'Heredia, San Joaquín de Flores, 100m Este de la Iglesia',
      service_type: 'Limpieza de Trampas de Grasa',
      problem_description: 'La trampa de grasa del fregadero comercial está rebalsando hacia el desagüe y tiene agua estancada. Se requiere limpieza y desazolve urgente.',
      appointment_date: today,
      start_time: '13:00',
      end_time: '15:00',
      latitude: 10.0076,
      longitude: -84.1614,
      photo_keys: [],
      photos_deleted: 0,
      status: 'pending',
      amount_collected: 50000,
      payment_method: 'efectivo',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 'demo-app-3',
      client_name: 'Ing. Esteban Brenes',
      client_phone: '7014-5522',
      client_address: 'Alajuela, La Guácima, Condominio Los Reyes',
      service_type: 'Destaqueo de Tuberías y Drenajes',
      problem_description: 'Tubería principal del inodoro y lavamanos obstruida por raíces y residuos acumulados. Requiere sonda rotativa K-60 sin romper pisos.',
      appointment_date: tomorrow,
      start_time: '09:00',
      end_time: '11:00',
      latitude: 9.9702,
      longitude: -84.2798,
      photo_keys: [],
      photos_deleted: 0,
      status: 'confirmed',
      amount_collected: 45000,
      payment_method: 'sinpe',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];
}

class ApiService {
  private useLocalFallback = false;

  private getStored<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  constructor() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setStored(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.setStored(STORAGE_KEYS.APPOINTMENTS, getInitialDemoAppointments());
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORK_DAYS)) {
      this.setStored(STORAGE_KEYS.WORK_DAYS, {});
    }
  }

  async verifyAdminPin(pin: string): Promise<boolean> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/admin/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        if (res.ok) {
          const data = await res.json();
          return data.valid === true;
        }
      }
    } catch {
      this.useLocalFallback = true;
    }
    const settings = this.getStored<GlobalSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return pin === settings.admin_pin_hash;
  }

  async getSettings(): Promise<GlobalSettings> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/settings');
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }
    return this.getStored<GlobalSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  async updateSettings(settings: Partial<GlobalSettings>): Promise<GlobalSettings> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }
    const current = this.getStored<GlobalSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const updated = { ...current, ...settings };
    this.setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  async getWorkDays(): Promise<Record<string, WorkDay>> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/work-days');
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }
    return this.getStored<Record<string, WorkDay>>(STORAGE_KEYS.WORK_DAYS, {});
  }

  async setWorkDay(workDay: WorkDay): Promise<void> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/work-days', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workDay)
        });
        if (res.ok) return;
      }
    } catch {
      this.useLocalFallback = true;
    }
    const days = this.getStored<Record<string, WorkDay>>(STORAGE_KEYS.WORK_DAYS, {});
    days[workDay.date] = workDay;
    this.setStored(STORAGE_KEYS.WORK_DAYS, days);
  }

  async getAvailability(date: string): Promise<AvailabilityResponse> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/availability?date=${date}`);
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }

    const settings = this.getStored<GlobalSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const workDays = this.getStored<Record<string, WorkDay>>(STORAGE_KEYS.WORK_DAYS, {});
    const workDay = workDays[date];

    if (workDay && !workDay.is_available) {
      return {
        date,
        is_available: false,
        start_time: workDay.start_time || settings.default_start_time,
        end_time: workDay.end_time || settings.default_end_time,
        slots: [],
        total_booked: 0,
        max_allowed: 0,
        remaining_slots: 0
      };
    }

    const durationMinutes = workDay?.slot_duration_minutes || settings.slot_duration_minutes;
    const maxAppointments = workDay?.max_appointments || settings.max_daily_appointments;
    const startTimeStr = workDay?.start_time || settings.default_start_time;
    const endTimeStr = workDay?.end_time || settings.default_end_time;

    const allAppointments = this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const dayAppointments = allAppointments.filter(
      (a) => a.appointment_date === date && a.status !== 'cancelled'
    );

    const isDayFull = dayAppointments.length >= maxAppointments;
    const slots: TimeSlot[] = [];

    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    
    let currentMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    while (currentMin + durationMinutes <= endMin) {
      const sH = Math.floor(currentMin / 60);
      const sM = currentMin % 60;
      const startSlot = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;

      const nextMin = currentMin + durationMinutes;
      const eH = Math.floor(nextMin / 60);
      const eM = nextMin % 60;
      const endSlot = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

      const isBooked = dayAppointments.some((a) => a.start_time === startSlot);
      const isManuallyBlocked = workDay?.blocked_slots?.includes(startSlot);

      const isAvailableSlot = !isDayFull && !isBooked && !isManuallyBlocked;

      slots.push({
        start_time: startSlot,
        end_time: endSlot,
        label: `${formatTime12h(startSlot)} - ${formatTime12h(endSlot)}`,
        available: isAvailableSlot,
        reason: isDayFull ? 'Cupo diario completo' : (isBooked ? 'Ocupado' : (isManuallyBlocked ? 'Bloqueado por admin' : undefined))
      });

      currentMin += durationMinutes;
    }

    const remaining = Math.max(0, maxAppointments - dayAppointments.length);

    return {
      date,
      is_available: true,
      start_time: startTimeStr,
      end_time: endTimeStr,
      slots,
      total_booked: dayAppointments.length,
      max_allowed: maxAppointments,
      remaining_slots: remaining
    };
  }

  async getAppointments(): Promise<Appointment[]> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/appointments');
        if (res.ok) {
          const data = await res.json();
          this.setStored(STORAGE_KEYS.APPOINTMENTS, data);
          return data;
        }
      }
    } catch {
      this.useLocalFallback = true;
    }
    return this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  }

  async createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    // Registrar conversión de tráfico atribuido
    try {
      const trafficSource = typeof window !== 'undefined' ? (sessionStorage.getItem('marin_traffic_source') || sessionStorage.getItem('royalty_traffic_source') || 'direct') : 'direct';
      this.trackTrafficEvent(trafficSource, 'booking', '/agenda').catch(() => {});
    } catch {}

    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto)
        });
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }

    const newAppointment: Appointment = {
      id: 'app-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      client_name: dto.client_name,
      client_phone: dto.client_phone,
      client_address: dto.client_address,
      service_type: dto.service_type,
      problem_description: dto.problem_description,
      appointment_date: dto.appointment_date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      latitude: dto.latitude || null,
      longitude: dto.longitude || null,
      photo_keys: dto.photos?.map(p => p.dataUrl) || [],
      photos_deleted: 0,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const current = this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    this.setStored(STORAGE_KEYS.APPOINTMENTS, [newAppointment, ...current]);
    return newAppointment;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    let updatedApp: Appointment | null = null;
    const updated = current.map((app) => {
      if (app.id === id) {
        const photosDeleted = status === 'completed' ? 1 : app.photos_deleted;
        const photoKeys = status === 'completed' ? [] : app.photo_keys;
        updatedApp = { ...app, status, photos_deleted: photosDeleted, photo_keys: photoKeys };
        return updatedApp;
      }
      return app;
    });

    this.setStored(STORAGE_KEYS.APPOINTMENTS, updated);
    return updatedApp;
  }

  async updateAppointmentPayment(id: string, amount: number, payment_method: string): Promise<Appointment | null> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount_collected: amount, payment_method })
        });
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    let updatedApp: Appointment | null = null;
    const updated = current.map((app) => {
      if (app.id === id) {
        updatedApp = { ...app, amount_collected: amount, payment_method };
        return updatedApp;
      }
      return app;
    });

    this.setStored(STORAGE_KEYS.APPOINTMENTS, updated);
    return updatedApp;
  }

  async updateAppointmentService(id: string, service_type: string): Promise<Appointment | null> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service_type })
        });
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    let updatedApp: Appointment | null = null;
    const updated = current.map((app) => {
      if (app.id === id) {
        updatedApp = { ...app, service_type };
        return updatedApp;
      }
      return app;
    });

    this.setStored(STORAGE_KEYS.APPOINTMENTS, updated);
    return updatedApp;
  }

  async getServices(): Promise<ServiceItem[]> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            this.setStored(STORAGE_KEYS.SERVICES, data);
            return data;
          }
        }
      }
    } catch {
      this.useLocalFallback = true;
    }

    return this.getStored<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  }

  async createService(item: { title: string; badge?: string; description?: string; price?: number }): Promise<ServiceItem> {
    const fallbackService: ServiceItem = {
      id: 'srv_' + Date.now().toString(36),
      title: item.title,
      badge: item.badge || 'Servicio Extra',
      description: item.description || '',
      price: item.price || 35000
    };

    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (res.ok) {
          const created = await res.json();
          const current = await this.getServices();
          this.setStored(STORAGE_KEYS.SERVICES, [...current, created]);
          return created;
        }
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    const updated = [...current, fallbackService];
    this.setStored(STORAGE_KEYS.SERVICES, updated);
    return fallbackService;
  }

  async updateServiceItem(id: string, updates: { title?: string; badge?: string; description?: string; price?: number }): Promise<ServiceItem | null> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/services/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const updated = await res.json();
          const current = await this.getServices();
          const list = current.map(s => s.id === id ? { ...s, ...updated } : s);
          this.setStored(STORAGE_KEYS.SERVICES, list);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('destaqueos_services_updated', { detail: list }));
          }
          return updated;
        }
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    const updated = current.map(s => s.id === id ? { ...s, ...updates } : s);
    this.setStored(STORAGE_KEYS.SERVICES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('destaqueos_services_updated', { detail: updated }));
    }
    return updated.find(s => s.id === id) || null;
  }

  async deleteService(id: string): Promise<boolean> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const current = this.getStored<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
          this.setStored(STORAGE_KEYS.SERVICES, current.filter(s => s.id !== id));
          return true;
        }
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    this.setStored(STORAGE_KEYS.SERVICES, current.filter(s => s.id !== id));
    return true;
  }

  async cleanupStorage(): Promise<{ deletedPhotos: number; deletedOldAppointments: number }> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/admin/cleanup', { method: 'POST' });
        if (res.ok) return await res.json();
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    const todayStr = getTodayDateString();

    let deletedPhotosCount = 0;
    let deletedAppsCount = 0;

    const remaining = current.filter((app) => {
      if (app.appointment_date < thirtyDaysAgoStr) {
        deletedAppsCount++;
        return false;
      }
      return true;
    }).map((app) => {
      if ((app.appointment_date < todayStr || app.status === 'completed') && app.photo_keys.length > 0) {
        deletedPhotosCount += app.photo_keys.length;
        return { ...app, photo_keys: [], photos_deleted: 1 };
      }
      return app;
    });

    this.setStored(STORAGE_KEYS.APPOINTMENTS, remaining);
    return { deletedPhotos: deletedPhotosCount, deletedOldAppointments: deletedAppsCount };
  }

  async getReviews(): Promise<Review[]> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            this.setStored(STORAGE_KEYS.REVIEWS, data);
            return data;
          }
        }
      }
    } catch {
      this.useLocalFallback = true;
    }
    return this.getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
  }

  async createReview(dto: CreateReviewDTO): Promise<Review | null> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto)
        });
        if (res.ok) {
          const created: Review = await res.json();
          const current = this.getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
          this.setStored(STORAGE_KEYS.REVIEWS, [created, ...current]);
          return created;
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'El número ingresado no corresponde a ningún cliente registrado en las citas de Destaqueos Mauricio Marín.');
        }
      }
    } catch (e: any) {
      // Si el servidor devolvió un error explícito de validación (403, 400), propagarlo inmediatamente
      if (e?.message && e.message !== 'Failed to fetch') {
        throw e;
      }
      this.useLocalFallback = true;
    }

    // Modo local / offline: validar contra las citas guardadas
    const currentAppointments = this.getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const cleanInput = (dto.client_phone || '').replace(/\D/g, '').slice(-8);
    const matchedApp = currentAppointments.find((a) => {
      if (dto.appointment_id && a.id === dto.appointment_id) return true;
      const aDigits = (a.client_phone || '').replace(/\D/g, '').slice(-8);
      return aDigits === cleanInput && cleanInput.length >= 8;
    });

    if (!matchedApp) {
      throw new Error('Acceso denegado: Este número de teléfono no coincide con ningún cliente registrado en las citas de Destaqueos Mauricio Marín. Solo los clientes con trabajos agendados pueden publicar testimonios verificados.');
    }

    const fallbackReview: Review = {
      id: 'rev_' + Date.now(),
      ...dto,
      appointment_id: dto.appointment_id || matchedApp.id,
      created_at: new Date().toISOString(),
      is_verified: 1,
      is_published: 1
    };
    const current = this.getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
    this.setStored(STORAGE_KEYS.REVIEWS, [fallbackReview, ...current]);
    return fallbackReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const current = this.getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
          this.setStored(STORAGE_KEYS.REVIEWS, current.filter(r => r.id !== id));
          return true;
        }
      }
    } catch {
      this.useLocalFallback = true;
    }

    const current = this.getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
    this.setStored(STORAGE_KEYS.REVIEWS, current.filter(r => r.id !== id));
    return true;
  }

  // ----------------------------------------------------
  // COTIZACIONES DINÁMICAS (QUOTES)
  // ----------------------------------------------------
  async getQuotes(): Promise<any[]> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/quotes');
        if (res.ok) {
          return await res.json();
        }
      }
    } catch {
      this.useLocalFallback = true;
    }
    return this.getStored<any[]>('destaqueos_saved_quotes_history', []);
  }

  async getQuoteById(id: string): Promise<any | null> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/quotes/${id}`);
        if (res.ok) {
          return await res.json();
        }
      }
    } catch {
      this.useLocalFallback = true;
    }
    const local = this.getStored<any[]>('destaqueos_saved_quotes_history', []);
    const found = local.find((q: any) => q.id === id || q.quoteData?.id === id);
    return found ? (found.quoteData || found) : null;
  }

  async saveQuote(quote: any): Promise<any> {
    const local = this.getStored<any[]>('destaqueos_saved_quotes_history', []);
    const filtered = local.filter((q: any) => q.id !== quote.id && q.quoteData?.id !== quote.id);
    filtered.unshift(quote);
    this.setStored('destaqueos_saved_quotes_history', filtered);

    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quote)
        });
        if (res.ok) {
          return await res.json();
        }
      }
    } catch {
      this.useLocalFallback = true;
    }
    return { id: quote.id, share_url: `/cotizacion/${quote.id}` };
  }

  async markQuoteDownloaded(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/quotes/${id}/downloaded`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateQuoteStatus(id: string, status: 'por_enviar' | 'enviada' | 'aceptada' | string): Promise<boolean> {
    const local = this.getStored<any[]>('destaqueos_saved_quotes_history', []);
    const updated = local.map((q: any) => {
      if (q.id === id || q.quoteData?.id === id) {
        return {
          ...q,
          status,
          updated_at: new Date().toISOString(),
          quoteData: q.quoteData ? { ...q.quoteData, status } : undefined
        };
      }
      return q;
    });
    this.setStored('destaqueos_saved_quotes_history', updated);

    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/quotes/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (res.ok) return true;
      }
    } catch {
      this.useLocalFallback = true;
    }
    return true;
  }

  async deleteQuote(id: string): Promise<boolean> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      }
    } catch {
      this.useLocalFallback = true;
    }
    return true;
  }

  // ----------------------------------------------------
  // RASTREADOR DE TRÁFICO (FB, IG, WA, GOOGLE, DIRECT)
  // ----------------------------------------------------
  async trackTrafficEvent(source: string, event_type: 'visit' | 'agenda_click' | 'booking', path?: string): Promise<boolean> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch('/api/traffic/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, event_type, path: path || window.location.pathname })
        });
        if (res.ok) return true;
      }
    } catch {
      // Fallback local
    }
    const localEvents = this.getStored<any[]>('destaqueos_local_traffic_events', []);
    localEvents.push({
      id: `trf_loc_${Date.now()}`,
      source: source || 'direct',
      event_type,
      path: path || window.location.pathname,
      created_at: new Date().toISOString()
    });
    this.setStored('destaqueos_local_traffic_events', localEvents.slice(-200));
    return true;
  }

  async getTrafficStats(period: 'week' | 'biweek' | 'month' | 'all' = 'month'): Promise<any> {
    try {
      if (!this.useLocalFallback) {
        const res = await fetch(`/api/traffic/stats?period=${period}`);
        if (res.ok) {
          return await res.json();
        }
      }
    } catch {
      this.useLocalFallback = true;
    }

    // Fallback de métricas locales
    const localEvents = this.getStored<any[]>('destaqueos_local_traffic_events', []);
    const sources = ['fb', 'ig', 'wa', 'google', 'direct'];
    const bySource: Record<string, any> = {};
    let totalVisits = 0;
    let totalClicks = 0;
    let totalBookings = 0;

    sources.forEach((s) => {
      const srcEvents = localEvents.filter((e) => e.source === s);
      const visits = srcEvents.filter((e) => e.event_type === 'visit').length;
      const clicks = srcEvents.filter((e) => e.event_type === 'agenda_click').length;
      const bookings = srcEvents.filter((e) => e.event_type === 'booking').length;
      const clickRate = visits > 0 ? Number(((clicks / visits) * 100).toFixed(1)) : 0;
      const conversionRate = visits > 0 ? Number(((bookings / visits) * 100).toFixed(1)) : 0;
      bySource[s] = { visits, clicks, bookings, clickRate, conversionRate };
      totalVisits += visits;
      totalClicks += clicks;
      totalBookings += bookings;
    });

    return {
      period,
      bySource,
      totals: {
        visits: totalVisits,
        clicks: totalClicks,
        bookings: totalBookings,
        clickRate: totalVisits > 0 ? Number(((totalClicks / totalVisits) * 100).toFixed(1)) : 0,
        conversionRate: totalVisits > 0 ? Number(((totalBookings / totalVisits) * 100).toFixed(1)) : 0
      },
      recentEvents: localEvents.slice(-20).reverse()
    };
  }
}

export const api = new ApiService();
