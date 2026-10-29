import React from 'react';
import { Database, ShieldCheck, Clock, CheckCircle2, FileText, Calendar } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { formatDateToSpanish, formatTime12h } from '../../utils/dateFormatter';

interface StorageManagerProps {
  appointments?: Appointment[];
}

export const StorageManager: React.FC<StorageManagerProps> = ({ appointments = [] }) => {
  const nowMillis = Date.now();

  // Filtrar citas cuyos datos pesados y fotos han sido depurados automáticamente tras 24 horas
  const depuratedAppointments = appointments.filter((a) => {
    if (a.photos_deleted === 1) return true;
    if (a.status === 'completed') return true;
    const utcMillis = Date.parse(`${a.appointment_date}T${a.end_time || a.start_time || '17:00'}:00-06:00`);
    return !isNaN(utcMillis) && nowMillis >= utcMillis + 24 * 60 * 60 * 1000;
  });

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
      {/* Cabecera Principal */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-ice text-brand-blue flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-brand-dark">
              Almacenamiento y Retención Automática (Cero Basura)
            </h3>
            <span className="text-[10px] text-slate-400 font-bold block">
              Depuración desatendida diaria
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
          100% Automático
        </span>
      </div>

      {/* Mensaje Informativo para el Administrador */}
      <div className="p-4 rounded-2xl bg-brand-ice/60 border border-brand-iceBorder text-xs text-brand-dark space-y-1.5">
        <div className="flex items-center gap-2 font-black text-brand-blue">
          <Clock className="w-4 h-4 shrink-0 text-brand-orange" />
          <span className="text-xs sm:text-sm">
            La limpieza se ejecuta automáticamente 24 horas después de agendar la cita
          </span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
          El sistema depura fotos y archivos pesados todos los días para no saturar memoria. 
          Los registros de sus citas <strong>se conservan siempre intactos</strong> en su panel de administración para que usted lleve el control semanal, mensual y anual de todos sus clientes atendidos.
        </p>
      </div>

      {/* Historial de Borrado de Datos */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-blue" />
            <span>Historial de Borrado de Datos ({depuratedAppointments.length})</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-bold">
            Fotos borradas • Registros guardados
          </span>
        </div>

        {depuratedAppointments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-brand-dark">El sistema está al día</p>
            <p className="text-[11px] text-slate-500">
              Conforme pasen 24 horas de cada cita agendada, aquí se listará el historial de depuración automática.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {depuratedAppointments.map((app) => (
              <div
                key={app.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-dark">{app.client_name}</span>
                    <span className="text-[10px] text-brand-blue font-bold">
                      {app.service_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDateToSpanish(app.appointment_date)}</span>
                    <span>•</span>
                    <span>{formatTime12h(app.start_time)} - {formatTime12h(app.end_time)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Fotos depuradas a las 24h</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
