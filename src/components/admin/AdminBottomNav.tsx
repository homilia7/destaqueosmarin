import React from 'react';
import { Navigation, Calendar, Clock, Settings, FileText, BarChart3, Wallet } from 'lucide-react';

export type AdminTab = 'route' | 'all' | 'income' | 'quotes' | 'traffic' | 'schedule' | 'settings' | 'reviews';

interface AdminBottomNavProps {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  todayCount: number;
  pendingCount: number;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  activeTab,
  onChangeTab,
  todayCount,
  pendingCount
}) => {
  const tabs = [
    {
      id: 'route' as AdminTab,
      label: 'Ruta Hoy',
      icon: Navigation,
      badge: todayCount > 0 ? todayCount : null,
      badgeColor: 'bg-brand-orange text-white'
    },
    {
      id: 'all' as AdminTab,
      label: 'Citas',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'income' as AdminTab,
      label: 'Ingresos',
      icon: Wallet,
      badge: null
    },
    {
      id: 'quotes' as AdminTab,
      label: 'Cotizador',
      icon: FileText,
      badge: null
    },
    {
      id: 'schedule' as AdminTab,
      label: 'Horarios',
      icon: Clock,
      badge: null
    },
    {
      id: 'settings' as AdminTab,
      label: 'Ajustes',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'text-brand-blue font-extrabold scale-105'
                  : 'text-slate-500 hover:text-brand-dark font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-brand-ice text-brand-blue shadow-sm' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>

                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[10px] font-black rounded-full flex items-center justify-center shadow-sm ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-extrabold text-brand-blue' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
