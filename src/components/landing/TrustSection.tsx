import React from 'react';
import { ShieldCheck, Sparkles, MapPin, CreditCard, Clock, Phone } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-16 px-4 border-t border-slate-800">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
            <Clock className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white text-base">Atención 24/7</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Disponibilidad continua para emergencias nocturnas, fines de semana y feriados.
            </p>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
            <Sparkles className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white text-base">Trabajo Limpio</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cero desastres en su hogar o local. Desinfección y cuidado de su espacio garantizado.
            </p>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
            <CreditCard className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white text-base">Pagos SINPE & Efectivo</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Facilidad total para pagar por SINPE Móvil o efectivo al finalizar el trabajo con recibo.
            </p>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white text-base">Equipo Especializado</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Camión cisterna de bombeo y sondas eléctricas industriales para cualquier obstrucción.
            </p>
          </div>
        </div>

        {/* Coverage banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-850 p-6 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h5 className="font-bold text-white text-sm">Cobertura Integral en Toda Costa Rica</h5>
              <p className="text-xs text-slate-300">
                San José • Alajuela • Heredia • Cartago • Zonas Industriales y Rurales
              </p>
            </div>
          </div>
          <a
            href="tel:61141421"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shrink-0 transition-transform active:scale-95"
          >
            <Phone className="w-4 h-4 fill-slate-950" />
            Llamar al 6114-1421
          </a>
        </div>

        {/* Copyright & slogan */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
          <p className="font-medium text-slate-400">
            Destaqueos y Tanques Sépticos Mauricio Marín • "Solucionamos su problema, cuidamos su espacio"
          </p>
          <p className="mt-1">Sistema Web de Operaciones y Geolocalización • Costa Rica 🇨🇷</p>
        </div>
      </div>
    </footer>
  );
};
