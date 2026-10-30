import React, { useState } from 'react';
import { Navigation, Phone, MessageSquare, CheckCircle, MapPin, ChevronDown, ChevronUp, Image as ImageIcon, Clock, Edit3, FastForward, DollarSign, Star, Calendar, FileText } from 'lucide-react';
import { Appointment, AppointmentStatus, PaymentMethod, PaymentItem } from '../../types/appointment';
import { SavedQuoteEntry } from '../../types/quote';
import { formatTime12h, formatDateToSpanish } from '../../utils/dateFormatter';
import { ServiceEditorModal } from './ServiceEditorModal';
import { PaymentModal } from './PaymentModal';
import { api } from '../../services/api';

interface TodayRouteCardProps {
  appointment: Appointment;
  index: number;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenLightbox: (photos: string[], index: number) => void;
  onUpdateService?: (id: string, newServiceType: string) => Promise<void>;
  onUpdatePayment?: (id: string, amount: number, method: PaymentMethod, breakdown?: PaymentItem[]) => Promise<void>;
  isHighlighted?: boolean;
  existingQuote?: SavedQuoteEntry | null;
  onCreateQuote?: (appointment: Appointment) => void;
  onViewQuote?: (quoteId: string) => void;
}

export const TodayRouteCard: React.FC<TodayRouteCardProps> = ({
  appointment,
  index,
  onUpdateStatus,
  onOpenLightbox,
  onUpdateService,
  onUpdatePayment,
  isHighlighted = false,
  existingQuote,
  onCreateQuote,
  onViewQuote
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const rawDigits = appointment.client_phone.replace(/\D/g, '');
  const phoneWithCountry = rawDigits.startsWith('506') ? rawDigits : `506${rawDigits}`;
  const rangoHora = `${formatTime12h(appointment.start_time)} - ${formatTime12h(appointment.end_time)}`;

  const hasCoordinates = appointment.latitude !== null && appointment.latitude !== undefined &&
                         appointment.longitude !== null && appointment.longitude !== undefined;

  const wazeUrl = hasCoordinates
    ? `https://waze.com/ul?ll=${appointment.latitude},${appointment.longitude}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(appointment.client_address)}&navigate=yes`;

  const handleConfirmWhatsApp = () => {
    onUpdateStatus(appointment.id, 'confirmed');
    const fecha = formatDateToSpanish(appointment.appointment_date);
    const mensaje = `Hola *${appointment.client_name}*, le saludamos de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛. Hemos revisado los detalles de su solicitud y le confirmamos su cita para el servicio de *${appointment.service_type}* el día *${fecha}* en el horario de *${rangoHora}*. Por favor envíenos la ubicación exacta por este medio para nuestro registro de ruta. ¡Muchas gracias!`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAdvanceAppointmentWhatsApp = () => {
    const fecha = formatDateToSpanish(appointment.appointment_date);
    const mensaje = `Hola *${appointment.client_name}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.\n\nLe consultamos sobre su cita para *${appointment.service_type}*, programada para el día *${fecha}* (${rangoHora}).\n\nAcabamos de terminar un trabajo previo más rápido de lo esperado y ya contamos con disponibilidad inmediata en este momento. ¿Le sería posible atendernos más temprano el día de hoy?\n\nQuedamos atentos a su confirmación. ¡Muchas gracias!`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendOfficialQuoteWhatsApp = () => {
    if (!existingQuote) return;
    const origin = window.location.origin;
    const quoteUrl = existingQuote.shareUrl || `${origin}/cotizacion/${existingQuote.id}`;
    const quoteNumber = existingQuote.quoteData?.quoteNumber || existingQuote.fileName || 'COT-2026';
    const workRef = existingQuote.workReference || existingQuote.quoteData?.workReference || appointment.service_type;
    const amount = Number(existingQuote.totalAmount || existingQuote.quoteData?.laborCost || 0);
    const montoStr = amount > 0 ? `• *Inversión Total:* ₡${amount.toLocaleString('es-CR')}\n` : '';

    const mensaje = `Hola *${appointment.client_name}*, le saluda *Mauricio Marín* de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.\n\nYa realicé su cotización oficial para el servicio de *${workRef}*.\n\n📋 *Resumen de la Cotización:*\n• *N° de Control:* ${quoteNumber}\n• *Trabajo:* ${workRef}\n• *Ubicación:* ${appointment.client_address}\n${montoStr}• *Garantía:* 100% satisfacción y servicio profesional garantizado.\n\n🌐 *Puede consultar y descargar su cotización formal en línea aquí:*\n👉 ${quoteUrl}\n\nQuedamos a su disposición para coordinar o atender cualquier consulta. ¡Muchas gracias por su preferencia!`;

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendReviewLinkWhatsApp = () => {
    const origin = window.location.origin;
    const reviewUrl = `${origin}/calificar?id=${appointment.id}&cliente=${encodeURIComponent(appointment.client_name)}&tel=${encodeURIComponent(appointment.client_phone)}&servicio=${encodeURIComponent(appointment.service_type)}`;
    const mensaje = `Hola *${appointment.client_name}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.\n\nFue un placer haberle realizado el servicio de *${appointment.service_type}*. Le agradeceríamos enormemente si nos regala un minuto para calificar nuestra atención y dejarnos un breve comentario en nuestro enlace oficial de testimonios verificados:\n\n👉 ${reviewUrl}\n\n¡Muchas gracias por su confianza y preferencia!`;

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFinishJob = () => {
    onUpdateStatus(appointment.id, 'completed');
    setIsPaymentOpen(true);
  };

  const isCompleted = appointment.status === 'completed';

  return (
    <div 
      id={`appointment-${appointment.id}`}
      className={`rounded-3xl border p-4 sm:p-5 shadow-card transition-all ${
        isHighlighted
          ? 'border-brand-orange ring-4 ring-brand-orange shadow-xl shadow-brand-orange/30 animate-pulse bg-amber-50/40'
          : isCompleted ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-brand-blue/20 ring-1 ring-brand-blue/10'
      }`}
    >
      
      {/* Turno, Horario, Día de la Semana y Fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-7 h-7 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-black shrink-0">
            #{index + 1}
          </span>
          <div className="flex items-center gap-2 text-xs font-black text-brand-dark bg-brand-ice px-3 py-1.5 rounded-xl border border-brand-iceBorder flex-wrap shadow-2xs">
            <div className="flex items-center gap-1.5 text-brand-orange">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-brand-dark font-extrabold">{rangoHora}</span>
            </div>
            <span className="text-slate-300 font-bold">•</span>
            <div className="flex items-center gap-1.5 text-brand-blue capitalize font-bold">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="text-slate-800">{formatDateToSpanish(appointment.appointment_date)}</span>
            </div>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase self-start sm:self-auto shrink-0 ${
          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {isCompleted ? 'Finalizada' : 'En Ruta'}
        </span>
      </div>

      {/* Info Principal Cliente */}
      <div className="py-3 space-y-1.5">
        <h3 className="text-base font-extrabold text-brand-dark leading-snug">
          {appointment.client_name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-bold text-brand-blue">
            {appointment.service_type}
          </p>
          {onUpdateService && (
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 transition-colors cursor-pointer"
              title="Cambiar o agregar más servicios a esta cita"
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>Editar / +Servicios</span>
            </button>
          )}
        </div>

        {/* Estado y Monto del Cobro */}
        <div className="pt-0.5 space-y-1.5">
          {Number(appointment.amount_collected || 0) > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cobrado: ₡{Number(appointment.amount_collected).toLocaleString('es-CR')}</span>
                {onUpdatePayment && (
                  <button
                    type="button"
                    onClick={() => setIsPaymentOpen(true)}
                    className="ml-1 text-[10px] text-emerald-700 underline font-bold hover:text-emerald-900 cursor-pointer"
                  >
                    Cambiar
                  </button>
                )}
              </div>
              {Array.isArray(appointment.payment_breakdown) && appointment.payment_breakdown.length > 0 && (
                appointment.payment_breakdown.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                    <span>
                      {item.method === 'cash' ? '💵 Efectivo' : item.method === 'sinpe' ? '📱 SINPE' : item.method === 'transfer' ? '🏦 Transf.' : '💳 Tarjeta'}:
                    </span>
                    <span className="font-extrabold text-slate-900">₡{Number(item.amount).toLocaleString('es-CR')}</span>
                  </span>
                ))
              )}
            </div>
          ) : (
            onUpdatePayment && (
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all cursor-pointer"
              >
                <DollarSign className="w-3 h-3 text-amber-600" />
                <span>₡ Registrar Cobro (SINPE / Efectivo / Transf.)</span>
              </button>
            )
          )}
        </div>
        <div className="flex items-start gap-1.5 text-xs text-brand-slate font-medium pt-1">
          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{appointment.client_address}</span>
        </div>
      </div>

      {/* BOTONES RÁPIDOS MÓVILES PARA LA CALLE */}
      <div className="space-y-2 pt-1">
        {/* Botón Gigante Waze */}
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-black text-white bg-[#33CCFF] hover:bg-[#28b2e0] shadow-md active:scale-98 transition-all"
        >
          <Navigation className="w-5 h-5 fill-white" />
          <span>Iniciar Ruta en Waze</span>
        </a>

        {/* Fila de Llamada y WhatsApp */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${rawDigits}`}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl text-xs font-extrabold text-brand-dark bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-98 transition-all"
          >
            <Phone className="w-4 h-4 text-brand-blue" />
            <span>Llamar</span>
          </a>

          <button
            type="button"
            onClick={handleConfirmWhatsApp}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl text-xs font-extrabold text-white bg-[#25D366] hover:bg-[#20ba5a] shadow-sm active:scale-98 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Botón Adelantar Cita por WhatsApp (en caso de terminar rápido el trabajo previo) */}
        {!isCompleted && (
          <button
            type="button"
            onClick={handleAdvanceAppointmentWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-xs active:scale-98 transition-all"
          >
            <FastForward className="w-4 h-4 text-amber-700 fill-amber-700" />
            <span>Adelantar Cita por WhatsApp</span>
          </button>
        )}

        {/* Botón Finalizar / Etiqueta de Finalizado */}
        {!isCompleted ? (
          <button
            type="button"
            onClick={handleFinishJob}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#FF5E0E] via-[#FF6D14] to-[#FF851A] hover:from-[#E65100] hover:to-[#FF6D14] shadow-md shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Marcar Trabajo como Finalizado</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wide">✓ TRABAJO FINALIZADO</span>
            </div>
            {Number(appointment.amount_collected || 0) === 0 && onUpdatePayment && (
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Ingresar Cobro
              </button>
            )}
          </div>
        )}

        {/* El botón Compartir Cotización Oficial solo debe aparecer a las cotizaciones que crea el admin */}
        {existingQuote ? (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleSendOfficialQuoteWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-300 shadow-xs active:scale-98 transition-all cursor-pointer"
              title="Compartir cotización formal creada por el admin para este cliente"
            >
              <FileText className="w-4 h-4 text-brand-blue" />
              <span>Compartir Cotización Oficial por WhatsApp</span>
            </button>
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                ✓ Cotización {existingQuote.quoteData?.quoteNumber || existingQuote.fileName} creada
              </span>
              <button
                type="button"
                onClick={() => onViewQuote ? onViewQuote(existingQuote.id) : onCreateQuote?.(appointment)}
                className="text-brand-blue font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Ver / Editar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Si el admin no ha creado cotización: botón "Crear Cotización" para llevarlo a crearla para este cliente */
          appointment.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => onCreateQuote?.(appointment)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-xs active:scale-98 transition-all cursor-pointer"
              title="Crear una cotización personalizada para este cliente"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Crear Cotización</span>
            </button>
          )
        )}

        {/* Botón Solicitar Reseña / Calificación por WhatsApp (SOLO citas completadas) */}
        {isCompleted && (
          <button
            type="button"
            onClick={handleSendReviewLinkWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Enviar Link de Calificación (1-5★) por WhatsApp</span>
          </button>
        )}
      </div>

      {/* Detalle Desplegable: Descripción y Fotos */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-slate-500 hover:text-brand-dark"
        >
          <span>{expanded ? 'Ocultar detalles y fotos' : 'Ver problema reportado y fotos'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="pt-2 space-y-2 text-xs border-t border-slate-100 mt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-700 mb-1">Problema Reportado:</p>
              <p className="text-slate-600 italic leading-relaxed">"{appointment.problem_description}"</p>
            </div>

            {appointment.photo_keys && appointment.photo_keys.length > 0 && (
              <div>
                <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Fotos de Evidencia:</span>
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {appointment.photo_keys.map((photoUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onOpenLightbox(appointment.photo_keys, i)}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0"
                    >
                      <img src={photoUrl} alt="Fuga" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para Editar o Agregar Múltiples Servicios */}
      {isEditorOpen && (
        <ServiceEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          appointmentId={appointment.id}
          clientName={appointment.client_name}
          currentServiceType={appointment.service_type}
          onSaveService={async (id, srv) => {
            if (onUpdateService) await onUpdateService(id, srv);
          }}
        />
      )}

      {/* Modal para Registrar o Editar Cobro */}
      {isPaymentOpen && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          appointmentId={appointment.id}
          clientName={appointment.client_name}
          serviceType={appointment.service_type}
          currentAmount={appointment.amount_collected}
          currentMethod={appointment.payment_method}
          currentBreakdown={appointment.payment_breakdown}
          onSavePayment={async (id, amt, mtd, breakdown) => {
            if (onUpdatePayment) await onUpdatePayment(id, amt, mtd as PaymentMethod, breakdown);
          }}
        />
      )}
    </div>
  );
};
