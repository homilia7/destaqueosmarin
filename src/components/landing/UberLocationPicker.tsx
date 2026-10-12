import React, { useState } from 'react';
import { Navigation, MapPin, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { AVAILABLE_SERVICES } from '../../types/service';
import type { ServiceType } from '../../types/service';
import { useOrders } from '../../hooks/useOrders';
import { GpsRouteButtons } from './GpsRouteButtons';
import { buildWhatsAppEmergencyMessage } from '../../utils/whatsapp';

interface UberLocationPickerProps {
  selectedService: ServiceType;
}

export const UberLocationPicker: React.FC<UberLocationPickerProps> = ({ selectedService }) => {
  const { location, loading, error, captureLiveGPS, updateManualAddress } = useGeolocation();
  const { addOrder } = useOrders();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [urgency, setUrgency] = useState<'inmediato' | 'hoy_mismo'>('inmediato');
  const [addressInput, setAddressInput] = useState('');
  const [landmarksInput, setLandmarksInput] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const activeService = AVAILABLE_SERVICES.find((s) => s.id === selectedService) || AVAILABLE_SERVICES[0];

  const handleSendWhatsAppOrder = () => {
    const finalAddress = location.addressText || addressInput || 'Ubicación proporcionada por cliente';
    const finalLandmarks = location.landmarks || landmarksInput;
    const finalMapsUrl = location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${finalAddress} ${finalLandmarks}`)}`;

    addOrder({
      customerName: customerName.trim() || 'Cliente Web',
      customerPhone: customerPhone.trim() || 'Sin número registrado',
      serviceType: selectedService,
      urgencyLevel: urgency,
      status: 'pendiente',
      source: 'google_ads',
      notes: `Solicitud express desde Google Ads`,
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

    const whatsappUrl = buildWhatsAppEmergencyMessage({
      activeService,
      urgency,
      customerName,
      customerPhone,
      finalAddress,
      finalLandmarks,
      location,
      finalMapsUrl,
    });

    window.open(whatsappUrl, '_blank');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 5000);
  };

  return (
    <section id="uber-location-section" className="py-10 px-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Navigation className="w-4 h-4 animate-bounce" /> Navegación en Tiempo Real Estilo Uber
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white m-0">Indique su Ubicación para el Camión</h3>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-semibold">
            {activeService.title}
          </span>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <button
            type="button"
            onClick={captureLiveGPS}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5 fill-white text-emerald-600" />}
            {loading ? 'Detectando Coordenadas...' : '📍 Usar mi Ubicación GPS en Vivo (1 Toque)'}
          </button>

          <GpsRouteButtons location={location} />
          {error && <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Su Nombre (Ej. Carlos Solís)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl" />
            <input type="tel" placeholder="Teléfono (Ej. 8888-1234)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl" />
          </div>

          <input type="text" placeholder="Dirección o Cantón (Ej. Escazú Centro)" value={addressInput} onChange={(e) => { setAddressInput(e.target.value); updateManualAddress(e.target.value, landmarksInput); }} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl" />
          <textarea rows={2} placeholder="Señas exactas (Ej. 200m norte del Pali, portón negro)" value={landmarksInput} onChange={(e) => { setLandmarksInput(e.target.value); updateManualAddress(addressInput, e.target.value); }} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl" />

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-slate-700">Urgencia:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-emerald-700">
              <input type="radio" name="urgency" checked={urgency === 'inmediato'} onChange={() => setUrgency('inmediato')} /> ¡Urgencia Ya!
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
              <input type="radio" name="urgency" checked={urgency === 'hoy_mismo'} onChange={() => setUrgency('hoy_mismo')} /> Hoy mismo programado
            </label>
          </div>

          <button type="button" onClick={handleSendWhatsAppOrder} className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-3 cursor-pointer">
            <Send className="w-5 h-5 fill-white" /> Enviar Pedido con GPS por WhatsApp a Mauricio (6114-1421)
          </button>
          {sentSuccess && <p className="text-center text-xs font-bold text-emerald-600">✅ ¡Solicitud registrada en el radar de emergencias!</p>}
        </div>
      </div>
    </section>
  );
};
