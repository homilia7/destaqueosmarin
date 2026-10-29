import { useState } from 'react';
import { api } from '../services/api';

const AUTH_KEY = 'legacy_admin_token';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'authenticated' || localStorage.getItem(AUTH_KEY) === 'authenticated';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (usernameOrPin: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const pinToVerify = password ? password.trim() : usernameOrPin.trim();
      const isValid = await api.verifyAdminPin(pinToVerify);
      if (isValid) {
        sessionStorage.setItem(AUTH_KEY, 'authenticated');
        localStorage.setItem(AUTH_KEY, 'authenticated');
        setIsAuthenticated(true);
        return true;
      } else {
        setError('Usuario o contraseña / PIN incorrectos.');
        return false;
      }
    } catch {
      setError('Error al verificar las credenciales de acceso.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };
}
