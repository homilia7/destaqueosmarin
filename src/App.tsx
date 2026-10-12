import { useState } from 'react';
import type { ServiceType } from './types/service';
import type { EmergencyOrder } from './types/order';
import { EmergencyHeader } from './components/landing/EmergencyHeader';
import { EmergencyHero } from './components/landing/EmergencyHero';
import { ServiceCards } from './components/landing/ServiceCards';
import { UberLocationPicker } from './components/landing/UberLocationPicker';
import { TrustSection } from './components/landing/TrustSection';
import { AdminHeader } from './components/admin/AdminHeader';
import type { AdminTab } from './components/admin/AdminHeader';
import { LiveRadarOrders } from './components/admin/LiveRadarOrders';
import { CashierPanel } from './components/admin/CashierPanel';
import { ClientCRM } from './components/admin/ClientCRM';
import { GoogleAdsGuide } from './components/admin/GoogleAdsGuide';
import { AdsAnalyticsView } from './components/admin/AdsAnalyticsView';
import { DigitalReceiptModal } from './components/admin/DigitalReceiptModal';
import { useOrders } from './hooks/useOrders';
import { useClients } from './hooks/useClients';
import { Shield } from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'admin'>('landing');
  const [selectedService, setSelectedService] = useState<ServiceType>('tanque_septico');
  const [adminTab, setAdminTab] = useState<AdminTab>('radar');
  const [receiptOrder, setReceiptOrder] = useState<EmergencyOrder | null>(null);

  const { orders } = useOrders();
  const { reminders } = useClients();

  const pendingCount = orders.filter((o) => o.status === 'pendiente' || o.status === 'en_camino').length;
  const dueCount = reminders.filter((r) => r.isDue).length;

  const scrollToLocation = () => {
    const el = document.getElementById('uber-location-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {viewMode === 'landing' ? (
        <>
          <EmergencyHeader onOpenAdmin={() => setViewMode('admin')} />
          <main className="flex-1">
            <EmergencyHero onScrollToLocation={scrollToLocation} />
            <ServiceCards
              selectedService={selectedService}
              onSelectService={setSelectedService}
            />
            <UberLocationPicker selectedService={selectedService} />
          </main>
          <TrustSection />

          {/* Floating Switcher Bar */}
          <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => setViewMode('admin')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/90 hover:bg-slate-900 text-white rounded-full text-xs font-bold shadow-xl border border-slate-700 backdrop-blur-md transition-transform active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modo Técnico / Panel Mauricio</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="min-h-screen flex flex-col bg-slate-100">
          <AdminHeader
            activeTab={adminTab}
            onSelectTab={setAdminTab}
            onExitAdmin={() => setViewMode('landing')}
            pendingOrdersCount={pendingCount}
            dueRemindersCount={dueCount}
          />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
            {adminTab === 'radar' && (
              <LiveRadarOrders onOpenReceipt={(order) => setReceiptOrder(order)} />
            )}
            {adminTab === 'caja' && <CashierPanel />}
            {adminTab === 'crm' && <ClientCRM />}
            {adminTab === 'analitica_ads' && <AdsAnalyticsView />}
            {adminTab === 'google_ads' && <GoogleAdsGuide />}
          </main>
          {receiptOrder && (
            <DigitalReceiptModal
              order={receiptOrder}
              onClose={() => setReceiptOrder(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
