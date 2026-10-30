import React, { useState } from 'react';
import { X, Check, DollarSign, CreditCard, Smartphone, Banknote, Building2, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { PaymentMethod, PaymentItem } from '../../types/appointment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  clientName: string;
  serviceType: string;
  currentAmount?: number;
  currentMethod?: string;
  currentBreakdown?: PaymentItem[];
  onSavePayment: (id: string, amount: number, method: string, breakdown?: PaymentItem[]) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  clientName,
  serviceType,
  currentAmount = 0,
  currentMethod = 'sinpe',
  currentBreakdown = [],
  onSavePayment
}) => {
  // Inicializar pagos divididos o pago único
  const [payments, setPayments] = useState<PaymentItem[]>(() => {
    if (Array.isArray(currentBreakdown) && currentBreakdown.length > 0) {
      return currentBreakdown.map((p) => ({
        method: p.method || 'sinpe',
        amount: Number(p.amount || 0)
      }));
    }
    if (currentAmount > 0) {
      return [
        {
          method: (currentMethod as PaymentMethod) || 'sinpe',
          amount: currentAmount
        }
      ];
    }
    return [
      {
        method: 'sinpe',
        amount: 45000
      }
    ];
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const totalAmount = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const handleAddPaymentRow = () => {
    const existingMethods = new Set(payments.map((p) => p.method));
    let nextMethod: PaymentMethod = 'cash';
    if (existingMethods.has('cash')) nextMethod = 'transfer';
    if (existingMethods.has('transfer')) nextMethod = 'sinpe';

    setPayments([...payments, { method: nextMethod, amount: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (payments.length <= 1) return;
    setPayments(payments.filter((_, idx) => idx !== index));
  };

  const handleUpdateRow = (index: number, field: keyof PaymentItem, value: any) => {
    setPayments(
      payments.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  const handleApplyQuickAmount = (val: number) => {
    if (payments.length === 1) {
      setPayments([{ ...payments[0], amount: val }]);
    } else {
      const lastZeroIdx = payments.findIndex((p) => p.amount === 0);
      if (lastZeroIdx !== -1) {
        handleUpdateRow(lastZeroIdx, 'amount', val);
      } else {
        handleUpdateRow(payments.length - 1, 'amount', val);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const primaryMethod = payments.length > 1 
        ? payments.map((p) => p.method).join(',') 
        : (payments[0]?.method || 'sinpe');

      await onSavePayment(appointmentId, totalAmount, primaryMethod, payments);
      onClose();
    } catch {
      alert('Error al registrar el cobro de la cita.');
    } finally {
      setSaving(false);
    }
  };

  const quickAmounts = [25000, 35000, 40000, 45000, 50000, 60000, 75000, 85000];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Trabajo Finalizado
                </span>
              </div>
              <h3 className="text-base font-black text-brand-dark leading-tight mt-0.5">
                Registrar Cobro del Trabajo
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[260px] sm:max-w-xs">
                {clientName} • {serviceType}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Instrucción clara */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between gap-2">
            <span>Ingrese el monto cobrado. Si el cliente pagó con varios medios (ej. parte en Sinpe y parte en Efectivo), use el selector para añadir más montos.</span>
          </div>

          {/* Pastillas de Montos Frecuentes */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Sugerencias Rápidas de Monto:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleApplyQuickAmount(q)}
                  className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  ₡{q.toLocaleString('es-CR')}
                </button>
              ))}
            </div>
          </div>

          {/* Filas de Pago por Medio */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Desglose de Pago por Medio ({payments.length}):
              </label>
              <button
                type="button"
                onClick={handleAddPaymentRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black text-brand-blue bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Otro Medio</span>
              </button>
            </div>

            {payments.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2 animate-in fade-in"
              >
                <div className="flex items-center gap-2">
                  {/* Selector del Medio de Pago */}
                  <div className="flex-1">
                    <select
                      value={p.method}
                      onChange={(e) => handleUpdateRow(idx, 'method', e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-brand-dark focus:border-brand-blue outline-none"
                    >
                      <option value="sinpe">📱 SINPE Móvil</option>
                      <option value="cash">💵 Efectivo</option>
                      <option value="transfer">🏦 Transferencia Bancaria</option>
                      <option value="card">💳 Tarjeta (Datáfono)</option>
                    </select>
                  </div>

                  {/* Campo de Monto */}
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-xs font-black text-slate-400">
                      ₡
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      required
                      value={p.amount || ''}
                      onChange={(e) => handleUpdateRow(idx, 'amount', Number(e.target.value))}
                      placeholder="Monto"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-brand-dark focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>

                  {/* Botón Eliminar fila si hay más de 1 */}
                  {payments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Eliminar este medio de pago"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Caja Resumen de Total */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Total a ingresar en Control de Ingresos:</span>
              <span className="text-xl font-black text-emerald-950">
                ₡{totalAmount.toLocaleString('es-CR')}
              </span>
            </div>
            
            {/* Resumen por método */}
            {payments.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-emerald-800">
                {payments.map((p, i) => (
                  <span key={i} className="bg-white/80 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                    {p.method === 'sinpe' ? '📱 Sinpe' : p.method === 'cash' ? '💵 Efectivo' : p.method === 'transfer' ? '🏦 Transferencia' : '💳 Tarjeta'}: ₡{Number(p.amount || 0).toLocaleString('es-CR')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Botón Guardar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {totalAmount > 0
                  ? `Guardar Cobro de ₡${totalAmount.toLocaleString('es-CR')} en Ingresos`
                  : 'Guardar Cobro en Registros de Ingresos'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
