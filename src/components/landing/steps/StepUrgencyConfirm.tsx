import React from 'react';
import { ArrowLeft, Send, Loader2, Zap, Clock, User, Phone, Wrench } from 'lucide-react';

interface StepUrgencyConfirmProps {
  customerName: string;
  customerPhone: string;
  activeServiceTitle: string;
  urgency: 'inmediato' | 'hoy_mismo';
  onSelectUrgency: (urgency: 'inmediato' | 'hoy_mismo') => void;
  isSubmitting: boolean;
  onPrev: () => void;
  onSubmit: () => void;
}

export const StepUrgencyConfirm: React.FC<StepUrgencyConfirmProps> = ({
  customerName,
  customerPhone,
  activeServiceTitle,
  urgency,
  onSelectUrgency,
  isSubmitting,
  onPrev,
  onSubmit,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Resumen rápido de datos ingresados */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Cliente:
          </span>
          <b className="text-slate-900 font-semibold">{customerName}</b>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            Teléfono:
          </span>
          <b className="text-slate-900 font-semibold">{customerPhone}</b>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            Servicio:
          </span>
          <b className="text-emerald-700 font-bold">{activeServiceTitle}</b>
        </div>
      </div>

      {/* Selección de Urgencia */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          4. Seleccione Nivel de Urgencia:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label
            onClick={() => onSelectUrgency('inmediato')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              urgency === 'inmediato'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-sm text-emerald-950 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 text-xs bg-white'
            }`}
          >
            <input
              type="radio"
              name="urgency"
              checked={urgency === 'inmediato'}
              onChange={() => onSelectUrgency('inmediato')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <p className="text-xs font-bold text-slate-900 leading-tight">¡Urgencia Ya!</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Llegada inmediata en ruta</p>
            </div>
          </label>

          <label
            onClick={() => onSelectUrgency('hoy_mismo')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              urgency === 'hoy_mismo'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-sm text-emerald-950 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 text-xs bg-white'
            }`}
          >
            <input
              type="radio"
              name="urgency"
              checked={urgency === 'hoy_mismo'}
              onChange={() => onSelectUrgency('hoy_mismo')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-bold text-slate-900 leading-tight">Hoy mismo programado</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Durante el transcurso del día</p>
            </div>
          </label>
        </div>
      </div>

      {/* Botones de navegación y envío */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Modificar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 fill-white" />
          )}
          <span>{isSubmitting ? 'Agendando...' : 'Agendar Cita en Panel y Abrir WhatsApp'}</span>
        </button>
      </div>
    </div>
  );
};
