import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Calendar, Clock, Image as ImageIcon, Navigation, ExternalLink, Edit3, FastForward, Star, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { Appointment, AppointmentStatus, PaymentMethod, PaymentItem } from '../../types/appointment';
import { SavedQuoteEntry } from '../../types/quote';
import { formatDateToSpanish, formatTime12h } from '../../utils/dateFormatter';
import { ServiceEditorModal } from './ServiceEditorModal';
import { PaymentModal } from './PaymentModal';
import { api } from '../../services/api';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenLightbox: (photos: string[], index: number) => void;
  onUpdateService?: (id: string, newServiceType: string) => Promise<void>;
  onUpdatePayment?: (id: string, amount: number, method: PaymentMethod, breakdown?: PaymentItem[]) => Promise<void>;
  isHighlighted?: boolean;
  existingQuote?: SavedQuoteEntry | null;
  onCreateQuote?: (appointment: Appointment) => void;
  onViewQuote?: (quoteId: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdateStatus,
  onOpenLightbox,
  onUpdateService,
  onUpdatePayment,
  isHighlighted = false,
  existingQuote,
  onCreateQuote,
  onViewQuote
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const rawDigits = appointment.client_phone.replace(/\D/g, '');
  const phoneWithCountry = rawDigits.startsWith('506') ? rawDigits : `506${rawDigits}`;
  const rango_hora = `${formatTime12h(appointment.start_time)} - ${formatTime12h(appointment.end_time)}`;

  const hasCoordinates = appointment.latitude !== null && appointment.latitude !== undefined &&
                         appointment.longitude !== null && appointment.longitude !== undefined;

  const wazeUrl = hasCoordinates
    ? `https://waze.com/ul?ll=${appointment.latitude},${appointment.longitude}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(appointment.client_address)}&navigate=yes`;

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${appointment.latitude},${appointment.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.client_address)}`;

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    cancelled: { label: 'Cancelada', color: 'bg-slate-100 text-slate-500 border-slate-300' }
  };

  const handleQuickConfirmWhatsApp = () => {
    onUpdateStatus(appointment.id, 'confirmed');

    const fecha = formatDateToSpanish(appointment.appointment_date);
    const mensaje = `Hola *${appointment.client_name}*, le saludamos de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛. Hemos revisado los detalles de su solicitud y le confirmamos su cita para el servicio de *${appointment.service_type}* el día *${fecha}* en el horario de *${rango_hora}*. Por favor envíenos la ubicación exacta por este medio para nuestro registro de ruta. ¡Muchas gracias!`;

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAdvanceAppointmentWhatsApp = () => {
    const fecha = formatDateToSpanish(appointment.appointment_date);
    const mensaje = `Hola *${appointment.client_name}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.\n\nLe consultamos sobre su cita para *${appointment.service_type}*, programada para el día *${fecha}* (${rango_hora}).\n\nAcabamos de terminar un trabajo previo más rápido de lo esperado y ya contamos con disponibilidad inmediata en este momento. ¿Le sería posible atendernos más temprano el día de hoy?\n\nQuedamos atentos a su confirmación. ¡Muchas gracias!`;

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

  return (
    <div 
      id={`appointment-${appointment.id}`}
      className={`bg-white rounded-2xl p-5 border shadow-soft hover:shadow-card transition-all space-y-4 ${
        isHighlighted 
          ? 'border-brand-orange ring-4 ring-brand-orange shadow-xl shadow-brand-orange/30 animate-pulse bg-amber-50/20' 
          : 'border-slate-200/80'
      }`}
    >
      {/* Top: Cliente, Servicio y Estado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold text-brand-blue uppercase tracking-wider block">
              {appointment.service_type}
            </span>
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
          <h4 className="text-lg font-extrabold text-brand-dark">{appointment.client_name}</h4>
          {/* Monto de Cobro y Método */}
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
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
            <span>🔒 Ocupada</span>
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border whitespace-nowrap shadow-2xs ${statusConfig[appointment.status].color}`}>
            {statusConfig[appointment.status].label}
          </span>
        </div>
      </div>

      {/* Info de Fecha, Horario, Dirección y Enlaces de Navegación Waze */}
      <div className="space-y-2.5 text-xs text-brand-slate font-medium">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
            <span className="capitalize font-bold text-brand-dark">{formatDateToSpanish(appointment.appointment_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-orange shrink-0" />
            <span className="font-extrabold text-brand-dark">{rango_hora}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-brand-dark">{appointment.client_address}</p>
            {hasCoordinates && (
              <p className="text-[10px] text-brand-blue font-mono mt-0.5">
                📍 Coordenadas: {appointment.latitude?.toFixed(4)}, {appointment.longitude?.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Botones de Navegación Directa: Waze y Google Maps */}
        <div className="flex items-center gap-2">
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-white bg-[#33CCFF] hover:bg-[#28b2e0] shadow-sm transition-all"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Cómo llegar en Waze</span>
          </a>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-dark bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {/* Descripción del Problema */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
        <p className="font-bold text-slate-700 mb-1">Descripción del Cliente:</p>
        <p className="text-brand-slate italic leading-relaxed">"{appointment.problem_description}"</p>
      </div>

      {/* Nota si las fotos ya fueron purgadas automáticamente a las 24h */}
      {appointment.photos_deleted === 1 && (!appointment.photo_keys || appointment.photo_keys.length === 0) && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Fotos depuradas automáticamente de R2 tras 24h (registro guardado para control)</span>
        </div>
      )}

      {/* Galería de Fotos */}
      {appointment.photo_keys && appointment.photo_keys.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-brand-dark mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-brand-blue" />
            <span>Evidencia Fotográfica ({appointment.photo_keys.length} fotos):</span>
          </p>
          <div className="flex gap-2">
            {appointment.photo_keys.map((photoUrl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenLightbox(appointment.photo_keys, i)}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 hover:scale-105 transition-all group"
              >
                <img src={photoUrl} alt="Fuga" className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                  Zoom
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botones de WhatsApp: Confirmar Cita, Adelantar Cita y Cotización / Calificación */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleQuickConfirmWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#25D366] hover:bg-[#20ba5a] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-white text-[#25D366]" />
          <span>Confirmar Cita al Cliente por WhatsApp</span>
        </button>

        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <button
            type="button"
            onClick={handleAdvanceAppointmentWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <FastForward className="w-4 h-4 text-amber-700 fill-amber-700" />
            <span>Adelantar Cita por WhatsApp</span>
          </button>
        )}

        {/* El botón Compartir Cotización Oficial solo debe aparecer a las cotizaciones que crea el admin */}
        {existingQuote ? (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleSendOfficialQuoteWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-300 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              title="Crear una cotización personalizada para este cliente"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Crear Cotización</span>
            </button>
          )
        )}

        {/* Botón Solicitar Reseña / Calificación por WhatsApp (SOLO citas completadas) */}
        {appointment.status === 'completed' && (
          <button
            type="button"
            onClick={handleSendReviewLinkWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Enviar Link de Calificación (1-5★) por WhatsApp</span>
          </button>
        )}
      </div>

      {/* Etiqueta de Finalizado si la cita ya está completada */}
      {appointment.status === 'completed' && (
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

      {/* Botones Secundarios de Llamada y Otros Estados */}
      <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
        <a
          href={`tel:${rawDigits}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-dark bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-brand-blue" />
          <span>Llamar al {appointment.client_phone}</span>
        </a>

        <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
          {appointment.status !== 'completed' ? (
            <button
              type="button"
              onClick={handleFinishJob}
              title="Marca la cita como completada y abre el registro de cobro"
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-white bg-gradient-to-r from-[#FF5E0E] via-[#FF6D14] to-[#FF851A] hover:from-[#E65100] hover:to-[#FF6D14] shadow-xs cursor-pointer"
            >
              Finalizar
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
              Finalizada
            </span>
          )}
          <button
            onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              appointment.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-50'
            }`}
          >
            Cancelar
          </button>
        </div>
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
