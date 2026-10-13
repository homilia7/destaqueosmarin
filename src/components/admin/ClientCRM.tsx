import React, { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import { BellRing, Phone, Send, Plus, Filter, Download } from 'lucide-react';
import type { ServiceType } from '../../types/service';
import type { LeadSource } from '../../types/order';

export const ClientCRM: React.FC = () => {
  const { clients, reminders, addClient } = useClients();
  const [showAddForm, setShowAddForm] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'todos' | 'google_ads'>('todos');

  // Nuevo cliente
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [canton, setCanton] = useState('');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('tanque_septico');
  const [source, setSource] = useState<LeadSource>('google_ads');
  const [lastDate, setLastDate] = useState(new Date().toISOString().split('T')[0]);

  const dueCount = reminders.filter((r) => r.isDue).length;

  const handleExportCSV = () => {
    const headers = 'ID,Nombre,Telefono,Canton,Direccion,Servicio,Origen,UltimaVisita,TotalGastadoCRC\n';
    const rows = clients.map((c) =>
      `"${c.id}","${c.fullName}","${c.phone}","${c.cantonDistrict}","${c.exactAddress}","${c.serviceType}","${c.source}","${c.lastServiceDate}",${c.totalSpent}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clientes_mauricio_marin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    addClient({
      fullName,
      phone,
      cantonDistrict: canton || 'GAM',
      exactAddress: address || 'San José',
      serviceType,
      source,
      lastServiceDate: lastDate,
      recommendedCycleMonths: serviceType === 'trampa_grasa' ? 6 : 12,
      totalSpent: serviceType === 'tanque_septico' ? 80000 : 45000,
    });

    setFullName('');
    setPhone('');
    setCanton('');
    setAddress('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header CRM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 m-0">
              Directorio de Clientes & Re-servicio Automático
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
              {clients.length} registrados
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Recordatorios preventivos a los 6 y 12 meses para generar ingresos constantes.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
            title="Descargar lista de clientes para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cerrar Formulario' : 'Nuevo Cliente'}</span>
          </button>
        </div>
      </div>

      {/* Formulario nuevo cliente si está activo */}
      {showAddForm && (
        <form onSubmit={handleCreateClient} className="bg-white p-5 rounded-2xl border border-emerald-500/30 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800">Registrar Cliente para Seguimiento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nombre y Apellidos"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-slate-50 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Teléfono (Ej. 8888-1234)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-slate-50 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Cantón / Zona (Ej. Escazú)"
              value={canton}
              onChange={(e) => setCanton(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="text-xs px-3 py-2 bg-slate-50 border rounded-lg font-bold"
            >
              <option value="tanque_septico">Tanque Séptico (Ciclo 12 meses)</option>
              <option value="trampa_grasa">Trampa de Grasa (Ciclo 6 meses)</option>
              <option value="destaqueo">Destaqueo de Tuberías</option>
            </select>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="text-xs px-3 py-2 bg-slate-50 border rounded-lg font-bold"
            >
              <option value="google_ads">Vino por Google Ads</option>
              <option value="organico">Búsqueda Orgánica</option>
              <option value="recomendacion">Recomendación / Directo</option>
            </select>
            <input
              type="date"
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border rounded-lg"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
            Guardar Cliente en Directorio
          </button>
        </form>
      )}

      {/* Alerta de recordatorios pendientes y Filtro de Origen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs">
          <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
          <span className="font-bold text-amber-900">{dueCount} clientes con mantenimiento vencido</span>
        </div>

        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setSourceFilter('todos')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              sourceFilter === 'todos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setSourceFilter('google_ads')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              sourceFilter === 'google_ads' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3 h-3" /> Solo Google Ads ({clients.filter((c) => c.source === 'google_ads').length})
          </button>
        </div>
      </div>

      {/* Lista de clientes y recordatorios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders
          .filter(({ client }) => sourceFilter === 'todos' || client.source === 'google_ads')
          .map(({ client, monthsElapsed, isDue, dueDate, prefilledWhatsAppMessage }) => (
          <div
            key={client.id}
            className={`bg-white rounded-2xl p-4 border transition-all ${
              isDue ? 'border-amber-300 shadow-amber-100/50 shadow-md ring-1 ring-amber-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">{client.fullName}</h4>
                  {client.source === 'google_ads' && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded uppercase">
                      Google Ads
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-emerald-600" /> {client.phone} • {client.cantonDistrict}
                </p>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isDue ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isDue ? `⚠️ Vencido (${monthsElapsed} meses)` : `Al día (${monthsElapsed} meses)`}
              </span>
            </div>

            <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-xl space-y-1 text-slate-600">
              <p>
                <span className="font-bold text-slate-700">Servicio habitual:</span>{' '}
                {client.serviceType.replace('_', ' ')}
              </p>
              <p>
                <span className="font-bold text-slate-700">Última visita:</span> {client.lastServiceDate}
              </p>
              <p className="text-[11px] text-slate-400">Próxima fecha sugerida: {dueDate}</p>
            </div>

            {/* Botón de 1 toque WhatsApp para reactivación */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`https://wa.me/506${client.phone.replace(/\D/g, '')}?text=${prefilledWhatsAppMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar Recordatorio Anual por WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
