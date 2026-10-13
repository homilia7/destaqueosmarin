import React, { useState } from 'react';
import { useFinances } from '../../hooks/useFinances';
import { Wallet, CheckCircle, ShieldAlert, Plus, Fuel, Trash2, ArrowUpRight, Download } from 'lucide-react';
import type { PaymentType, ExpenseCategory } from '../../types/finance';

export const CashierPanel: React.FC = () => {
  const { incomes, balance, addIncome, addExpense, toggleVerifySinpe, deleteIncome } = useFinances();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('sinpe');
  const [sinpeRef, setSinpeRef] = useState('');
  const [description, setDescription] = useState('Destaqueo de tuberías');

  // Gasto
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('combustible');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const handleExportCashierCSV = () => {
    const headers = 'ID,Fecha,Cliente,Telefono,Descripcion,MontoCRC,Metodo,ReferenciaSINPE,Verificado\n';
    const rows = incomes.map((inc) =>
      `"${inc.id}","${inc.date}","${inc.customerName}","${inc.customerPhone}","${inc.serviceDescription}",${inc.amount},"${inc.paymentType}","${inc.sinpeReference || ''}","${inc.sinpeVerified ? 'SI' : 'NO'}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cierre_caja_mauricio_marin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount) return;

    addIncome({
      date: new Date().toISOString().split('T')[0],
      customerName,
      customerPhone: customerPhone || 'Sin teléfono',
      serviceDescription: description,
      amount: Number(amount),
      paymentType,
      sinpeReference: sinpeRef || undefined,
      sinpeVerified: paymentType === 'sinpe' ? false : true,
    });

    setCustomerName('');
    setAmount('');
    setSinpeRef('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;

    addExpense({
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      amount: Number(expAmount),
      notes: expNotes || 'Gasto operativo',
    });

    setExpAmount('');
    setExpNotes('');
  };

  const formatCRC = (val: number) => `₡${val.toLocaleString('es-CR')}`;

  return (
    <div className="space-y-6">
      {/* Resumen de Caja */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-blue-600" /> Ingresos SINPE Móvil
          </p>
          <p className="text-lg sm:text-xl font-black text-blue-600 mt-1">{formatCRC(balance.totalSinpe)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Ingresos Efectivo
          </p>
          <p className="text-lg sm:text-xl font-black text-emerald-600 mt-1">{formatCRC(balance.totalCash)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-red-600" /> Gastos del Camión
          </p>
          <p className="text-lg sm:text-xl font-black text-red-600 mt-1">{formatCRC(balance.totalExpenses)}</p>
        </div>

        <div className="bg-emerald-500 text-slate-950 p-4 rounded-2xl shadow-md">
          <p className="text-xs font-black uppercase tracking-wider text-slate-900">Ganancia Neta Hoy</p>
          <p className="text-lg sm:text-2xl font-black mt-1">{formatCRC(balance.netProfit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Cobro */}
        <form onSubmit={handleAddIncome} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Registrar Nuevo Cobro
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre del Cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <input
              type="number"
              placeholder="Monto en Colones (₡)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="tel"
              placeholder="Teléfono (Opcional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <input
              type="text"
              placeholder="Detalle de Servicio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
            >
              <option value="sinpe">Pago por SINPE Móvil</option>
              <option value="efectivo">Pago en Efectivo</option>
            </select>
            {paymentType === 'sinpe' && (
              <input
                type="text"
                placeholder="N° Comprobante SINPE"
                value={sinpeRef}
                onChange={(e) => setSinpeRef(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Guardar Cobro en Caja
          </button>
        </form>

        {/* Formulario de Gastos */}
        <form onSubmit={handleAddExpense} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-red-600" /> Registrar Gasto Operativo (Diesel/Ruta)
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
            >
              <option value="combustible">Combustible / Diesel</option>
              <option value="planta_descarga">Planta de Descarga / Lodos</option>
              <option value="peajes">Peajes</option>
              <option value="mantenimiento_camion">Mantenimiento Camión</option>
            </select>
            <input
              type="number"
              placeholder="Monto Gasto (₡)"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <input
            type="text"
            placeholder="Detalle (Ej. Bomba Delta 40 litros)"
            value={expNotes}
            onChange={(e) => setExpNotes(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Registrar Gasto
          </button>
        </form>
      </div>

      {/* Tabla de cobros con validador SINPE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-700">Movimientos Registrados Hoy</span>
          <button
            onClick={handleExportCashierCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-300 transition-colors cursor-pointer"
            title="Descargar cierre de caja en formato CSV para Excel"
          >
            <Download className="w-3 h-3 text-slate-600" />
            <span>Exportar Cierre CSV</span>
          </button>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {incomes.map((inc) => (
            <div key={inc.id} className="p-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{inc.customerName}</p>
                <p className="text-slate-500 text-[11px]">{inc.serviceDescription}</p>
                {inc.sinpeReference && (
                  <span className="font-mono text-[10px] text-blue-600 font-semibold">
                    Comprobante: {inc.sinpeReference}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-slate-900">{formatCRC(inc.amount)}</span>
                {inc.paymentType === 'sinpe' ? (
                  <button
                    onClick={() => toggleVerifySinpe(inc.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                      inc.sinpeVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.sinpeVerified ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {inc.sinpeVerified ? 'Verificado en Banco' : 'Pendiente Verificar'}
                  </button>
                ) : (
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                    Efectivo
                  </span>
                )}
                <button onClick={() => deleteIncome(inc.id)} className="text-slate-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
