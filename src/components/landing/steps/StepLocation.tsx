import React from 'react';
import { MapPin, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import type { LocationData } from '../../../types/order';
import { GpsRouteButtons } from '../GpsRouteButtons';

interface StepLocationProps {
  location: LocationData;
  loading: boolean;
  error: string | null;
  onCaptureGPS: () => void;
  addressInput: string;
  landmarksInput: string;
  onAddressChange: (val: string) => void;
  onLandmarksChange: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepLocation: React.FC<StepLocationProps> = ({
  location,
  loading,
  error,
  onCaptureGPS,
  addressInput,
  landmarksInput,
  onAddressChange,
  onLandmarksChange,
  onNext,
  onPrev,
}) => {
  return (
    <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
        3. Su ubicación o señas exactas:
      </label>

      <button
        type="button"
        onClick={onCaptureGPS}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        {loading ? 'Detectando GPS...' : '📍 Usar mi Ubicación GPS en Vivo (1 Toque)'}
      </button>

      <GpsRouteButtons location={location} />
      {error && (
        <div className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs flex gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        type="text"
        placeholder="Cantón o Barrio (Ej. Escazú Centro)"
        value={addressInput}
        onChange={(e) => onAddressChange(e.target.value)}
        className="w-full px-3.5 py-2.5 text-base sm:text-xs bg-slate-50 border border-slate-300 rounded-xl"
      />
      <textarea
        rows={2}
        placeholder="Señas exactas (Ej. 200m norte del Pali, portón negro)"
        value={landmarksInput}
        onChange={(e) => onLandmarksChange(e.target.value)}
        className="w-full px-3.5 py-2 text-base sm:text-xs bg-slate-50 border border-slate-300 rounded-xl"
      />

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Atrás
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Siguiente: Nivel de Urgencia</span> <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
