import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  MousePointerClick, 
  CalendarCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  TrendingUp, 
  RefreshCw, 
  Globe, 
  Share2, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { FacebookIcon, InstagramIcon } from '../common/SocialLinks';

type PeriodType = 'week' | 'biweek' | 'month' | 'all';
type SourceFilter = 'all' | 'fb' | 'ig' | 'wa' | 'google' | 'direct';

interface TrafficStats {
  period: string;
  bySource: Record<string, {
    visits: number;
    clicks: number;
    bookings: number;
    clickRate: number;
    conversionRate: number;
  }>;
  totals: {
    visits: number;
    clicks: number;
    bookings: number;
    clickRate: number;
    conversionRate: number;
  };
  recentEvents: Array<{
    id: string;
    source: string;
    event_type: string;
    path: string;
    created_at: string;
  }>;
}

const TRAFFIC_STATS_CACHE_KEY = 'destaqueos_traffic_stats_cache';

const getInitialTrafficStats = (period: PeriodType): TrafficStats => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${TRAFFIC_STATS_CACHE_KEY}_${period}`) || localStorage.getItem(TRAFFIC_STATS_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Sincronización inmediata desde eventos locales para evitar parpadeo o renderizado temporal en cero
    try {
      const localEventsRaw = localStorage.getItem('destaqueos_local_traffic_events') || localStorage.getItem('royalty_local_traffic_events');
      const localEvents = localEventsRaw ? JSON.parse(localEventsRaw) : [];
      if (Array.isArray(localEvents) && localEvents.length > 0) {
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
    } catch {}
  }

  return {
    period,
    bySource: {
      fb: { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 },
      ig: { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 },
      wa: { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 },
      google: { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 },
      direct: { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 }
    },
    totals: { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 },
    recentEvents: []
  };
};

export const TrafficAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedSource, setSelectedSource] = useState<SourceFilter>('all');
  const [stats, setStats] = useState<TrafficStats>(() => getInitialTrafficStats('month'));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://destaqueosmarin.pages.dev';

  const shortLinks = [
    {
      id: 'fb',
      name: 'Facebook',
      url: `${baseUrl}/fb`,
      path: '/fb',
      icon: FacebookIcon,
      color: 'bg-[#1877F2]',
      border: 'border-blue-200',
      bgLight: 'bg-blue-50/60',
      textAccent: 'text-[#1877F2]',
      description: 'Pégalo en el botón de tu página de Facebook, publicaciones o historias.'
    },
    {
      id: 'ig',
      name: 'Instagram',
      url: `${baseUrl}/ig`,
      path: '/ig',
      icon: InstagramIcon,
      color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      border: 'border-pink-200',
      bgLight: 'bg-pink-50/60',
      textAccent: 'text-[#DD2A7B]',
      description: 'Pégalo en el enlace de tu biografía de Instagram o en el sticker de historias.'
    },
    {
      id: 'wa',
      name: 'WhatsApp',
      url: `${baseUrl}/wa`,
      path: '/wa',
      icon: MessageSquare,
      color: 'bg-[#25D366]',
      border: 'border-emerald-200',
      bgLight: 'bg-emerald-50/60',
      textAccent: 'text-[#25D366]',
      description: 'Compártelo en tus estados de WhatsApp o mensajes automáticos de bienvenida.'
    },
    {
      id: 'google',
      name: 'Google Ads',
      url: `${baseUrl}/google`,
      path: '/google',
      icon: Globe,
      color: 'bg-[#4285F4]',
      border: 'border-blue-300',
      bgLight: 'bg-blue-50/70',
      textAccent: 'text-[#4285F4]',
      description: 'Pégalo como URL de destino final en tus campañas y anuncios de Google Ads.'
    }
  ];

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.getTrafficStats(period);
      if (data) {
        setStats(data);
        try {
          localStorage.setItem(`${TRAFFIC_STATS_CACHE_KEY}_${period}`, JSON.stringify(data));
          localStorage.setItem(TRAFFIC_STATS_CACHE_KEY, JSON.stringify(data));
        } catch {}
      }
    } catch (e) {
      console.warn('Error fetching traffic stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Si cambia el período, cargar inmediatamente el caché correspondiente sin parpadeo
    const cached = getInitialTrafficStats(period);
    if (cached) setStats(cached);

    fetchStats();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchStats();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [period]);

  const handleCopyLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2500);
    } catch (e) {}
  };

  // Extraer métricas según filtro seleccionado
  const currentMetrics = (() => {
    if (!stats) {
      return { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 };
    }
    if (selectedSource === 'all') {
      return stats.totals;
    }
    return stats.bySource[selectedSource] || { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 };
  })();

  const formatPeriodLabel = (p: PeriodType) => {
    switch (p) {
      case 'week': return 'Últimos 7 Días (Semanal)';
      case 'biweek': return 'Últimos 15 Días (Quincenal)';
      case 'month': return 'Últimos 30 Días (Mensual)';
      case 'all': return 'Histórico Completo';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-brand-blue text-white flex items-center justify-center shadow-md shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-brand-dark">
                Rastreador de Tráfico & Embudo de Conversión
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>En Tiempo Real</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Mide cuántas personas entran desde Facebook, Instagram y WhatsApp, cuántas ven la agenda y cuántas agendan.
            </p>
          </div>
        </div>

        {/* Botón de Actualizar y Selector de Período */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Selector de Período */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer ${
                period === 'week' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setPeriod('biweek')}
              className={`px-3 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer ${
                period === 'biweek' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              Quincenal
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer ${
                period === 'month' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer ${
                period === 'all' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              Todo
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-slate-500 hover:text-brand-dark hover:bg-slate-100 transition-all cursor-pointer"
            title="Actualizar datos en tiempo real"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-blue' : ''}`} />
          </button>
        </div>
      </div>

      {/* BLOQUE DE ENLACES CORTOS PERSONALIZADOS */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
              Tus 3 Enlaces Cortos Oficiales para Redes Sociales
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Rastreo automático e instantáneo
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Copia y pega cada enlace en su respectiva red social. El sistema detectará automáticamente de dónde viene cada visitante y te mostrará el reporte aquí.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shortLinks.map((link) => {
            const Icon = link.icon;
            const isCopied = copiedLink === link.id;
            const visits = stats?.bySource[link.id]?.visits || 0;
            const bookings = stats?.bySource[link.id]?.bookings || 0;

            return (
              <div 
                key={link.id} 
                className={`p-4 rounded-2xl border ${link.border} ${link.bgLight} space-y-3 relative group transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${link.color} text-white flex items-center justify-center shadow-xs`}>
                      <Icon className="w-4 h-4 fill-white" />
                    </div>
                    <span className="text-xs font-black text-brand-dark">{link.name}</span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {visits} visitas • {bookings} citas
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-xs font-mono font-bold text-slate-800 truncate flex-1">
                      {link.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(link.url, link.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-black text-white bg-brand-dark hover:bg-slate-800 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Copiar enlace corto"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? '¡Listo!' : 'Copiar'}</span>
                    </button>
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-50 transition-colors"
                      title="Probar enlace en nueva pestaña"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    {link.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTOR DE VISTA: GENERAL VS INDIVIDUAL POR RED */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSource('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            selectedSource === 'all'
              ? 'bg-brand-dark text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>🌐 Todo el Tráfico General</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSource('fb')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            selectedSource === 'fb'
              ? 'bg-[#1877F2] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50/50'
          }`}
        >
          <FacebookIcon className="w-3.5 h-3.5" />
          <span>Facebook (/fb)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSource('ig')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            selectedSource === 'ig'
              ? 'bg-gradient-to-r from-[#F58529] to-[#DD2A7B] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-pink-50/50'
          }`}
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>Instagram (/ig)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSource('wa')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            selectedSource === 'wa'
              ? 'bg-[#25D366] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp (/wa)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSource('google')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            selectedSource === 'google'
              ? 'bg-[#4285F4] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Google Ads (/google)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSource('direct')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            selectedSource === 'direct'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🔗 Tráfico Directo / Orgánico</span>
        </button>
      </div>

      {/* TARJETAS DEL EMBUDO DE CONVERSIÓN (FUNNEL) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-blue" />
            <span>
              Embudo de Conversión — {selectedSource === 'all' ? 'Todo el Tráfico' : selectedSource.toUpperCase()} ({formatPeriodLabel(period)})
            </span>
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* PASO 1: ENTRARON (VISITAS) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Paso 1: Entraron
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-brand-dark">
                {currentMetrics.visits.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Usuarios que visitaron la web
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tráfico de entrada</span>
              <span className="font-bold text-blue-600">100% de la base</span>
            </div>
          </div>

          {/* PASO 2: DIERON CLIC (INTERÉS EN AGENDA) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Paso 2: Dieron Clic
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-brand-dark flex items-baseline gap-2">
                <span>{currentMetrics.clicks.toLocaleString()}</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  {currentMetrics.clickRate}% clic
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Interesados en agendar inspección
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Clics sobre visitas</span>
              <span className="font-bold text-amber-600">{currentMetrics.clicks} de {currentMetrics.visits}</span>
            </div>
          </div>

          {/* PASO 3: AGENDARON (CONVERSIONES) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Paso 3: Agendaron Cita
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-800 flex items-baseline gap-2">
                <span>{currentMetrics.bookings.toLocaleString()}</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {currentMetrics.conversionRate}% éxito
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Citas confirmadas en el sistema
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Conversión total a cita</span>
              <span className="font-bold text-emerald-600">{currentMetrics.bookings} agendados</span>
            </div>
          </div>

        </div>

        {/* Barra Visual del Embudo */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Rendimiento Visual del Embudo</span>
            <span>
              De cada 100 visitantes: {currentMetrics.clickRate} ven la agenda y {currentMetrics.conversionRate} agendan
            </span>
          </div>

          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
            {/* Visitas base (100%) */}
            <div 
              style={{ width: '100%' }}
              className="bg-blue-400 h-full relative"
              title={`Visitas: ${currentMetrics.visits}`}
            >
              {/* Clics overlay */}
              <div 
                style={{ width: `${Math.min(currentMetrics.clickRate, 100)}%` }}
                className="bg-amber-400 h-full relative"
                title={`Clics: ${currentMetrics.clicks} (${currentMetrics.clickRate}%)`}
              >
                {/* Agendados overlay */}
                <div 
                  style={{ width: `${Math.min(currentMetrics.conversionRate, 100)}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Agendados: ${currentMetrics.bookings} (${currentMetrics.conversionRate}%)`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Visitas: {currentMetrics.visits}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Clics: {currentMetrics.clicks}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Agendados: {currentMetrics.bookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA COMPARATIVA POR RED SOCIAL */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider">
          Tabla Comparativa de Redes Sociales ({formatPeriodLabel(period)})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Red Social / Canal</th>
                <th className="py-2.5 px-3">Link Corto</th>
                <th className="py-2.5 px-3 text-right">Entraron (Visitas)</th>
                <th className="py-2.5 px-3 text-right">Dieron Clic</th>
                <th className="py-2.5 px-3 text-right">Agendaron</th>
                <th className="py-2.5 px-3 text-right">Conversión a Cita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {shortLinks.map((item) => {
                const data = stats?.bySource[item.id] || { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 };
                const Icon = item.icon;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-md ${item.color} text-white flex items-center justify-center shrink-0`}>
                          <Icon className="w-3 h-3 fill-white" />
                        </div>
                        <span className="font-bold text-brand-dark">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {item.path}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-brand-dark">
                      {data.visits.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-700">
                      {data.clicks.toLocaleString()} <span className="text-[10px] text-slate-400">({data.clickRate}%)</span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-800">
                      {data.bookings.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                        data.conversionRate > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {data.conversionRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Fila Directo / Orgánico */}
              {(() => {
                const directData = stats?.bySource['direct'] || { visits: 0, clicks: 0, bookings: 0, clickRate: 0, conversionRate: 0 };
                return (
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-slate-600 text-white flex items-center justify-center shrink-0">
                          <Globe className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-brand-dark">Directo / Orgánico</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      / (Sin ref)
                    </td>
                    <td className="py-3 px-3 text-right font-black text-brand-dark">
                      {directData.visits.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-700">
                      {directData.clicks.toLocaleString()} <span className="text-[10px] text-slate-400">({directData.clickRate}%)</span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-800">
                      {directData.bookings.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                        directData.conversionRate > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {directData.conversionRate}%
                      </span>
                    </td>
                  </tr>
                );
              })()}

              {/* Fila TOTAL GENERAL */}
              <tr className="bg-slate-100/80 font-black text-brand-dark border-t-2 border-slate-300">
                <td className="py-3 px-3">
                  TOTAL GENERAL
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                  Todas las fuentes
                </td>
                <td className="py-3 px-3 text-right text-sm">
                  {stats?.totals.visits.toLocaleString() || 0}
                </td>
                <td className="py-3 px-3 text-right text-sm text-amber-800">
                  {stats?.totals.clicks.toLocaleString() || 0}
                </td>
                <td className="py-3 px-3 text-right text-sm text-emerald-800">
                  {stats?.totals.bookings.toLocaleString() || 0}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-200 text-emerald-950">
                    {stats?.totals.conversionRate || 0}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* STREAM EN TIEMPO REAL: ÚLTIMA ACTIVIDAD */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-blue" />
            <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider">
              Últimos Eventos de Tráfico en Vivo
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">Actualización en tiempo real</span>
        </div>

        <div className="min-h-[60px]">
          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {stats.recentEvents.map((ev) => {
                const srcLabel = ev.source === 'fb' ? 'Facebook' : ev.source === 'ig' ? 'Instagram' : ev.source === 'wa' ? 'WhatsApp' : ev.source === 'google' ? 'Google Ads' : 'Directo';
                const srcBadgeColor = ev.source === 'fb' ? 'bg-blue-100 text-blue-800' : ev.source === 'ig' ? 'bg-pink-100 text-pink-800' : ev.source === 'wa' ? 'bg-emerald-100 text-emerald-800' : ev.source === 'google' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600';
                
                const typeLabel = ev.event_type === 'visit' ? 'Entró a la plataforma' : ev.event_type === 'agenda_click' ? 'Hizo clic en agendar' : '¡Cita confirmada!';
                const typeIcon = ev.event_type === 'visit' ? Users : ev.event_type === 'agenda_click' ? MousePointerClick : CalendarCheck;
                const TypeIconComponent = typeIcon;

                return (
                  <div key={ev.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${srcBadgeColor}`}>
                        {srcLabel}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <TypeIconComponent className="w-3.5 h-3.5 text-slate-400" />
                        <span>{typeLabel}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ev.created_at ? new Date(ev.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Reciente'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              Aún no hay eventos registrados en este período. Comienza compartiendo los links cortos en tus redes sociales.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
