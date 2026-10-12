import { useState, useEffect, useMemo } from 'react';
import type { ClientRecord, ClientReminder } from '../types/client';

const CLIENTS_KEY = 'destaqueos_clients_v1';

const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: 'CLI-01',
    fullName: 'Restaurante El Fogón Tico',
    phone: '8888-2345',
    cantonDistrict: 'Heredia Centro',
    exactAddress: '150m este del Palacio de los Deportes',
    serviceType: 'trampa_grasa',
    source: 'google_ads',
    lastServiceDate: '2026-04-10', // hace ~6 meses
    recommendedCycleMonths: 6,
    notes: 'Trampa de 500 litros de acero inox',
    totalSpent: 90000,
  },
  {
    id: 'CLI-02',
    fullName: 'Familia Ramírez Calderón',
    phone: '8701-9988',
    cantonDistrict: 'Cartago, Taras',
    exactAddress: 'Entrada a San Nicolás, casa #45',
    serviceType: 'tanque_septico',
    source: 'google_ads',
    lastServiceDate: '2025-10-15', // hace ~12 meses
    recommendedCycleMonths: 12,
    notes: 'Tanque residencial doble cámara',
    totalSpent: 85000,
  },
  {
    id: 'CLI-03',
    fullName: 'Condominio Bella Vista',
    phone: '8654-3210',
    cantonDistrict: 'Santa Ana, Pozos',
    exactAddress: 'Calle vieja a Santa Ana, km 3',
    serviceType: 'tanque_septico',
    source: 'organico',
    lastServiceDate: '2026-08-01', // hace 2 meses (al día)
    recommendedCycleMonths: 12,
    notes: 'Tanque comunal',
    totalSpent: 160000,
  },
];

export function useClients() {
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    const saved = localStorage.getItem(CLIENTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  useEffect(() => {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }, [clients]);

  const addClient = (newCli: Omit<ClientRecord, 'id'>) => {
    const client: ClientRecord = {
      ...newCli,
      id: `CLI-${Date.now().toString().slice(-4)}`,
    };
    setClients((prev) => [client, ...prev]);
  };

  const reminders = useMemo<ClientReminder[]>(() => {
    const now = new Date();
    return clients.map((client) => {
      const lastDate = new Date(client.lastServiceDate);
      const diffMs = now.getTime() - lastDate.getTime();
      const monthsElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375));
      const isDue = monthsElapsed >= client.recommendedCycleMonths;

      const dueDate = new Date(lastDate);
      dueDate.setMonth(dueDate.getMonth() + client.recommendedCycleMonths);

      const serviceName = client.serviceType === 'tanque_septico' ? 'tanque séptico' : 'trampa de grasa';
      const msg = `Hola estimado/a ${client.fullName}, le saluda Mauricio Marín de Destaqueos y Tanques Sépticos (Tel: 6114-1421).
Le recordamos que ya se cumplieron ${monthsElapsed} meses desde su última limpieza de ${serviceName}.
Para evitar desbordamientos, malos olores o emergencias costosas, le recomendamos agendar su mantenimiento preventivo con precio especial para clientes frecuentes. ¿Le gustaría coordinar una visita esta semana?`;

      return {
        client,
        monthsElapsed,
        isDue,
        dueDate: dueDate.toISOString().split('T')[0],
        recommendedAction: isDue ? '¡Mantenimiento Vencido!' : 'Al día',
        prefilledWhatsAppMessage: encodeURIComponent(msg),
      };
    });
  }, [clients]);

  return {
    clients,
    reminders,
    addClient,
  };
}
