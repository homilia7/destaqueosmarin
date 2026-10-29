import React from 'react';
import { Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { getTodayDateString } from '../../utils/dateFormatter';

interface KPICardsProps {
  appointments: Appointment[];
}

export const KPICards: React.FC<KPICardsProps> = ({ appointments }) => {
  const todayStr = getTodayDateString();

  // Calcular citas de Hoy
  const todayApps = appointments.filter((a) => a.appointment_date === todayStr);
  const todayPending = todayApps.filter((a) => a.status === 'pending').length;

  // Calcular citas de la semana en curso (Lunes a Domingo)
  const d = new Date(todayStr + 'T12:00:00');
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mondayStr = monday.toISOString().split('T')[0];
  const sundayStr = sunday.toISOString().split('T')[0];

  const weekApps = appointments.filter((a) => a.appointment_date >= mondayStr && a.appointment_date <= sundayStr);

  // Calcular citas del mes actual
  const currentYearMonth = todayStr.substring(0, 7); // 'YYYY-MM'
  const monthApps = appointments.filter((a) => a.appointment_date.startsWith(currentYearMonth));

  const kpis = [
    {
      title: 'Hoy',
      count: todayApps.length,
      detail: `${todayPending} pendientes`,
      icon: Clock,
      color: 'bg-blue-500 text-white'
    },
    {
      title: 'Esta Semana',
      count: weekApps.length,
      detail: 'Semana en curso',
      icon: Calendar,
      color: 'bg-brand-blue text-white'
    },
    {
      title: 'Este Mes',
      count: monthApps.length,
      detail: 'Histórico del mes',
      icon: TrendingUp,
      color: 'bg-brand-orange text-white'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${kpi.color} flex items-center justify-center shadow-xs shrink-0`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-3xl font-black text-brand-dark leading-none my-0.5 sm:my-1">
                {kpi.count}
              </h3>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400">
                {kpi.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
