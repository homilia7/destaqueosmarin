import React, { useState, useRef } from 'react';
import { StepDateAndTime } from './StepDateAndTime';
import { StepClientDetails } from './StepClientDetails';
import { StepPhotoUpload } from './StepPhotoUpload';
import { StepConfirmation } from './StepConfirmation';
import { Appointment, ServiceType, TimeSlot } from '../../../types/appointment';
import { CompressedImage } from '../../../utils/imageCompressor';
import { api } from '../../../services/api';

interface BookingWizardProps {
  initialService?: ServiceType;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialService = 'Limpieza de Tanques Sépticos'
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    service_type: initialService,
    problem_description: ''
  });

  const [photos, setPhotos] = useState<CompressedImage[]>([]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (latitude: number, longitude: number) => {
    setFormData((prev) => ({ ...prev, latitude, longitude }));
  };

  const handleAddPhoto = (photo: CompressedImage) => {
    if (photos.length < 3) {
      setPhotos((prev) => [...prev, photo]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setIsSubmitting(true);
    try {
      const newApp = await api.createAppointment({
        client_name: formData.client_name,
        client_phone: formData.client_phone,
        client_address: formData.client_address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        service_type: formData.service_type,
        problem_description: formData.problem_description,
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        photos: photos.map((p) => ({ name: p.name, dataUrl: p.dataUrl }))
      });
      setConfirmedAppointment(newApp);
      setStep(4);
      // Dirigir automáticamente la pantalla arriba del todo sin que el usuario tenga que hacer scroll
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (wizardTopRef.current) {
          wizardTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } catch (err) {
      alert('Error al agendar la cita. Por favor intente nuevamente.');
      console.warn(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedSlot(null);
    setFormData({
      client_name: '',
      client_phone: '',
      client_address: '',
      latitude: null,
      longitude: null,
      service_type: 'Limpieza de Tanques Sépticos',
      problem_description: ''
    });
    setPhotos([]);
    setConfirmedAppointment(null);
  };

  const wizardTopRef = useRef<HTMLDivElement>(null);

  const goToStep = (nextStep: 1 | 2 | 3 | 4) => {
    setStep(nextStep);
    setTimeout(() => {
      if (wizardTopRef.current) {
        wizardTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 40);
  };

  return (
    <div ref={wizardTopRef} className="w-full scroll-mt-20">
      {/* Cabecera del Wizard Compacta */}
      <div className="text-center mb-3 sm:mb-5 space-y-1">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-brand-ice text-brand-blue border border-brand-iceBorder uppercase tracking-wider">
          Disponibilidad en Vivo
        </span>
        <h2 className="text-lg sm:text-2xl font-extrabold text-brand-dark tracking-tight leading-tight">
          AGENDA TU INSPECCIÓN TÉCNICA
        </h2>
        <p className="text-[11px] sm:text-xs text-brand-slate max-w-md mx-auto hidden sm:block">
          Elige el horario, completa tus datos con mapa GPS y confirma tu cita.
        </p>
      </div>

      {/* Tarjeta Principal del Formulario Interactivo */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 border border-slate-100 shadow-card">
          
        {/* Barra de Pasos Estrecha y Compacta */}
        {step < 4 && (
          <div className="max-w-xs sm:max-w-sm mx-auto flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            {[
              { s: 1, label: 'Horario' },
              { s: 2, label: 'Datos' },
              { s: 3, label: 'Fotos' }
            ].map((item, idx) => (
              <React.Fragment key={item.s}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                      step > item.s
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : step === item.s
                        ? 'bg-brand-blue text-white shadow-sm ring-2 ring-brand-blue/20'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > item.s ? '✓' : item.s}
                  </div>
                  <span className={`text-[11px] font-bold ${step >= item.s ? 'text-brand-dark' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 mx-2 h-0.5 rounded-full ${step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Renderizado de Pasos */}
        {step === 1 && (
          <StepDateAndTime
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSelectDate={setSelectedDate}
            onSelectSlot={setSelectedSlot}
            onNext={() => goToStep(2)}
          />
        )}

        {step === 2 && (
          <StepClientDetails
            formData={formData}
            onChange={handleFieldChange}
            onChangeLocation={handleLocationChange}
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
            onSubmitDirectly={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 3 && (
          <StepPhotoUpload
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onBack={() => goToStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

          {step === 4 && confirmedAppointment && (
            <StepConfirmation
              appointment={confirmedAppointment}
              onReset={handleReset}
            />
          )}
        </div>
    </div>
  );
};
