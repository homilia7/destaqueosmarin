export type PaymentType = 'sinpe' | 'efectivo';
export type ExpenseCategory = 'combustible' | 'planta_descarga' | 'peajes' | 'mantenimiento_camion' | 'otros';

export interface IncomeTransaction {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  serviceDescription: string;
  amount: number;
  paymentType: PaymentType;
  sinpeReference?: string;
  sinpeVerified: boolean;
  notes?: string;
}

export interface ExpenseTransaction {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  notes: string;
}

export interface DailyBalance {
  totalSinpe: number;
  totalCash: number;
  totalGrossIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalJobs: number;
}
