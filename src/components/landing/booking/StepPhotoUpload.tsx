import React, { useState } from 'react';
import { Camera, Trash2, ArrowLeft, CheckCircle, Loader2, Check } from 'lucide-react';
import { CompressedImage, compressImageToWebP } from '../../../utils/imageCompressor';

interface StepPhotoUploadProps {
  photos: CompressedImage[];
  onAddPhoto: (photo: CompressedImage) => void;
  onRemovePhoto: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const StepPhotoUpload: React.FC<StepPhotoUploadProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onBack,
  onSubmit,
  isSubmitting
}) => {
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= 3) {
      alert('Máximo 3 fotografías permitidas.');
      return;
    }

    setCompressing(true);
    try {
      const remainingSlots = 3 - photos.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      for (const file of filesToProcess) {
        const compressed = await compressImageToWebP(file, 1200, 1200, 0.8);
        onAddPhoto(compressed);
      }
    } catch (err) {
      console.warn('Error al procesar y comprimir imagen:', err);
    } finally {
      setCompressing(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Banner Informativo Opcional */}
      <div className="bg-emerald-50/60 p-3.5 sm:p-4 rounded-2xl border border-emerald-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs sm:text-sm">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Evidencia Fotográfica</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            100% Opcional
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Si tienes fotos del área con humedad, medidor o tubería, puedes adjuntarlas aquí (máx. 3). Si no tienes fotos a mano, <strong>puedes confirmar tu cita directamente sin fotos</strong>.
        </p>
      </div>

      {/* Zona de Carga / Selección */}
      {photos.length < 3 && (
        <label className="border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50 transition-all">
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={compressing || isSubmitting}
          />
          {compressing ? (
            <div className="flex flex-col items-center py-3 text-brand-blue gap-2">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-xs font-bold">Optimizando imagen...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-brand-ice text-brand-blue flex items-center justify-center mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-brand-dark">
                Tocar para tomar foto o elegir de la galería
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Opcional · {photos.length} de 3 añadidas
              </p>
            </div>
          )}
        </label>
      )}

      {/* Lista de Fotos Subidas */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {photos.map((p, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white p-1.5 shadow-xs">
              <img
                src={p.dataUrl}
                alt={p.name}
                className="w-full h-28 object-cover rounded-xl"
              />
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span className="font-bold text-emerald-600">
                  {p.compressedSizeKB} KB
                </span>
                <button
                  type="button"
                  onClick={() => onRemovePhoto(idx)}
                  className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  title="Eliminar foto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acciones de Navegación */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="order-3 sm:order-1 px-4 py-2.5 rounded-xl font-bold text-brand-slate hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>

        <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-2">
          {photos.length === 0 ? (
            <button
              type="button"
              disabled={isSubmitting || compressing}
              onClick={onSubmit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-white bg-brand-orange hover:bg-brand-orangeHover shadow-glow-orange hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
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
          ) : (
            <button
              type="button"
              disabled={isSubmitting || compressing}
              onClick={onSubmit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-white bg-brand-orange hover:bg-brand-orangeHover shadow-glow-orange hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirmando Cita...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirmar Cita con {photos.length} Foto{photos.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
