import { useState, useEffect } from 'react';
import type { EmergencyOrder, OrderStatus } from '../types/order';

const STORAGE_KEY = 'destaqueos_orders_v1';

const INITIAL_ORDERS: EmergencyOrder[] = [
  {
    id: 'ORD-101',
    createdAt: new Date().toISOString(),
    customerName: 'Carlos Solís Brenes',
    customerPhone: '8845-9210',
    serviceType: 'tanque_septico',
    urgencyLevel: 'inmediato',
    status: 'en_camino',
    source: 'google_ads',
    location: {
      latitude: 9.9354,
      longitude: -84.1039,
      addressText: 'San Rafael, Escazú, San José',
      landmarks: '200 metros norte del Costa Rica Country Club, casa portón verde',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=9.9354,-84.1039',
      wazeUrl: 'https://waze.com/ul?ll=9.9354,-84.1039&navigate=yes',
    },
    notes: 'Tanque séptico rebalsado con mal olor en patio',
    estimatedAmount: 85000,
    paymentMethod: 'sinpe',
  },
  {
    id: 'ORD-102',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    customerName: 'Soda La Criolla (Doña Marta)',
    customerPhone: '8712-4455',
    serviceType: 'trampa_grasa',
    urgencyLevel: 'hoy_mismo',
    status: 'pendiente',
    source: 'google_ads',
    location: {
      latitude: 9.9981,
      longitude: -84.2141,
      addressText: 'Alajuela Centro, costado sur del Mercado',
      landmarks: 'Frente a Farmacia Sucre',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=9.9981,-84.2141',
      wazeUrl: 'https://waze.com/ul?ll=9.9981,-84.2141&navigate=yes',
    },
    notes: 'Trampa de grasa de cocina obstruida antes del almuerzo',
    estimatedAmount: 50000,
    paymentMethod: 'efectivo',
  },
];

export function useOrders() {
  const [orders, setOrders] = useState<EmergencyOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (newOrder: Omit<EmergencyOrder, 'id' | 'createdAt'>) => {
    const order: EmergencyOrder = {
      ...newOrder,
      id: `ORD-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status } : ord))
    );
  };

  const removeOrder = (id: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== id));
  };

  return {
    orders,
    addOrder,
    updateOrderStatus,
    removeOrder,
  };
}
