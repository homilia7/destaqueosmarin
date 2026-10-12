import { useState, useCallback } from 'react';
import type { LocationData } from '../types/order';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    addressText: '',
    landmarks: '',
    googleMapsUrl: '',
    wazeUrl: '',
  });

  const generateRouteUrls = (lat: number, lng: number) => ({
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    wazeUrl: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  });

  const captureLiveGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const routes = generateRouteUrls(latitude, longitude);

        let reverseAddress = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
          );
          if (res.ok) {
            const data = await res.json();
            reverseAddress = data.display_name || '';
          }
        } catch {
          // Ignorar fallo de geocodificación externa
        }

        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
          accuracyMeters: Math.round(accuracy),
          addressText: reverseAddress || prev.addressText || 'Ubicación GPS Detectada',
          googleMapsUrl: routes.googleMapsUrl,
          wazeUrl: routes.wazeUrl,
        }));
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permiso de GPS denegado. Puedes escribir tu dirección manual abajo.');
        } else {
          setError('No fue posible obtener tu señal GPS en este momento.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  const updateManualAddress = (addressText: string, landmarks: string) => {
    setLocation((prev) => {
      const encodedAddress = encodeURIComponent(`${addressText} ${landmarks}`.trim());
      return {
        ...prev,
        addressText,
        landmarks,
        googleMapsUrl: prev.latitude 
          ? prev.googleMapsUrl 
          : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
        wazeUrl: prev.latitude 
          ? prev.wazeUrl 
          : `https://waze.com/ul?q=${encodedAddress}&navigate=yes`,
      };
    });
  };

  return {
    location,
    loading,
    error,
    captureLiveGPS,
    updateManualAddress,
    setLocation,
  };
}
