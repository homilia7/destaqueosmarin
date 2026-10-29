import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, Wrench, FileText, ArrowLeft, ArrowRight, CheckCircle2, CheckCircle, Camera, Loader2, AlertCircle } from 'lucide-react';
import { ServiceType, ServiceItem, DEFAULT_SERVICES } from '../../../types/appointment';
import { api } from '../../../services/api';
import { LocationPickerMap } from '../../common/LocationPickerMap';

interface StepClientDetailsProps {
  formData: {
    client_name: string;
    client_phone: string;
    client_address: string;
    latitude: number | null;
    longitude: number | null;
    service_type: ServiceType;
    problem_description: string;
  };
  onChange: (field: string, value: string) => void;
  onChangeLocation: (lat: number, lng: number) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmitDirectly?: () => void;
  isSubmitting?: boolean;
}

export const StepClientDetails: React.FC<StepClientDetailsProps> = ({
  formData,
  onChange,
  onChangeLocation,
  onBack,
  onNext,
  onSubmitDirectly,
  isSubmitting = false
}) => {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [activeFocus, setActiveFocus] = useState<string | null>(null);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const problemInputRef = useRef<HTMLTextAreaElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getServices().then((srvs) => {
      if (srvs && srvs.length > 0) {
        setServices(srvs);
      }
    }).catch(() => {});
  }, []);

  const isNameValid = formData.client_name.trim().length >= 3;
  const isPhoneValid = formData.client_phone.replace(/\D/g, '').length >= 8;
  const isAddressWritten = formData.client_address.trim().length >= 5;
  const isLocationPinned = formData.latitude !== null && formData.longitude !== null;
  const isAddressValid = isAddressWritten || isLocationPinned;
  const isProblemValid = formData.problem_description.trim().length >= 3;

  const isFormValid = isNameValid && isPhoneValid && isAddressValid && isProblemValid;

  // Si el formulario ya se vuelve válido, limpiar la alerta
  useEffect(() => {
    if (isFormValid) {
      setShowValidationAlert(false);
    }
  }, [isFormValid]);

  const handleLocationPicked = (lat: number, lng: number) => {
    onChangeLocation(lat, lng);
    if (!formData.client_address || formData.client_address.trim().length < 5) {
      onChange('client_address', `Ubicación fijada en mapa GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  const getMissingFieldsText = () => {
    const list: string[] = [];
    if (!isNameValid) list.push('Nombre y Apellidos');
    if (!isPhoneValid) list.push('Teléfono Móvil (8 dígitos)');
    if (!isProblemValid) list.push('Descripción del Problema');
    if (!isAddressValid) list.push('Dirección o Punto GPS');
    return list.join(', ');
  };

  const focusFirstInvalidField = () => {
    setShowValidationAlert(true);
    if (!isNameValid && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!isPhoneValid && phoneInputRef.current) {
      phoneInputRef.current.focus();
      phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!isProblemValid && problemInputRef.current) {
      problemInputRef.current.focus();
      problemInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!isAddressValid && addressInputRef.current) {
      addressInputRef.current.focus();
      addressInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAttemptSubmitDirectly = () => {
    if (!isFormValid) {
      focusFirstInvalidField();
      return;
    }
    if (onSubmitDirectly) {
      onSubmitDirectly();
    }
  };

  const handleAttemptNext = () => {
    if (!isFormValid) {
      focusFirstInvalidField();
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 1. Nombre y Teléfono en grilla */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Nombre Completo */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Nombre y Apellidos *
            </label>
            {isNameValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Listo
              </span>
            ) : activeFocus === 'name' ? (
              <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Escribiendo...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Falta rellenar
              </span>
            )}
          </div>
          <div className="relative">
            <User 
              className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                isNameValid ? 'text-emerald-500' : activeFocus === 'name' ? 'text-brand-blue' : 'text-amber-500'
              }`} 
            />
            <input
              ref={nameInputRef}
              type="text"
              required
              placeholder="Ej. Carlos Montero"
              value={formData.client_name}
              onFocus={() => {
                setActiveFocus('name');
                setShowValidationAlert(false);
              }}
              onBlur={() => setActiveFocus(null)}
              onChange={(e) => onChange('client_name', e.target.value)}
              className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
                isNameValid
                  ? 'border-emerald-500 bg-emerald-50/20 text-brand-dark focus:ring-2 focus:ring-emerald-500/20'
                  : activeFocus === 'name'
                  ? 'border-brand-blue bg-white text-brand-dark ring-2 ring-brand-blue/20'
                  : 'border-amber-400 bg-amber-50/40 text-brand-dark ring-2 ring-amber-300/50 shadow-xs'
              }`}
            />
            {isNameValid && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
            )}
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Teléfono Móvil (WhatsApp) *
            </label>
            {isPhoneValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Listo
              </span>
            ) : activeFocus === 'phone' ? (
              <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Escribiendo...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Falta rellenar
              </span>
            )}
          </div>
          <div className="relative">
            <Phone 
              className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                isPhoneValid ? 'text-emerald-500' : activeFocus === 'phone' ? 'text-brand-blue' : 'text-amber-500'
              }`} 
            />
            <input
              ref={phoneInputRef}
              type="tel"
              required
              placeholder="Ej. 6114-1421 o 8888-8888"
              value={formData.client_phone}
              onFocus={() => {
                setActiveFocus('phone');
                setShowValidationAlert(false);
              }}
              onBlur={() => setActiveFocus(null)}
              onChange={(e) => onChange('client_phone', e.target.value)}
              className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
                isPhoneValid
                  ? 'border-emerald-500 bg-emerald-50/20 text-brand-dark focus:ring-2 focus:ring-emerald-500/20'
                  : activeFocus === 'phone'
                  ? 'border-brand-blue bg-white text-brand-dark ring-2 ring-brand-blue/20'
                  : 'border-amber-400 bg-amber-50/40 text-brand-dark ring-2 ring-amber-300/50 shadow-xs'
              }`}
            />
            {isPhoneValid && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
            )}
          </div>
          {!isPhoneValid && formData.client_phone.length > 0 && (
            <p className="text-[10px] text-red-500 mt-0.5">Mínimo 8 dígitos de teléfono.</p>
          )}
        </div>
      </div>

      {/* 2. Tipo de Servicio */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
            Tipo de Servicio Requerido *
          </label>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Listo
          </span>
        </div>
        <div className="relative">
          <Wrench className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
          <select
            value={formData.service_type}
            onChange={(e) => onChange('service_type', e.target.value as ServiceType)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-emerald-500 bg-emerald-50/20 text-sm font-semibold text-brand-dark focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer"
          >
            {services.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title} {s.price ? `— ₡${Number(s.price).toLocaleString('es-CR')}` : ''} {s.badge ? `(${s.badge})` : ''}
              </option>
            ))}
            {formData.service_type && !services.some((s) => s.title === formData.service_type) && (
              <option value={formData.service_type}>{formData.service_type}</option>
            )}
          </select>
        </div>
      </div>

      {/* 3. Descripción Detallada del Problema o Síntomas */}
      <div className="bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
            <FileText className={`w-3.5 h-3.5 ${isProblemValid ? 'text-emerald-500' : 'text-brand-blue'}`} />
            <span>Descripción del Problema o Síntomas *</span>
          </label>
          {isProblemValid ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Listo
            </span>
          ) : activeFocus === 'problem' ? (
            <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Escribiendo...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              Falta rellenar
            </span>
          )}
        </div>
        <div className="relative">
          <textarea
            ref={problemInputRef}
            required
            rows={2}
            placeholder="Ej. El recibo del agua se duplicó, se escucha agua corriendo en el baño o pared húmeda..."
            value={formData.problem_description}
            onFocus={() => {
              setActiveFocus('problem');
              setShowValidationAlert(false);
            }}
            onBlur={() => setActiveFocus(null)}
            onChange={(e) => onChange('problem_description', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
              isProblemValid
                ? 'border-emerald-500 bg-white text-brand-dark focus:ring-2 focus:ring-emerald-500/20'
                : activeFocus === 'problem'
                ? 'border-brand-blue bg-white text-brand-dark ring-2 ring-brand-blue/20'
                : 'border-amber-400 bg-amber-50/40 text-brand-dark ring-2 ring-amber-300/50 shadow-xs'
            }`}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Explica brevemente lo que ocurre para que el técnico lleve el equipo adecuado.</p>
      </div>

      {/* 4. Dirección Escrita + Mapa Interactivo */}
      <div className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Dirección Exacta o Cantón *
            </label>
            {isAddressValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Listo
              </span>
            ) : activeFocus === 'address' ? (
              <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Escribiendo...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Falta rellenar
              </span>
            )}
          </div>
          <div className="relative">
            <MapPin 
              className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                isAddressValid ? 'text-emerald-500' : activeFocus === 'address' ? 'text-brand-blue' : 'text-amber-500'
              }`} 
            />
            <input
              ref={addressInputRef}
              type="text"
              required
              placeholder="Ej. San José, Escazú, 200m este del parque o Condominio Los Reyes"
              value={formData.client_address}
              onFocus={() => {
                setActiveFocus('address');
                setShowValidationAlert(false);
              }}
              onBlur={() => setActiveFocus(null)}
              onChange={(e) => onChange('client_address', e.target.value)}
              className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
                isAddressValid
                  ? 'border-emerald-500 bg-emerald-50/20 text-brand-dark focus:ring-2 focus:ring-emerald-500/20'
                  : activeFocus === 'address'
                  ? 'border-brand-blue bg-white text-brand-dark ring-2 ring-brand-blue/20'
                  : 'border-amber-400 bg-amber-50/40 text-brand-dark ring-2 ring-amber-300/50 shadow-xs'
              }`}
            />
            {isAddressValid && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
            )}
          </div>
        </div>

        {/* Mapa Interactivo con Pin y GPS */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Punto de Llegada en Mapa GPS / Waze
            </span>
            {isLocationPinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                GPS Fijado
              </span>
            )}
          </div>
          <LocationPickerMap
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChangeLocation={handleLocationPicked}
          />
        </div>
      </div>

      {/* Alerta Visual de Campos Faltantes al Intentar Confirmar */}
      {showValidationAlert && !isFormValid && (
        <div className="bg-amber-50 border-2 border-amber-400 p-3.5 rounded-2xl text-amber-900 shadow-md flex items-start gap-3 transition-all animate-pulse">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-black text-amber-950 uppercase tracking-wide">
              ⚠️ Por favor completa los campos requeridos arriba
            </h5>
            <p className="text-xs font-semibold text-amber-900 leading-relaxed">
              Falta completar: <span className="font-extrabold underline">{getMissingFieldsText()}</span>. Haz clic en cualquiera de los campos resaltados en anaranjado para llenarlos.
            </p>
          </div>
        </div>
      )}

      {/* 5. Botones de Navegación con Opción Directa sin fotos */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="order-3 sm:order-1 px-4 py-2.5 rounded-xl font-bold text-brand-slate hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>

        <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-2">
          {/* Opción 1: Confirmar directamente (sin fotos) */}
          {onSubmitDirectly && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleAttemptSubmitDirectly}
              className={`px-5 py-3 rounded-xl font-extrabold text-white transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer shadow-md active:scale-95 ${
                isFormValid
                  ? 'bg-brand-orange hover:bg-brand-orangeHover shadow-glow-orange'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
              title={isFormValid ? 'Confirmar cita sin adjuntar fotos' : 'Haz clic para revisar qué campos faltan completar'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirmando Cita...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Cita (Sin Fotos)</span>
                </>
              )}
            </button>
          )}

          {/* Opción 2: Subir fotos (opcional) */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAttemptNext}
            className={`px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer active:scale-95 ${
              isFormValid
                ? 'text-brand-blue bg-brand-ice hover:bg-brand-iceBorder border border-brand-iceBorder'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Subir Fotos (Opcional)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
