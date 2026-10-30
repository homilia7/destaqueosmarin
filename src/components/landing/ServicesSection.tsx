import React, { useState, useEffect } from 'react';
import { Search, Radar, Droplets, ArrowRight, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { api } from '../../services/api';
import { ServiceItem } from '../../types/appointment';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

interface DisplayService {
  id: string;
  title: string;
  badge: string;
  icon: any;
  color: string;
  price: number;
  description: string;
  features: string[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const baseServices: DisplayService[] = [
    {
      id: 'srv_1',
      title: 'Limpieza de Tanques Sépticos',
      badge: 'Camión Cisterna Propio',
      icon: Droplets,
      color: 'from-emerald-700 to-teal-600',
      price: 85000,
      description: 'Vaciado y succión profunda de aguas negras y lodos con camión cisterna de alto vacío. Certificado de descarga ambiental autorizada.',
      features: ['Succión de alto vacío', 'Mangueras de largo alcance', 'Lavado y desinfección']
    },
    {
      id: 'srv_2',
      title: 'Destaqueo de Tuberías y Drenajes',
      badge: 'Cero Roturas',
      icon: Search,
      color: 'from-emerald-600 to-green-500',
      price: 45000,
      description: 'Destape rápido y definitivo de inodoros, fregaderos, lavamanos y desagües principales con sondas rotativas eléctricas Ridge K-60 sin picar pisos.',
      features: ['Sondas rotativas de acero', 'Cero roturas ni escombros', 'Flujo 100% restablecido']
    },
    {
      id: 'srv_3',
      title: 'Limpieza de Trampas de Grasa',
      badge: 'Comercial & Sodas',
      icon: Radar,
      color: 'from-teal-600 to-emerald-500',
      price: 50000,
      description: 'Desazolve y desengrase profundo para restaurantes, sodas, hoteles y plantas procesadoras de alimentos. Cumplimiento de normas sanitarias.',
      features: ['Retiro y disposición de grasa', 'Desodorización profunda', 'Programación preventiva']
    }
  ];

  const [services, setServices] = useState<DisplayService[]>(baseServices);

  // Cargar catálogo actualizado desde la base de datos o almacenamiento local
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const catalog = await api.getServices();
        if (Array.isArray(catalog) && catalog.length > 0) {
          setServices((prev) =>
            prev.map((base) => {
              const remote = catalog.find(
                (c) => c.id === base.id || c.title.toLowerCase().trim() === base.title.toLowerCase().trim()
              );
              if (remote) {
                return {
                  ...base,
                  title: remote.title || base.title,
                  badge: remote.badge || base.badge,
                  price: remote.price !== undefined ? Number(remote.price) : base.price,
                  description: remote.description || base.description
                };
              }
              return base;
            })
          );
        }
      } catch (e) {
        console.warn('Error loading dynamic service prices:', e);
      }
    };

    fetchServices();

    // Escuchar actualizaciones en tiempo real cuando el administrador edite precios
    const handleUpdate = (e: any) => {
      if (e.detail) {
        const catalog: ServiceItem[] = e.detail;
        setServices((prev) =>
          prev.map((base) => {
            const remote = catalog.find(
              (c) => c.id === base.id || c.title.toLowerCase().trim() === base.title.toLowerCase().trim()
            );
            if (remote && remote.price !== undefined) {
              return { ...base, price: Number(remote.price) };
            }
            return base;
          })
        );
      }
    };

    window.addEventListener('destaqueos_services_updated', handleUpdate);
    return () => window.removeEventListener('destaqueos_services_updated', handleUpdate);
  }, []);

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs sm:text-sm font-bold text-brand-blue tracking-widest uppercase">
            Servicios Certificados
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
            SOLUCIONES ESPECIALIZADAS PARA SU HOGAR, COMERCIO O EMPRESA
          </h2>
          <p className="text-base text-brand-slate">
            Vaciado de tanques sépticos con camión cisterna propio, destaqueo con sondas rotativas eléctricas y desazolve de trampas de grasa en todo Costa Rica.
          </p>
        </div>

        {/* Grilla de 3 Tarjetas Flotantes con Precios a la Par */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="group relative bg-white rounded-3xl p-8 border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top: Icono, Badge y Precio a la Par */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${srv.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-brand-ice text-brand-blue border border-brand-iceBorder">
                        {srv.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>₡{Number(srv.price || 45000).toLocaleString('es-CR')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Título con Precio Destacado a la Par */}
                  <div className="flex items-start justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
                    <h3 className="text-lg font-extrabold text-brand-dark group-hover:text-brand-blue transition-colors flex-1 leading-snug">
                      {srv.title}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Tarifa Base
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        ₡{Number(srv.price || 45000).toLocaleString('es-CR')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-brand-slate leading-relaxed mb-6">
                    {srv.description}
                  </p>

                  {/* Lista de características */}
                  <div className="space-y-2 mb-8">
                    {srv.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-brand-slate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón Pastilla Azul Claro */}
                <a
                  href="/agenda"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectService(srv.title);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-brand-blue bg-brand-ice hover:bg-brand-blue hover:text-white border border-brand-iceBorder transition-all cursor-pointer shadow-xs"
                >
                  <span>Reservar Este Servicio</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Banner de Evidencia Real: Ubicación Exacta y Cero Daños (Color Clarito y sin la foto eliminada) */}
        <div className="mt-14 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 rounded-3xl p-6 sm:p-10 text-slate-800 shadow-soft border-2 border-emerald-200/90">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Garantía de Cero Daño Innecesario a Pisos</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              UBICAMOS EL PUNTO EXACTO DE LA FUGA Y OBSTRUCCIÓN
            </h3>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
              Detectamos el origen del problema y la obstrucción con precisión técnica antes de intervenir. Evitamos romper pisos de porcelanato, losas o jardines enteros, trabajando únicamente donde se requiere la solución.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sin rupturas a ciegas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ahorro sustancial en acabados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Camión cisterna y sondas Ridge</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <a
                href="/agenda"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectService('Destaqueo de Tuberías y Drenajes');
                }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-[#FF5E0E] via-[#FF6D14] to-[#FF851A] hover:from-[#E65100] hover:to-[#FF6D14] shadow-lg shadow-orange-500/30 hover:shadow-orange-500/45 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <span>Agendar Inspección y Destaqueo</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
