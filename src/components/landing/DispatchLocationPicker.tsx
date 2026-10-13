import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { AVAILABLE_SERVICES } from '../../types/service';
import type { ServiceType } from '../../types/service';
import type { EmergencyOrder } from '../../types/order';
import { useOrders } from '../../hooks/useOrders';
import { useAnalytics } from '../../hooks/useAnalytics';
import { buildWhatsAppEmergencyMessage } from '../../utils/whatsapp';
import { StepNamePhone } from './steps/StepNamePhone';
import { StepLocation } from './steps/StepLocation';
import { StepUrgencyConfirm } from './steps/StepUrgencyConfirm';
import { OrderSuccessCard } from './steps/OrderSuccessCard';

interface DispatchLocationPickerProps {
  selectedService: ServiceType;
}

export const DispatchLocationPicker: React.FC<DispatchLocationPickerProps> = ({ selectedService }) => {
  const { location, loading, error, captureLiveGPS, updateManualAddress } = useGeolocation();
  const { addOrder } = useOrders();
  const { trackEvent } = useAnalytics();

  // Pasos secuenciales: 1 = Nombre, 2 = Teléfono, 3 = Ubicación GPS, 4 = Urgencia y Enviar
  const [step, setStep] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [urgency, setUrgency] = useState<'inmediato' | 'hoy_mismo'>('inmediato');
  const [addressInput, setAddressInput] = useState('');
  const [landmarksInput, setLandmarksInput] = useState('');
  const [registeredOrder, setRegisteredOrder] = useState<EmergencyOrder | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeService = AVAILABLE_SERVICES.find((s) => s.id === selectedService) || AVAILABLE_SERVICES[0];

  const handleAddressChange = (val: string) => {
    setAddressInput(val);
    updateManualAddress(val, landmarksInput);
  };

  const handleLandmarksChange = (val: string) => {
    setLandmarksInput(val);
    updateManualAddress(addressInput, val);
  };

  const handleSendOrder = () => {
    setIsSubmitting(true);
    const finalAddress = location.addressText || addressInput || 'Ubicación proporcionada por cliente';
    const finalLandmarks = location.landmarks || landmarksInput;
    const finalMapsUrl =
      location.googleMapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${finalAddress} ${finalLandmarks}`)}`;

    const newOrder = addOrder({
      customerName: customerName.trim() || 'Cliente Particular',
      customerPhone: customerPhone.trim() || 'Sin número registrado',
      serviceType: selectedService,
      urgencyLevel: urgency,
      status: 'pendiente',
      source: 'google_ads',
      notes: `Solicitud express web agendada`,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        addressText: finalAddress,
        landmarks: finalLandmarks,
        googleMapsUrl: finalMapsUrl,
        wazeUrl: location.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(finalAddress)}&navigate=yes`,
        accuracyMeters: location.accuracyMeters,
      },
    });

    trackEvent('reserva_gps');

    const waUrl = buildWhatsAppEmergencyMessage({
      activeService,
      urgency,
      customerName,
      customerPhone,
      finalAddress,
      finalLandmarks,
      location,
      finalMapsUrl,
    });

    setWhatsappUrl(waUrl);
    setRegisteredOrder(newOrder);
    setIsSubmitting(false);

    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  };

  const handleReset = () => {
    setRegisteredOrder(null);
    setStep(1);
    setCustomerName('');
    setCustomerPhone('');
    setAddressInput('');
    setLandmarksInput('');
  };

  return (
    <section id="solicitud-servicio-section" className="py-5 sm:py-8 px-3 sm:px-4 max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden transition-all">
        {/* Cabecera compacta y sobria */}
        <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-100">
              Indique su Ubicación para el Camión
            </span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800/40">
            {activeService.title}
          </span>
        </div>

        {/* Barra de progreso sutil y compacta */}
        {!registeredOrder && (
          <div className="bg-slate-50 px-3.5 py-1.5 border-b border-slate-200/70 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>
              Paso {step} de 4: {step === 1 ? 'Nombre' : step === 2 ? 'Teléfono' : step === 3 ? 'Ubicación' : 'Urgencia'}
            </span>
            <div className="w-20 sm:w-28 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {registeredOrder ? (
            <OrderSuccessCard
              registeredOrder={registeredOrder}
              whatsappUrl={whatsappUrl}
              onReset={handleReset}
            />
          ) : (
            <div>
              {(step === 1 || step === 2) && (
                <StepNamePhone
                  step={step}
                  customerName={customerName}
                  customerPhone={customerPhone}
                  onChangeName={setCustomerName}
                  onChangePhone={setCustomerPhone}
                  onNext={() => setStep(step + 1)}
                  onPrev={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <StepLocation
                  location={location}
                  loading={loading}
                  error={error}
                  onCaptureGPS={captureLiveGPS}
                  addressInput={addressInput}
                  landmarksInput={landmarksInput}
                  onAddressChange={handleAddressChange}
                  onLandmarksChange={handleLandmarksChange}
                  onNext={() => setStep(4)}
                  onPrev={() => setStep(2)}
                />
              )}

              {step === 4 && (
                <StepUrgencyConfirm
                  customerName={customerName}
                  customerPhone={customerPhone}
                  activeServiceTitle={activeService.title}
                  urgency={urgency}
                  onSelectUrgency={setUrgency}
                  isSubmitting={isSubmitting}
                  onPrev={() => setStep(3)}
                  onSubmit={handleSendOrder}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
