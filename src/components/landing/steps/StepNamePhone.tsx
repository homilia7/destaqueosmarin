import React from 'react';
import { User, Phone, ArrowRight, ArrowLeft } from 'lucide-react';

interface StepNamePhoneProps {
  step: number;
  customerName: string;
  customerPhone: string;
  onChangeName: (val: string) => void;
  onChangePhone: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepNamePhone: React.FC<StepNamePhoneProps> = ({
  step,
  customerName,
  customerPhone,
  onChangeName,
  onChangePhone,
  onNext,
  onPrev,
}) => {
  if (step === 1) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            1. ¿Cuál es su nombre o nombre del comercio?
          </label>
          <input
            type="text"
            autoFocus
            placeholder="Ej. Carlos Solís / Soda El Buen Sabor"
            value={customerName}
            onChange={(e) => onChangeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && customerName.trim() && onNext()}
            className="w-full px-3.5 py-3 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled={!customerName.trim()}
          onClick={onNext}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continuar al Teléfono</span> <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          2. Número de teléfono de contacto:
        </label>
        <input
          type="tel"
          autoFocus
          placeholder="Ej. 8888-1234"
          value={customerPhone}
          onChange={(e) => onChangePhone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && customerPhone.trim() && onNext()}
          className="w-full px-3.5 py-3 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Atrás
        </button>
        <button
          type="button"
          disabled={!customerPhone.trim()}
          onClick={onNext}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continuar a Ubicación</span> <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
