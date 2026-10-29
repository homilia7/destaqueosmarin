import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Wrench, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { DEFAULT_SERVICES, ServiceItem } from '../../types/appointment';

interface ServiceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  clientName: string;
  currentServiceType: string;
  onSaveService: (appointmentId: string, newServiceType: string) => Promise<void>;
}

export const ServiceEditorModal: React.FC<ServiceEditorModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  clientName,
  currentServiceType,
  onSaveService
}) => {
  const [catalogServices, setCatalogServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Inicializar servicios seleccionados al abrir
  useEffect(() => {
    if (!isOpen) return;

    // Cargar catálogo de servicios desde la API
    api.getServices().then((srvs) => {
      if (srvs && srvs.length > 0) setCatalogServices(srvs);
    });

    // Dividir si ya viene combinado con " + "
    if (currentServiceType) {
      const parts = currentServiceType.split(' + ').map((s) => s.trim()).filter(Boolean);
      setSelectedServices(parts.length > 0 ? parts : [currentServiceType]);
    } else {
      setSelectedServices([]);
    }
  }, [isOpen, currentServiceType]);

  if (!isOpen) return null;

  const toggleService = (title: string) => {
    setSelectedServices((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customServiceInput.trim();
    if (!clean) return;
    if (!selectedServices.includes(clean)) {
      setSelectedServices((prev) => [...prev, clean]);
    }
    setCustomServiceInput('');
  };

  const handleSave = async () => {
    if (selectedServices.length === 0) {
      alert('Debes seleccionar al menos un servicio.');
      return;
    }
    setSaving(true);
    const combined = selectedServices.join(' + ');
    try {
      await onSaveService(appointmentId, combined);
      onClose();
    } catch (err) {
      alert('Error al actualizar los servicios de la cita.');
      console.warn(err);
    } finally {
      setSaving(false);
    }
  };

  const combinedPreview = selectedServices.length > 0
    ? selectedServices.join(' + ')
    : '(Ningún servicio seleccionado)';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] flex flex-col shadow-2xl border border-slate-100">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-ice text-brand-blue flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-dark leading-tight">
                Cambiar o Agregar Servicios
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                Cita de: <strong className="text-brand-dark">{clientName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          
          {/* Instrucción */}
          <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200/60 text-xs text-blue-900 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
              <span>Múltiples servicios permitidos</span>
            </p>
            Puedes marcar uno o varios servicios para el cliente. Los servicios seleccionados se sincronizan en la cita y se incluirán en el mensaje de confirmación de WhatsApp.
          </div>

          {/* Catálogo de Servicios Disponibles */}
          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
              Seleccionar del Catálogo
            </label>
            <div className="space-y-2">
              {catalogServices.map((srv) => {
                const isSelected = selectedServices.includes(srv.title);
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => toggleService(srv.title)}
                    className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-white text-brand-dark border-slate-200 hover:border-brand-blue/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span>{srv.title}</span>
                        {srv.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-brand-ice text-brand-blue'
                          }`}>
                            {srv.badge}
                          </span>
                        )}
                      </div>
                      {srv.description && (
                        <p className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {srv.description}
                        </p>
                      )}
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white text-brand-blue border-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agregar Servicio Personalizado Extra */}
          <div className="pt-1">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              + Agregar Otro Servicio Personalizado
            </label>
            <form onSubmit={handleAddCustom} className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. Inspección de Tanque, Reparación de Tubo..."
                value={customServiceInput}
                onChange={(e) => setCustomServiceInput(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
              <button
                type="submit"
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-black transition-all flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </form>
          </div>

          {/* Vista Previa de Servicios Combinados */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Vista Previa en Cita y WhatsApp:
            </span>
            <p className="text-xs font-extrabold text-brand-blue leading-snug break-words">
              {combinedPreview}
            </p>
          </div>

        </div>

        {/* Botones de Acción */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selectedServices.length === 0}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-brand-orange hover:bg-brand-orangeHover shadow-glow-orange disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Servicios'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
