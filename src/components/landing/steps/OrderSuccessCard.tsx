import React from 'react';
import { CheckCircle2, MessageSquare, Plus } from 'lucide-react';
import type { EmergencyOrder } from '../../../types/order';

interface OrderSuccessCardProps {
  registeredOrder: EmergencyOrder;
  whatsappUrl: string;
  onReset: () => void;
}

export const OrderSuccessCard: React.FC<OrderSuccessCardProps> = ({
  registeredOrder,
  whatsappUrl,
  onReset,
}) => {
  return (
    <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-mono font-bold rounded-full">
          Cita Agendada: #{registeredOrder.id}
        </span>
        <h4 className="text-base sm:text-lg font-black text-slate-900 mt-2">
          ¡Solicitud Registrada en el Panel de Mauricio!
        </h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
          La orden ya ingresó al radar operativo en vivo. Redirigiendo a WhatsApp para confirmar los detalles de llegada...
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" /> Abrir WhatsApp Ahora
        </a>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Nueva Solicitud
        </button>
      </div>
    </div>
  );
};
