import React, { useState } from 'react';
import { AdminBottomNav, AdminTab } from './AdminBottomNav';
import { TodayRouteCard } from './TodayRouteCard';
import { AppointmentCard } from './AppointmentCard';
import { PhotoLightbox } from './PhotoLightbox';
import { AvailabilityManager } from './AvailabilityManager';
import { AdminSettingsTab } from './AdminSettingsTab';
import { KPICards } from './KPICards';
import { FinancialReportCard } from './FinancialReportCard';
import { AdminReviewsCard } from './AdminReviewsCard';
import { JobQuoteManager } from '../quotes/JobQuoteManager';
import { TrafficAnalytics } from './TrafficAnalytics';
import { IncomeExpenseManager } from './IncomeExpenseManager';
import { AnimatedEagleLogo } from '../common/AnimatedEagleLogo';
import { useAppointments } from '../../hooks/useAppointments';
import { useReviews } from '../../hooks/useReviews';
import { useQuotes } from '../../hooks/useQuotes';
import { JobQuote } from '../../types/quote';
import { api } from '../../services/api';
import { TimeSlot, AvailabilityResponse } from '../../types/appointment';
import { 
  getTodayDateString, 
  getTomorrowDateString, 
  getDayAfterTomorrowDateString,
  getNextDays,
  formatDateToSpanish, 
  formatTime12h 
} from '../../utils/dateFormatter';
import { Bell, RefreshCw, X, Navigation, Star, Calendar, Clock, Settings, FileText, BarChart3, Eye, Plus, CheckCircle2, AlertCircle, ChevronDown, Menu, Wallet } from 'lucide-react';

interface AdminViewProps {
  onClose: () => void;
  onLogout: () => void;
  onInstallPWA?: () => void;
  onRequestNotifications?: () => void;
  isInstallable?: boolean;
  notificationsGranted?: boolean;
}

const VALID_ADMIN_TABS: AdminTab[] = ['route', 'all', 'income', 'quotes', 'traffic', 'schedule', 'settings', 'reviews'];

const getInitialAdminTab = (): AdminTab => {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      if (tabParam && VALID_ADMIN_TABS.includes(tabParam)) {
        return tabParam;
      }
      const savedTab = localStorage.getItem('marin_admin_active_tab') as AdminTab;
      if (savedTab && VALID_ADMIN_TABS.includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {}
  }
  return 'route';
};

