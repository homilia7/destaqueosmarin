import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, Check, Loader2 } from 'lucide-react';
import { AvailabilityResponse, TimeSlot } from '../../../types/appointment';
import { api } from '../../../services/api';
import { getNextDays, formatTime12h, formatDateToSpanish } from '../../../utils/dateFormatter';

interface StepDateAndTimeProps {
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: TimeSlot) => void;
  onNext: () => void;
}

export const StepDateAndTime: React.FC<StepDateAndTimeProps> = ({
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
  onNext
}) => {
  const days = getNextDays(14);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate && days.length > 0) {
      onSelectDate(days[0].date);
    }
  }, [days, onSelectDate, selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    let isMounted = true;
    setLoading(true);

    api.getAvailability(selectedDate)
      .then((res) => {
        if (isMounted) setAvailability(res);
      })
      .catch((err) => console.warn('Error loading availability:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedDate]);

  return (
    <div className="space-y-8">
      {/* 1. Selector Horizontal de Días */}
      <div>
        <label className="flex items-center gap-2 text-sm font-extrabold text-brand-dark mb-3">
          <CalendarIcon className="w-4 h-4 text-brand-blue" />
          <span>1. Selecciona la Fecha para la Inspección</span>
        </label>
        
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
          {days.map((d) => {
            const isSelected = d.date === selectedDate;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => {
                  onSelectDate(d.date);
                }}
                className={`flex-shrink-0 snap-start w-24 py-3 px-2 rounded-2xl flex flex-col items-center justify-center border text-center transition-all ${
                  isSelected
                    ? 'bg-brand-blue text-white border-brand-blue shadow-glow-blue scale-105'
                    : 'bg-white text-brand-dark border-slate-200 hover:border-brand-blue/50 hover:bg-brand-ice'
                }`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {d.dayName}
                </span>
                <span className="text-xl font-extrabold my-0.5">
                  {d.dayNumber}
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full mt-0.5 ${
                  isSelected ? 'bg-white text-brand-blue' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {d.isToday ? 'HOY' : 'Disponible'}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-brand-slate mt-2 capitalize font-medium">
          📅 {formatDateToSpanish(selectedDate)}
        </p>
      </div>

      {/* 2. Cabecera Informativa de Rango y Bloques Horarios Disponibles */}
      <div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-2 text-sm font-extrabold text-brand-dark">
              <Clock className="w-4 h-4 text-brand-blue" />
              <span>2. Bloques Horarios Disponibles (Rango Completo)</span>
            </label>
          </div>

          {availability && availability.is_available && (
            <div className="p-3 rounded-xl bg-brand-ice border border-brand-iceBorder flex items-center justify-between text-xs text-brand-dark font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-orange" />
                <span>
                  Horario de atención para este día: de <strong>{formatTime12h(availability.start_time)}</strong> a <strong>{formatTime12h(availability.end_time)}</strong>
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Quedan {availability.remaining_slots} espacios disponibles
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-brand-blue gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Consultando agenda disponible en tiempo real...</span>
          </div>
        ) : availability && availability.slots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availability.slots.map((slot) => {
              const isSelected = selectedSlot?.start_time === slot.start_time;
              return (
                <button
                  key={slot.start_time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3.5 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between ${
                    !slot.available
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-brand-orange text-white border-brand-orange shadow-glow-orange scale-102'
                      : 'bg-white text-brand-dark border-slate-200 hover:border-brand-blue hover:bg-brand-ice'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                      <span className="text-sm font-extrabold">{slot.label}</span>
                    </div>
                    <p className={`text-[11px] font-medium ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                      Turno de {slot.start_time} a {slot.end_time}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                    isSelected
                      ? 'bg-white text-brand-orange'
                      : slot.available
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {slot.available ? 'Disponible' : (slot.reason || 'Ocupado')}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm">
              No hay horarios disponibles para esta fecha o el día está marcado como sin cupo. Por favor selecciona otro día en el calendario.
            </p>
          </div>
        )}
      </div>

      {/* Botón Siguiente Paso */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!selectedDate || !selectedSlot}
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-white bg-brand-blue hover:bg-brand-lightBlue disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Siguiente: Indicar Ubicación y Contacto</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
