import React from 'react';
import { ExternalLink, Check } from 'lucide-react';
import type { LocationData } from '../../types/order';

interface GpsRouteButtonsProps {
  location: LocationData;
}

export const GpsRouteButtons: React.FC<GpsRouteButtonsProps> = ({ location }) => {
  if (!location.latitude) return null;

  return (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
      <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" /> Coordenadas GPS detectadas
        </span>
        <span className="font-mono text-emerald-700">
          Precisión: ±{location.accuracyMeters}m
        </span>
      </div>
      <p className="text-xs text-slate-700 font-medium">{location.addressText}</p>

      {/* Botones de navegación en tiempo real (Waze y Google Maps) */}
      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={location.wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Abrir Ruta en Waze
        </a>
        <a
          href={location.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Abrir Ruta en Google Maps
        </a>
      </div>
    </div>
  );
};
