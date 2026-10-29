import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Calendar, Clock, Image as ImageIcon, Navigation, ExternalLink, Edit3, FastForward, Star, FileText } from 'lucide-react';
import { Appointment, AppointmentStatus, PaymentMethod } from '../../types/appointment';
import { formatDateToSpanish, formatTime12h } from '../../utils/dateFormatter';
import { ServiceEditorModal } from './ServiceEditorModal';
import { PaymentModal } from './PaymentModal';
import { api } from '../../services/api';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenLightbox: (photos: string[], index: number) => void;
  onUpdateService?: (id: string, newServiceType: string) => Promise<void>;
  onUpdatePayment?: (id: string, amount: number, method: PaymentMethod) => Promise<void>;
  isHighlighted?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdateStatus,
  onOpenLightbox,
  onUpdateService,
  onUpdatePayment,
  isHighlighted = false
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

  const handleSendQuoteWhatsApp = async () => {
    const origin = window.location.origin;
    const cleanId = appointment.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const quoteId = `cot_${cleanId || 'cli'}`;
    const fecha = formatDateToSpanish(appointment.appointment_date);
    const quoteNumber = `COT-${appointment.appointment_date ? appointment.appointment_date.replace(/-/g, '').slice(2) : '2026'}-${appointment.id.slice(0, 4).toUpperCase()}`;
    const quoteUrl = `${origin}/cotizacion/${quoteId}`;
    const amount = Number(appointment.amount_collected || 0);

    try {
      await api.saveQuote({
        id: quoteId,
        quote_number: quoteNumber,
        date: appointment.appointment_date,
        company_name: 'Destaqueos y Tanques Sépticos Mauricio Marín',
        client_name: appointment.client_name,
        client_location: appointment.client_address,
        client_phone: appointment.client_phone,
        work_reference: appointment.service_type,
        scope_items: JSON.stringify([
          { id: '1', text: `Servicio profesional de: ${appointment.service_type}` },
          { id: '2', text: appointment.problem_description || 'Trabajo con camión cisterna / sondas rotativas eléctricas.' }
        ]),
        labor_cost: amount > 0 ? amount : 45000,
        materials_cost: 0,
        materials_detail: 'Equipo especializado y personal técnico calificado incluido',
        apply_iva: 0,
        delivery_time: 'Atención técnica según agenda programada',
        total_amount: amount > 0 ? amount : 45000,
        file_name: `Cotizacion-${appointment.client_name.replace(/\s+/g, '-')}`,
        responsible_name: 'Mauricio Marín',
        responsible_phone: '6114-1421',
        status: 'enviada'
      });
    } catch (e) {
      console.warn('Error guardando cotizacion antes de compartir:', e);
    }

    const montoStr = amount > 0 ? `• *Inversión Estimada:* ₡${amount.toLocaleString('es-CR')}\n` : '';

    const mensaje = `Hola *${appointment.client_name}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.\n\nYa realicé su cotización oficial para el servicio de *${appointment.service_type}*.\n\n📋 *Resumen de la Cotización:*\n• *N° de Control:* ${quoteNumber}\n• *Trabajo:* ${appointment.service_type}\n• *Ubicación:* ${appointment.client_address}\n• *Fecha estimada:* ${fecha} (${rango_hora})\n${montoStr}• *Garantía:* 100% satisfacción y servicio profesional garantizado.\n\n🌐 *Puede consultar y descargar su cotización formal en línea aquí:*\n👉 ${quoteUrl}\n\nQuedamos a su disposición para coordinar o atender cualquier consulta. ¡Muchas gracias por su preferencia!`;

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
          <div className="pt-0.5">
            {Number(appointment.amount_collected || 0) > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800">
                <span>Cobrado: ₡{Number(appointment.amount_collected).toLocaleString('es-CR')}</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">
                  ({appointment.payment_method === 'card' ? 'Tarjeta' : (appointment.payment_method === 'cash' ? 'Efectivo' : 'Sinpe Móvil')})
                </span>
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
            ) : (
              onUpdatePayment && (
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer"
                >
                  <span>₡ Registrar Cobro (Sinpe / Tarjeta)</span>
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

        {/* Compartir Cotización Oficial por WhatsApp (mensaje programado con link y desglose) */}
        {appointment.status !== 'cancelled' && (
          <button
            type="button"
            onClick={handleSendQuoteWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-300 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-brand-blue" />
            <span>Compartir Cotización Oficial por WhatsApp</span>
          </button>
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
          <button
            onClick={() => onUpdateStatus(appointment.id, 'completed')}
            title="Marca la cita como completada y purga fotos de R2"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              appointment.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Finalizar
          </button>
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
          onSavePayment={async (id, amt, mtd) => {
            if (onUpdatePayment) await onUpdatePayment(id, amt, mtd);
          }}
        />
      )}
    </div>
  );
};
