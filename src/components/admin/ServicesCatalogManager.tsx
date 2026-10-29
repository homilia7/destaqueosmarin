import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, CheckCircle2, Loader2, Edit3, DollarSign, Check } from 'lucide-react';
import { api } from '../../services/api';
import { DEFAULT_SERVICES, ServiceItem } from '../../types/appointment';

interface ServicesCatalogManagerProps {
  onServicesChanged?: () => void;
}

export const ServicesCatalogManager: React.FC<ServicesCatalogManagerProps> = ({
  onServicesChanged
}) => {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('45000');

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [priceSaving, setPriceSaving] = useState(false);
  const [successPriceId, setSuccessPriceId] = useState<string | null>(null);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      console.warn('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSaving(true);
    try {
      await api.createService({
        title: newTitle.trim(),
        badge: newBadge.trim() || 'Servicio Especial',
        description: newDesc.trim() || undefined,
        price: Number(newPrice) || 45000
      });
      setNewTitle('');
      setNewBadge('');
      setNewDesc('');
      setNewPrice('45000');
      setShowAddForm(false);
      await loadServices();
      if (onServicesChanged) onServicesChanged();
    } catch (err) {
      alert('Error al guardar el nuevo servicio.');
      console.warn(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrice = async (id: string) => {
    const parsedPrice = Number(tempPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) return;

    setPriceSaving(true);
    try {
      await api.updateServiceItem(id, { price: parsedPrice });
      setServices((prev) => prev.map((s) => s.id === id ? { ...s, price: parsedPrice } : s));
      setEditingPriceId(null);
      setSuccessPriceId(id);
      setTimeout(() => setSuccessPriceId(null), 3000);
      if (onServicesChanged) onServicesChanged();
    } catch (err) {
      alert('Error al actualizar el precio.');
      console.warn(err);
    } finally {
      setPriceSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar el servicio "${title}" del catálogo?`)) return;

    try {
      await api.deleteService(id);
      await loadServices();
      if (onServicesChanged) onServicesChanged();
    } catch (err) {
      alert('Error al eliminar servicio.');
      console.warn(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-ice text-brand-blue flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-brand-dark">Catálogo y Precios de Servicios</h3>
            <p className="text-[11px] text-slate-500">
              {services.length} servicios disponibles • Precios editables en tiempo real
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-brand-blue text-white hover:bg-brand-lightBlue transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cerrar' : 'Agregar Servicio'}</span>
        </button>
      </div>

      {/* Formulario de Nuevo Servicio */}
      {showAddForm && (
        <form onSubmit={handleCreateService} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-black text-brand-dark">
            <Plus className="w-3.5 h-3.5 text-brand-orange" />
            <span>Crear Nuevo Servicio con Precio</span>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Inspección con Cámara Térmica o Reparación de Fuga"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                Precio (₡) *
              </label>
              <input
                type="number"
                required
                placeholder="45000"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                Etiqueta / Badge
              </label>
              <input
                type="text"
                placeholder="Ej. Alta Precisión"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                Descripción Corta
              </label>
              <input
                type="text"
                placeholder="Diagnóstico no destructivo"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !newTitle.trim()}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-brand-orange hover:bg-brand-orangeHover shadow-glow-orange disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{saving ? 'Guardando...' : 'Guardar Servicio'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de Servicios con Precios Editables a la Par */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
            <span>Cargando catálogo de servicios...</span>
          </div>
        ) : services.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">No hay servicios registrados.</p>
        ) : (
          services.map((srv) => (
            <div
              key={srv.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-brand-dark text-sm">{srv.title}</span>
                  {srv.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-ice text-brand-blue border border-brand-iceBorder">
                      {srv.badge}
                    </span>
                  )}
                  {successPriceId === srv.id && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 animate-fadeIn">
                      ¡Precio Guardado!
                    </span>
                  )}
                </div>
                {srv.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">{srv.description}</p>
                )}
              </div>

              {/* Precio a la par y Botón de Edición Rápida */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {editingPriceId === srv.id ? (
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border-2 border-brand-blue shadow-xs">
                    <span className="font-black text-slate-400 text-xs pl-1">₡</span>
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="w-24 px-1.5 py-1 text-xs font-black text-brand-dark focus:outline-none"
                      placeholder="45000"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSavePrice(srv.id)}
                      disabled={priceSaving}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {priceSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      <span>Guardar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPriceId(null)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPriceId(srv.id);
                      setTempPrice(String(srv.price || 45000));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 transition-all cursor-pointer group/price"
                    title="Clic para cambiar el precio de este servicio"
                  >
                    <span className="text-xs font-black">
                      ₡{Number(srv.price || 45000).toLocaleString('es-CR')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold group-hover/price:underline flex items-center gap-0.5 ml-1">
                      <Edit3 className="w-3 h-3" />
                      <span>Cambiar Precio</span>
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(srv.id, srv.title)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Eliminar del catálogo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
