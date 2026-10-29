import React from 'react';
import { ArrowLeft, Phone, ShieldCheck, Lock } from 'lucide-react';
import { BookingWizard } from '../landing/booking/BookingWizard';
import { ServiceType } from '../../types/appointment';
import { AnimatedEagleLogo } from '../common/AnimatedEagleLogo';

interface AgendaPageProps {
  onBackToHome: () => void;
  initialService?: ServiceType;
  onOpenAdmin: () => void;
}

export const AgendaPage: React.FC<AgendaPageProps> = ({
  onBackToHome,
  initialService = 'Limpieza de Tanques Sépticos',
  onOpenAdmin
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-ice via-white to-brand-ice/30 flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      
      {/* Cabecera Limpia Sin Distracciones */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 py-2.5 px-3 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Botón Volver Atrás */}
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-brand-dark bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-blue group-hover:-translate-x-1 transition-transform" />
            <span>Volver al inicio</span>
          </button>

          {/* Logo Corporativo con Camión */}
          <div className="flex items-center gap-2">
            <img src="/camion-destaqueos.png" alt="Camión Cisterna Mauricio Marín" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
            <div>
              <span className="block text-sm sm:text-base font-black tracking-tight leading-none bg-gradient-to-r from-emerald-700 via-teal-500 to-emerald-700 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent">
                MAURICIO MARÍN
              </span>
              <span className="block text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-emerald-600">
                Destaqueos & Tanques Sépticos
              </span>
            </div>
          </div>

          {/* Teléfono de Soporte Inmediato */}
          <a
            href="tel:+50661141421"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-brand-dark bg-brand-ice border border-brand-iceBorder hover:bg-brand-iceBorder transition-all"
            title="Llamar para asistencia inmediata"
          >
            <Phone className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
            <span className="hidden sm:inline">6114-1421</span>
          </a>

        </div>
      </header>

      {/* Contenido Central: Proceso de Agendamiento Sin Salidas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-2.5 sm:py-6">
        <BookingWizard initialService={initialService} />
      </main>

      {/* Pie de Página Mínimo y Seguro */}
      <footer className="bg-white border-t border-slate-100 py-6 px-4 text-center text-xs text-brand-slate space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Proceso 100% Seguro y Confidencial · Respuesta Inmediata 24/7</span>
        </div>
        <p className="text-[11px] text-slate-400">
          ¿Dudas con su reserva o emergencia? Llámenos directamente al <strong>6114-1421</strong>.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-[10px] text-slate-300 hover:text-slate-500 inline-flex items-center gap-1 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Acceso Administrativo</span>
          </button>
        </div>
      </footer>

    </div>
  );
};
