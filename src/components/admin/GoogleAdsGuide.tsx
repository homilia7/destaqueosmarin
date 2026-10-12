import React from 'react';
import { AlertTriangle, DollarSign, Copy, Target } from 'lucide-react';

export const GoogleAdsGuide: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copiado al portapapeles:\n${text}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-slate-900 m-0">
          Estrategia Google Ads & Posicionamiento Local
        </h3>
        <p className="text-xs text-slate-500">
          Guía técnica y configuración lista para salir de primero en Google cuando haya una urgencia.
        </p>
      </div>

      {/* Tarjeta de Costo por Clic (CPC) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Métricas Reales de CPC en Costa Rica
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <span className="text-[11px] text-blue-200">Costo por Clic Promedio</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">$1.50 – $3.20 USD</p>
            <span className="text-[10px] text-blue-300">Aprox. ₡780 – ₡1.680 CRC</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <span className="text-[11px] text-blue-200">Presupuesto Sugerido</span>
            <p className="text-xl font-black text-white mt-0.5">$5 a $10 USD / día</p>
            <span className="text-[10px] text-blue-300">₡2.600 – ₡5.200 CRC diarios</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <span className="text-[11px] text-blue-200">Retorno de Inversión (ROI)</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">Alto (Ticket ₡75k+)</p>
            <span className="text-[10px] text-blue-300">1 servicio paga toda la pauta del mes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Palabras Clave Ganadoras */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Target className="w-4 h-4 text-emerald-600" /> Palabras Clave de Alta Intención (SEM)
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Para Campaña de Búsqueda
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Términos exactos donde la persona está sufriendo la emergencia y necesita contratar ya:
          </p>
          <div className="space-y-1.5 font-mono text-[11px] text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p>"destaqueo de tuberias costa rica"</p>
            <p>"limpieza de tanques septicos san jose"</p>
            <p>"destapar cañeria urgente"</p>
            <p>"camion cisterna tanque septico"</p>
            <p>"limpieza trampa de grasa restaurantes"</p>
            <p>"fontanero de emergencia 24 horas"</p>
          </div>
        </div>

        {/* Palabras Clave Negativas Obligatorias */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Palabras Negativas (Excluir)
            </h4>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
              ¡Protege el Presupuesto!
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Sin estas palabras, Google gastará dinero en curiosos que buscan hacerlo ellos mismos:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['gratis', 'como hacer', 'casero', 'bicarbonato', 'vinagre', 'empleo', 'trabajo', 'curso', 'herramientas', 'comprar maquina', 'manual', 'youtube'].map((neg) => (
              <span key={neg} className="px-2 py-1 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200">
                -{neg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Copys de Anuncios listos para pegar en Google Ads */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">
          Anuncios Recomendados (Listos para Google Ads)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Anuncio 1: Destaqueos de Urgencia</span>
              <button
                onClick={() => copyToClipboard('Destaqueo de Tuberías Urgente | Llegamos en 45 Min | 6114-1421')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Copiar titular"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-bold text-blue-700 text-sm">
              Destaqueo de Tuberías Urgente | Llegamos en 45 Min | 6114-1421
            </p>
            <p className="text-slate-600 text-xs">
              Solucionamos su problema sin romper pisos. Equipo industrial y sondas eléctricas. Atención inmediata en el GAM. Pagos por SINPE.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase text-blue-700">Anuncio 2: Tanques Sépticos Cisterna</span>
              <button
                onClick={() => copyToClipboard('Limpieza Tanques Sépticos | Camión Cisterna Propio | 24 Horas')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Copiar titular"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-bold text-blue-700 text-sm">
              Limpieza Tanques Sépticos | Camión Cisterna Propio | 24 Horas
            </p>
            <p className="text-slate-600 text-xs">
              Succión y evacuación de lodos con camión de alto vacío. Residencial, comercial y restaurantes. Cotice directo al 6114-1421.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
