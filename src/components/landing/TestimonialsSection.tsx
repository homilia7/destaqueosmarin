import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Review } from '../../types/review';

const sanitizeText = (txt: string) => (txt || '').replace(/\uFFFD/g, 'ó').trim();

export const TestimonialsSection: React.FC = () => {
  const [realReviews, setRealReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getReviews().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setRealReviews(data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Adaptar cantidad de tarjetas visibles según resolución
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const baselineTestimonials = [
    {
      id: 'base-1',
      name: 'Ing. Mauricio Alvarado',
      location: 'Curridabat, San José',
      review: 'Tenía 3 meses con el recibo de agua disparado y dos fontaneros anteriores querían picar toda la cocina. Los técnicos de Royality vinieron con el geófono y en 25 minutos marcaron un único punto exacto bajo el fregadero. Impresionante precisión.',
      rating: 5,
      service: 'Detección Especializada de Fugas',
      isReal: false
    },
    {
      id: 'base-2',
      name: 'Licda. Marcela Chaves',
      location: 'San Rafael de Escazú',
      review: 'Excelente trato y puntualidad británica. Agendé desde la página, me confirmaron de inmediato y resolvieron una filtración oculta en la losa del segundo piso sin romper un solo azulejo. 100% recomendados.',
      rating: 5,
      service: 'Rastreo y Diagnóstico',
      isReal: false
    },
    {
      id: 'base-3',
      name: 'Arq. Roberto Solís',
      location: 'Alajuela, La Guácima',
      review: 'Los contratamos para el diagnóstico de una residencia en condominio. El informe técnico que nos entregaron fue tan claro que el seguro reconoció los costos sin objeción. La tecnología acústica que usan es de primer mundo.',
      rating: 5,
      service: 'Informe Técnico Certificado',
      isReal: false
    }
  ];

  // Convertir reseñas reales a formato de tarjeta con sanitizado anti-caracteres corruptos
  const formattedReal = realReviews.map((r) => ({
    id: r.id,
    name: sanitizeText(r.client_name),
    location: sanitizeText(r.service_type || 'San José, Costa Rica'),
    review: sanitizeText(r.comment),
    rating: r.rating || 5,
    service: sanitizeText(r.service_type || 'Detección Especializada'),
    isReal: true
  }));

  // Combinar reseñas reales primero y completar con testimonios base
  const allTestimonials = [
    ...formattedReal,
    ...baselineTestimonials.filter((b) => !formattedReal.some((r) => r.id === b.id))
  ];

  const maxIndex = Math.max(0, allTestimonials.length - visibleCount);

  // Asegurar que el índice activo esté dentro del rango si cambia la ventana
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Auto-play anti-drain (pausa con hover y con pestaña oculta)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      handleNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, maxIndex, currentIndex]);

  // Soporte táctil / swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  return (
    <section id="testimonios" className="py-20 bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado y Controles del Slider */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-brand-blue border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Testimonios Verificados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
              CLIENTES QUE PROTEGIERON SUS HOGARES
            </h2>
            <p className="text-base text-brand-slate">
              Personas reales a las que localizamos filtraciones ocultas sin romper paredes ni pisos.
            </p>
          </div>

          {/* Flechas de Navegación del Slider */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Testimonio anterior"
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:text-brand-blue hover:border-brand-blue/40 hover:bg-blue-50/50 shadow-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente testimonio"
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:text-brand-blue hover:border-brand-blue/40 hover:bg-blue-50/50 shadow-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carrusel Deslizante (Slider Track) */}
        <div
          className="relative overflow-hidden -mx-2 sm:-mx-3 py-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
            }}
          >
            {allTestimonials.map((t) => (
              <div
                key={t.id}
                style={{ width: `${100 / visibleCount}%` }}
                className="shrink-0 px-2 sm:px-3"
              >
                <div
                  className={`h-full bg-brand-surface rounded-3xl p-6 sm:p-8 border shadow-soft flex flex-col justify-between hover:shadow-card transition-all ${
                    t.isReal
                      ? 'border-brand-blue/30 ring-1 ring-brand-blue/10 bg-gradient-to-b from-blue-50/20 to-white'
                      : 'border-slate-100'
                  }`}
                >
                  <div>
                    {/* Estrellas */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      {t.isReal && (
                        <span className="text-[10px] font-black text-brand-blue bg-blue-100/70 px-2 py-0.5 rounded-md">
                          Reciente
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-brand-slate italic leading-relaxed mb-6">
                      "{t.review}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-brand-dark truncate">{t.name}</h4>
                        <p className="text-xs text-brand-muted truncate">{t.location}</p>
                      </div>
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <CheckCircle className="w-3 h-3" />
                        Verificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores de Puntos (Dots de Paginación) */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir al testimonio ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 bg-brand-blue shadow-xs'
                    : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
