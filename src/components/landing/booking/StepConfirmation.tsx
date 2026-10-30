import React, { useEffect } from 'react';
import { CheckCircle2, MessageSquare, Calendar, MapPin, Clock, RotateCcw } from 'lucide-react';
import { Appointment } from '../../../types/appointment';
import { formatDateToSpanish, formatTime12h } from '../../../utils/dateFormatter';

interface StepConfirmationProps {
  appointment: Appointment;
  onReset: () => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({
  appointment,
  onReset
}) => {
  // Al confirmarse la cita, asegurar que la pantalla se desplace automáticamente arriba del todo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const timeRange = `${formatTime12h(appointment.start_time)} - ${formatTime12h(appointment.end_time)}`;

  const whatsappMessage = encodeURIComponent(
    `¡Hola Destaqueos y Tanques Sépticos Mauricio Marín! Acabo de agendar un servicio:\n\n` +
    `• Nombre: ${appointment.client_name}\n` +
    `• Servicio: ${appointment.service_type}\n` +
    `• Fecha: ${formatDateToSpanish(appointment.appointment_date)}\n` +
    `• Horario: ${timeRange}\n` +
    `• Dirección: ${appointment.client_address}\n` +
    `• Detalle: ${appointment.problem_description}\n\n` +
    `Por favor me confirman. ¡Muchas gracias!`
  );

  return (
    <div className="text-center py-6 space-y-6">
      {/* Icono de Éxito */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          CITA REGISTRADA CON ÉXITO
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
          ¡Gracias, {appointment.client_name}!
        </h3>
        <p className="text-sm text-brand-slate max-w-md mx-auto">
          Hemos recibido tu solicitud de inspección técnica. Un especialista revisará el caso y se pondrá en contacto al{' '}
          <strong className="text-brand-dark">{appointment.client_phone}</strong>.
        </p>
      </div>

      {/* Tarjeta de Resumen */}
      <div className="max-w-md mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
          <span className="font-semibold text-brand-dark capitalize">
            {formatDateToSpanish(appointment.appointment_date)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-brand-orange shrink-0" />
          <span className="font-semibold text-brand-dark">
            {timeRange} (Bloque reservado)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-brand-slate text-xs">{appointment.client_address}</span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <a
          href={`https://wa.me/50661141421?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Enviar Comprobante a WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-bold text-brand-slate bg-white hover:bg-slate-100 border border-slate-200 text-sm transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Nueva Cita</span>
        </button>
      </div>
    </div>
  );
};
