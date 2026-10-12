export type ServiceType = 
  | 'destaqueo' 
  | 'tanque_septico' 
  | 'trampa_grasa' 
  | 'drenajes';

export interface ServiceItem {
  id: ServiceType;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  basePriceEstimate: string;
  iconName: string;
}

export const AVAILABLE_SERVICES: ServiceItem[] = [
  {
    id: 'destaqueo',
    title: 'Destaqueo de Tuberías',
    tagline: 'Sondas eléctricas y rotativas de alta potencia',
    description: 'Solución inmediata para inodoros, fregaderos, lavamanos y tuberías principales sin romper pisos.',
    badge: 'Urgencia 24/7',
    basePriceEstimate: 'Desde ₡35.000',
    iconName: 'Wrench',
  },
  {
    id: 'tanque_septico',
    title: 'Limpieza de Tanques Sépticos',
    tagline: 'Camión cisterna de alto vacío propio',
    description: 'Evacuación completa de lodos y residuos líquidos. Disposición final en plantas autorizadas.',
    badge: 'Camión Cisterna',
    basePriceEstimate: 'Desde ₡75.000',
    iconName: 'Truck',
  },
  {
    id: 'trampa_grasa',
    title: 'Limpieza de Trampas de Grasa',
    tagline: 'Comercios, restaurantes y sodas',
    description: 'Mantenimiento preventivo y correctivo con certificado de limpieza para permisos de salud.',
    badge: 'Comercial & Pymes',
    basePriceEstimate: 'Desde ₡45.000',
    iconName: 'Utensils',
  },
  {
    id: 'drenajes',
    title: 'Construcción y Reparación de Drenajes',
    tagline: 'Ingeniería y soluciones definitivas',
    description: 'Campos de infiltración, pozos de absorción y tuberías de drenaje pluvial y sanitario.',
    badge: 'Garantía Total',
    basePriceEstimate: 'Cotización en sitio',
    iconName: 'Shovel',
  },
];
