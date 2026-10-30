import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Plus, 
  Trash2, 
  Receipt, 
  Fuel, 
  Utensils, 
  Wrench, 
  Truck, 
  FileText, 
  Smartphone, 
  Banknote, 
  Building2, 
  CreditCard,
  Image as ImageIcon, 
  CheckCircle2, 
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { Appointment, Expense, ExpenseCategory, PaymentItem } from '../../types/appointment';
import { useExpenses } from '../../hooks/useExpenses';
import { formatDateToSpanish, formatTime12h } from '../../utils/dateFormatter';

interface IncomeExpenseManagerProps {
  appointments: Appointment[];
}

type PeriodFilter = 'day' | 'week' | 'month' | 'all';

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: any; color: string; bg: string }> = {
  gasolina: { label: 'Gasolina / Combustible', icon: Fuel, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  alimentacion: { label: 'Alimentación / Viáticos', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  materiales: { label: 'Materiales / Repuestos', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  mantenimiento: { label: 'Mantenimiento Camión', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  otro: { label: 'Otros Gastos', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' }
};

export const IncomeExpenseManager: React.FC<IncomeExpenseManagerProps> = ({ appointments }) => {
  const { expenses, loading: loadingExpenses, createExpense, removeExpense } = useExpenses(true);
  
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Estado para nuevo gasto
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('gasolina');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseDesc, setExpenseDesc] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [isCompressingReceipt, setIsCompressingReceipt] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  
  // Lightbox para ver recibo ampliado
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Helper para comprimir recibo a base64 ligero
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingReceipt(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 900;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setReceiptBase64(canvas.toDataURL('image/jpeg', 0.72));
          } else {
            setReceiptBase64(event.target?.result as string);
          }
          setIsCompressingReceipt(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setIsCompressingReceipt(false);
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || amountNum <= 0) return;
    if (!expenseDesc.trim()) return;

    setIsSavingExpense(true);
    try {
      await createExpense({
        date: expenseDate,
        category: expenseCategory,
        description: expenseDesc.trim(),
        amount: amountNum,
        receipt_url: receiptBase64
      });

      // Reset
      setExpenseAmount('');
      setExpenseDesc('');
      setReceiptBase64(null);
      setIsAddingExpense(false);
    } finally {
      setIsSavingExpense(false);
    }
  };

  // Rango de fechas según el filtro seleccionado
  const dateRange = useMemo(() => {
    const now = new Date(selectedDate + 'T12:00:00');
    
    if (period === 'day') {
      const dayStr = selectedDate;
      return { start: dayStr, end: dayStr };
    }
    
    if (period === 'week') {
      const current = new Date(now);
      const dayOfWeek = current.getDay(); // 0 is Sun, 1 is Mon...
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(current);
      monday.setDate(current.getDate() + diffToMonday);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0]
      };
    }

    if (period === 'month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      return {
        start: `${year}-${month}-01`,
        end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      };
    }

    return { start: '2000-01-01', end: '2099-12-31' };
  }, [period, selectedDate]);

  // Filtrar citas completadas en el periodo
  const completedAppointmentsInPeriod = useMemo(() => {
    return appointments.filter((app) => {
      if (app.status !== 'completed') return false;
      const appDate = app.appointment_date;
      if (period === 'all') return true;
      return appDate >= dateRange.start && appDate <= dateRange.end;
    });
  }, [appointments, period, dateRange]);

  // Filtrar gastos en el periodo
  const expensesInPeriod = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = exp.date;
      if (period === 'all') return true;
      return expDate >= dateRange.start && expDate <= dateRange.end;
    });
  }, [expenses, period, dateRange]);

  // Totales
  const totalIncome = useMemo(() => {
    return completedAppointmentsInPeriod.reduce((sum, app) => sum + Number(app.amount_collected || 0), 0);
  }, [completedAppointmentsInPeriod]);

  const totalExpenses = useMemo(() => {
    return expensesInPeriod.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [expensesInPeriod]);

  const netBalance = totalIncome - totalExpenses;

  // Desglose por método de pago
  const breakdownTotals = useMemo(() => {
    let sinpe = 0;
    let cash = 0;
    let transfer = 0;
    let card = 0;

    completedAppointmentsInPeriod.forEach((app) => {
      if (Array.isArray(app.payment_breakdown) && app.payment_breakdown.length > 0) {
        app.payment_breakdown.forEach((item) => {
          const amt = Number(item.amount || 0);
          if (item.method === 'sinpe') sinpe += amt;
          else if (item.method === 'cash') cash += amt;
          else if (item.method === 'transfer') transfer += amt;
          else if (item.method === 'card') card += amt;
        });
      } else {
        const amt = Number(app.amount_collected || 0);
        if (app.payment_method === 'cash') cash += amt;
        else if (app.payment_method === 'card') card += amt;
        else sinpe += amt;
      }
    });

    return { sinpe, cash, transfer, card };
  }, [completedAppointmentsInPeriod]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* ENCABEZADO Y SELECTOR DE PERIODO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-orange" />
            <span>Control de Ingresos y Gastos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Registro contable de trabajos realizados, medios de pago y comprobantes de gastos operativos.
          </p>
        </div>

        {/* Selector de periodo */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-black">
            <button
              type="button"
              onClick={() => setPeriod('day')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                period === 'day' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Día
            </button>
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                period === 'week' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                period === 'month' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                period === 'all' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histórico
            </button>
          </div>

          {/* Selector de fecha de referencia */}
          {period !== 'all' && (
            <input
              type={period === 'month' ? 'month' : 'date'}
              value={period === 'month' ? selectedDate.substring(0, 7) : selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDate(period === 'month' ? `${val}-01` : val);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* TARJETAS KPI DE RESUMEN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Ingresos */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white p-5 rounded-3xl border border-emerald-200 shadow-soft">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              Total Ingresos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-950">
            ₡{totalIncome.toLocaleString('es-CR')}
          </p>
          <p className="text-[11px] font-bold text-emerald-700 mt-1">
            {completedAppointmentsInPeriod.length} {completedAppointmentsInPeriod.length === 1 ? 'trabajo finalizado' : 'trabajos finalizados'}
          </p>
        </div>

        {/* Total Gastos */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-50 to-white p-5 rounded-3xl border border-rose-200 shadow-soft">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-800">
              Total Gastos Operativos
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-2xs">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-950">
            ₡{totalExpenses.toLocaleString('es-CR')}
          </p>
          <p className="text-[11px] font-bold text-rose-700 mt-1">
            {expensesInPeriod.length} {expensesInPeriod.length === 1 ? 'comprobante registrado' : 'comprobantes registrados'}
          </p>
        </div>

        {/* Ganancia Neta */}
        <div className={`p-5 rounded-3xl border shadow-soft ${
          netBalance >= 0
            ? 'bg-gradient-to-br from-blue-500/10 via-blue-50 to-white border-blue-200'
            : 'bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border-amber-200'
        }`}>
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Ganancia Neta (Balance)
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs ${
              netBalance >= 0 ? 'bg-brand-blue' : 'bg-amber-600'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${netBalance >= 0 ? 'text-brand-dark' : 'text-amber-950'}`}>
            ₡{netBalance.toLocaleString('es-CR')}
          </p>
          <p className="text-[11px] font-bold text-slate-600 mt-1">
            Margen de utilidad real en el periodo
          </p>
        </div>
      </div>

      {/* DESGLOSE POR MEDIO DE PAGO */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-brand-blue" />
          <span>Ingresos por Medio de Pago en este Periodo</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* SINPE */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-extrabold mb-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>SINPE Móvil</span>
            </div>
            <p className="text-lg font-black text-emerald-950">₡{breakdownTotals.sinpe.toLocaleString('es-CR')}</p>
          </div>

          {/* Efectivo */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-extrabold mb-1">
              <Banknote className="w-3.5 h-3.5 text-amber-600" />
              <span>Efectivo</span>
            </div>
            <p className="text-lg font-black text-amber-950">₡{breakdownTotals.cash.toLocaleString('es-CR')}</p>
          </div>

          {/* Transferencia */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center gap-1.5 text-blue-800 text-xs font-extrabold mb-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Transferencia</span>
            </div>
            <p className="text-lg font-black text-blue-950">₡{breakdownTotals.transfer.toLocaleString('es-CR')}</p>
          </div>

          {/* Tarjeta */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
            <div className="flex items-center gap-1.5 text-purple-800 text-xs font-extrabold mb-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>Tarjeta / Datáfono</span>
            </div>
            <p className="text-lg font-black text-purple-950">₡{breakdownTotals.card.toLocaleString('es-CR')}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DOBLE: GASTOS OPERATIVOS vs TRABAJOS FACTURADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUMNA 1: GASTOS OPERATIVOS Y FORMULARIO */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-brand-dark">Gastos Operativos</h3>
                <p className="text-[11px] text-slate-500 font-medium">Gasolina, comidas y repuestos</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingExpense(!isAddingExpense)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
            >
              {isAddingExpense ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAddingExpense ? 'Cerrar' : '+ Registrar Gasto'}</span>
            </button>
          </div>

          {/* FORMULARIO DE NUEVO GASTO */}
          {isAddingExpense && (
            <form onSubmit={handleSaveExpense} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">
                Ingresar Nuevo Gasto
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Categoría</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                  >
                    <option value="gasolina">⛽ Gasolina / Combustible</option>
                    <option value="alimentacion">🍽️ Alimentación / Viáticos</option>
                    <option value="materiales">🔧 Materiales / Repuestos</option>
                    <option value="mantenimiento">🚛 Mantenimiento Camión</option>
                    <option value="otro">📌 Otros Gastos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Monto (₡)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">₡</span>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="25000"
                    min="1"
                    required
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Descripción / Proveedor</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ej: Diésel camión en Bomba Delta Cartago"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Subir foto de factura / comprobante */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Foto Factura / Comprobante (Opcional)</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                    {isCompressingReceipt ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>{receiptBase64 ? 'Cambiar Foto' : 'Subir Foto Recibo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>

                  {receiptBase64 && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={receiptBase64} 
                        alt="Comprobante" 
                        onClick={() => setLightboxImage(receiptBase64)}
                        className="w-10 h-10 object-cover rounded-lg border border-rose-300 cursor-pointer hover:opacity-80"
                      />
                      <button
                        type="button"
                        onClick={() => setReceiptBase64(null)}
                        className="text-[10px] text-rose-600 underline font-bold"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingExpense || isCompressingReceipt}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingExpense ? 'Guardando...' : 'Guardar Gasto'}
                </button>
              </div>
            </form>
          )}

          {/* LISTA DE GASTOS REGISTRADOS */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {expensesInPeriod.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">No hay gastos registrados en este periodo.</p>
              </div>
            ) : (
              expensesInPeriod.map((exp) => {
                const cat = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.otro;
                const IconComponent = cat.icon;
                return (
                  <div
                    key={exp.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
                        <IconComponent className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-brand-dark truncate">{exp.description}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${cat.bg} ${cat.color}`}>
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{formatDateToSpanish(exp.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {exp.receipt_url && (
                        <button
                          type="button"
                          onClick={() => setLightboxImage(exp.receipt_url || null)}
                          className="w-7 h-7 rounded-lg overflow-hidden border border-slate-300 hover:opacity-80"
                          title="Ver comprobante"
                        >
                          <img src={exp.receipt_url} alt="Recibo" className="w-full h-full object-cover" />
                        </button>
                      )}
                      <span className="text-xs font-black text-rose-700">
                        -₡{Number(exp.amount).toLocaleString('es-CR')}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExpense(exp.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA 2: TRABAJOS FACTURADOS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-brand-dark">Trabajos Facturados</h3>
                <p className="text-[11px] text-slate-500 font-medium">Servicios finalizados con cobro registrado</p>
              </div>
            </div>

            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800">
              {completedAppointmentsInPeriod.length} trabajos
            </span>
          </div>

          {/* LISTA DE TRABAJOS FACTURADOS */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {completedAppointmentsInPeriod.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">No hay trabajos finalizados en este periodo.</p>
              </div>
            ) : (
              completedAppointmentsInPeriod.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-brand-dark">{app.client_name}</h4>
                      <p className="text-[11px] text-brand-blue font-bold">{app.service_type}</p>
                      <p className="text-[10px] text-slate-400">{formatDateToSpanish(app.appointment_date)}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-800 block">
                        ₡{Number(app.amount_collected || 0).toLocaleString('es-CR')}
                      </span>
                    </div>
                  </div>

                  {/* Badges de desglose */}
                  {Array.isArray(app.payment_breakdown) && app.payment_breakdown.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60">
                      {app.payment_breakdown.map((item, i) => (
                        <span 
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs"
                        >
                          <span>
                            {item.method === 'cash' ? '💵 Efectivo' : item.method === 'sinpe' ? '📱 SINPE' : item.method === 'transfer' ? '🏦 Transf.' : '💳 Tarjeta'}:
                          </span>
                          <span className="font-extrabold text-emerald-700">₡{Number(item.amount).toLocaleString('es-CR')}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* LIGHTBOX MODAL PARA VER COMPROBANTE EN TAMAÑO COMPLETO */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Comprobante en detalle" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
