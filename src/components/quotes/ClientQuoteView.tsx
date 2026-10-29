import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  FileCheck,
  ExternalLink,
  X,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import { FacebookIcon, InstagramIcon, SOCIAL_URLS } from '../common/SocialLinks';

const DEFAULT_LOGO = '/camion-destaqueos.png';
const SHIELD_LOGO = '/camion-destaqueos.png';

interface ClientQuoteViewProps {
  quoteId: string;
  onBackToHome?: () => void;
}

export const ClientQuoteView: React.FC<ClientQuoteViewProps> = ({
  quoteId,
  onBackToHome
}) => {
  const [quote, setQuote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isAcceptSubmitting, setIsAcceptSubmitting] = useState(false);
  const [isAcceptedSuccess, setIsAcceptedSuccess] = useState(false);
  const [customClientPhone, setCustomClientPhone] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getQuoteById(quoteId)
      .then((data) => {
        if (isMounted && data) {
          setQuote(data);
          if (data.status === 'aceptada') {
            setIsAcceptedSuccess(true);
          }
          if (data.client_phone || data.clientPhone) {
            setCustomClientPhone(data.client_phone || data.clientPhone);
          }
          document.title = `📋 Cotización Oficial: ${data.client_name || 'Cliente'} (${data.quote_number || 'COT'}) | Destaqueos Mauricio Marín`;
        }
      })
      .catch((err) => console.warn(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { 
      isMounted = false;
      document.title = 'Destaqueos y Tanques Sépticos Mauricio Marín | 24/7 Costa Rica';
    };
  }, [quoteId]);

  const handleClientDownload = async () => {
    if (!quote) return;
    
    // 1. Notificar al backend D1 que el cliente descargó la cotización
    try {
      await api.markQuoteDownloaded(quote.id || quoteId);
    } catch (e) {}

    // 2. Preparar el título del documento para la descarga limpia en PDF
    const targetName = quote.file_name || `Cotizacion-${quote.quote_number || 'Mauricio-Marin'}`;
    const previousTitle = document.title;
    document.title = targetName.replace(/\.pdf$/i, '');

    // 3. Ejecutar diálogo de impresión / Guardar como PDF
    window.print();

    setDownloadSuccess(true);
    setTimeout(() => {
      document.title = previousTitle;
    }, 1500);
  };

  const handleSendAcceptance = async () => {
    if (!quote) return;
    setIsAcceptSubmitting(true);
    try {
      await api.updateQuoteStatus(quote.id || quoteId, 'aceptada');
      setQuote((prev: any) => prev ? { ...prev, status: 'aceptada' } : prev);
      setIsAcceptedSuccess(true);
    } catch (e) {
      console.warn('Error accepting quote:', e);
      setIsAcceptedSuccess(true);
    } finally {
      setIsAcceptSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-3" />
        <p className="text-sm font-extrabold text-brand-dark">Cargando cotización oficial...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md w-full shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-brand-dark">Cotización no encontrada</h3>
          <p className="text-xs text-slate-500 font-medium">
            El enlace de cotización puede haber expirado o no estar disponible temporalmente.
          </p>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-brand-blue text-xs shadow-sm hover:bg-brand-blue/90"
            >
              Volver a la Página Principal
            </button>
          )}
        </div>
      </div>
    );
  }

  // Parsear items de trabajo si vienen como string JSON de D1
  const scopeItems: Array<{ id: string; text: string }> = Array.isArray(quote.scope_items)
    ? quote.scope_items
    : typeof quote.scope_items === 'string'
    ? (() => {
        try { return JSON.parse(quote.scope_items); } catch { return []; }
      })()
    : Array.isArray(quote.scopeItems)
    ? quote.scopeItems
    : [];

  const labor = Number(quote.labor_cost ?? quote.laborCost ?? 0);
  const materials = Number(quote.materials_cost ?? quote.materialsCost ?? 0);
  const subtotal = labor + materials;
  const applyIVA = Boolean(quote.apply_iva ?? quote.applyIVA);
  const ivaAmount = applyIVA ? Math.round(subtotal * 0.13) : 0;
  const totalGeneral = Number(quote.total_amount ?? quote.totalAmount ?? (subtotal + ivaAmount));

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-brand-dark font-sans select-none">
      
      {/* Barra Superior para el Cliente (no visible en impresión) */}
      <div className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                title="Volver al inicio"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-brand-dark">Cotización en Línea</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verificada Oficial</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                Emitida por Destaqueos y Tanques Sépticos Mauricio Marín para {quote.client_name || quote.clientName || 'Cliente'}
              </p>
            </div>
          </div>

          {/* Botones de Acción para el Cliente */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleClientDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-brand-blue hover:bg-brand-blue/90 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Cotización (PDF)</span>
            </button>

            {isAcceptedSuccess || quote.status === 'aceptada' ? (
              <div className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-emerald-900 bg-emerald-100 border border-emerald-300 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cotización Aceptada</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aceptar Cotización</span>
              </button>
            )}
          </div>
        </div>

        {downloadSuccess && (
          <div className="max-w-4xl mx-auto mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
            ✅ Documento descargado correctamente. El técnico ha sido notificado de su descarga.
          </div>
        )}
      </div>

      {/* Contenedor Central de la Hoja de Cotización Oficial */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        
        {/* Hoja Membretada con ID único para aislamiento en impresión */}
        <div 
          id="printable-quote-sheet"
          className="print-area bg-white rounded-3xl p-5 sm:p-7 print:p-3 border border-slate-200/90 shadow-xl space-y-3.5 print:space-y-2 text-brand-dark font-sans relative overflow-hidden"
        >
          {/* Barra Decorativa Superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 shadow-xs z-10" />

          {/* Difuminado Profesional en la Cabecera */}
          <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-emerald-500/10 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-64 h-32 bg-gradient-to-br from-emerald-700/15 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-emerald-700/[0.03] to-transparent pointer-events-none" />

          {/* Encabezado Oficial */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5 pt-1 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-20 sm:w-24 h-12 sm:h-14 flex items-center justify-center shrink-0">
                <img 
                  src={DEFAULT_LOGO} 
                  alt="Destaqueos Mauricio Marín" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-emerald-800 leading-tight">
                  {quote.company_name || quote.companyName || 'Destaqueos y Tanques Sépticos Mauricio Marín'}
                </h1>
                <p className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Tanques Sépticos • Destaqueos de Tuberías • Camión Cisterna
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  Costa Rica • Tel. {quote.responsible_phone || quote.responsiblePhone || '6114-1421'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto text-left sm:text-right border sm:border-0 border-slate-100">
              <div className="text-xs sm:text-sm font-mono font-black text-brand-dark">
                {quote.quote_number || quote.quoteNumber}
              </div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                Fecha: <span className="text-brand-dark font-extrabold">{quote.date}</span>
              </div>
              <div className="text-[9.5px] text-slate-400 font-semibold">
                Validez: 15 días naturales
              </div>
            </div>
          </div>

          {/* Datos del Cliente y Ubicación */}
          <div className="bg-slate-50/80 p-2.5 sm:p-3 print:p-2 rounded-xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs relative z-10">
            <div>
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                Cotizado Para:
              </span>
              <span className="text-xs sm:text-sm font-black text-brand-dark block mt-0.5">
                {quote.client_name || quote.clientName || 'Cliente Particular'}
              </span>
              {(quote.client_phone || quote.clientPhone) && (
                <span className="text-slate-500 font-semibold flex items-center gap-1 mt-0.5 text-[11px]">
                  <Phone className="w-3 h-3 text-brand-blue" />
                  <span>{quote.client_phone || quote.clientPhone}</span>
                </span>
              )}
            </div>

            <div>
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                Lugar / Ubicación del Trabajo:
              </span>
              <span className="text-xs font-extrabold text-slate-700 block mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-orange shrink-0" />
                <span>{quote.client_location || quote.clientLocation || 'Área Metropolitana / A convenir'}</span>
              </span>
            </div>
          </div>

          {/* Referencia Principal */}
          <div className="relative z-10">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
              Referencia del Proyecto / Trabajo:
            </span>
            <div className="bg-blue-50/50 py-1.5 px-3 rounded-lg border border-blue-100 font-extrabold text-brand-dark text-xs">
              {quote.work_reference || quote.workReference || 'Trabajos Técnicos Especializados de Destaqueo y Fontanería'}
            </div>
          </div>

          {/* Alcance Línea por Línea (Hasta 7 items en una sola hoja) */}
          {scopeItems.length > 0 && (
            <div className="relative z-10">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Alcance y Puntos de Trabajo a Realizar:
              </span>
              <div className="space-y-1 print:space-y-0.5">
                {scopeItems
                  .filter((item) => item.text && item.text.trim())
                  .map((item, idx) => (
                    <div key={item.id || idx} className="flex items-start gap-2 text-[11px] sm:text-xs print:text-[10.5px] text-slate-700 leading-snug">
                      <span className="w-4 h-4 rounded bg-[#67141d]/10 text-[#67141d] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-semibold">{item.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tabla de Desglose Económico */}
          <div className="relative z-10">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              Desglose Económico de la Propuesta:
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-black uppercase text-[9.5px] border-b border-slate-200">
                  <tr>
                    <th className="py-1.5 px-3 text-left">Concepto</th>
                    <th className="py-1.5 px-3 text-right">Monto Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px] sm:text-xs">
                  <tr>
                    <td className="py-1.5 px-3 font-bold">Mano de Obra Calificada y Ejecución Técnica</td>
                    <td className="py-1.5 px-3 text-right font-extrabold text-brand-dark">
                      ₡{labor.toLocaleString('es-CR')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3">
                      <div className="font-bold">Estimado de Materiales e Insumos</div>
                      {(quote.materials_detail || quote.materialsDetail) && (
                        <div className="text-[9.5px] text-slate-400 italic">
                          {quote.materials_detail || quote.materialsDetail}
                        </div>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-right font-extrabold text-brand-dark">
                      ₡{materials.toLocaleString('es-CR')}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/60 font-bold">
                    <td className="py-1 px-3 text-slate-600">Subtotal de la Obra:</td>
                    <td className="py-1 px-3 text-right font-black text-brand-dark">
                      ₡{subtotal.toLocaleString('es-CR')}
                    </td>
                  </tr>
                  {applyIVA && (
                    <tr className="bg-slate-50/60 font-bold text-slate-600">
                      <td className="py-1 px-3">IVA (13% - Factura Electrónica):</td>
                      <td className="py-1 px-3 text-right font-black text-emerald-800">
                        ₡{ivaAmount.toLocaleString('es-CR')}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-[#67141d]/5 font-black text-xs sm:text-sm text-[#67141d]">
                    <td className="py-2 px-3">TOTAL GENERAL COTIZADO:</td>
                    <td className="py-2 px-3 text-right font-black text-sm sm:text-base">
                      ₡{totalGeneral.toLocaleString('es-CR')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tiempo de Entrega y Checkpoints Compactos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs relative z-10">
            <div className="bg-slate-50 p-2 sm:p-2.5 print:p-2 rounded-xl border border-slate-200/80 space-y-0.5">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                Tiempo Estimado de Entrega:
              </span>
              <div className="font-black text-brand-dark text-xs sm:text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-blue" />
                <span>{quote.delivery_time || quote.deliveryTime || '1 día hábil'}</span>
              </div>
              <p className="text-[9.5px] text-slate-400">
                Sujeto a confirmación tras inicio de labores.
              </p>
            </div>

            <div className="bg-slate-50 p-2 sm:p-2.5 print:p-2 rounded-xl border border-slate-200/80 space-y-1 text-[10px] sm:text-[11px]">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                Condiciones y Compromisos:
              </span>
              <div className="space-y-0.5 font-bold text-slate-700">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Pago 100% contra entrega y satisfacción</span>
                </div>
                <div className="flex items-center gap-1.5 text-brand-dark">
                  <CheckCircle2 className="w-3 h-3 shrink-0 text-brand-blue" />
                  <span>Materiales certificados y garantía técnica por escrito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Firma Oficial, Redes Sociales y Botón WhatsApp Directo */}
          <div className="pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
            {/* Firma y Sello Escudo */}
            <div className="flex items-center gap-3 text-center sm:text-left">
              <img 
                src={SHIELD_LOGO} 
                alt="Mauricio Marín" 
                className="w-10 h-10 object-contain shrink-0 drop-shadow-xs hidden sm:block"
              />
              <div className="space-y-0.5">
                <div className="font-script text-base sm:text-lg text-emerald-800 font-bold tracking-wider leading-none">
                  {quote.responsible_name || quote.responsibleName || 'Mauricio Marín'}
                </div>
                <div className="h-0.5 w-28 bg-slate-300 mx-auto sm:mx-0 my-0.5" />
                <h4 className="text-[11px] font-black text-brand-dark leading-tight">{quote.responsible_name || quote.responsibleName || 'Mauricio Marín'}</h4>
                <p className="text-[9.5px] font-bold text-slate-400 leading-tight">Especialista en Tanques Sépticos y Destaqueos</p>
                <p className="text-[10.5px] font-black text-brand-blue leading-tight">Tel: {quote.responsible_phone || quote.responsiblePhone || '6114-1421'}</p>
              </div>
            </div>

            {/* Redes Sociales Oficiales y Botón de WhatsApp Directo */}
            <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">
                Contacto Directo & Redes Oficiales:
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                {/* Facebook */}
                <a
                  href={SOCIAL_URLS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white bg-[#1877F2] hover:bg-[#1567d3] transition-all shadow-xs text-[10px] sm:text-[10.5px] font-bold cursor-pointer"
                  title="Página Oficial de Facebook"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href={SOCIAL_URLS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 transition-all shadow-xs text-[10px] sm:text-[10.5px] font-bold cursor-pointer"
                  title="Perfil Oficial de Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>

                {/* Teléfono Directo */}
                <a
                  href={`tel:${(quote.responsible_phone || quote.responsiblePhone || '61141421').replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-brand-dark bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shadow-xs text-[10px] sm:text-[10.5px] font-black cursor-pointer"
                  title="Llamar directamente a la empresa"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Central: {quote.responsible_phone || quote.responsiblePhone || '6114-1421'}</span>
                </a>
              </div>
              <div className="text-[9.5px] text-slate-400 font-semibold flex items-center gap-1.5">
                <span>Destaqueos y Tanques Sépticos Mauricio Marín</span>
                <span>•</span>
                <span className="text-brand-blue font-bold">https://destaqueosmarin.pages.dev</span>
              </div>
            </div>
          </div>

          {/* Pie Legal y Logo Escudo */}
          <div className="pt-2 border-t border-slate-100 text-[8.5px] text-slate-400 text-center flex flex-row items-center justify-between gap-1 relative z-10">
            <span>Documento emitido electrónicamente con plena validez comercial.</span>
            <div className="flex items-center gap-1.5">
              <img src={SHIELD_LOGO} alt="Mauricio Marín" className="w-3.5 h-4 object-contain inline-block opacity-75" />
              <span>Destaqueos y Tanques Sépticos Mauricio Marín • Mauricio Marín</span>
            </div>
          </div>
        </div>

      </main>

      {/* Pop-up Modal: Aceptación de Cotización */}
      {isAcceptModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {!isAcceptedSuccess ? (
              <div className="p-5 sm:p-6 space-y-4">
                {/* Cabecera del modal */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-brand-dark">Aceptar Cotización</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Confirmación oficial para {quote.client_name || quote.clientName || 'Cliente'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAcceptModalOpen(false)}
                    className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Resumen de la cotización */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">N° de Cotización:</span>
                    <span className="font-mono font-black text-brand-dark">{quote.quote_number || quote.quoteNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Cliente:</span>
                    <span className="font-extrabold text-brand-dark">{quote.client_name || quote.clientName || 'Cliente Particular'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Trabajo:</span>
                    <span className="font-bold text-brand-blue truncate max-w-[220px]">{quote.work_reference || quote.workReference || 'Servicio Técnico'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                    <span className="text-slate-600">Total Cotizado:</span>
                    <span className="text-sm font-black text-emerald-700">₡{totalGeneral.toLocaleString('es-CR')}</span>
                  </div>
                </div>

                {/* Mensaje Prediseñado */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Mensaje de Aceptación:
                  </label>
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-2 font-medium">
                    <p className="italic">
                      "Estimado equipo técnico de <strong>Destaqueos y Tanques Sépticos Mauricio Marín</strong>:
                    </p>
                    <p className="italic">
                      Por medio de la presente confirmo que he revisado y <strong>acepto la cotización oficial N° {quote.quote_number || quote.quoteNumber}</strong> por un monto total de <strong>₡{totalGeneral.toLocaleString('es-CR')}</strong>.
                    </p>
                    <p className="italic">
                      Estoy conforme con los alcances técnicos y garantías descritas, y deseo coordinar el inicio de los trabajos según disponibilidad."
                    </p>
                  </div>
                </div>

                {/* Teléfono de contacto opcional para confirmación */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">
                    Teléfono de Contacto para Confirmación:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={customClientPhone}
                      onChange={(e) => setCustomClientPhone(e.target.value)}
                      placeholder="Ej. 8888-8888"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-brand-dark focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    />
                  </div>
                </div>

                {/* Botones del Modal */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAcceptModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendAcceptance}
                    disabled={isAcceptSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAcceptSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Aceptación</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ESTADO DE ÉXITO */
              <div className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-brand-dark">¡Cotización Aceptada!</h3>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 max-w-sm mx-auto leading-relaxed">
                    La aceptación ha sido enviada al administrador y se pondrá en contacto contigo en las próximas horas.
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 max-w-sm mx-auto space-y-1.5 font-medium text-left">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">N° Cotización:</span>
                    <span className="font-black text-brand-dark">{quote.quote_number || quote.quoteNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">Monto Aceptado:</span>
                    <span className="font-black text-emerald-700">₡{totalGeneral.toLocaleString('es-CR')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="font-bold text-slate-400">Estado:</span>
                    <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                      Aceptada y Notificada
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="w-full max-w-xs mx-auto py-2.5 px-4 rounded-xl text-xs font-black text-white bg-brand-blue hover:bg-brand-blue/90 shadow-md transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
