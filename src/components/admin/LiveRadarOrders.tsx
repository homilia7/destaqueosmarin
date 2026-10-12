import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import { Phone, Navigation, ExternalLink, Trash2, FileText } from 'lucide-react';
import type { EmergencyOrder, OrderStatus } from '../../types/order';

interface LiveRadarOrdersProps {
  onOpenReceipt: (order: EmergencyOrder) => void;
}

export const LiveRadarOrders: React.FC<LiveRadarOrdersProps> = ({ onOpenReceipt }) => {
  const { orders, updateOrderStatus, removeOrder } = useOrders();

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateOrderStatus(id, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-black text-slate-900 m-0">
            Radar de Emergencias en Tiempo Real
          </h3>
          <p className="text-xs text-slate-500">
            Solicitudes recibidas desde la web con geolocalización y navegación directa.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full w-fit">
          {orders.length} Solicitudes en radar
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Navigation className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No hay emergencias pendientes</h4>
          <p className="text-xs text-slate-400 mt-1">
            Los clientes que envíen su ubicación desde la landing aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((ord) => {
            return (
              <div
                key={ord.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 transition-all ${
                  ord.urgencyLevel === 'inmediato'
                    ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white text-[11px] font-mono font-bold rounded-lg">
                      {ord.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        ord.urgencyLevel === 'inmediato'
                          ? 'bg-red-100 text-red-700 animate-pulse'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ord.urgencyLevel === 'inmediato' ? '🚨 Urgencia Ya' : 'Hoy mismo'}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 capitalize">
                      {ord.serviceType.replace('_', ' ')}
                    </span>
                    {ord.source === 'google_ads' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded uppercase">
                        Google Ads
                      </span>
                    )}
                  </div>

                  {/* Status selector */}
                  <select
                    value={ord.status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                    className="text-xs font-bold px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_camino">En camino (Conduciendo)</option>
                    <option value="en_progreso">En progreso (En sitio)</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                {/* Customer details & location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-900">{ord.customerName}</p>
                    <p className="text-slate-600 flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <a href={`tel:${ord.customerPhone}`} className="hover:underline text-emerald-700 font-bold">
                        {ord.customerPhone}
                      </a>
                    </p>
                    {ord.notes && (
                      <p className="text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{ord.notes}"
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ubicación para el Camión:</span>
                    </div>
                    <p className="text-slate-700">{ord.location.addressText}</p>
                    {ord.location.landmarks && (
                      <p className="text-slate-600 font-medium">
                        <span className="text-emerald-700 font-bold">Señas:</span> {ord.location.landmarks}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons (Uber Driver navigation) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Waze button */}
                    <a
                      href={ord.location.wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Navegar en Waze
                    </a>

                    {/* Google Maps button */}
                    <a
                      href={ord.location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Google Maps
                    </a>

                    {/* WhatsApp directly */}
                    <a
                      href={`https://wa.me/506${ord.customerPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(ord.customerName)},%20le%20saluda%20Mauricio%20Mar%C3%ADn%20de%20Destaqueos.%20Voy%20en%20camino%20a%20su%20ubicaci%C3%B3n.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      WhatsApp al Cliente
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenReceipt(ord)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      Emitir Recibo
                    </button>
                    <button
                      onClick={() => removeOrder(ord.id)}
                      title="Eliminar orden"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
