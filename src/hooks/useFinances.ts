import { useState, useEffect, useMemo } from 'react';
import type { IncomeTransaction, ExpenseTransaction, DailyBalance } from '../types/finance';

const INCOMES_KEY = 'destaqueos_incomes_v1';
const EXPENSES_KEY = 'destaqueos_expenses_v1';

const INITIAL_INCOMES: IncomeTransaction[] = [
  {
    id: 'INC-201',
    date: new Date().toISOString().split('T')[0],
    customerName: 'Manuel Chaves Rojas',
    customerPhone: '8390-1122',
    serviceDescription: 'Destaqueo de tubería principal con máquina rotativa',
    amount: 45000,
    paymentType: 'sinpe',
    sinpeReference: 'REF-789214',
    sinpeVerified: true,
  },
  {
    id: 'INC-202',
    date: new Date().toISOString().split('T')[0],
    customerName: 'Maritza Fonseca (Condominio Roble)',
    customerPhone: '8910-5566',
    serviceDescription: 'Limpieza de tanque séptico cisterna',
    amount: 80000,
    paymentType: 'efectivo',
    sinpeVerified: false,
  },
];

const INITIAL_EXPENSES: ExpenseTransaction[] = [
  {
    id: 'EXP-101',
    date: new Date().toISOString().split('T')[0],
    category: 'combustible',
    amount: 25000,
    notes: 'Diesel camión bomba bomba Delta',
  },
];

export function useFinances() {
  const [incomes, setIncomes] = useState<IncomeTransaction[]>(() => {
    const saved = localStorage.getItem(INCOMES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_INCOMES;
  });

  const [expenses, setExpenses] = useState<ExpenseTransaction[]>(() => {
    const saved = localStorage.getItem(EXPENSES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  useEffect(() => {
    localStorage.setItem(INCOMES_KEY, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addIncome = (newInc: Omit<IncomeTransaction, 'id'>) => {
    const income: IncomeTransaction = {
      ...newInc,
      id: `INC-${Date.now().toString().slice(-4)}`,
    };
    setIncomes((prev) => [income, ...prev]);
  };

  const addExpense = (newExp: Omit<ExpenseTransaction, 'id'>) => {
    const expense: ExpenseTransaction = {
      ...newExp,
      id: `EXP-${Date.now().toString().slice(-4)}`,
    };
    setExpenses((prev) => [expense, ...prev]);
  };

  const toggleVerifySinpe = (id: string) => {
    setIncomes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, sinpeVerified: !i.sinpeVerified } : i))
    );
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const balance: DailyBalance = useMemo(() => {
    const totalSinpe = incomes
      .filter((i) => i.paymentType === 'sinpe')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalCash = incomes
      .filter((i) => i.paymentType === 'efectivo')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalGrossIncome = totalSinpe + totalCash;
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalGrossIncome - totalExpenses;

    return {
      totalSinpe,
      totalCash,
      totalGrossIncome,
      totalExpenses,
      netProfit,
      totalJobs: incomes.length,
    };
  }, [incomes, expenses]);

  return {
    incomes,
    expenses,
    balance,
    addIncome,
    addExpense,
    toggleVerifySinpe,
    deleteIncome,
  };
}
