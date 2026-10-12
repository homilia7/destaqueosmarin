import React, { useState } from 'react';
import type { EmergencyOrder } from '../../types/order';
import { X, Send, ShieldCheck } from 'lucide-react';

interface DigitalReceiptModalProps {
  order: EmergencyOrder | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const [amount, setAmount] = useState(order.estimatedAmount || 65000);
  const [method, setMethod] = useState<'sinpe' | 'efectivo'>(order.paymentMethod === 'sinpe' ? 'sinpe' : 'efectivo');
  const [warrantyDays, setWarrantyDays] = useState(30);

  const receiptNumber = `REC-${order.id.replace('ORD-', '')}-${new Date().getFullYear()}`;
  const currentDate = new Date().toLocaleDateString('es-CR');

  const handleSendWhatsAppReceipt = () => {
    const text = `🧾 *COMPROBANTE DE SERVICIO - MAURICIO MARÍN* 🧾
📌 *N° Recibo:* ${receiptNumber}
📅 *Fecha:* ${currentDate}
👤 *Cliente:* ${order.customerName}
🛠 *Servicio:* ${order.serviceType.replace('_', ' ').toUpperCase()}
📍 *Ubicación:* ${order.location.addressText}
💰 *Monto Cancelado:* ₡${amount.toLocaleString('es-CR')}
💳 *Método de Pago:* ${method === 'sinpe' ? 'SINPE Móvil' : 'Efectivo'}
🛡 *Garantía de Servicio:* ${warrantyDays} días
📞 *Contacto:* 6114-1421
¡Muchas gracias por su confianza! Guarde este mensaje como su comprobante oficial.`;

    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const url = `https://wa.me/506${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white m-0">
              Emitir Recibo Digital
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h4 className="font-black text-slate-900 text-base">DESTAQUEOS MAURICIO MARÍN</h4>
            <p className="text-[11px] text-slate-500">Tel: 6114-1421 • Limpieza de Tanques Sépticos</p>
            <p className="font-mono text-emerald-700 font-bold mt-1">{receiptNumber}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Teléfono:</span>
              <span className="font-bold text-slate-900">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Servicio:</span>
              <span className="font-bold text-slate-900 capitalize">{order.serviceType.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Monto editable */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Monto Cobrado (₡):</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 font-bold text-slate-900 bg-white border rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('sinpe')}
                className={`py-1.5 rounded-lg font-bold text-xs ${
                  method === 'sinpe' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                SINPE Móvil
              </button>
              <button
                type="button"
                onClick={() => setMethod('efectivo')}
                className={`py-1.5 rounded-lg font-bold text-xs ${
                  method === 'efectivo' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                Efectivo
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Garantía Ofrecida:</label>
              <select
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value))}
                className="w-full px-2.5 py-1 text-xs bg-white border rounded-lg font-semibold"
              >
                <option value={15}>15 días de garantía</option>
                <option value={30}>30 días de garantía</option>
                <option value={60}>60 días de garantía</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleSendWhatsAppReceipt}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar Recibo por WhatsApp al Cliente
          </button>
        </div>
      </div>
    </div>
  );
};
