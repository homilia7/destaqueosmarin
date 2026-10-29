import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AnimatedEagleLogo } from '../common/AnimatedEagleLogo';

interface AdminLoginProps {
  onLogin: (username: string, password?: string) => Promise<boolean>;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  onClose,
  isLoading,
  error
}) => {
  const [mode, setMode] = useState<'credentials' | 'pin'>('credentials');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onLogin(username.trim(), password.trim());
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        onLogin('admin', nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
      {/* Barra Superior con Botón Volver */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Sitio Web</span>
        </button>

        <span className="text-[11px] font-bold text-slate-400 font-mono">
          /detec/panel
        </span>
      </div>

      {/* Tarjeta Central de Login */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
          
          {/* Logo y Título */}
          <div className="text-center space-y-2">
            <AnimatedEagleLogo className="w-14 h-14 rounded-2xl mx-auto shadow-md" />
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
              Panel Administrativo
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Acceso exclusivo para administración y técnicos en ruta
            </p>
          </div>

          {/* Selector de Modo: Usuario/Contraseña vs PIN Rápido */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => setMode('credentials')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'credentials'
                  ? 'bg-white text-brand-dark shadow-xs'
                  : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              Usuario y Contraseña
            </button>
            <button
              type="button"
              onClick={() => setMode('pin')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'pin'
                  ? 'bg-white text-brand-dark shadow-xs'
                  : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              PIN Rápido (4 dígitos)
            </button>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario de Usuario y Contraseña */}
          {mode === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 text-sm font-semibold text-brand-dark outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 text-sm font-semibold text-brand-dark outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-lightBlue disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Iniciar Sesión en el Panel</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Modo Teclado Numérico PIN */
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                      pin.length > idx
                        ? 'border-brand-blue bg-brand-ice text-brand-blue shadow-sm'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    {pin.length > idx ? '●' : ''}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      if (k === 'C') setPin('');
                      else if (k === '⌫') handleBackspace();
                      else handleKeyPress(k);
                    }}
                    className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-brand-blue active:text-white text-base font-extrabold text-brand-dark border border-slate-200 shadow-xs transition-all"
                  >
                    {k}
                  </button>
                ))}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-blue py-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando PIN...</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Pie de página sutil */}
      <div className="text-center py-2 text-[11px] text-slate-400 font-semibold">
        Legacy Detección de Fugas • Sistema de Gestión Móvil
      </div>
    </div>
  );
};
