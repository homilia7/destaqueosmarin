import React from 'react';
import { AVAILABLE_SERVICES } from '../../types/service';
import type { ServiceType } from '../../types/service';
import { Wrench, Truck, UtensilsCrossed, Shovel, CheckCircle } from 'lucide-react';

interface ServiceCardsProps {
  selectedService: ServiceType;
  onSelectService: (service: ServiceType) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  destaqueo: <Wrench className="w-6 h-6 text-emerald-600" />,
  tanque_septico: <Truck className="w-6 h-6 text-emerald-600" />,
  trampa_grasa: <UtensilsCrossed className="w-6 h-6 text-emerald-600" />,
  drenajes: <Shovel className="w-6 h-6 text-emerald-600" />,
};

export const ServiceCards: React.FC<ServiceCardsProps> = ({ selectedService, onSelectService }) => {
  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Nuestros Servicios Especializados
        </h3>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Seleccione el servicio que necesita para coordinar el camión cisterna o el equipo de destaqueo:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {AVAILABLE_SERVICES.map((srv) => {
          const isSelected = selectedService === srv.id;
          return (
            <div
              key={srv.id}
              onClick={() => onSelectService(srv.id)}
              className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10 scale-102 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {ICONS_MAP[srv.id]}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {srv.badge}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1">{srv.title}</h4>
                <p className="text-xs font-semibold text-emerald-700 mb-2">{srv.tagline}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">{srv.basePriceEstimate}</span>
                <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Seleccionado
                    </>
                  ) : (
                    'Elegir servicio'
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
