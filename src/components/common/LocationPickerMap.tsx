import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, MapPin, Check, ExternalLink, Loader2 } from 'lucide-react';

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onChangeLocation: (lat: number, lng: number) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onChangeLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [detectingGPS, setDetectingGPS] = useState(false);

  // Coordenadas iniciales por defecto (San José, Costa Rica)
  const defaultLat = latitude || 9.9333;
  const defaultLng = longitude || -84.0833;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Crear mapa Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: latitude && longitude ? 15 : 12,
      scrollWheelZoom: false
    });

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Icono de Pin personalizado en SVG para no depender de assets externos
    const customPinIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="transform: translate(-50%, -100%);">
          <svg width="34" height="42" viewBox="0 0 384 512" fill="#FF5722" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
            <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
          </svg>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 42]
    });

    // Marcador
    if (latitude && longitude) {
      const marker = L.marker([latitude, longitude], { icon: customPinIcon, draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChangeLocation(pos.lat, pos.lng);
      });
      markerRef.current = marker;
    }

    // Clic en el mapa para posicionar el pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { icon: customPinIcon, draggable: true }).addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChangeLocation(pos.lat, pos.lng);
        });
        markerRef.current = marker;
      }
      onChangeLocation(lat, lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Actualizar posición del marcador si cambian las coordenadas externamente
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Manejador de GPS del navegador
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChangeLocation(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
        setDetectingGPS(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('No pudimos acceder a tu ubicación GPS. Por favor marca tu ubicación en el mapa haciendo clic sobre él.');
        setDetectingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-brand-dark uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-brand-blue" />
          <span>Fijar Ubicación en el Mapa (para Waze / Rutas)</span>
        </label>

        {/* Botón Detectar GPS */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={detectingGPS}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-ice hover:bg-brand-iceBorder text-brand-blue border border-brand-iceBorder text-xs font-extrabold transition-all"
        >
          {detectingGPS ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-brand-orange" />
          )}
          <span>{detectingGPS ? 'Detectando...' : 'Detectar con GPS'}</span>
        </button>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-56 sm:h-64 z-0" />

        {/* Overlay informativo */}
        {!latitude && (
          <div className="absolute top-2 left-2 right-2 bg-brand-dark/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[11px] font-medium pointer-events-none flex items-center justify-between">
            <span>👉 Toca el mapa para fijar el punto exacto de tu casa o negocio</span>
          </div>
        )}

        {latitude && longitude && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-slate-200 shadow-md flex items-center justify-between text-[11px] z-10">
            <span className="font-bold text-brand-dark flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Punto fijado: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
            <a
              href={`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>Ver en Waze</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
