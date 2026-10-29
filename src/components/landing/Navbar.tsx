import React, { useState } from 'react';
import { Phone, Calendar, Lock, Menu, X } from 'lucide-react';
import { AnimatedEagleLogo } from '../common/AnimatedEagleLogo';
import { SocialLinks } from '../common/SocialLinks';

interface NavbarProps {
  onOpenAdmin: () => void;
  onNavigateAgenda: () => void;
  onNavigateTestimonials?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onNavigateAgenda, onNavigateTestimonials }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 sm:h-12">
          
          {/* Logo Oficial con Camión y Shimmer Esmeralda */}
          <a href="#inicio" className="flex items-center gap-2.5 group">
            <img src="/camion-destaqueos.png" alt="Destaqueos Mauricio Marín" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg drop-shadow-md" />
            <div className="flex flex-col">
              <span className="block text-sm sm:text-base font-black tracking-tight leading-none bg-gradient-to-r from-emerald-700 via-teal-500 via-emerald-400 to-emerald-700 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(16,185,129,0.35)]">
                MAURICIO MARÍN
              </span>
              <span className="block text-[8px] sm:text-[9px] font-black tracking-widest uppercase mt-0.5 bg-gradient-to-r from-emerald-600 via-teal-400 via-emerald-500 to-emerald-700 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent">
                Destaqueos & Tanques Sépticos
              </span>
            </div>
          </a>

          {/* Enlaces Desktop */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-brand-slate">
            <a href="#inicio" className="hover:text-brand-blue transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-brand-blue transition-colors">Servicios</a>
            <a href="#tecnologia" className="hover:text-brand-blue transition-colors">Tecnología</a>
            <a
              href="/agenda"
              onClick={(e) => {
                e.preventDefault();
                onNavigateAgenda();
              }}
              className="hover:text-brand-blue transition-colors cursor-pointer"
            >
              Agendar
            </a>
            <a
              href="/testimonios"
              onClick={(e) => {
                if (onNavigateTestimonials) {
                  e.preventDefault();
                  onNavigateTestimonials();
                }
              }}
              className="hover:text-brand-blue transition-colors cursor-pointer"
            >
              Testimonios
            </a>
          </nav>

          {/* Acciones Derecha */}
          <div className="hidden sm:flex items-center gap-2">
            <SocialLinks size="sm" className="hidden xl:flex mr-1" />

            <a
              href="tel:+50661141421"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-dark bg-brand-ice hover:bg-brand-iceBorder border border-brand-iceBorder transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
              <span>6114-1421</span>
            </a>

            <a
              href="/agenda"
              onClick={(e) => {
                e.preventDefault();
                onNavigateAgenda();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-brand-orange hover:bg-brand-orangeHover shadow-glow-orange hover:shadow-md transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Cita</span>
            </a>

            {/* Acceso Discreto Admin */}
            <button
              onClick={onOpenAdmin}
              aria-label="Panel Administrador"
              title="Panel de Control Privado"
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-dark hover:bg-slate-100 transition-colors ml-0.5"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hamburguesa Móvil */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={onOpenAdmin}
              aria-label="Panel Admin"
              className="p-1.5 text-slate-400 hover:text-brand-dark"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-brand-dark hover:bg-slate-100"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#inicio"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-slate hover:bg-brand-ice"
          >
            Inicio
          </a>
          <a
            href="#servicios"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-slate hover:bg-brand-ice"
          >
            Servicios
          </a>
          <a
            href="#tecnologia"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-slate hover:bg-brand-ice"
          >
            Tecnología
          </a>
          <a
            href="/agenda"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigateAgenda();
            }}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-slate hover:bg-brand-ice cursor-pointer"
          >
            Agendar Cita
          </a>
          <a
            href="/testimonios"
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateTestimonials) {
                e.preventDefault();
                onNavigateTestimonials();
              }
            }}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-slate hover:bg-brand-ice cursor-pointer"
          >
            Testimonios
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="tel:+50661141421"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-brand-ice text-brand-dark border border-brand-iceBorder"
            >
              <Phone className="w-4 h-4 text-brand-blue" />
              Llamar al 6114-1421
            </a>
            <a
              href="/agenda"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigateAgenda();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-brand-orange text-white shadow-glow-orange cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Inspección Ahora</span>
            </a>

            {/* Redes Sociales en Menú Móvil */}
            <div className="pt-3 mt-1 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Síguenos en redes:</span>
              <SocialLinks size="sm" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
