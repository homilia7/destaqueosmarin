import React from 'react';
import { Radio, Wallet, Users, Compass, ArrowLeft, Truck, BarChart3 } from 'lucide-react';

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
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors"
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

        {/* Tab navigation */}
        <nav className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => onSelectTab('radar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'radar'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Radar de Emergencias</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-600 text-white">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('caja')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'caja'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Caja SINPE & Efectivo</span>
          </button>

          <button
            onClick={() => onSelectTab('crm')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'crm'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>CRM & Recordatorios</span>
            {dueRemindersCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950">
                {dueRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('analitica_ads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'analitica_ads'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas & Clics Ads</span>
          </button>

          <button
            onClick={() => onSelectTab('google_ads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'google_ads'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Guía Google Ads</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
