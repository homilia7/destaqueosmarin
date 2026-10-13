import React from 'react';
import { ArrowLeft, Send, Loader2, Zap, Clock, Calendar, User, Phone, Wrench } from 'lucide-react';
import type { TimeSlot } from '../../../types/schedule';

interface StepUrgencyConfirmProps {
  customerName: string;
  customerPhone: string;
  activeServiceTitle: string;
  urgency: 'inmediato' | 'hoy_mismo' | 'manana';
  selectedTime: string;
  timeSlots: TimeSlot[];
  onSelectUrgency: (urgency: 'inmediato' | 'hoy_mismo' | 'manana') => void;
  onSelectTime: (time: string) => void;
  isSubmitting: boolean;
  onPrev: () => void;
  onSubmit: () => void;
}

export const StepUrgencyConfirm: React.FC<StepUrgencyConfirmProps> = ({
  customerName,
  customerPhone,
  activeServiceTitle,
  urgency,
  selectedTime,
  timeSlots,
  onSelectUrgency,
  onSelectTime,
  isSubmitting,
  onPrev,
  onSubmit,
}) => {
  const isSubmitDisabled = isSubmitting || (urgency === 'manana' && !selectedTime);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Resumen de datos */}
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

      {/* Selector de Nivel de Urgencia / Programación */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          4. ¿Para cuándo requiere el servicio?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSelectUrgency('inmediato')}
            className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
              urgency === 'inmediato'
                ? 'border-emerald-500 bg-emerald-50/80 shadow-sm text-emerald-950 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <p className="text-xs font-bold text-slate-900">¡Urgencia Ya!</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Llegada en ruta</p>
          </button>

          <button
            type="button"
            onClick={() => onSelectUrgency('hoy_mismo')}
            className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
              urgency === 'hoy_mismo'
                ? 'border-emerald-500 bg-emerald-50/80 shadow-sm text-emerald-950 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-slate-900">Hoy mismo</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Durante el día</p>
          </button>

          <button
            type="button"
            onClick={() => onSelectUrgency('manana')}
            className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
              urgency === 'manana'
                ? 'border-emerald-500 bg-emerald-50/80 shadow-sm text-emerald-950 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <p className="text-xs font-bold text-slate-900">Para Mañana</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Elegir hora libre</p>
          </button>
        </div>
      </div>

      {/* Cuadrícula de Horas Disponibles (Solo cuando selecciona Para Mañana) */}
      {urgency === 'manana' && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in zoom-in-98 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Horas disponibles para mañana:
            </span>
            {selectedTime && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Hora: {selectedTime}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-0.5">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.label;
              if (!slot.isAvailableForClient) {
                return (
                  <div
                    key={slot.label}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-100/90 text-slate-400 text-center cursor-not-allowed select-none"
                    title="Esta hora no está disponible"
                  >
                    <p className="text-xs font-semibold line-through text-slate-400">{slot.label}</p>
                    <span className="text-[9px] font-medium text-slate-400">Ocupada</span>
                  </div>
                );
              }
              return (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => onSelectTime(slot.label)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-sm'
                      : 'border-slate-300 bg-white hover:border-emerald-500 text-slate-800 text-xs font-semibold'
                  }`}
                >
                  <p className="text-xs leading-tight">{slot.label}</p>
                  <span className={`text-[9px] ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                    Disponible
                  </span>
                </button>
              );
            })}
          </div>

          {!selectedTime && (
            <p className="text-[11px] text-amber-700 font-semibold text-center pt-0.5">
              ⚠️ Seleccione una hora disponible para confirmar su cita.
            </p>
          )}
        </div>
      )}

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
          disabled={isSubmitDisabled}
          className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 fill-white" />
          )}
          <span>
            {isSubmitting
              ? 'Agendando...'
              : urgency === 'manana' && selectedTime
              ? `Agendar Mañana a las ${selectedTime} en WhatsApp`
              : 'Agendar Cita en Panel y Abrir WhatsApp'}
          </span>
        </button>
      </div>
    </div>
  );
};
