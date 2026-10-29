import React, { useState } from 'react';
import { Download, Bell, Volume2, LogOut, ShieldCheck, Database, Smartphone, ChevronDown, ChevronUp, CheckCircle2, Share2, MoreVertical } from 'lucide-react';
import { StorageManager } from './StorageManager';
import { ServicesCatalogManager } from './ServicesCatalogManager';
import { playNotificationChime } from '../../utils/soundAlert';
import { Appointment } from '../../types/appointment';

interface AdminSettingsTabProps {
  onLogout: () => void;
  onInstallPWA?: () => void;
  onRequestNotifications?: () => void;
  isInstallable?: boolean;
  notificationsGranted?: boolean;
  appointments?: Appointment[];
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  onLogout,
  onInstallPWA,
  onRequestNotifications,
  isInstallable = false,
  notificationsGranted = false,
  appointments = []
}) => {
  const [isAppAccordionOpen, setIsAppAccordionOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* 1. Botón Acordeón Exclusivo para Administrador: Instalar App en Celular */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsAppAccordionOpen(!isAppAccordionOpen)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-ice text-brand-blue flex items-center justify-center shrink-0 shadow-sm border border-brand-iceBorder">
              <Smartphone className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-brand-dark">Instalar Aplicación en el Celular</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-brand-blue border border-blue-200">
                  Solo Administrador
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Acceso directo sin barra de navegador, alertas sonoras y gestión en calle
              </p>
            </div>
          </div>

          <div className="p-1 rounded-xl text-slate-400">
            {isAppAccordionOpen ? (
              <ChevronUp className="w-5 h-5 text-brand-blue" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Contenido Desplegable del Acordeón */}
        {isAppAccordionOpen && (
          <div className="p-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40 animate-fadeIn">
            
            {/* Botón de Instalación Directa si el navegador lo permite */}
            {isInstallable && onInstallPWA && (
              <button
                type="button"
                onClick={onInstallPWA}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-brand-blue hover:bg-brand-lightBlue text-white text-sm font-black shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar App en este Celular Ahora</span>
              </button>
            )}

            {/* Guía Paso a Paso para Android y iPhone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Android Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-brand-dark font-extrabold pb-1 border-b border-slate-100">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Para Celulares Android (Chrome)</span>
                </div>
                <ol className="space-y-1.5 text-slate-600 font-medium list-decimal list-inside">
                  <li>Toca los tres puntos (<MoreVertical className="w-3 h-3 inline text-slate-400" />) arriba a la derecha.</li>
                  <li>Selecciona <strong className="text-brand-dark">"Instalar aplicación"</strong> o <strong className="text-brand-dark">"Agregar a pantalla principal"</strong>.</li>
                  <li>Pulsa <strong className="text-brand-dark">"Instalar"</strong> y el ícono de Legacy Royality se agregará a tus apps.</li>
                </ol>
              </div>

              {/* iPhone Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-brand-dark font-extrabold pb-1 border-b border-slate-100">
                  <Share2 className="w-4 h-4 text-brand-blue" />
                  <span>Para iPhone / iPad (Safari)</span>
                </div>
                <ol className="space-y-1.5 text-slate-600 font-medium list-decimal list-inside">
                  <li>Abre este panel en el navegador <strong className="text-brand-dark">Safari</strong>.</li>
                  <li>Toca el botón <strong className="text-brand-dark">Compartir</strong> (ícono de cuadro con flecha hacia arriba ⬆️ en la barra inferior).</li>
                  <li>Desliza hacia abajo y presiona <strong className="text-brand-dark">"Agregar al inicio"</strong>.</li>
                  <li>Toca <strong className="text-brand-dark">"Agregar"</strong> arriba a la derecha.</li>
                </ol>
              </div>

            </div>

            {/* Activar Notificaciones y Probar Sonido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {onRequestNotifications && (
                <button
                  type="button"
                  onClick={onRequestNotifications}
                  disabled={notificationsGranted}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${
                    notificationsGranted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 cursor-pointer'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    {notificationsGranted
                      ? '✓ Notificaciones Push Activas'
                      : 'Activar Alertas al Celular'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => playNotificationChime()}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-brand-orange" />
                <span>Probar Sonido de Notificación</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* 2. Catálogo Oficial de Servicios (Agregar / Modificar Servicios) */}
      <ServicesCatalogManager />

      {/* 3. Gestor de Limpieza y Almacenamiento */}
      <StorageManager appointments={appointments} />

      {/* 4. Cerrar Sesión */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-extrabold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión del Panel</span>
        </button>
      </div>
    </div>
  );
};
