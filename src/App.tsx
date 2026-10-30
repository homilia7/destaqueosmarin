import React, { useState, useEffect } from 'react';
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { ServicesSection } from './components/landing/ServicesSection';
import { TechShowcase } from './components/landing/TechShowcase';
import { TestimonialsSection } from './components/landing/TestimonialsSection';
import { Footer } from './components/landing/Footer';
import { AgendaPage } from './components/agenda/AgendaPage';
import { ClientReviewPage } from './components/review/ClientReviewPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminView } from './components/admin/AdminView';
import { JobQuoteManager } from './components/quotes/JobQuoteManager';
import { ClientQuoteView } from './components/quotes/ClientQuoteView';
import { ProjectPresentationPage } from './components/project/ProjectPresentationPage';
import { useAdminAuth } from './hooks/useAdminAuth';
import { usePWA } from './hooks/usePWA';
import { ServiceType } from './types/appointment';
import { api } from './services/api';
import { MessageSquare } from 'lucide-react';

export function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    return path || '/';
  });

  const [selectedService, setSelectedService] = useState<ServiceType>('Limpieza de Tanques Sépticos');
  
  const { isAuthenticated, isLoading, error, login, logout } = useAdminAuth();
  const { isInstallable, notificationsGranted, promptInstall, requestNotificationPermission } = usePWA();

  // Escuchar cambios de historial (botón atrás/adelante del navegador)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
      setCurrentPath(path || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirigir hash #agendar/#agenda directamente a la ruta limpia /agenda
  useEffect(() => {
    if (window.location.hash === '#agendar' || window.location.hash === '#agenda') {
      window.history.replaceState({}, '', '/agenda');
      setCurrentPath('/agenda');
      window.scrollTo(0, 0);
    }
  }, []);

  // Redirigir variantes /detec, /panel, /admin o ?view=admin a la ruta oficial /detec/panel preservando parámetros
  useEffect(() => {
    const raw = window.location.pathname.replace(/\/+$/, '');
    const params = new URLSearchParams(window.location.search);
    let changed = false;

    if (raw === '/detec' || raw === '/panel' || raw === '/admin') {
      setCurrentPath('/detec/panel');
      changed = true;
    }

    if (params.get('view') === 'admin') {
      params.delete('view');
      setCurrentPath('/detec/panel');
      changed = true;
    }

    // Atajos directos de URL a pestañas del panel administrativo
    if (raw === '/horarios' || raw === '/horario') {
      params.set('tab', 'schedule');
      setCurrentPath('/detec/panel');
      changed = true;
    } else if (raw === '/trafico' || raw === '/metricas') {
      params.set('tab', 'traffic');
      setCurrentPath('/detec/panel');
      changed = true;
    } else if (raw === '/citas') {
      params.set('tab', 'all');
      setCurrentPath('/detec/panel');
      changed = true;
    } else if (raw === '/ajustes') {
      params.set('tab', 'settings');
      setCurrentPath('/detec/panel');
      changed = true;
    } else if (raw === '/resenas' || raw === '/reviews') {
      params.set('tab', 'reviews');
      setCurrentPath('/detec/panel');
      changed = true;
    }

    if (changed) {
      const search = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState({}, '', `/detec/panel${search}`);
    }
  }, []);

  // Detección y rastreo de enlaces cortos de redes sociales (/fb, /ig, /wa o ?ref=...)
  useEffect(() => {
    const raw = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const refParam = (params.get('ref') || params.get('source') || params.get('utm_source') || '').toLowerCase();

    let detectedSource = '';
    if (raw === '/fb' || refParam === 'fb' || refParam === 'facebook') {
      detectedSource = 'fb';
    } else if (raw === '/ig' || refParam === 'ig' || refParam === 'instagram') {
      detectedSource = 'ig';
    } else if (raw === '/wa' || refParam === 'wa' || refParam === 'whatsapp') {
      detectedSource = 'wa';
    } else if (raw === '/google' || raw === '/ads' || refParam === 'google' || refParam === 'gads' || refParam === 'cpc' || params.has('gclid') || (params.get('utm_medium') || '').toLowerCase() === 'cpc') {
      detectedSource = 'google';
    }

    if (detectedSource) {
      sessionStorage.setItem('marin_traffic_source', detectedSource);
      api.trackTrafficEvent(detectedSource, 'visit', raw || '/');
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
    } else if (!sessionStorage.getItem('marin_traffic_source') && !raw.startsWith('/detec') && !raw.startsWith('/cotizacion')) {
      sessionStorage.setItem('marin_traffic_source', 'direct');
      api.trackTrafficEvent('direct', 'visit', raw || '/');
    }
  }, []);

  const navigateTo = (path: string) => {
    if (path === '/agenda' || path.startsWith('/agenda')) {
      const source = typeof window !== 'undefined' ? (sessionStorage.getItem('marin_traffic_source') || 'direct') : 'direct';
      api.trackTrafficEvent(source, 'agenda_click', path);
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path.replace(/\/+$/, '').toLowerCase() || '/');
    window.scrollTo(0, 0);
  };

  const handleSelectService = (serviceTitle: string) => {
    setSelectedService(serviceTitle as ServiceType);
    navigateTo('/agenda');
  };

  const normalizedPath = currentPath.toLowerCase();
  const isAgendaRoute = normalizedPath === '/agenda' || normalizedPath === '/agendar';
  const isAdminRoute = normalizedPath === '/detec/panel' || normalizedPath === '/detec' || normalizedPath === '/panel' || normalizedPath === '/admin';
  const isReviewRoute = normalizedPath === '/calificar' || normalizedPath === '/review' || normalizedPath === '/valorar';
  const isQuoteRoute = normalizedPath === '/cotizador' || normalizedPath === '/cotizar' || normalizedPath === '/presupuesto';
  const isClientQuoteRoute = normalizedPath.startsWith('/cotizacion');
  const isProjectRoute = normalizedPath === '/proyecto' || normalizedPath === '/sistema' || normalizedPath === '/propuesta';
  const isTestimonialsRoute = normalizedPath === '/testimonios';

  const clientQuoteId = (() => {
    if (!isClientQuoteRoute) return '';
    const parts = currentPath.split('/');
    if (parts.length >= 3 && parts[1] === 'cotizacion') {
      return decodeURIComponent(parts[2]);
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '';
  })();

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark selection:bg-brand-blue selection:text-white">
      {isAdminRoute ? (
        /* RUTA EXCLUSIVA INDEPENDIENTE: /detec/panel */
        isAuthenticated ? (
          <AdminView
            onClose={() => navigateTo('/')}
            onLogout={() => {
              logout();
              navigateTo('/');
            }}
            onInstallPWA={promptInstall}
            onRequestNotifications={requestNotificationPermission}
            isInstallable={isInstallable}
            notificationsGranted={notificationsGranted}
          />
        ) : (
          <AdminLogin
            onLogin={login}
            onClose={() => navigateTo('/')}
            isLoading={isLoading}
            error={error}
          />
        )
      ) : isAgendaRoute ? (
        /* Vista Exclusiva de Agenda Sin Distracciones: /agenda */
        <AgendaPage
          onBackToHome={() => navigateTo('/')}
          initialService={selectedService}
          onOpenAdmin={() => navigateTo('/detec/panel')}
        />
      ) : isTestimonialsRoute ? (
        /* Vista Exclusiva de Testimonios y Reseñas de Clientes: /testimonios */
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar
            onOpenAdmin={() => navigateTo('/detec/panel')}
            onNavigateAgenda={() => navigateTo('/agenda')}
            onNavigateTestimonials={() => navigateTo('/testimonios')}
          />
          <main className="flex-grow py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
              >
                <span>← Volver al Inicio</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/calificar')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-xs cursor-pointer"
              >
                <span>★ Dejar mi Reseña</span>
              </button>
            </div>
            <TestimonialsSection />
          </main>
          <Footer
            onOpenAdmin={() => navigateTo('/detec/panel')}
            onNavigateAgenda={() => navigateTo('/agenda')}
            onNavigateTestimonials={() => navigateTo('/testimonios')}
          />
        </div>
      ) : isReviewRoute ? (
        /* Vista Exclusiva para Calificación de Clientes: /calificar */
        <ClientReviewPage onBackToHome={() => navigateTo('/')} />
      ) : isProjectRoute ? (
        /* Vista Estratégica del Sistema y Funcionalidades: /proyecto */
        <ProjectPresentationPage
          onBackToHome={() => navigateTo('/')}
          onNavigateAgenda={() => navigateTo('/agenda')}
          onOpenAdmin={() => navigateTo('/detec/panel')}
        />
      ) : isClientQuoteRoute ? (
        /* Vista Oficial Dinámica de Cotización para el Cliente: /cotizacion/:id */
        <ClientQuoteView
          quoteId={clientQuoteId}
          onBackToHome={() => navigateTo('/')}
        />
      ) : isQuoteRoute ? (
        /* Vista Directa para Cotizaciones de Trabajos: /cotizador */
        <div className="min-h-screen bg-[#F1F5F9] p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="no-print flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
              >
                <span>← Volver a Inicio</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/detec/panel')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-dark hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
              >
                <span>Panel Administrador</span>
              </button>
            </div>
            <JobQuoteManager />
          </div>
        </div>
      ) : (
        /* Vista Principal Completa: / */
        <>
          <Navbar
            onOpenAdmin={() => navigateTo('/detec/panel')}
            onNavigateAgenda={() => navigateTo('/agenda')}
            onNavigateTestimonials={() => navigateTo('/testimonios')}
          />

          <main className="flex-grow">
            <HeroSection onNavigateAgenda={() => navigateTo('/agenda')} />
            <ServicesSection onSelectService={handleSelectService} />
            <TechShowcase onNavigateAgenda={() => navigateTo('/agenda')} />
          </main>

          <Footer
            onOpenAdmin={() => navigateTo('/detec/panel')}
            onNavigateAgenda={() => navigateTo('/agenda')}
            onNavigateTestimonials={() => navigateTo('/testimonios')}
          />
        </>
      )}

      {/* Botón Flotante Directo de WhatsApp Mauricio Marín */}
      {!isAdminRoute && (
        <a
          href="https://wa.me/50661141421?text=Hola%20Mauricio%20Mar%C3%ADn%2C%20quisiera%20consultar%20por%20un%20servicio%20de%20destaqueo%20o%20tanque%20s%C3%A9ptico"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Mauricio Marín 6114-1421"
          className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-emerald-500/25 border border-white/20"
          title="Escribir directo a Mauricio Marín por WhatsApp"
        >
          <MessageSquare className="w-5 h-5 fill-white shrink-0" />
          <span className="text-xs font-black hidden sm:inline">WhatsApp 6114-1421</span>
        </a>
      )}
    </div>
  );
}

export default App;
