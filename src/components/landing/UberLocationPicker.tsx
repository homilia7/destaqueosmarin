import React, { useState } from 'react';
import { Navigation, MapPin, Send, AlertCircle, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { AVAILABLE_SERVICES } from '../../types/service';
import type { ServiceType } from '../../types/service';
import type { EmergencyOrder } from '../../types/order';
import { useOrders } from '../../hooks/useOrders';
import { useAnalytics } from '../../hooks/useAnalytics';
import { GpsRouteButtons } from './GpsRouteButtons';
import { buildWhatsAppEmergencyMessage } from '../../utils/whatsapp';

interface UberLocationPickerProps {
  selectedService: ServiceType;
}

export const UberLocationPicker: React.FC<UberLocationPickerProps> = ({ selectedService }) => {
  const { location, loading, error, captureLiveGPS, updateManualAddress } = useGeolocation();
  const { addOrder } = useOrders();
  const { trackEvent } = useAnalytics();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [urgency, setUrgency] = useState<'inmediato' | 'hoy_mismo'>('inmediato');
  const [addressInput, setAddressInput] = useState('');
  const [landmarksInput, setLandmarksInput] = useState('');
  const [registeredOrder, setRegisteredOrder] = useState<EmergencyOrder | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeService = AVAILABLE_SERVICES.find((s) => s.id === selectedService) || AVAILABLE_SERVICES[0];

  const handleSendOrder = () => {
    setIsSubmitting(true);
    const finalAddress = location.addressText || addressInput || 'Ubicación proporcionada por cliente';
    const finalLandmarks = location.landmarks || landmarksInput;
    const finalMapsUrl = location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${finalAddress} ${finalLandmarks}`)}`;

    // 1. Guardar primero en el sistema web y panel de Mauricio
    const newOrder = addOrder({
      customerName: customerName.trim() || 'Cliente Web',
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

    // 2. Preparar URL de WhatsApp
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

    // 3. Abrir WhatsApp tras registrar en el panel
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  };

  const handleReset = () => {
    setRegisteredOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setAddressInput('');
    setLandmarksInput('');
  };

  return (
    <section id="uber-location-section" className="py-8 sm:py-12 px-3 sm:px-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-emerald-500/40 shadow-xl overflow-hidden">
        {/* Header estilo Uber */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Navigation className="w-4 h-4 animate-bounce" /> Navegación en Tiempo Real Estilo Uber
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white m-0">Indique su Ubicación para el Camión</h3>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-semibold">
            {activeService.title}
          </span>
        </div>

        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
          {registeredOrder ? (
            /* Pantalla de Confirmación de Cita y Redirección a WhatsApp */
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 sm:p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-mono font-bold rounded-full">
                  Cita Agendada: #{registeredOrder.id}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                  ¡Solicitud Enviada con Éxito al Panel de Mauricio!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                  La orden ya ingresó en el radar del camión. Redirigiendo a WhatsApp para confirmar la llegada inmediata...
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Abrir WhatsApp Ahora
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto py-3 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors"
                >
                  Nueva Solicitud
                </button>
              </div>
            </div>
          ) : (
            /* Formulario normal */
            <>
              <button
                type="button"
                onClick={captureLiveGPS}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl sm:rounded-2xl shadow-lg transition-all text-xs sm:text-sm cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5 fill-white text-emerald-600" />}
                {loading ? 'Detectando Coordenadas...' : '📍 Usar mi Ubicación GPS en Vivo (1 Toque)'}
              </button>

              <GpsRouteButtons location={location} />
              {error && <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input type="text" placeholder="Su Nombre (Ej. Carlos Solís)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3.5 py-3 text-base sm:text-sm bg-slate-50 border rounded-xl" />
                <input type="tel" placeholder="Teléfono (Ej. 8888-1234)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-3.5 py-3 text-base sm:text-sm bg-slate-50 border rounded-xl" />
              </div>

              <input type="text" placeholder="Dirección o Cantón (Ej. Escazú Centro)" value={addressInput} onChange={(e) => { setAddressInput(e.target.value); updateManualAddress(e.target.value, landmarksInput); }} className="w-full px-3.5 py-3 text-base sm:text-sm bg-slate-50 border rounded-xl" />
              <textarea rows={2} placeholder="Señas exactas (Ej. 200m norte del Pali, portón negro)" value={landmarksInput} onChange={(e) => { setLandmarksInput(e.target.value); updateManualAddress(addressInput, e.target.value); }} className="w-full px-3.5 py-3 text-base sm:text-sm bg-slate-50 border rounded-xl" />

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold">
                <span className="text-slate-700">Urgencia:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-emerald-700">
                  <input type="radio" name="urgency" checked={urgency === 'inmediato'} onChange={() => setUrgency('inmediato')} /> ¡Urgencia Ya!
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input type="radio" name="urgency" checked={urgency === 'hoy_mismo'} onChange={() => setUrgency('hoy_mismo')} /> Hoy mismo programado
                </label>
              </div>

              <button
                type="button"
                onClick={handleSendOrder}
                disabled={isSubmitting}
                className="w-full py-4 px-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 text-white font-black text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 fill-white" />}
                {isSubmitting ? 'Agendando Solicitud en Panel...' : 'Agendar Cita en Panel y Abrir WhatsApp'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
