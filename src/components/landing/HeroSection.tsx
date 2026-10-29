import React from 'react';
import { Phone, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { WaveDivider } from '../common/WaveDivider';

interface HeroSectionProps {
  onNavigateAgenda: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateAgenda }) => {
  return (
    <section id="inicio" className="relative pt-6 md:pt-12 overflow-hidden bg-gradient-to-br from-[#d1fae5] via-[#ecfdf5] to-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Columna Izquierda: Mensaje Persuasivo */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Badge de Precisión */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] text-xs sm:text-sm font-bold">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-black tracking-wide uppercase bg-gradient-to-r from-emerald-700 via-teal-500 to-emerald-700 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent">
                Mauricio Marín
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-semibold">Camión Cisterna & Destaqueos 24/7</span>
            </div>

            {/* Título Principal H1 con Iluminado Especial */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-extrabold text-brand-dark tracking-tight leading-[1.14]">
              <span className="relative inline-block mr-2 sm:mr-3">
                <span className="bg-gradient-to-r from-emerald-800 via-teal-500 via-emerald-400 to-emerald-700 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(16,185,129,0.35)]">
                  DESTAQUEOS Y TANQUES
                </span>
              </span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-teal-700 via-emerald-500 via-teal-400 to-emerald-700 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent">
                  SÉPTICOS MARÍN
                </span>
              </span>{' '}
              <br className="hidden sm:inline" />
              <span className="text-emerald-700 underline decoration-amber-500/40 decoration-wavy">
                SIN ROMPER
              </span>{' '}
              TUS PISOS
            </h1>

            {/* Subtítulo Persuasivo */}
            <p className="text-base sm:text-lg text-brand-slate max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Vaciado y limpieza profunda de tanques sépticos con camión cisterna de alto vacío, desazolve de trampas de grasa y destaqueo de tuberías con sondas eléctricas en todo el GAM.
            </p>

            {/* Botones CTA Principales */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="/agenda"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateAgenda();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-blue hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                <span>Verificar Disponibilidad y Agendar</span>
              </a>

              <a
                href="tel:+50661141421"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-brand-dark bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <Phone className="w-5 h-5 text-emerald-600" />
                <span>Llamar al 6114-1421</span>
              </a>
            </div>

            {/* Mini Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm font-semibold text-brand-slate">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cero Daño a Pisos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Camión Cisterna Propio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">100%</span>
                <span>Garantía de Trabajo Limpio</span>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Composición Visual Técnica */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Tarjeta Principal de Presentación */}
              <div className="relative rounded-3xl overflow-hidden bg-white p-3 shadow-card border border-white/60">
                <img
                  src="/camion-destaqueos.png"
                  alt="Camión Cisterna de Destaqueos y Tanques Sépticos Mauricio Marín"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />

                {/* Overlay de Diagnóstico Flotante con Transparencia Glassmorphism */}
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-sm text-white p-3.5 rounded-2xl border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-emerald-400 font-extrabold drop-shadow-md">Camión Cisterna Disponible</p>
                      <p className="text-sm font-extrabold text-white drop-shadow-md">Succión de Alto Vacío y Sondas</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/30 backdrop-blur-sm text-emerald-200 text-xs font-black rounded-lg border border-emerald-400/40 shadow-sm">
                      24/7 Activo
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta Flotante Auxiliar */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white p-3.5 rounded-2xl shadow-card border border-slate-100 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black">
                  24/7
                </div>
                <div>
                  <p className="text-xs text-brand-muted font-medium">Atención de Emergencias</p>
                  <p className="text-sm font-extrabold text-brand-dark">Respuesta en Ruta</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Divisor de Onda SVG hacia la siguiente sección */}
      <WaveDivider fillColor="#FFFFFF" />
    </section>
  );
};
