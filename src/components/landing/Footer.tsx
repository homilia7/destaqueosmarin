import React from 'react';
import { Phone, MapPin, Clock, Lock, ShieldCheck } from 'lucide-react';
import { AnimatedEagleLogo } from '../common/AnimatedEagleLogo';
import { SocialLinks } from '../common/SocialLinks';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateAgenda: () => void;
  onNavigateTestimonials?: () => void;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onNavigateAgenda,
  onNavigateTestimonials
}) => {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Columna 1: Marca y Misión con Camión Oficial */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img 
                src="/camion-destaqueos.png" 
                alt="Camión Cisterna Mauricio Marín" 
                className="w-10 h-10 object-contain rounded-xl drop-shadow-md" 
              />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight leading-none bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent">
                  MAURICIO MARÍN
                </span>
                <span className="text-[10px] font-black tracking-widest uppercase mt-1 text-emerald-400">
                  Destaqueos & Tanques Sépticos
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vaciado de tanques sépticos con camión cisterna de alto vacío, desazolve de trampas de grasa y destaqueo con sondas eléctricas en todo el país.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía de Trabajo 100% Limpio</span>
            </div>

            {/* Redes Sociales Oficiales */}
            <div className="pt-2 space-y-1.5">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Redes Sociales Oficiales:
              </span>
              <SocialLinks size="sm" showLabels={true} />
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Servicios Técnicos</a></li>
              <li><a href="#tecnologia" className="hover:text-white transition-colors">Equipamiento FLIR / Geófono</a></li>
              <li>
                <a
                  href="/agenda"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateAgenda();
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Agendar Inspección
                </a>
              </li>
              <li>
                <a
                  href="/testimonios"
                  onClick={(e) => {
                    if (onNavigateTestimonials) {
                      e.preventDefault();
                      onNavigateTestimonials();
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Testimonios Verificados
                </a>
              </li>
              <li><a href="/proyecto" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">⚡ Arquitectura del Sistema (/proyecto)</a></li>
            </ul>
          </div>

          {/* Columna 3: Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Atención Directa</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="tel:+50661141421" className="text-white font-bold hover:underline">
                  6114-1421
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Atención de Emergencias 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Cobertura en Gran Área Metropolitana (GAM)</span>
              </div>
            </div>
          </div>

          {/* Columna 4: Garantía y Portal Técnico Privado */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Atención Especializada</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipos de geófono digital de alta fidelidad, inspección acústica subterránea y termografía infrarroja para residencias, comercios e industrias.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Administrativo Privado</span>
              </button>
            </div>
          </div>

        </div>

        {/* Copyright y Redes Rápidas */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/camion-destaqueos.png" 
              alt="Mauricio Marín Sello" 
              className="w-5 h-5 object-contain opacity-80"
            />
            <p>© {new Date().getFullYear()} Destaqueos y Tanques Sépticos Mauricio Marín. Todos los derechos reservados.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">Síguenos:</span>
            <SocialLinks size="sm" />
          </div>
          <p className="text-[11px]">Diseño y Arquitectura Operativa Llave en Mano.</p>
        </div>

      </div>
    </footer>
  );
};