export const AdminView: React.FC<AdminViewProps> = ({
  onClose,
  onLogout,
  onInstallPWA,
  onRequestNotifications,
  isInstallable = false,
  notificationsGranted = false
}) => {
  const {
    appointments,
    loading,
    lastUpdated,
    newAppointmentAlert,
    dismissAlert,
    refresh,
    createAppointment,
    updateStatus,
    updateService,
    updatePayment
  } = useAppointments(true);

  const {
    reviews,
    newReviewAlert,
    dismissAlert: dismissReviewAlert,
    removeReview
  } = useReviews(true);

  const { quotes, findQuoteForAppointment } = useQuotes(true);
  const [quoteToEdit, setQuoteToEdit] = useState<JobQuote | null>(null);

  const handleCreateQuoteForAppointment = (appointment: any) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const quoteNumber = `COT-${new Date().getFullYear()}-${randomSuffix}`;
    const serviceAmount = appointment.amount_collected ? Number(appointment.amount_collected) : 45000;

    const newQuote: JobQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      appointmentId: appointment.id,
      quoteNumber,
      date: appointment.appointment_date || getTodayDateString(),
      companyName: 'Destaqueos y Tanques Sépticos Mauricio Marín',
      companyLogoUrl: '/camion-destaqueos.png',
      customLogoUrl: null,
      clientName: appointment.client_name || '',
      clientLocation: appointment.client_address || '',
      clientPhone: appointment.client_phone || '',
      workReference: appointment.service_type || 'Limpieza y Destaqueo',
      scopeItems: [
        { id: '1', text: `Servicio especializado: ${appointment.service_type}` },
        ...(appointment.problem_description
          ? [{ id: '2', text: appointment.problem_description }]
          : [{ id: '2', text: 'Vaciado y succión con camión cisterna / sondeo electromecánico.' }]),
        { id: '3', text: 'Pruebas de evacuación y verificación de flujo continuo.' }
      ],
      laborCost: serviceAmount,
      materialsCost: 0,
      materialsDetail: 'Equipo especializado, mangueras de alto vacío y personal técnico calificado incluido.',
      applyIVA: false,
      ivaRate: 0.13,
      deliveryTime: '1 día hábil',
      paymentTerms: '100% contra entrega y satisfacción al cliente',
      checkpoints: {
        paymentOnDelivery: true,
        satisfactionGuarantee: true,
        certifiedMaterials: true,
        noHiddenCosts: true
      },
      responsibleName: 'Mauricio Marín',
      responsibleTitle: 'Especialista en Tanques Sépticos y Destaqueos',
      responsiblePhone: '6114-1421',
      instagramUrl: '',
      whatsappUrl: 'https://wa.me/50661141421',
      emailContact: 'mauriciomarin@gmail.com',
      websiteUrl: 'https://destaqueosmarin.pages.dev',
      createdAt: new Date().toISOString(),
      status: 'por_enviar'
    };

    setQuoteToEdit(newQuote);
    setActiveTab('quotes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOrEditQuote = (quoteId: string) => {
    const found = quotes.find((q) => q.id === quoteId);
    if (found && found.quoteData) {
      setQuoteToEdit(found.quoteData);
      setActiveTab('quotes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [activeTab, setActiveTabState] = useState<AdminTab>(getInitialAdminTab);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('marin_admin_active_tab', tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  };

  // Mantener sincronizada la URL y localStorage en montaje o cambios
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('marin_admin_active_tab', activeTab);
        const url = new URL(window.location.href);
        if (url.searchParams.get('tab') !== activeTab) {
          url.searchParams.set('tab', activeTab);
          window.history.replaceState({}, '', url.toString());
        }
      } catch (e) {}
    }
  }, [activeTab]);

  // Escuchar si el usuario navega con botones adelante/atrás del navegador
  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      if (tabParam && VALID_ADMIN_TABS.includes(tabParam) && tabParam !== activeTab) {
        setActiveTabState(tabParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'tomorrow'>('all');
  const [lightboxState, setLightboxState] = useState<{ photos: string[]; index: number } | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();
  const dayAfterStr = getDayAfterTomorrowDateString();
  const weekDays = getNextDays(7);

  // Filtro de fecha para la pestaña de Citas: Hoy, Mañana, Pasado mañana, Esta semana, Todas
  const [scheduleDateFilter, setScheduleDateFilter] = useState<'today' | 'tomorrow' | 'day_after' | 'week' | 'all'>('today');
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(todayStr);

  const targetDateForSlots = (() => {
    if (scheduleDateFilter === 'today') return todayStr;
    if (scheduleDateFilter === 'tomorrow') return tomorrowStr;
    if (scheduleDateFilter === 'day_after') return dayAfterStr;
    if (scheduleDateFilter === 'week') return selectedWeekDate || todayStr;
    return todayStr;
  })();

  // Disponibilidad de horarios en vivo para la fecha activa en Citas
  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingSlotModal, setBookingSlotModal] = useState<{ date: string; slot: TimeSlot } | null>(null);
  const [adminBookingForm, setAdminBookingForm] = useState({
    clientName: '',
    clientPhone: '',
    serviceType: 'Limpieza de Tanques Sépticos',
    location: '',
    notes: ''
  });
  const [isSubmittingAdminBooking, setIsSubmittingAdminBooking] = useState(false);
  const [adminBookingSuccess, setAdminBookingSuccess] = useState<string | null>(null);

  const loadScheduleAvailability = async (date: string) => {
    setLoadingAvailability(true);
    try {
      const res = await api.getAvailability(date);
      setAvailabilityData(res);
    } catch (e) {
      console.warn('Error loading schedule availability:', e);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleSelectScheduleDateFilter = (filter: 'today' | 'tomorrow' | 'day_after' | 'week' | 'all') => {
    setScheduleDateFilter(filter);
    
    // Desplazamiento suave para posicionar las citas de ese día frente al usuario
    setTimeout(() => {
      const target = document.getElementById('horarios-disponibilidad-section') || document.getElementById('citas-registradas-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleSelectWeekDay = (dateStr: string) => {
    setSelectedWeekDate(dateStr);
    
    setTimeout(() => {
      const target = document.getElementById('horarios-disponibilidad-section') || document.getElementById('citas-registradas-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  React.useEffect(() => {
    if (activeTab === 'all' && scheduleDateFilter !== 'all') {
      loadScheduleAvailability(targetDateForSlots);
    }
  }, [activeTab, scheduleDateFilter, targetDateForSlots, appointments]);

  // Función para llevar directamente a la cita especificada
  const handleViewAppointment = (app: any) => {
    if (!app) return;
    const isToday = app.appointment_date === todayStr;
    if (isToday) {
      setActiveTab('route');
    } else {
      setActiveTab('all');
      setFilterStatus('all');
    }

    setHighlightedId(app.id);
    dismissAlert();

    // Desplazamiento suave directo hacia la tarjeta de la cita
    setTimeout(() => {
      const el = document.getElementById(`appointment-${app.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);

    // Retirar el resalte después de 6 segundos
    setTimeout(() => {
      setHighlightedId(null);
    }, 6000);
  };

  // Escuchar si se abre el panel con parámetro de cita en URL (?appointmentId=... o ?cita=...)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const targetAppointmentId = params.get('appointmentId') || params.get('cita');
    if (targetAppointmentId && appointments.length > 0) {
      const found = appointments.find((a) => a.id === targetAppointmentId);
      if (found) {
        handleViewAppointment(found);
      }
    }
  }, [appointments]);

  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const pendingAppointments = appointments.filter((a) => a.status === 'pending');

  const filteredAppointments = appointments.filter((a) => {
    // 1. Filtrar por rango o fecha seleccionada
    if (scheduleDateFilter === 'today' && a.appointment_date !== todayStr) return false;
    if (scheduleDateFilter === 'tomorrow' && a.appointment_date !== tomorrowStr) return false;
    if (scheduleDateFilter === 'day_after' && a.appointment_date !== dayAfterStr) return false;
    if (scheduleDateFilter === 'week' && a.appointment_date !== targetDateForSlots) return false;

    // 2. Sub-filtro de estado (Todas, Pendientes, Confirmadas)
    if (filterStatus === 'pending') return a.status === 'pending';
    if (filterStatus === 'confirmed') return a.status === 'confirmed';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#F1F5F9] flex flex-col overflow-hidden text-brand-dark font-sans select-none">
      
      {/* Header Adaptativo: Móvil y Computadora (Ajustado compacto para que quepa 100% en pantalla sin cortes) */}
      <header className="bg-brand-dark text-white px-3 sm:px-4 md:px-5 h-14 min-h-[56px] flex items-center justify-between shrink-0 shadow-md border-b border-slate-800 w-full relative z-40">
        
        {/* Izquierda: Logo y Menú Desplegable Oficial */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <img src="/camion-destaqueos.png" alt="Mauricio Marín" className="w-8 h-8 object-contain rounded-xl shadow-sm shrink-0" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tight leading-none text-white">Mauricio Marín</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">En Vivo</span>
              </div>
            </div>
          </div>

          {/* MENÚ DESPLEGABLE DEL ADMIN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-black shadow-xs cursor-pointer transition-colors"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span className="capitalize">{
                activeTab === 'route' ? 'Ruta de Hoy' :
                activeTab === 'all' ? 'Todas las Citas' :
                activeTab === 'income' ? 'Control de Ingresos' :
                activeTab === 'traffic' ? 'Tráfico & Métricas' :
                activeTab === 'quotes' ? 'Cotizador' :
                activeTab === 'schedule' ? 'Horarios' :
                activeTab === 'settings' ? 'Ajustes' :
                activeTab === 'reviews' ? 'Reseñas' : 'Menú'
              }</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                {[
                  { id: 'route' as AdminTab, label: 'Ruta de Hoy', icon: Navigation, count: todayAppointments.length },
                  { id: 'all' as AdminTab, label: 'Todas las Citas', icon: Calendar, count: pendingAppointments.length },
                  { id: 'income' as AdminTab, label: 'Control de Ingresos', icon: Wallet, count: 0 },
                  { id: 'traffic' as AdminTab, label: 'Tráfico & Métricas', icon: BarChart3, count: 0 },
                  { id: 'quotes' as AdminTab, label: 'Cotizador Formal', icon: FileText, count: 0 },
                  { id: 'schedule' as AdminTab, label: 'Horarios & Disponibilidad', icon: Clock, count: 0 },
                  { id: 'settings' as AdminTab, label: 'Ajustes del Sistema', icon: Settings, count: 0 },
                  { id: 'reviews' as AdminTab, label: 'Testimonios & Reseñas', icon: Star, count: reviews.length }
                ].map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                        isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ItemIcon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.count > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-white/20 text-white">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Centro (Desktop): Barra de Pestañas Superior Compacta */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner shrink-0">
          {[
            { id: 'route' as AdminTab, label: 'Ruta de Hoy', icon: Navigation, count: todayAppointments.length },
            { id: 'all' as AdminTab, label: 'Todas las Citas', icon: Calendar, count: pendingAppointments.length },
            { id: 'income' as AdminTab, label: 'Ingresos', icon: Wallet, count: 0 },
            { id: 'traffic' as AdminTab, label: 'Tráfico', icon: BarChart3, count: 0 },
            { id: 'quotes' as AdminTab, label: 'Cotizador', icon: FileText, count: 0 },
            { id: 'schedule' as AdminTab, label: 'Horarios', icon: Clock, count: 0 },
            { id: 'settings' as AdminTab, label: 'Ajustes', icon: Settings, count: 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-black transition-colors duration-150 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 min-w-[17px] text-[9px] font-black rounded-full flex items-center justify-center shrink-0 ${
                    tab.id === 'route' ? 'bg-brand-orange text-white' : 'bg-red-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Derecha: Botón Reseñas y Cerrar (Ajustados para visibilidad completa garantizada) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            title="Ver Testimonios y Reseñas de Clientes"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 shrink-0 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300/50'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-xs">Reseñas</span>
            {reviews.length > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-black rounded-full shrink-0 ${
                activeTab === 'reviews' ? 'bg-white text-amber-900' : 'bg-amber-500 text-white'
              }`}>
                {reviews.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Salir"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-red-900/60 transition-colors duration-150 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">Cerrar</span>
          </button>
        </div>
      </header>

      {/* Alerta flotante en tiempo real si entra una nueva cita */}
      {newAppointmentAlert && (
        <div className="bg-brand-orange text-white px-4 py-3 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                  ¡NUEVA CITA REGISTRADA!
                </span>
                <span className="text-xs font-black">
                  {newAppointmentAlert.appointment_date} {newAppointmentAlert.start_time ? `(${formatTime12h(newAppointmentAlert.start_time)})` : ''}
                </span>
              </div>
              <p className="text-xs font-bold text-white/95 mt-0.5">
                Cliente: <strong>{newAppointmentAlert.client_name}</strong> • {newAppointmentAlert.service_type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
            {/* BOTÓN VER CITA QUE LO LLEVA DIRECTO A LA CITA */}
            <button
              type="button"
              onClick={() => handleViewAppointment(newAppointmentAlert)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black text-brand-dark bg-white hover:bg-slate-100 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Ir directamente a los detalles de esta cita"
            >
              <Eye className="w-4 h-4 text-brand-orange" />
              <span>Ver Cita</span>
            </button>

            <button 
              type="button"
              onClick={dismissAlert} 
              className="p-1.5 hover:bg-black/20 rounded-xl transition-colors cursor-pointer"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alerta flotante en tiempo real si un cliente publica una calificación / reseña */}
      {newReviewAlert && (
        <div className="bg-amber-500 text-white px-4 py-3 shadow-lg flex items-center justify-between shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-black">
            <Star className="w-4 h-4 shrink-0 fill-white" />
            <span>
              ¡NUEVO TESTIMONIO! {newReviewAlert.client_name} ({newReviewAlert.rating}★): "{newReviewAlert.comment.substring(0, 35)}..."
            </span>
          </div>
          <button onClick={dismissReviewAlert} className="p-1 hover:bg-black/20 rounded-lg cursor-pointer" title="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contenedor Desplazable de Pantalla Completa: la barra de scroll queda exactamente en el borde derecho de la ventana */}
      <div id="admin-main-scroller" className="flex-1 overflow-y-auto w-full scroll-smooth">
        <main className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-28 md:pb-12 max-w-lg md:max-w-6xl xl:max-w-7xl w-full mx-auto space-y-6">
        
        {/* TAB 1: RUTA DE HOY (Modo Calle en Móvil / Cuadrícula de Paradas en PC) */}
        {activeTab === 'route' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base sm:text-lg font-black text-brand-dark">Plan de Ruta de Hoy</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {todayAppointments.length} trabajos agendados para hoy
                </p>
              </div>
              <span className="text-xs font-black text-brand-blue bg-brand-ice px-3 py-1 rounded-xl border border-brand-iceBorder">
                HOY
              </span>
            </div>

            {/* Reporte Financiero Diario y Semanal */}
            <FinancialReportCard appointments={appointments} />

            {loading ? (
              <div className="text-center py-12 text-xs font-bold text-brand-blue">Cargando ruta de hoy...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-brand-ice text-brand-blue flex items-center justify-center mx-auto">
                  <Navigation className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-brand-dark">Sin trabajos pendientes hoy</h4>
                <p className="text-xs text-slate-500">
                  Las nuevas citas para hoy se organizarán automáticamente en este plan de ruta.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayAppointments.map((app, idx) => (
                  <TodayRouteCard
                    key={app.id}
                    appointment={app}
                    index={idx}
                    onUpdateStatus={updateStatus}
                    onUpdateService={updateService}
                    onUpdatePayment={updatePayment}
                    onOpenLightbox={(photos, index) => setLightboxState({ photos, index })}
                    isHighlighted={highlightedId === app.id}
                    existingQuote={findQuoteForAppointment(app)}
                    onCreateQuote={handleCreateQuoteForAppointment}
                    onViewQuote={handleViewOrEditQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TODAS LAS CITAS CON FILTROS RÁPIDOS Y MÉTRICAS */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* 1. Métricas Principales de Citas (Fila completa, altura compacta, sin truncado ni espacio muerto) */}
            <KPICards appointments={appointments} />

            {/* 2. Cierre Financiero de Citas */}
            <div className="w-full">
              <FinancialReportCard appointments={appointments} />
            </div>

            {/* 3. SELECTOR MANDATORIO DE FECHA: HOY, MAÑANA, PASADO MAÑANA, ESTA SEMANA, TODAS */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider">
                      Horarios & Disponibilidad de Citas
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Verde = Horario disponible para agendar • Azul = Horario ya ocupado
                    </p>
                  </div>
                </div>

                {scheduleDateFilter !== 'all' && (
                  <span className="text-xs font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-700 capitalize border border-slate-200">
                    📅 {formatDateToSpanish(targetDateForSlots)}
                  </span>
                )}
              </div>

              {/* Botones de Selección: Hoy, Mañana, Pasado mañana, Esta semana, Todas */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                {[
                  { id: 'today', label: 'Hoy' },
                  { id: 'tomorrow', label: 'Mañana' },
                  { id: 'day_after', label: 'Pasado mañana' },
                  { id: 'week', label: 'Esta semana' },
                  { id: 'all', label: `Todas (${appointments.length})` }
                ].map((tab) => {
                  const isSelected = scheduleDateFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectScheduleDateFilter(tab.id as any)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selector de Días de la Semana cuando se elige 'Esta semana' */}
              {scheduleDateFilter === 'week' && (
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-100">
                  {weekDays.map((d) => {
                    const isSelectedDay = selectedWeekDate === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => handleSelectWeekDay(d.date)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors duration-150 cursor-pointer flex flex-col items-center ${
                          isSelectedDay
                            ? 'bg-brand-dark text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase">{d.dayName} {d.dayNumber}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{d.isToday ? 'HOY' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. CUADRÍCULA DE HORARIOS: VERDE = DISPONIBLE / AZUL = OCUPADA */}
            {scheduleDateFilter !== 'all' && (
              <div id="horarios-disponibilidad-section" className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 scroll-mt-20 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-blue" />
                    <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider">
                      Horarios Disponibles vs Ocupados ({formatDateToSpanish(targetDateForSlots)})
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {loadingAvailability && (
                      <span className="text-[10px] text-brand-blue font-bold animate-pulse">
                        Actualizando...
                      </span>
                    )}
                    {availabilityData && (
                      <>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{availabilityData.slots.filter(s => s.available).length} Disponibles</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          <span>{availabilityData.slots.filter(s => !s.available).length} Ocupadas</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {adminBookingSuccess && (
                  <div className="bg-emerald-600 text-white p-3 rounded-2xl text-xs font-black shadow-sm flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{adminBookingSuccess}</span>
                    </div>
                    <button type="button" onClick={() => setAdminBookingSuccess(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Cuadrícula estable sin colapso de altura para evitar saltos bruscos */}
                <div className="min-h-[220px]">
                  {availabilityData && availabilityData.slots.length > 0 ? (
                    <div 
                      key={targetDateForSlots} 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-300"
                    >
                      {availabilityData.slots.map((slot) => {
                        const isAvailable = slot.available;
                        const bookedApp = appointments.find(
                          (a) => a.appointment_date === targetDateForSlots && a.start_time === slot.start_time && a.status !== 'cancelled'
                        );

                        if (isAvailable) {
                          return (
                            <div
                              key={slot.start_time}
                              onClick={() => {
                                setBookingSlotModal({ date: targetDateForSlots, slot });
                              }}
                              className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 border-2 border-emerald-400 text-emerald-950 ring-2 ring-emerald-200/50 shadow-xs transition-colors cursor-pointer flex flex-col justify-between gap-2 group"
                              title="Haz clic para agendar o bloquear este horario para un cliente"
                            >
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>DISPONIBLE</span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700">Libre</span>
                              </div>

                              <div className="my-1">
                                <span className="text-sm font-black text-emerald-950 block">
                                  {slot.label}
                                </span>
                                <span className="text-[10px] font-medium text-emerald-800">
                                  Campo libre para agendar
                                </span>
                              </div>

                              <button
                                type="button"
                                className="w-full py-1.5 px-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-[11px] font-black shadow-2xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Reservar Horario</span>
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={slot.start_time}
                            className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-400 text-blue-950 ring-2 ring-blue-200/50 shadow-xs flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-2xs">
                                <span>🔒 OCUPADA</span>
                              </span>
                              <span className="text-[10px] font-bold text-blue-700 capitalize truncate max-w-[140px]">
                                {formatDateToSpanish(targetDateForSlots)}
                              </span>
                            </div>

                            <div className="my-1">
                              <span className="text-sm font-black text-blue-950 block">
                                {slot.label}
                              </span>
                              <p className="text-[11px] font-bold text-blue-900 truncate mt-0.5">
                                {bookedApp ? `👤 ${bookedApp.client_name}` : 'Cita Agendada'}
                              </p>
                              {bookedApp?.service_type && (
                                <p className="text-[10px] text-blue-700 truncate font-medium">
                                  {bookedApp.service_type}
                                </p>
                              )}
                            </div>

                            {bookedApp ? (
                              <button
                                type="button"
                                onClick={() => handleViewAppointment(bookedApp)}
                                className="w-full py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black shadow-2xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Cita</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold text-center py-1">
                                Horario Ocupado
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : loadingAvailability ? (
                    <div className="text-center py-12 text-xs font-bold text-brand-blue animate-pulse">
                      Consultando horarios del día...
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      No hay horarios configurados o el día está marcado como no laboral. Puedes activarlo en la pestaña Horarios.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cuadrícula General cuando se selecciona 'Todas': Muestra todas las citas ocupadas con día y fecha */}
            {scheduleDateFilter === 'all' && (
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider">
                      Citas con Horarios Ocupados en el Sistema ({appointments.filter((a) => a.status !== 'cancelled').length})
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    🔒 Horarios Ocupados y Bloqueados en Web
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {appointments
                    .filter((a) => a.status !== 'cancelled')
                    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.start_time.localeCompare(b.start_time))
                    .map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-400 text-blue-950 ring-2 ring-blue-200/50 shadow-xs flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-2xs">
                            <span>🔒 OCUPADA</span>
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 capitalize truncate max-w-[130px]" title={formatDateToSpanish(app.appointment_date)}>
                            {formatDateToSpanish(app.appointment_date)}
                          </span>
                        </div>

                        <div className="my-1">
                          <span className="text-sm font-black text-blue-950 block">
                            {formatTime12h(app.start_time)} - {formatTime12h(app.end_time)}
                          </span>
                          <p className="text-[11px] font-bold text-blue-900 truncate mt-0.5">
                            👤 {app.client_name}
                          </p>
                          <p className="text-[10px] text-blue-700 truncate font-medium">
                            {app.service_type}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleViewAppointment(app)}
                          className="w-full py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black shadow-2xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Cita</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Sub-Filtros de Citas Registradas */}
            <div id="citas-registradas-section" className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <span className="text-xs font-black text-brand-dark uppercase tracking-wider">
                Citas Registradas ({filteredAppointments.length}):
              </span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
                {[
                  { id: 'all', label: `Todas (${filteredAppointments.length})` },
                  { id: 'pending', label: 'Pendientes' },
                  { id: 'confirmed', label: 'Confirmadas' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterStatus(f.id as any)}
                    className={`px-3 py-1 rounded-xl flex-shrink-0 transition-all cursor-pointer ${
                      filterStatus === f.id
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs font-bold text-brand-blue">Cargando citas...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                No hay citas en este filtro.
              </div>
            ) : (
              <div 
                key={`${scheduleDateFilter}-${filterStatus}`} 
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in duration-300"
              >
                {filteredAppointments.map((app) => (
                  <AppointmentCard
                    key={app.id}
                    appointment={app}
                    onUpdateStatus={updateStatus}
                    onUpdateService={updateService}
                    onUpdatePayment={updatePayment}
                    onOpenLightbox={(photos, index) => setLightboxState({ photos, index })}
                    isHighlighted={highlightedId === app.id}
                    existingQuote={findQuoteForAppointment(app)}
                    onCreateQuote={handleCreateQuoteForAppointment}
                    onViewQuote={handleViewOrEditQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTROL DE INGRESOS Y GASTOS */}
        {activeTab === 'income' && (
          <div className="w-full">
            <IncomeExpenseManager appointments={appointments} />
          </div>
        )}

        {/* TAB 3: COTIZADOR DE TRABAJOS EN LÍNEA */}
        {activeTab === 'quotes' && (
          <div className="w-full">
            <JobQuoteManager 
              quoteToEdit={quoteToEdit}
              onClearQuoteToEdit={() => setQuoteToEdit(null)}
            />
          </div>
        )}

        {/* TAB TRÁFICO Y MÉTRICAS EN VIVO (FB, IG, WA, DIRECTO) */}
        {activeTab === 'traffic' && (
          <div className="w-full">
            <TrafficAnalytics />
          </div>
        )}

        {/* TAB 4: HORARIOS Y "MAÑANA VOY A TRABAJAR" */}
        {activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto">
            <AvailabilityManager />
          </div>
        )}

        {/* TAB 4: AJUSTES, PWA Y LIMPIEZA */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <AdminSettingsTab
              onLogout={onLogout}
              onInstallPWA={onInstallPWA}
              onRequestNotifications={onRequestNotifications}
              isInstallable={isInstallable}
              notificationsGranted={notificationsGranted}
              appointments={appointments}
            />
          </div>
        )}

        {/* TAB 7: TESTIMONIOS Y RESEÑAS EN PÁGINA INDEPENDIENTE */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
              <div>
                <h2 className="text-base sm:text-lg font-black text-brand-dark">Testimonios y Reseñas de Clientes</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Muro oficial de opiniones verificadas y calificaciones recibidas en el sistema
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const reviewUrl = `${window.location.origin}/calificar`;
                  navigator.clipboard.writeText(reviewUrl);
                  alert('¡Enlace para pedir calificación a clientes copiado al portapapeles!');
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Copiar enlace para enviar por WhatsApp al cliente"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Copiar Enlace de Calificación</span>
              </button>
            </div>
            <AdminReviewsCard reviews={reviews} onDeleteReview={removeReview} />
          </div>
        )}

      </main>
      </div>

      {/* BARRA INFERIOR DE NAVEGACIÓN MÓVIL ESTILO APP NATIVA */}
      <AdminBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        todayCount={todayAppointments.length}
        pendingCount={pendingAppointments.length}
      />

      {/* MODAL PARA AGENDAR Y BLOQUEAR HORARIOS AL INSTANTE POR LLAMADA TELEFÓNICA */}
      {bookingSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
                    Agendar y Bloquear Horario
                  </h3>
                  <p className="text-xs text-slate-500 font-bold capitalize">
                    {formatDateToSpanish(bookingSlotModal.date)} • {bookingSlotModal.slot.label}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingSlotModal(null)}
                className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!adminBookingForm.clientName.trim()) {
                  alert('Por favor ingrese el nombre del cliente');
                  return;
                }
                setIsSubmittingAdminBooking(true);
                try {
                  await createAppointment({
                    client_name: adminBookingForm.clientName.trim(),
                    client_phone: adminBookingForm.clientPhone.trim() || '6114-1421',
                    client_address: adminBookingForm.location.trim() || 'Por definir con cliente',
                    service_type: adminBookingForm.serviceType as any,
                    problem_description: adminBookingForm.notes.trim() || 'Agendado por llamada telefónica de cliente',
                    appointment_date: bookingSlotModal.date,
                    start_time: bookingSlotModal.slot.start_time,
                    end_time: bookingSlotModal.slot.end_time
                  });

                  setAdminBookingSuccess(`✅ Horario reservado para ${adminBookingForm.clientName}. Quedó bloqueado en la web.`);
                  setTimeout(() => setAdminBookingSuccess(null), 8000);
                  setBookingSlotModal(null);
                  setAdminBookingForm({
                    clientName: '',
                    clientPhone: '',
                    serviceType: 'Limpieza de Tanques Sépticos',
                    location: '',
                    notes: ''
                  });
                  await loadScheduleAvailability(bookingSlotModal.date);
                } catch (err) {
                  alert('Error al reservar la cita. Intente de nuevo.');
                } finally {
                  setIsSubmittingAdminBooking(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-black text-slate-700 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={adminBookingForm.clientName}
                  onChange={(e) => setAdminBookingForm({ ...adminBookingForm, clientName: e.target.value })}
                  placeholder="ej. Carlos Mora (o Cliente Telefónico)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Teléfono del Cliente</label>
                <input
                  type="tel"
                  value={adminBookingForm.clientPhone}
                  onChange={(e) => setAdminBookingForm({ ...adminBookingForm, clientPhone: e.target.value })}
                  placeholder="ej. 8888-8888"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Servicio Solicitado</label>
                <select
                  value={adminBookingForm.serviceType}
                  onChange={(e) => setAdminBookingForm({ ...adminBookingForm, serviceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                >
                  <option value="Limpieza de Tanques Sépticos">Limpieza de Tanques Sépticos (₡85,000)</option>
                  <option value="Destaqueo de Tuberías y Drenajes">Destaqueo de Tuberías y Drenajes (₡45,000)</option>
                  <option value="Limpieza de Trampas de Grasa">Limpieza de Trampas de Grasa (₡50,000)</option>
                  <option value="Inspección de Tuberías con Cámara CCTV HD">Inspección de Tuberías con Cámara CCTV HD (₡60,000)</option>
                  <option value="Mantenimiento y Reparación de Cajas de Registro">Mantenimiento y Reparación de Cajas de Registro (₡40,000)</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Ubicación / Cantón (Opcional)</label>
                <input
                  type="text"
                  value={adminBookingForm.location}
                  onChange={(e) => setAdminBookingForm({ ...adminBookingForm, location: e.target.value })}
                  placeholder="ej. San José, Escazú"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Notas / Referencia (Opcional)</label>
                <input
                  type="text"
                  value={adminBookingForm.notes}
                  onChange={(e) => setAdminBookingForm({ ...adminBookingForm, notes: e.target.value })}
                  placeholder="ej. Tanque séptico saturado o drenaje obstruido"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingSlotModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdminBooking}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdminBooking ? 'Guardando...' : '💾 Guardar y Bloquear Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visor de Fotos Lightbox */}
      {lightboxState && (
        <PhotoLightbox
          photos={lightboxState.photos}
          currentIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
          onPrev={() =>
            setLightboxState((prev) =>
              prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null
            )
          }
          onNext={() =>
            setLightboxState((prev) =>
              prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null
            )
          }
        />
      )}
    </div>
  );
};
