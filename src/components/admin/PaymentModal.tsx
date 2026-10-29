import React, { useState } from 'react';
import { X, Check, DollarSign, CreditCard, Smartphone, Banknote, Loader2 } from 'lucide-react';
import { PaymentMethod } from '../../types/appointment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  clientName: string;
  serviceType: string;
  currentAmount?: number;
  currentMethod?: string;
  onSavePayment: (id: string, amount: number, method: PaymentMethod) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  clientName,
  serviceType,
  currentAmount = 0,
  currentMethod = 'sinpe',
  onSavePayment
}) => {
  const [amount, setAmount] = useState<number>(currentAmount);
  const [method, setMethod] = useState<PaymentMethod>(
    (currentMethod as PaymentMethod) || 'sinpe'
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSavePayment(appointmentId, Number(amount || 0), method);
      onClose();
    } catch {
      alert('Error al registrar el cobro de la cita.');
    } finally {
      setSaving(false);
    }
  };

  const quickAmounts = [25000, 35000, 45000, 60000, 75000, 100000];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
              ₡
            </div>
            <div>
              <h3 className="text-base font-black text-brand-dark leading-tight">
                Registrar Cobro
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[220px]">
                {clientName} • {serviceType}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Monto */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Monto Cobrado (₡ Colones)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-black text-sm">
                ₡
              </span>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="45000"
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-lg font-black text-brand-dark focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>

            {/* Pastillas de Montos Frecuentes */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                    amount === q
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ₡{q.toLocaleString('es-CR')}
                </button>
              ))}
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('sinpe')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'sinpe'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-black leading-tight">Sinpe Móvil</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black leading-tight">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'cash'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-black leading-tight">Efectivo</span>
              </button>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {amount > 0
                  ? `Guardar Cobro de ₡${amount.toLocaleString('es-CR')}`
                  : 'Guardar Cobro'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
