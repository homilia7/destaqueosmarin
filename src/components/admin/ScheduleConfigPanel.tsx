import React from 'react';
import { Clock, Calendar, Lock, Shield } from 'lucide-react';
import { useSchedule, formatHour12 } from '../../hooks/useSchedule';
import { DAYS_OF_WEEK } from '../../types/schedule';
import type { EmergencyOrder } from '../../types/order';

interface ScheduleConfigPanelProps {
  orders: EmergencyOrder[];
}

export const ScheduleConfigPanel: React.FC<ScheduleConfigPanelProps> = ({ orders }) => {
  const {
    config,
    timeSlots,
    toggleWorkDay,
    toggleBlockSlot,
    setWorkingHours,
    setLunchHour,
    toggleLunchBreak,
  } = useSchedule(orders);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-slate-900 m-0">
          Horario Laboral & Agenda de Despacho
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina su jornada laboral y horas de descanso. Los clientes en la web solo podrán reservar en horas libres.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bloque 1: Configuración de Jornada y Días */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Días de Atención Activos
          </h4>

          {/* Días de la semana */}
          <div className="flex flex-wrap gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const isActive = config.workDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleWorkDay(day.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {day.name}
                </button>
              );
            })}
          </div>

          {/* Horario inicio y fin */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Rango de Horas de Trabajo
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Hora Inicio:</label>
                <select
                  value={config.startHour}
                  onChange={(e) => setWorkingHours(Number(e.target.value), config.endHour)}
                  className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {[6, 7, 8, 9].map((h) => (
                    <option key={h} value={h}>{formatHour12(h)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Hora Fin:</label>
                <select
                  value={config.endHour}
                  onChange={(e) => setWorkingHours(config.startHour, Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {[16, 17, 18, 19, 20].map((h) => (
                    <option key={h} value={h}>{formatHour12(h)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 2: Hora de Almuerzo y Privacidad */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" /> Hora de Almuerzo (Bloqueo Privado)
            </h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.lunchBreakEnabled}
                onChange={(e) => toggleLunchBreak(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Franja de Almuerzo:</label>
            <select
              value={config.lunchHour}
              disabled={!config.lunchBreakEnabled}
              onChange={(e) => setLunchHour(Number(e.target.value))}
              className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
            >
              {[11, 12, 13, 14].map((h) => (
                <option key={h} value={h}>{formatHour12(h)} a {formatHour12(h + 1)}</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-red-800 font-bold">
              <Shield className="w-4 h-4 text-red-600 shrink-0" />
              <span>Privacidad garantizada para Mauricio</span>
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed">
              En este panel la verá marcada en <b>ROJO</b>. Para el cliente en la web aparecerá simplemente como <b>"Ocupada"</b> sin revelar su hora de almuerzo.
            </p>
          </div>
        </div>
      </div>

      {/* Bloque 3: Visualizador en tiempo real de mañana */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Agenda Visual para Mañana (Control de Franjas)
            </h4>
            <p className="text-[11px] text-slate-500">
              Haga clic sobre cualquier hora para bloquearla o desbloquearla manualmente.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Libre
            </span>
            <span className="flex items-center gap-1 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Almuerzo
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Reservada
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {timeSlots.map((slot) => {
            return (
              <div
                key={slot.label}
                onClick={() => !slot.isBooked && toggleBlockSlot(slot.label)}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  slot.isLunch
                    ? 'bg-red-50 border-red-300 text-red-900 ring-1 ring-red-200'
                    : slot.isBooked
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : slot.isManuallyBlocked
                    ? 'bg-amber-50 border-amber-300 text-amber-900 cursor-pointer'
                    : 'bg-white border-slate-200 hover:border-emerald-500 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{slot.label}</span>
                  {slot.isLunch && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded uppercase">
                      Almuerzo
                    </span>
                  )}
                  {slot.isBooked && (
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">
                      Cita
                    </span>
                  )}
                  {slot.isManuallyBlocked && !slot.isLunch && (
                    <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-black rounded uppercase">
                      Bloqueado
                    </span>
                  )}
                  {slot.isAvailableForClient && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">
                      Disponible
                    </span>
                  )}
                </div>

                <p className="text-[10px] mt-1 text-slate-500 truncate">
                  {slot.isLunch
                    ? 'Hora de almuerzo (Ocupada en web)'
                    : slot.bookedDetails
                    ? `${slot.bookedDetails.customerName} (#${slot.bookedDetails.orderId})`
                    : slot.isManuallyBlocked
                    ? 'Click para desbloquear'
                    : 'Click para bloquear franja'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
