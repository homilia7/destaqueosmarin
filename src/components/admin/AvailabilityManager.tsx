import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Check, Save, Sliders, ToggleLeft, ToggleRight, Loader2, Ban } from 'lucide-react';
import { GlobalSettings, WorkDay } from '../../types/appointment';
import { api } from '../../services/api';
import { getNextDays, formatDateToSpanish, formatTime12h } from '../../utils/dateFormatter';

const STANDARD_PRESETS = [60, 90, 120, 180, 240];

export const AvailabilityManager: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDayAvailable, setIsDayAvailable] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [dayDuration, setDayDuration] = useState<number | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [savingDay, setSavingDay] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const days = getNextDays(14);

  useEffect(() => {
    api.getSettings().then((s) => {
      setSettings(s);
      setStartTime(s.default_start_time);
      setEndTime(s.default_end_time);
      if (!STANDARD_PRESETS.includes(s.slot_duration_minutes)) {
        setIsCustomDuration(true);
      }
    });
    if (days.length > 0) {
      setSelectedDate(days[1]?.date || days[0].date);
    }
  }, []);

  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      await api.updateSettings(settings);
      setFeedback('Reglas globales guardadas correctamente.');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Error al guardar configuración global.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleBlockSlot = (startSlot: string) => {
    setBlockedSlots((prev) =>
      prev.includes(startSlot) ? prev.filter((s) => s !== startSlot) : [...prev, startSlot]
    );
  };

  const handleSaveDayRule = async () => {
    if (!selectedDate) return;
    setSavingDay(true);
    try {
      const workDay: WorkDay = {
        date: selectedDate,
        is_available: isDayAvailable,
        start_time: startTime,
        end_time: endTime,
        slot_duration_minutes: dayDuration || undefined,
        blocked_slots: blockedSlots
      };
      await api.setWorkDay(workDay);
      setFeedback(`Horarios activados para el día ${selectedDate}`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Error al configurar día de trabajo.');
    } finally {
      setSavingDay(false);
    }
  };

  // Previsualizar slots para el día con la duración activa
  const previewSlots = [];
  const activeDuration = dayDuration || (settings ? settings.slot_duration_minutes : 120);

  if (settings && isDayAvailable) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let cur = startH * 60 + startM;
    const fin = endH * 60 + endM;

    while (cur + activeDuration <= fin) {
      const sH = Math.floor(cur / 60);
      const sM = cur % 60;
      const slotStart = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
      const eH = Math.floor((cur + activeDuration) / 60);
      const eM = (cur + activeDuration) % 60;
      const slotEnd = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
      previewSlots.push({ start: slotStart, end: slotEnd });
      cur += activeDuration;
    }
  }

  if (!settings) {
    return <div className="p-8 text-center text-sm font-semibold text-brand-blue">Cargando reglas de agenda...</div>;
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Configuración Global de Reglas */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Sliders className="w-4 h-4 text-brand-blue" />
          <h3 className="text-sm font-extrabold text-brand-dark">1. Reglas Globales de Trabajo</h3>
        </div>

        <form onSubmit={handleSaveGlobalSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Intervalo de Duración por Bloque */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Duración por Bloque
                </label>
                <span className="text-[11px] font-black text-brand-blue bg-brand-ice px-2 py-0.5 rounded-lg border border-brand-iceBorder">
                  {settings.slot_duration_minutes} min ({(settings.slot_duration_minutes / 60).toFixed(1)}h)
                </span>
              </div>

              <select
                value={isCustomDuration ? 'custom' : settings.slot_duration_minutes}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomDuration(true);
                  } else {
                    setIsCustomDuration(false);
                    setSettings({ ...settings, slot_duration_minutes: Number(e.target.value) });
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-brand-blue transition-all"
              >
                <option value={60}>Cada 1 hora (60 min)</option>
                <option value={90}>Cada 1.5 horas (90 min)</option>
                <option value={120}>Cada 2 horas (120 min) - Estándar</option>
                <option value={180}>Cada 3 horas (180 min)</option>
                <option value={240}>Cada 4 horas (240 min) - 4ta Opción</option>
                <option value="custom">Personalizar duración en minutos...</option>
              </select>

              {/* Panel de Intervalo Personalizado */}
              {isCustomDuration && (
                <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Minutos exactos por bloque:</span>
                    <span className="text-xs font-black text-brand-dark">{settings.slot_duration_minutes} min</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={15}
                      max={480}
                      step={5}
                      value={settings.slot_duration_minutes}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          slot_duration_minutes: Math.max(15, Math.min(480, Number(e.target.value) || 15))
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-brand-dark focus:border-brand-blue outline-none"
                      placeholder="Ej. 75, 105, 150"
                    />
                    <span className="text-xs font-black text-slate-500 shrink-0">min</span>
                  </div>

                  {/* Pastillas Rápidas */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[45, 60, 75, 90, 105, 120, 150, 180, 240].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setSettings({ ...settings, slot_duration_minutes: mins })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                          settings.slot_duration_minutes === mins
                            ? 'bg-brand-blue text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mins < 60 ? `${mins}m` : `${(mins / 60).toFixed(1)}h (${mins}m)`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Límite Máximo de Citas por Día */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Límite Máximo de Citas por Día
                </label>
                <span className="text-[11px] font-black text-slate-500">
                  {settings.max_daily_appointments} citas máx.
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={15}
                value={settings.max_daily_appointments}
                onChange={(e) => setSettings({ ...settings, max_daily_appointments: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-brand-blue transition-all"
              />
            </div>

          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-lightBlue text-white text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Reglas Globales</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Planificador Específico ("Mañana voy a trabajar") */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Calendar className="w-4 h-4 text-brand-orange" />
          <h3 className="text-sm font-extrabold text-brand-dark">2. Planificador Específico ("Mañana voy a trabajar")</h3>
        </div>

        {/* Selector de Fecha */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            Selecciona el Día
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {days.map((d) => (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDate(d.date)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedDate === d.date
                    ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.dayName} {d.dayNumber}
              </button>
            ))}
          </div>
          <p className="text-xs text-brand-blue font-bold mt-1 capitalize">
            {formatDateToSpanish(selectedDate)}
          </p>
        </div>

        {/* Switch Habilitar Día */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <h4 className="text-xs font-extrabold text-brand-dark">Habilitar día para agendamiento</h4>
            <p className="text-[11px] text-slate-500">Controla si los clientes pueden agendar este día.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsDayAvailable(!isDayAvailable)}
            className={`p-1 transition-colors ${isDayAvailable ? 'text-brand-blue' : 'text-slate-300'}`}
          >
            {isDayAvailable ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>
        </div>

        {/* Horas Inicio, Cierre y Duración de Bloque */}
        {isDayAvailable && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hora Cierre</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Intervalo Día</label>
                <select
                  value={dayDuration || ''}
                  onChange={(e) => setDayDuration(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-brand-blue"
                >
                  <option value="">Global ({settings.slot_duration_minutes} min)</option>
                  <option value={60}>1h (60 min)</option>
                  <option value={90}>1.5h (90 min)</option>
                  <option value={120}>2h (120 min)</option>
                  <option value={180}>3h (180 min)</option>
                  <option value={240}>4h (240 min)</option>
                </select>
              </div>
            </div>

            {/* Previsualización y Bloqueo Manual de Bloques */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase mb-2">
                Bloques generados ({activeDuration} min c/u) • Toca para bloquear o liberar:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previewSlots.map((s) => {
                  const isBlocked = blockedSlots.includes(s.start);
                  return (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => handleToggleBlockSlot(s.start)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                        isBlocked
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <span>{formatTime12h(s.start)} - {formatTime12h(s.end)}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-white">
                        {isBlocked ? 'Bloqueado' : 'Libre'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={savingDay}
            onClick={handleSaveDayRule}
            className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-extrabold shadow-glow-orange flex items-center gap-2 transition-all cursor-pointer"
          >
            {savingDay ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Aplicar y Activar Horarios Públicos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
