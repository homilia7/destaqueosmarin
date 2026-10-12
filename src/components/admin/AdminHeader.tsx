import React, { useState, useRef, useEffect } from 'react';
import { Radio, Wallet, Users, Compass, ArrowLeft, Truck, BarChart3, ChevronDown, Check } from 'lucide-react';

export type AdminTab = 'radar' | 'caja' | 'crm' | 'analitica_ads' | 'google_ads';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  pendingOrdersCount: number;
  dueRemindersCount: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onSelectTab,
  onExitAdmin,
  pendingOrdersCount,
  dueRemindersCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'radar' as AdminTab, label: 'Radar de Emergencias', icon: Radio, count: pendingOrdersCount, badgeColor: 'bg-red-600 text-white' },
    { id: 'caja' as AdminTab, label: 'Caja SINPE & Efectivo', icon: Wallet },
    { id: 'crm' as AdminTab, label: 'CRM & Recordatorios', icon: Users, count: dueRemindersCount, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'analitica_ads' as AdminTab, label: 'Métricas & Clics Ads', icon: BarChart3 },
    { id: 'google_ads' as AdminTab, label: 'Guía Google Ads & Maps', icon: Compass },
  ];

  const currentItem = menuItems.find((item) => item.id === activeTab) || menuItems[0];
  const CurrentIcon = currentItem.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Web Cliente</span>
            </button>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black text-white m-0">
                Panel Operativo • Mauricio Marín
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Camión Cisterna Activo
            </span>
          </div>
        </div>

        {/* Selector Desplegable del Menú Admin */}
        <div className="relative pt-3" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full sm:w-auto min-w-[280px] flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl border border-slate-700 shadow-md transition-all cursor-pointer font-bold text-sm"
            >
              <div className="flex items-center gap-2.5">
                <CurrentIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{currentItem.label}</span>
                {currentItem.count !== undefined && currentItem.count > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${currentItem.badgeColor}`}>
                    {currentItem.count}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <span className="hidden sm:inline text-xs text-slate-400">
              Módulo activo: <b className="text-emerald-400">{currentItem.label}</b>
            </span>
          </div>

          {/* Menú Desplegable Flotante */}
          {isOpen && (
            <div className="absolute left-0 right-0 sm:right-auto sm:w-80 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Seleccionar Sección del Panel
              </div>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = item.id === activeTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${item.badgeColor}`}>
                          {item.count}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
