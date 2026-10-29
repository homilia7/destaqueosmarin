import React from 'react';
import { Check, ShieldAlert, Award, Clock, DollarSign, ArrowUpRight } from 'lucide-react';
import { WaveDivider } from '../common/WaveDivider';

interface TechShowcaseProps {
  onNavigateAgenda: () => void;
}

export const TechShowcase: React.FC<TechShowcaseProps> = ({ onNavigateAgenda }) => {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Cero Daño ni Rotura de Pisos',
      desc: 'Evite romper pisos de porcelanato, paredes o aceras. Nuestras sondas rotativas Ridge K-60 penetran la obstrucción sin dañar tuberías.'
    },
    {
      icon: Award,
      title: 'Camión Cisterna de Alto Vacío',
      desc: 'Equipo industrial propio para succión y evacuación de aguas negras, lodos sépticos y grasas comerciales con descarga autorizada.'
    },
    {
      icon: Clock,
      title: 'Puntualidad y Cobertura 24/7 en el GAM',
      desc: 'Atendemos emergencias de día y noche con navegación GPS en vivo para llegar directo a su casa, local o empresa.'
    }
  ];

  return (
    <div className="relative bg-[#ecfdf5] overflow-hidden">
      <WaveDivider fillColor="#ecfdf5" className="-mt-1" />

      <section id="tecnologia" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Columna Izquierda: Razones de Elección */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-emerald-700 border border-emerald-200">
                Equipo y Camión Cisterna Especializado
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight leading-tight">
                ¿POR QUÉ ELEGIR A <span className="bg-gradient-to-r from-emerald-800 via-teal-500 to-emerald-700 bg-[length:200%_auto] animate-shimmer-fast bg-clip-text text-transparent drop-shadow-sm">MAURICIO MARÍN</span> PARA SUS EMERGENCIAS?
              </h2>

              <p className="text-base text-brand-slate leading-relaxed">
                Más de una década brindando servicio profesional de fontanería pesada, desazolve de tanques sépticos y destaqueos rápidos con garantía total de trabajo limpio.
              </p>

              <div className="space-y-4 pt-2">
                {benefits.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-brand-dark">{b.title}</h4>
                        <p className="text-xs sm:text-sm text-brand-slate mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4">
                <a
                  href="/agenda"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateAgenda();
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-slate-900 hover:bg-slate-800 shadow-card transition-all cursor-pointer"
                >
                  <span>Reservar Camión / Cita</span>
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                </a>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Técnica Asimétrica */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-white p-3 shadow-card border border-white">
                <img
                  src="/camion-destaqueos.png"
                  alt="Camión cisterna de alto vacío Destaqueos Mauricio Marín"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />
                <div className="p-4 bg-slate-900 text-white rounded-xl mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Unidad de Alto Vacío</span>
                    <span className="text-sm font-bold">Camión Cisterna Homologado</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <WaveDivider fillColor="#FFFFFF" isFlipped={true} className="-mb-1" />
    </div>
  );
};
