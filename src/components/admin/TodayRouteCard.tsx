import React, { useState } from 'react';
import { Navigation, Phone, MessageSquare, CheckCircle, MapPin, ChevronDown, ChevronUp, Image as ImageIcon, Clock, Edit3, FastForward, DollarSign, Star, Calendar, FileText } from 'lucide-react';
import { Appointment, AppointmentStatus, PaymentMethod } from '../../types/appointment';
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
  onUpdatePayment?: (id: string, amount: number, method: PaymentMethod) => Promise<void>;
  isHighlighted?: boolean;
}

export const TodayRouteCard: React.FC<TodayRouteCardProps> = ({
  appointment,
  index,
  onUpdateStatus,
  onOpenLightbox,
  onUpdateService,
  onUpdatePayment,
  isHighlighted = false
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

    const mensaje = `Hola *${appointment.client_name}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.\n\nYa realicé su cotización oficial para el servicio de *${appointment.service_type}*.\n\n📋 *Resumen de la Cotización:*\n• *N° de Control:* ${quoteNumber}\n• *Trabajo:* ${appointment.service_type}\n• *Ubicación:* ${appointment.client_address}\n• *Fecha estimada:* ${fecha} (${rangoHora})\n${montoStr}• *Garantía:* 100% satisfacción y servicio profesional garantizado.\n\n🌐 *Puede consultar y descargar su cotización formal en línea aquí:*\n👉 ${quoteUrl}\n\nQuedamos a su disposición para coordinar o atender cualquier consulta. ¡Muchas gracias por su preferencia!`;

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
        <div className="pt-0.5">
          {Number(appointment.amount_collected || 0) > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800">
              <span>₡{Number(appointment.amount_collected).toLocaleString('es-CR')}</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase">
                ({appointment.payment_method === 'card' ? 'Tarjeta' : (appointment.payment_method === 'cash' ? 'Efectivo' : 'Sinpe Móvil')})
              </span>
              {onUpdatePayment && (
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="ml-1 text-[10px] text-emerald-700 underline font-bold hover:text-emerald-900"
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

        {/* Botón Finalizar */}
        {!isCompleted && (
          <button
            type="button"
            onClick={() => onUpdateStatus(appointment.id, 'completed')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Marcar Trabajo como Finalizado</span>
          </button>
        )}

        {/* Botón Compartir Cotización Oficial por WhatsApp (mensaje programado con link y desglose) */}
        <button
          type="button"
          onClick={handleSendQuoteWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-300 shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4 text-brand-blue" />
          <span>Compartir Cotización Oficial por WhatsApp</span>
        </button>

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
          onSavePayment={async (id, amt, mtd) => {
            if (onUpdatePayment) await onUpdatePayment(id, amt, mtd);
          }}
        />
      )}
    </div>
  );
};
