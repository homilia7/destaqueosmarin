import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useOrders } from '../../hooks/useOrders';
import { useClients } from '../../hooks/useClients';
import { MousePointerClick, PhoneCall, CalendarCheck, TrendingUp, Filter, Sparkles, Phone } from 'lucide-react';
import type { TimeFilter } from '../../types/analytics';

export const AdsAnalyticsView: React.FC = () => {
  const { stats, timeFilter, setTimeFilter, trackEvent } = useAnalytics();
  const { orders } = useOrders();
  const { clients } = useClients();

  // Filtrar órdenes por tiempo y por Google Ads
  const adsOrders = orders.filter((o) => o.source === 'google_ads');
  const adsClients = clients.filter((c) => c.source === 'google_ads');

  return (
    <div className="space-y-6">
      {/* Header con Filtros de Tiempo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 m-0">
              Rendimiento de Google Ads & Conversiones
            </h3>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-xs rounded-full">
              En Vivo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de clics, llamadas, visitas desde el anuncio y clientes que reservaron.
          </p>
        </div>

        {/* Filtros: Día, Semana, Mes, Todos */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-bold self-start sm:self-auto">
          {(['dia', 'semana', 'mes', 'todos'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                timeFilter === filter
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter === 'dia' ? 'Hoy (Día)' : filter === 'semana' ? 'Esta Semana' : filter === 'mes' ? 'Este Mes' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas del Embudo de Google Ads */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Visitas desde el Anuncio */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Visitas desde Ads</span>
            <MousePointerClick className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.adsVisits}</p>
          <span className="text-[11px] text-blue-600 font-semibold">
            {stats.totalVisits} visitas totales
          </span>
        </div>

        {/* Clics en Botón de Llamar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Clics en Llamar</span>
            <PhoneCall className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.callClicks}</p>
          <span className="text-[11px] text-slate-500 font-medium">Marcado al 6114-1421</span>
        </div>

        {/* Reservas con GPS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Reservas WhatsApp</span>
            <CalendarCheck className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-green-600">{stats.gpsReservations}</p>
          <span className="text-[11px] text-slate-500 font-medium">Con ubicación GPS</span>
        </div>

        {/* Tasa de Conversión */}
        <div className="bg-gradient-to-tr from-blue-700 to-indigo-800 text-white p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-blue-200 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Conversión Real</span>
            <TrendingUp className="w-4 h-4 text-emerald-300" />
          </div>
          <p className="text-2xl font-black text-white">{stats.conversionRate}%</p>
          <span className="text-[11px] text-blue-200 font-medium">Visitas que contactan</span>
        </div>
      </div>

      {/* Sección: Clientes con Etiqueta de Google Ads */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-sm text-slate-900 m-0">
              Clientes que llegaron por Google Ads
            </h4>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              {adsOrders.length + adsClients.length} Registrados
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Filtro activo: <b className="capitalize text-slate-800">{timeFilter}</b>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Órdenes activas de Ads */}
          {adsOrders.map((ord) => (
            <div key={ord.id} className="p-3.5 bg-slate-50 rounded-xl border border-blue-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-wider">
                    Google Ads
                  </span>
                  <span className="text-xs font-bold text-slate-900">{ord.customerName}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {ord.serviceType.replace('_', ' ')} • {ord.location.addressText.slice(0, 32)}...
                </p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                  Est. ₡{ord.estimatedAmount?.toLocaleString('es-CR')}
                </p>
              </div>
              <a
                href={`tel:${ord.customerPhone}`}
                className="p-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Llamar</span>
              </a>
            </div>
          ))}

          {/* Clientes recurrentes de Ads */}
          {adsClients.map((cli) => (
            <div key={cli.id} className="p-3.5 bg-slate-50 rounded-xl border border-blue-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-wider">
                    Google Ads
                  </span>
                  <span className="text-xs font-bold text-slate-900">{cli.fullName}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {cli.cantonDistrict} • {cli.serviceType.replace('_', ' ')}
                </p>
                <p className="text-[11px] text-blue-700 font-bold mt-0.5">
                  Inversión acumulada: ₡{cli.totalSpent.toLocaleString('es-CR')}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-200 text-slate-700 rounded-lg">
                Cliente Frecuente
              </span>
            </div>
          ))}
        </div>

        {/* Botón de prueba simulada de clic */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Registro automático de UTMs y GCLID activo
          </span>
          <button
            onClick={() => trackEvent('visita')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
          >
            + Simular Clic de Anuncio
          </button>
        </div>
      </div>
    </div>
  );
};
