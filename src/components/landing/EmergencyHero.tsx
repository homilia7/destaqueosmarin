import React from 'react';
import { Phone, Navigation, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

interface EmergencyHeroProps {
  onScrollToLocation: () => void;
}

export const EmergencyHero: React.FC<EmergencyHeroProps> = ({ onScrollToLocation }) => {
  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white pt-8 pb-12 px-4 overflow-hidden border-b border-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Urgency pitch */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            Respuesta Rápida de Emergencia en el GAM y Alrededores
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white m-0">
            Destaqueo de Tuberías y{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
              Tanques Sépticos
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
            ¿Inodoro rebalzado, aguas negras atascadas o tanque séptico al límite? 
            Llegamos a su casa, empresa o restaurante con equipo especializado y camión cisterna.
          </p>

          {/* Quick guarantees */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sondas rotativas (Cero rotura)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Camión cisterna de alto vacío</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Garantía de trabajo 100% limpio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pago con SINPE Móvil o Efectivo</span>
            </div>
          </div>

          {/* Big action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={onScrollToLocation}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Navigation className="w-5 h-5" />
              Enviar mi Ubicación GPS (Tipo Uber)
            </button>
            <a
              href="tel:61141421"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm sm:text-base border border-slate-700 transition-colors"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
              Llamar directo: 6114-1421
            </a>
          </div>
        </div>

        {/* Right Column: Truck image */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-md bg-gradient-to-tr from-emerald-500/20 to-slate-800/80 p-3 rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden group">
            <img
              src="/camion-destaqueos.png"
              alt="Camión Cisterna de Destaqueos y Tanques Sépticos Mauricio Marín"
              className="w-full h-auto object-cover rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute bottom-5 left-5 right-5 bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Unidad Disponible en Ruta</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">6114-1421</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
