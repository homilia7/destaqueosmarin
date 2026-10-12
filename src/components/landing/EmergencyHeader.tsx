import React from 'react';
import { Phone, ShieldCheck, Clock, UserCheck } from 'lucide-react';

interface EmergencyHeaderProps {
  onOpenAdmin: () => void;
}

export const EmergencyHeader: React.FC<EmergencyHeaderProps> = ({ onOpenAdmin }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-emerald-500/30 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg font-black tracking-tight flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-extrabold tracking-tight leading-tight text-white m-0">
              DESTAQUEOS <span className="text-emerald-400">MAURICIO MARÍN</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 leading-none mt-0.5 truncate max-w-[200px] sm:max-w-none">
              <Clock className="w-3 h-3 text-emerald-400 shrink-0 inline" /> Atención de Urgencia 24/7 en Costa Rica
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Switch to Mauricio's panel */}
          <button
            onClick={onOpenAdmin}
            title="Panel de Control de Mauricio"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Panel Operativo</span>
          </button>

          {/* Quick Call Button */}
          <a
            href="tel:61141421"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-slate-950 font-black text-xs sm:text-sm rounded-lg shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 text-slate-950" />
            <span className="tracking-wide hidden xs:inline">Llamar:</span>
            <span className="tracking-wide">6114-1421</span>
          </a>
        </div>
      </div>
    </header>
  );
};
