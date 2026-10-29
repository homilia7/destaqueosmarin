import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Send, ArrowLeft, ShieldCheck, HeartHandshake, Phone, Lock } from 'lucide-react';
import { api } from '../../services/api';
import { AnimatedEagleLogo } from '../common/AnimatedEagleLogo';

interface ClientReviewPageProps {
  onBackToHome: () => void;
}

export const ClientReviewPage: React.FC<ClientReviewPageProps> = ({ onBackToHome }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [isPhoneLocked, setIsPhoneLocked] = useState<boolean>(false);
  const [serviceType, setServiceType] = useState<string>('Detección Especializada de Fugas');
  const [comment, setComment] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefilledName = params.get('cliente') || params.get('name') || '';
    const prefilledService = params.get('servicio') || params.get('service') || '';
    const prefilledId = params.get('id') || params.get('cita') || '';
    const prefilledPhone = params.get('tel') || params.get('telefono') || params.get('phone') || '';

    if (prefilledName) setClientName(prefilledName);
    if (prefilledService) setServiceType(prefilledService);
    if (prefilledId) setAppointmentId(prefilledId);
    if (prefilledPhone) {
      setClientPhone(prefilledPhone);
      setIsPhoneLocked(true);
    }
  }, []);

  const ratingLabels: Record<number, string> = {
    1: 'Malo — No cumplió expectativas',
    2: 'Regular — Hubo detalles por mejorar',
    3: 'Bueno — Cumplió con lo esperado',
    4: 'Muy Bueno — Gran atención y rapidez',
    5: '¡Excelente Servicio! — 100% Recomendado ⭐'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Por favor ingrese su nombre para el testimonio verificado.');
      return;
    }
    if (!clientPhone.trim()) {
      setErrorMessage('Por favor ingrese su número de teléfono para verificar su reseña.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMessage('Por favor escriba un breve comentario sobre el trabajo realizado.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await api.createReview({
        client_name: clientName.trim(),
        client_phone: clientPhone.trim() || undefined,
        service_type: serviceType,
        rating,
        comment: comment.trim(),
        appointment_id: appointmentId || undefined
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'El número ingresado no coincide con ningún cliente registrado en las citas de Destaqueos Mauricio Marín.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 flex flex-col justify-between text-brand-dark py-8 px-4 sm:px-6">
      
      {/* Header Superior con Logo */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <img src="/camion-destaqueos.png" alt="Mauricio Marín" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-emerald-800">
              MAURICIO MARÍN
            </h1>
            <p className="text-[11px] text-brand-blue font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
              <span>Portal de Opiniones Verificadas</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-dark transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </button>
      </div>

      {/* Contenido Central */}
      <div className="max-w-xl mx-auto w-full my-auto py-8">
        {isSubmitted ? (
          /* Pantalla de Éxito / Agradecimiento */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-card text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>¡Opinión Publicada con Éxito!</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
                ¡Muchas Gracias por su Calificación!
              </h2>
              <p className="text-sm text-brand-slate leading-relaxed">
                Estimado/a <strong>{clientName}</strong>, su comentario y valoración de <strong>{rating} estrellas</strong> ya están registrados y publicados en nuestra sección de testimonios de clientes reales.
              </p>
              {clientPhone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold justify-center pt-1">
                  <Phone className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Celular verificado: <strong className="text-brand-dark font-mono">{clientPhone}</strong></span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{serviceType}</span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-brand-dark italic">"{comment}"</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onBackToHome}
                className="flex-1 py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-black text-white bg-brand-blue hover:bg-brand-blue/90 shadow-md transition-all"
              >
                Ver mi Testimonio en la Página Web
              </button>
              <button
                type="button"
                onClick={() => window.close()}
                className="py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Calificación */
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-card space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-brand-blue uppercase tracking-wider">
                Reseña de Trabajo Realizado
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
                ¿Cómo califica nuestro servicio?
              </h2>
              <p className="text-xs sm:text-sm text-brand-slate">
                Su opinión sincera ayuda a otras personas a encontrar una solución sin romper su casa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Insignia de Enlace Blindado con Celular o Campo de Verificación */}
              {isPhoneLocked && clientPhone ? (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/90 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-brand-dark">
                    <div className="p-2 rounded-xl bg-brand-blue text-white shadow-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-brand-blue flex items-center gap-1">
                        <span>Enlace Oficial y Blindado</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Celular del cliente: <span className="font-mono font-bold text-brand-dark">{clientPhone}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🔒 Verificado
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-brand-dark flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Su Teléfono Celular (Validación de Cliente):</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Solo Clientes Registrados
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej: 8888-8888"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all font-mono"
                  />
                  <span className="text-[11px] text-slate-500 font-medium block">
                    🔒 El sistema valida que este celular coincida con una cita técnica agendada en Destaqueos Mauricio Marín para evitar reseñas falsas.
                  </span>
                </div>
              )}

              {/* Selector Interactivo de Estrellas */}
              <div className="text-center space-y-2.5 bg-gradient-to-b from-amber-50/50 to-amber-50/10 p-5 rounded-3xl border border-amber-200/60">
                <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  Seleccione de 1 a 5 Estrellas:
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeVal = hoverRating || rating;
                    const isFilled = starVal <= activeVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                        title={`${starVal} de 5 estrellas`}
                      >
                        <Star
                          className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-extrabold text-amber-700 h-5">
                  {ratingLabels[hoverRating || rating]}
                </p>
              </div>

              {/* Nombre del Cliente */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-brand-dark">
                  Su Nombre o Nombre de Familia:
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Familia Méndez / Carlos Solís"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                />
                <span className="text-[11px] text-slate-400">
                  Aparecerá junto a su reseña con la insignia de cliente verificado.
                </span>
              </div>

              {/* Tipo de Servicio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-brand-dark">
                  Servicio que le realizamos:
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                >
                  <option value="Detección Especializada de Fugas">Detección Especializada de Fugas</option>
                  <option value="Rastreo y Diagnóstico de Tuberías">Rastreo y Diagnóstico de Tuberías</option>
                  <option value="Limpieza Técnica de Tuberías">Limpieza Técnica de Tuberías</option>
                  <option value="Reparación Puntual de Fuga">Reparación Puntual de Fuga</option>
                  <option value="Inspección Acústica con Geófono">Inspección Acústica con Geófono</option>
                </select>
              </div>

              {/* Comentario / Testimonio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-brand-dark">
                  Su Comentario o Experiencia:
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntenos cómo fue la atención del técnico, la precisión de la detección y si le resolvieron el problema..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-black text-white bg-brand-blue hover:bg-brand-blue/90 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Publicando su opinión...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publicar Opinión Verificada</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer de Confianza */}
      <div className="max-w-xl mx-auto w-full text-center pt-6 text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <img 
          src="/camion-destaqueos.png" 
          alt="Mauricio Marín" 
          className="w-5 h-5 object-contain" 
        />
        <p>🔒 Sistema Oficial de Testimonios Directos — Destaqueos y Tanques Sépticos Mauricio Marín</p>
      </div>

    </div>
  );
};
