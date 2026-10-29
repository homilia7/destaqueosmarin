import React, { useState } from 'react';
import { DollarSign, Smartphone, CreditCard, Banknote, Calendar, TrendingUp } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { getTodayDateString } from '../../utils/dateFormatter';

interface FinancialReportCardProps {
  appointments: Appointment[];
}

export const FinancialReportCard: React.FC<FinancialReportCardProps> = ({ appointments }) => {
  const [period, setPeriod] = useState<'today' | 'week'>('today');
  const todayStr = getTodayDateString();

  // 1. Filtrar Citas de Hoy
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);

  // 2. Filtrar Citas de Esta Semana (Lunes a Domingo)
  const d = new Date(todayStr + 'T12:00:00');
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mondayStr = monday.toISOString().split('T')[0];
  const sundayStr = sunday.toISOString().split('T')[0];

  const weekAppointments = appointments.filter(
    (a) => a.appointment_date >= mondayStr && a.appointment_date <= sundayStr
  );

  const activeList = period === 'today' ? todayAppointments : weekAppointments;

  // Totales
  const totalAmount = activeList.reduce((acc, a) => acc + (Number(a.amount_collected) || 0), 0);
  
  const sinpeList = activeList.filter((a) => (a.payment_method || 'sinpe') === 'sinpe' && (a.amount_collected || 0) > 0);
  const totalSinpe = sinpeList.reduce((acc, a) => acc + Number(a.amount_collected || 0), 0);

  const cardList = activeList.filter((a) => a.payment_method === 'card' && (a.amount_collected || 0) > 0);
  const totalCard = cardList.reduce((acc, a) => acc + Number(a.amount_collected || 0), 0);

  const cashList = activeList.filter((a) => a.payment_method === 'cash' && (a.amount_collected || 0) > 0);
  const totalCash = cashList.reduce((acc, a) => acc + Number(a.amount_collected || 0), 0);

  const billedCount = activeList.filter((a) => (a.amount_collected || 0) > 0).length;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-soft space-y-3.5">
      {/* Selector de Período: Hoy vs Esta Semana */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
            ₡
          </div>
          <span className="text-xs font-black text-brand-dark uppercase tracking-wide">
            Cierre y Recaudación
          </span>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-black">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`px-3 py-1 rounded-lg transition-all ${
              period === 'today'
                ? 'bg-white text-brand-dark shadow-xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-lg transition-all ${
              period === 'week'
                ? 'bg-white text-brand-dark shadow-xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            Esta Semana
          </button>
        </div>
      </div>

      {/* Monto Total Grande */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            {period === 'today' ? 'Total Cobrado Hoy' : 'Total Cobrado Esta Semana'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            ₡{totalAmount.toLocaleString('es-CR')}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          <span className="font-black text-brand-dark">{billedCount}</span> de {activeList.length} trabajos con cobro
        </div>
      </div>

      {/* Desglose por Método de Pago */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
        {/* Sinpe Móvil */}
        <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200/60">
          <div className="flex items-center justify-between text-emerald-800 font-black text-[10px] mb-1">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-600" />
              <span>Sinpe Móvil</span>
            </span>
            <span className="text-[9px] bg-emerald-200/70 px-1.5 py-0.2 rounded-md">
              {sinpeList.length}
            </span>
          </div>
          <div className="font-black text-xs sm:text-sm text-emerald-900 leading-tight">
            ₡{totalSinpe.toLocaleString('es-CR')}
          </div>
        </div>

        {/* Tarjeta */}
        <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-200/60">
          <div className="flex items-center justify-between text-blue-800 font-black text-[10px] mb-1">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-blue-600" />
              <span>Tarjeta</span>
            </span>
            <span className="text-[9px] bg-blue-200/70 px-1.5 py-0.2 rounded-md">
              {cardList.length}
            </span>
          </div>
          <div className="font-black text-xs sm:text-sm text-blue-900 leading-tight">
            ₡{totalCard.toLocaleString('es-CR')}
          </div>
        </div>

        {/* Efectivo */}
        <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200/60">
          <div className="flex items-center justify-between text-amber-800 font-black text-[10px] mb-1">
            <span className="flex items-center gap-1">
              <Banknote className="w-3 h-3 text-amber-600" />
              <span>Efectivo</span>
            </span>
            <span className="text-[9px] bg-amber-200/70 px-1.5 py-0.2 rounded-md">
              {cashList.length}
            </span>
          </div>
          <div className="font-black text-xs sm:text-sm text-amber-900 leading-tight">
            ₡{totalCash.toLocaleString('es-CR')}
          </div>
        </div>
      </div>
    </div>
  );
};
