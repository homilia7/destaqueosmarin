import { useState, useEffect, useCallback, useRef } from 'react';
import { Expense } from '../types/appointment';
import { api } from '../services/api';

const EXPENSES_STORAGE_KEY = 'destaqueos_expenses_history';

export function useExpenses(isPollingActive = true) {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchExpenses = useCallback(async (isBackground = false) => {
    if (isFetchingRef.current) return;
    if (!isBackground) setLoading(true);
    isFetchingRef.current = true;

    try {
      const data = await api.getExpenses();
      if (Array.isArray(data)) {
        setExpenses(data);
        try {
          localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Error fetching expenses:', err);
    } finally {
      isFetchingRef.current = false;
      if (!isBackground) setLoading(false);
    }
  }, []);

  const createExpense = async (data: Omit<Expense, 'id'> & { id?: string }): Promise<Expense | null> => {
    try {
      const newExp: Expense = {
        id: data.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: data.date,
        category: data.category,
        description: data.description,
        amount: Number(data.amount || 0),
        receipt_url: data.receipt_url || null,
        created_at: new Date().toISOString()
      };

      setExpenses((prev) => [newExp, ...prev.filter((e) => e.id !== newExp.id)]);
      const saved = await api.saveExpense(newExp);
      return saved;
    } catch (e) {
      console.warn('Error creating expense:', e);
      return null;
    }
  };

  const removeExpense = async (id: string): Promise<boolean> => {
    try {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return await api.deleteExpense(id);
    } catch (e) {
      console.warn('Error deleting expense:', e);
      return false;
    }
  };

  // Polling inteligente con detección de visibilidad
  useEffect(() => {
    fetchExpenses(false);

    if (!isPollingActive) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          fetchExpenses(true);
        }
      }, 30000);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchExpenses(true);
        startPolling();
      } else if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchExpenses, isPollingActive]);

  return {
    expenses,
    loading,
    refreshExpenses: fetchExpenses,
    createExpense,
    removeExpense
  };
}
