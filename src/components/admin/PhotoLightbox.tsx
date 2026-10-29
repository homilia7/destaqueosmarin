import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoLightboxProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext
}) => {
  if (photos.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {/* Botón Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Contador */}
      <div className="absolute top-6 text-white text-xs font-bold tracking-wider uppercase bg-white/10 px-4 py-1.5 rounded-full">
        Foto {currentIndex + 1} de {photos.length}
      </div>

      {/* Imagen Principal */}
      <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center">
        <img
          src={photos[currentIndex]}
          alt={`Evidencia de fuga ${currentIndex + 1}`}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/20"
        />

        {/* Navegación Anterior */}
        {photos.length > 1 && (
          <button
            onClick={onPrev}
            className="absolute left-2 sm:-left-14 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Navegación Siguiente */}
        {photos.length > 1 && (
          <button
            onClick={onNext}
            className="absolute right-2 sm:-right-14 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
