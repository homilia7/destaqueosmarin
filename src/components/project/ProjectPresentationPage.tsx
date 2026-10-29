import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Edit3, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  FileText, 
  Share2, 
  Eye, 
  Clock, 
  BarChart3, 
  Calendar, 
  Star, 
  Cpu, 
  Smartphone, 
  Check, 
  X, 
  ChevronRight, 
  TrendingUp, 
  Award, 
  DollarSign,
  Layers,
  ShieldCheck,
  CheckSquare,
  BadgeCheck,
  Server,
  Boxes
} from 'lucide-react';
import { ProjectFeature, ProjectMetric, ProjectPresentationData } from '../../types/project';

const STORAGE_KEY = 'marin_project_presentation_data_v4';
const SHIELD_LOGO = '/camion-destaqueos.png';
const LOGO_DESTAQUEO = '/camion-destaqueos.png';

export interface DeliverableSummaryItem {
  id: string;
  pillar: string;
  title: string;
  tag: string;
  tagColor: string;
  summary: string;
  bullets: string[];
  actionPath?: string;
  actionText?: string;
}

export const DELIVERABLES_SUMMARY: DeliverableSummaryItem[] = [
  {
    id: 'del_1',
    pillar: '1. MOTOR COMERCIAL & CIERRE',
    title: 'Cotizador Formal Dinámico con Membrete y Firma Oficial',
    tag: 'Facturación Inmediata',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    summary: 'Generador de propuestas digitales en PDF con membrete corporativo, cálculo automático de materiales, mano de obra, IVA opcional y garantía por escrito.',
    bullets: [
      'Emisión formal de cotización en menos de 30 segundos',
      'Descarga directa en formato PDF listo para imprimir o enviar',
      'Erradica el regateo de precios proyectando máxima seriedad'
    ],
    actionPath: '/cotizador',
    actionText: 'Probar Cotizador'
  },
  {
    id: 'del_2',
    pillar: '1. MOTOR COMERCIAL & CIERRE',
    title: 'Previsualización Enriquecida Automática en WhatsApp (Open Graph)',
    tag: 'Apertura >95%',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    summary: 'Inyección dinámica de tarjeta visual oficial con el logotipo de Mauricio Marín y el monto cotizado al compartir el enlace en WhatsApp.',
    bullets: [
      'El cliente ve el monto oficial y tu logo antes de abrir el enlace',
      'Elimina enlaces sospechosos o textos genéricos que parecen spam',
      'Distinción visual inmediata sobre cualquier competidor tradicional'
    ],
    actionPath: '/cotizador',
    actionText: 'Ver Ejemplo'
  },
  {
    id: 'del_3',
    pillar: '1. MOTOR COMERCIAL & CIERRE',
    title: 'Radar Silencioso de Lectura y Descarga de Cotizaciones',
    tag: 'Ventaja Táctica',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    summary: 'Registro en tiempo real que te avisa cuándo el cliente abre la cotización y la fecha/hora exacta en que descargó el documento oficial.',
    bullets: [
      'Alerta inmediata en tu panel cuando el cliente revisa los precios',
      'Permite llamar para cerrar en el momento psicológico exacto',
      'Cero llamadas a ciegas o dudas sobre el interés del cliente'
    ],
    actionPath: '/cotizador',
    actionText: 'Ver Radar'
  },
  {
    id: 'del_4',
    pillar: '2. OPERACIÓN DIARIA & CONTROL',
    title: 'Bandeja Inteligente de "Cotizaciones por Enviar"',
    tag: 'Cero Pérdida de Dinero',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    summary: 'Buzón con contador visual para guardar cotizaciones borrador mientras estás en la calle y despacharlas por WhatsApp con un toque.',
    bullets: [
      'Cero dinero perdido por olvidos administrativos o notas en papel',
      'Cotiza en el vehículo o taller y envía a clientes en segundos',
      'Control total de propuestas pendientes para no descuidar ninguna'
    ],
    actionPath: '/cotizador',
    actionText: 'Ver Bandeja'
  },
  {
    id: 'del_5',
    pillar: '2. OPERACIÓN DIARIA & CONTROL',
    title: 'Hoja de Rutas del Día con Conexión a Waze y Maps en 1 Toque',
    tag: 'Eficiencia en Calle',
    tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    summary: 'Agenda organizada por turnos con botón de Waze directo, mapa interactivo GPS y registro de fotos de inspección técnica.',
    bullets: [
      'Navegación al domicilio del cliente con un solo clic en pantalla',
      'Reporte financiero diario y semanal de cobros realizados',
      'Historial completo de clientes, direcciones y fotografías técnicas'
    ],
    actionPath: '/detec/panel',
    actionText: 'Ver Rutas'
  },
  {
    id: 'del_6',
    pillar: '2. OPERACIÓN DIARIA & CONTROL',
    title: 'Registro Contable de Cobros (Sinpe Móvil, Efectivo, Tarjeta)',
    tag: 'Finanzas Claras',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    summary: 'Módulo contable integrado en cada cita para asentar el cobro exacto realizado, método de pago y estado de liquidación.',
    bullets: [
      'Control de ingresos diarios sin necesidad de cuadernos manuales',
      'Historial auditable de cobros por cada servicio realizado',
      'Desglose financiero transparente accesible desde el teléfono'
    ],
    actionPath: '/detec/panel',
    actionText: 'Ver Cobros'
  },
  {
    id: 'del_7',
    pillar: '3. CAPTACIÓN & REPUTACIÓN',
    title: 'Rastreador de Tráfico y Atribución Exacta (FB, IG, WA)',
    tag: 'Marketing de Alta Precisión',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    summary: 'Enlaces inteligentes (/fb, /ig, /wa) que rastrean el embudo: visitas, cotizaciones generadas y citas concretadas por cada canal.',
    bullets: [
      'Sabes con certeza matemática qué red social genera más dinero',
      'Filtros analíticos en vivo: semanales, quincenales y mensuales',
      'Cero inversión perdida en anuncios que no traen contratos reales'
    ],
    actionPath: '/detec/panel',
    actionText: 'Ver Analítica'
  },
  {
    id: 'del_8',
    pillar: '3. CAPTACIÓN & REPUTACIÓN',
    title: 'Agenda Interactiva Online 24/7 con Detección Visual',
    tag: 'Cero Fricción',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    summary: 'Formulario con guía visual inteligente y mapa GPS que guía al cliente paso a paso y despacha la cita técnica al WhatsApp de Mauricio.',
    bullets: [
      'Tus clientes nunca se pierden: validación visual clara de campos',
      'Aumento del 40% en reservas concretadas directamente en la web',
      'Recepción inmediata de los datos en WhatsApp listos para confirmar'
    ],
    actionPath: '/agenda',
    actionText: 'Abrir Agenda'
  },
  {
    id: 'del_9',
    pillar: '3. CAPTACIÓN & REPUTACIÓN',
    title: 'Muro de Reseñas Verificadas con Candado Anti-Fraude Telefónico',
    tag: 'Reputación Blindada',
    tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    summary: 'Portal de testimonios con validación cruzada: solo los números de teléfono con citas reales en Destaqueos Mauricio Marín pueden publicar opiniones.',
    bullets: [
      'Protección total contra comentarios falsos de competidores',
      'Prueba social auténtica con estrellas, fecha y tipo de trabajo',
      'Destruye las dudas del cliente antes de la primera llamada'
    ],
    actionPath: '/calificar',
    actionText: 'Ver Reseñas'
  },
  {
    id: 'del_10',
    pillar: '4. TECNOLOGÍA & PROPIEDAD',
    title: 'Nube Serverless Edge Distribuida (300+ Centros de Datos)',
    tag: 'Infraestructura Silicon Valley',
    tagColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    summary: 'Despliegue distribuido en Cloudflare Pages con base de datos SQL D1 de alta disponibilidad, carga en <0.5s y cifrado bancario HTTPS.',
    bullets: [
      'Cero costos mensuales fijos de hosting (ahorro de $20 a $50 al mes)',
      'Máxima velocidad de carga que posiciona a Mauricio Marín de primero en Google',
      'Inmune a caídas de servidores convencionales o ataques web'
    ],
    actionPath: '/',
    actionText: 'Ver Web'
  },
  {
    id: 'del_11',
    pillar: '4. TECNOLOGÍA & PROPIEDAD',
    title: 'Aplicación Web Progresiva (PWA Móvil Primero)',
    tag: 'Instalación en 1-Clic',
    tagColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    summary: 'Tecnología PWA instalable con icono directo en la pantalla del celular sin pagar licencias de App Store ni Play Store.',
    bullets: [
      'Acceso instantáneo desde el bolsillo para el técnico y clientes VIP',
      'Estrategia Network-First que siempre muestra datos frescos',
      'Presencia permanente en la pantalla de inicio del teléfono'
    ],
    actionPath: '/',
    actionText: 'Probar App'
  },
  {
    id: 'del_12',
    pillar: '4. TECNOLOGÍA & PROPIEDAD',
    title: '100% Propiedad del Código Fuente y Llave en Mano',
    tag: 'Activo Propio de Mauricio Marín',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    summary: 'Código propio en React, TypeScript y Tailwind CSS sin mensualidades de WordPress ni plugins de terceros que se desactualicen.',
    bullets: [
      'El software pertenece 100% a Mauricio Marín como activo de la empresa',
      'Sin costos recurrentes ni suscripciones de mantenimiento forzoso',
      'Entrega llave en mano verificada en producción lista para facturar'
    ],
    actionPath: '/proyecto',
    actionText: 'Propuesta'
  }
];

export const EXECUTIVE_CHECKLIST = [
  'Generador de Cotizaciones PDF Formales con membrete corporativo, cálculo automático de insumos, desglose de IVA y cláusulas de garantía.',
  'Tarjetas Open Graph Dinámicas para que cada cotización compartida en WhatsApp muestre el logotipo oficial y monto cotizado antes de abrirse.',
  'Radar de Visitas y Descargas que te notifica en vivo cuándo el cliente está leyendo la propuesta para llamarlo en el momento ideal.',
  'Bandeja de Cotizaciones Pendientes para guardar borradores en la calle y despacharlos en segundos sin perder clientes.',
  'Atribución de Redes Sociales con enlaces cortos (/fb, /ig, /wa) que miden visitas, cotizaciones y citas reales de cada canal publicitario.',
  'Agenda de Reservas 24/7 interactiva con validación visual intuitiva que despacha citas confirmadas directo a tu WhatsApp.',
  'Sistema de Testimonios Verificados con blindaje estricto que solo permite calificar a números registrados con citas previas.',
  'Panel Administrativo Todo-en-Uno (Modo Claro y Pro) con vista de rutas, cobros, base de datos y control de disponibilidad.',
  'Infraestructura Global en Cloudflare Pages con Base de Datos SQL D1 distribuida, carga en <0.5s y cero costos mensuales de hosting.',
  'Aplicación Web PWA instalable en 1 clic en la pantalla de inicio del celular, con funcionamiento rápido y soporte offline.',
  'Propiedad Total del Código Fuente en React, TypeScript y Tailwind CSS, sin suscripciones a WordPress ni plugins de terceros.',
  'Despliegue Llave en Mano verificado en producción, listo para facturar y con soporte técnico de calibración continua.'
];

export const COMPARISON_ROWS = [
  {
    feature: 'Velocidad de Carga en Celular',
    traditional: 'Lenta (4 a 7 segundos en WordPress o servidores compartidos)',
    royalty: 'Ultra rápida (<0.5 segundos en Nube Serverless Distribuida)',
  },
  {
    feature: 'Presentación de Cotizaciones',
    traditional: 'Audios informales o textos sueltos en WhatsApp que invitan al regateo',
    royalty: 'PDF formal con membrete corporativo, firma oficial y garantía en 30s',
  },
  {
    feature: 'Seguimiento del Cliente',
    traditional: 'A ciegas: sin saber si el cliente abrió la cotización o la ignoró',
    royalty: 'Radar en vivo: notificación exacta cuando lee y descarga el documento',
  },
  {
    feature: 'Captación en Redes Sociales',
    traditional: 'Gastos a ciegas sin saber si Facebook, Instagram o WhatsApp traen clientes',
    royalty: 'Rastreo exacto del embudo (/fb, /ig, /wa) con citas reales por red social',
  },
  {
    feature: 'Gestión Operativa de Calle',
    traditional: 'Cuadernos viejos, notas en el teléfono y citas traspapeladas',
    royalty: 'Panel centralizado con rutas del día, cobros Sinpe y Waze en 1 toque',
  },
  {
    feature: 'Costos Fijos Mensuales',
    traditional: '$25 a $50 mensuales obligatorios en hosting, plugins y licencias',
    royalty: '$0 mensuales en hosting serverless global de alta disponibilidad',
  },
  {
    feature: 'Propiedad del Sistema',
    traditional: 'Dependiente de terceros y plantillas que caducan o se rompen',
    royalty: 'Activo 100% propio de Mauricio Marín con código moderno sin mensualidades',
  }
];

const DEFAULT_METRICS: ProjectMetric[] = [
  { value: '30 seg', label: 'Emisión de Cotización', sublabel: 'PDF membretado formal' },
  { value: '100%', label: 'Cero Fugas de Tráfico', sublabel: 'Atribución FB, IG y WhatsApp' },
  { value: '1-Clic', label: 'Conexión Directa', sublabel: 'WhatsApp enrutado inmediato' },
  { value: '<0.5s', label: 'Carga Ultra Rápida', sublabel: 'Nube Cloudflare Serverless' },
];

const DEFAULT_FEATURES: ProjectFeature[] = [
  {
    id: 'feat_1',
    order: 1,
    category: 'COMERCIAL & CIERRE DE VENTAS',
    badge: 'Herramienta de Cierre',
    title: 'Cotizador Formal Dinámico con Membrete y Firma Oficial',
    problem: 'Ya no más cotizaciones informales en audios o mensajes de texto sueltos que transmiten desconfianza y fomentan el regateo constante de precios. Ahora tus propuestas transmiten prestigio corporativo inmediato con membrete, firma y validez formal.',
    solution: 'Generador digital automatizado que calcula mano de obra, insumos, IVA opcional y garantía, emitiendo una elegante hoja membretada en segundos. Proyecta imagen de primer nivel, elimina objeciones de costo y duplica la velocidad de cierre de contratos grandes.',
    impact: 'Cierre inmediato de contratos con máxima seriedad corporativa y validez formal.',
    actionText: 'Probar Cotizador',
    actionPath: '/cotizador'
  },
  {
    id: 'feat_2',
    order: 2,
    category: 'IMAGEN CORPORATIVA & MARKETING',
    badge: 'Tecnología Edge',
    title: 'Previsualización Enriquecida Automática en WhatsApp (Open Graph)',
    problem: 'Ya no más enlaces cortados o textos genéricos que parecen spam en WhatsApp y hacen dudar al cliente. Al compartir tu propuesta, tus clientes ven al instante una tarjeta impecable con tu logotipo oficial y el valor exacto cotizado.',
    solution: 'El servidor inyecta dinámicamente una tarjeta visual con el logo oficial de Royalty, título exacto "📋 Cotización Oficial: [Cliente]" y el monto cotizado. Logra una tasa de apertura superior al 95%, destacando tu empresa con una categoría visual insuperable frente a la competencia.',
    impact: 'Más del 95% de apertura y distinción de marca inmediata en cada cliente.',
    actionText: 'Ver Ejemplo',
    actionPath: '/cotizador'
  },
  {
    id: 'feat_3',
    order: 3,
    category: 'INTELIGENCIA DE VENTAS EN VIVO',
    badge: 'Ventaja Táctica',
    title: 'Rastreo Silencioso de Lectura y Descarga de Documentos',
    problem: 'Ya no más incertidumbre ni llamadas a ciegas sin saber si el cliente abrió o descargó la cotización. Ahora tienes control y visibilidad absoluta de cuándo tu cliente tiene la propuesta en sus manos para contactarlo en el momento exacto.',
    solution: 'El sistema registra en segundo plano y en vivo las visitas y la fecha/hora exacta en que el cliente descargó el PDF oficial, emitiendo una notificación instantánea en el panel para dar seguimiento oportuno en el momento psicológico ideal de cierre.',
    impact: 'Seguimiento con precisión quirúrgica en el momento exacto de mayor interés de compra.',
    actionText: 'Rastreo en Vivo',
    actionPath: '/cotizador'
  },
  {
    id: 'feat_4',
    order: 4,
    category: 'GESTIÓN OPERATIVA DIARIA',
    badge: 'Ahorro de Tiempo',
    title: 'Bandeja Inteligente de "Cotizaciones por Enviar"',
    problem: 'Ya no más papeles perdidos, notas en el celular ni cotizaciones olvidadas mientras trabajas en la calle o atiendes inspecciones. Todo queda organizado en un solo toque para cotizar desde el taller o vehículo y despachar en segundos.',
    solution: 'Bandeja centralizada "Por Enviar" con guardado a un solo clic y contador visual de pendientes para despachar por WhatsApp de inmediato. Cero dinero perdido por olvidos administrativos y organización impecable para convertir cada consulta en dinero seguro.',
    impact: 'Cero dinero perdido por olvidos administrativos y agilidad operativa inmediata.',
    actionText: 'Ver Bandeja',
    actionPath: '/cotizador'
  },
  {
    id: 'feat_5',
    order: 5,
    category: 'MÉTRICAS & MARKETING DIGITAL',
    badge: 'Retorno de Inversión',
    title: 'Rastreador de Tráfico y Embudo de Conversión (FB, IG, WA)',
    problem: 'Ya no más adivinar qué red social te deja ganancias reales y cuál solo consume tu tiempo. Ahora sabes con precisión matemática de dónde provienen las visitas, quién hace clic para cotizar y cuántos clientes agendan cita técnica.',
    solution: 'Enlaces inteligentes de marketing (/fb, /ig, /wa) con métricas en tiempo real que miden el embudo completo: visitas, cotizaciones generadas y citas concretadas. Claridad financiera total para enfocar esfuerzos y presupuesto en los canales que más dinero producen.',
    impact: 'Decisiones comerciales basadas en números exactos para maximizar el retorno de inversión.',
    actionText: 'Ver Analítica',
    actionPath: '/detec/panel'
  },
  {
    id: 'feat_6',
    order: 6,
    category: 'EXPERIENCIA DE USUARIO',
    badge: 'Cero Fricción',
    title: 'Agenda Interactiva con Detección Visual de Campos Incompletos',
    problem: 'Reservas fáciles, rápidas e inmediatas: tus clientes nunca se perderán en la web. La agenda guía al usuario de manera intuitiva y visual paso a paso, eliminando cualquier confusión, frustración o abandono antes de completar su reserva.',
    solution: 'Campos interactivos con guía visual inteligente que asisten al cliente al escribir y despachan la cita técnica directamente al WhatsApp. Aumenta un 40% las reservas confirmadas, asegurando que cada visitante complete su solicitud sin complicaciones ni llamadas previas.',
    impact: 'Aumento del 40% en reservas concretadas sin fricción para el usuario.',
    actionText: 'Abrir Agenda',
    actionPath: '/agenda'
  },
  {
    id: 'feat_7',
    order: 7,
    category: 'PRUEBA SOCIAL & CONFIANZA',
    badge: 'Reputación Blindada',
    title: 'Muro de Reseñas y Testimonios con Carrusel Dinámico',
    problem: 'Cuando tus clientes vean tus testimonios reales y calificaciones de 5 estrellas, te contratarán de inmediato y sin dudar. La prueba social auténtica genera confianza absoluta desde el primer segundo que entran a tu sitio.',
    solution: 'Muro dinámico interactivo con testimonios verificados de clientes en San José, Cartago y Heredia, con desglose de estrellas y fecha. Erradica cualquier desconfianza y blinda la reputación del negocio antes de la primera llamada técnica.',
    impact: 'Confianza inmediata y reputación blindada que destruye las objeciones del cliente.',
    actionText: 'Ver Testimonios',
    actionPath: '/calificar'
  },
  {
    id: 'feat_8',
    order: 8,
    category: 'CENTRO DE MANDO DIRECTIVO',
    badge: 'Control Total',
    title: 'Panel Administrativo Todo-en-Uno (Modo Claro / Modo Pro)',
    problem: 'Ya no más cuadernos viejos, notas en el celular ni mensajes dispersos que te hagan dudar de cuántas citas tienes en la semana. Toda la operación de tu empresa reunida en un centro de mando moderno, seguro y accesible desde cualquier lugar.',
    solution: 'Panel privado con acceso seguro, selector de modo visual, calendario cronológico de citas, base de datos de clientes, cotizador y métricas operativas. Control directivo total del negocio desde la computadora o el móvil mientras viajas a atender obras técnicas.',
    impact: 'Control corporativo total de la empresa en tiempo real desde la oficina o la calle.',
    actionText: 'Acceso Panel',
    actionPath: '/detec/panel'
  },
  {
    id: 'feat_9',
    order: 9,
    category: 'INFRAESTRUCTURA DE VANGUARDIA',
    badge: 'Grado Silicon Valley',
    title: 'Nube Serverless Edge Distribuida (Cloudflare Pages + Base de Datos en la Nube)',
    problem: 'Ya no más sitios lentos, caídas de servidor ni cobros mensuales excesivos por hosting convencional. Tu empresa opera sobre infraestructura global de última generación con máxima velocidad y seguridad bancaria.',
    solution: 'Despliegue distribuido en más de 300 centros de datos globales con base de datos SQL distribuida de alta disponibilidad. Carga ultra rápida en menos de 0.5 segundos, cifrado bancario HTTPS y cero costos fijos mensuales de hosting tradicional.',
    impact: 'Cero costos fijos mensuales y máxima velocidad para liderar en Google.',
    actionText: 'Ver Web',
    actionPath: '/'
  },
  {
    id: 'feat_10',
    order: 10,
    category: 'TECNOLOGÍA MÓVIL MODERNA',
    badge: 'Instalación en 1-Clic',
    title: 'Aplicación Web Progresiva (PWA Móvil Primero)',
    problem: 'Ya no más costos exorbitantes en desarrollo de aplicaciones complejas que los clientes evitan descargar. Ahora cuentas con una app web moderna que tú y tus clientes instalan en 1 solo clic en la pantalla de inicio del teléfono.',
    solution: 'Tecnología PWA ligera que se instala directamente sin pasar por tiendas de aplicaciones, brindando acceso instantáneo desde el bolsillo. Presencia permanente en el teléfono de clientes recurrentes y herramientas de trabajo siempre a mano.',
    impact: 'Acceso instantáneo desde el celular y presencia directa en la pantalla del cliente.',
    actionText: 'Probar App',
    actionPath: '/'
  }
];

const INITIAL_DATA: ProjectPresentationData = {
  heroTagline: 'DOCUMENTO ESTRATÉGICO DE ARQUITECTURA & VALOR COMERCIAL',
  heroTitle: 'La Plataforma Tecnológica a Medida que Convierte a Mauricio Marín en el Líder Absoluto de Costa Rica',
  heroSubtitle: 'Diseñada exclusivamente para Destaqueos y Tanques Sépticos Mauricio Marín: automatiza la captación de clientes, erradica cotizaciones informales en mensajes de texto, rastrea cuándo tu cliente abre y descarga tus propuestas, y convierte visitas en citas técnicas pagadas.',
  metrics: DEFAULT_METRICS,
  features: DEFAULT_FEATURES,
  closingTitle: '¿Por qué este sistema no es un gasto, sino el activo más rentable de Mauricio Marín?',
  closingText: 'Una página web genérica de $100 es solo un folleto digital que nadie lee. Esta plataforma es una máquina de operaciones y ventas construida a la medida de los procesos técnicos de Mauricio Marín. Cada funcionalidad está programada para ahorrar horas de trabajo manual, proyectar máxima seriedad corporativa y asegurar que cada cliente que busque un destaqueo o limpieza de tanque séptico en Costa Rica termine contratando a Mauricio Marín.',
  closingQuote: 'En el sector técnico, la empresa que cotiza formalmente en segundos y demuestra transparencia tecnológica es la que gana el 90% de los contratos de alto valor.'
};

interface ProjectPresentationPageProps {
  onBackToHome: () => void;
  onNavigateAgenda: () => void;
  onOpenAdmin: () => void;
}

export const ProjectPresentationPage: React.FC<ProjectPresentationPageProps> = ({
  onBackToHome,
  onNavigateAgenda,
  onOpenAdmin
}) => {
  // Estado de los datos de la presentación
  const [data, setData] = useState<ProjectPresentationData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return INITIAL_DATA;
  });

  // Modo Desarrollador (Protegido por código 1985)
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('royalty_dev_unlocked') === 'true';
    }
    return false;
  });

  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Edición de funcionalidad en modal
  const [editingFeature, setEditingFeature] = useState<ProjectFeature | null>(null);

  // Auto-guardar en localStorage cuando se editan datos
  const handleSaveData = (updated: ProjectPresentationData) => {
    setData(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    setSaveToast('✅ Cambios guardados correctamente en el sistema.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === '1985') {
      setIsDevMode(true);
      sessionStorage.setItem('royalty_dev_unlocked', 'true');
      setIsPasscodeModalOpen(false);
      setPasscodeInput('');
      setPasscodeError(false);
      setSaveToast('🔓 Modo Desarrollador Activado.');
      setTimeout(() => setSaveToast(null), 3000);
    } else {
      setPasscodeError(true);
      setPasscodeInput('');
    }
  };

  const handleLockDevMode = () => {
    setIsDevMode(false);
    sessionStorage.removeItem('royalty_dev_unlocked');
    setSaveToast('🔒 Modo Desarrollador Bloqueado.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleResetToDefault = () => {
    if (confirm('¿Desea restablecer toda la presentación a los textos originales recomendados?')) {
      setData(INITIAL_DATA);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      setSaveToast('🔄 Presentación restablecida a valores por defecto.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // Mover funcionalidad arriba/abajo
  const handleMoveFeature = (index: number, direction: 'up' | 'down') => {
    const newFeatures = [...data.features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFeatures.length) return;
    const temp = newFeatures[index];
    newFeatures[index] = newFeatures[targetIndex];
    newFeatures[targetIndex] = temp;
    // Recalcular orden numérico
    newFeatures.forEach((f, idx) => { f.order = idx + 1; });
    handleSaveData({ ...data, features: newFeatures });
  };

  const handleDeleteFeature = (id: string) => {
    if (confirm('¿Eliminar esta funcionalidad de la lista?')) {
      const filtered = data.features.filter((f) => f.id !== id);
      filtered.forEach((f, idx) => { f.order = idx + 1; });
      handleSaveData({ ...data, features: filtered });
    }
  };

  const handleSaveFeatureEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;
    const updatedFeatures = data.features.map((f) => 
      f.id === editingFeature.id ? editingFeature : f
    );
    handleSaveData({ ...data, features: updatedFeatures });
    setEditingFeature(null);
  };

  const handleAddNewFeature = () => {
    const newId = `feat_${Date.now()}`;
    const newFeature: ProjectFeature = {
      id: newId,
      order: data.features.length + 1,
      category: 'NUEVA CAPACIDAD TÉCNICA',
      badge: 'Funcionalidad',
      title: 'Nueva Funcionalidad del Sistema',
      problem: 'Descripción del dolor o problema que resuelve en la operación diaria.',
      solution: 'Descripción de cómo el software soluciona este aspecto de forma automatizada.',
      impact: 'Impacto directo en ingresos, ahorro de tiempo o prestigio para el negocio.',
      actionText: 'Explorar',
      actionPath: '/'
    };
    handleSaveData({ ...data, features: [...data.features, newFeature] });
    setEditingFeature(newFeature);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 selection:bg-brand-blue selection:text-white pb-24">
      
      {/* Toast Flotante */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* BARRA SUPERIOR DISCRETA Y NAVEGACIÓN */}
      <header className="sticky top-0 z-40 bg-[#070D18]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Inicio</span>
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <img src={SHIELD_LOGO} alt="Mauricio Marín" className="w-6 h-6 object-contain" />
              <span className="text-xs font-black tracking-wider uppercase text-slate-200 hidden md:inline">
                Destaqueos y Tanques Sépticos Mauricio Marín
              </span>
            </div>
          </div>

          {/* Navegación Rápida de la Landing Page de Ventas */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <button
              type="button"
              onClick={() => document.getElementById('lista-funcionalidades')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2.5 py-1 rounded-lg hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              10 Innovaciones
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('resumen-entregables')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2.5 py-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Qué Recibes</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('tabla-comparativa')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2.5 py-1 rounded-lg hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              Comparativa
            </button>
          </nav>

          {/* Acciones de la barra superior */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateAgenda}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-all cursor-pointer"
            >
              Agenda
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/cotizador';
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-xs"
            >
              Cotizador
            </button>

            {/* BOTÓN DISCRETO DE ACCESO DESARROLLADOR (NO MUESTRA EL CÓDIGO) */}
            {isDevMode ? (
              <button
                type="button"
                onClick={handleLockDevMode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-600/50 transition-all cursor-pointer shadow-xs"
                title="Modo Desarrollador Activo. Haga clic para bloquear."
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Modo Dev</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Acceso Técnico"
              >
                <Lock className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* BANNER INFORMATIVO EN MODO DESARROLLADOR */}
      {isDevMode && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-amber-200 text-xs font-bold flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>MODO DESARROLLADOR HABILITADO — Puedes editar textos, reordenar y agregar funcionalidades.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddNewFeature}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Funcionalidad</span>
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16 sm:space-y-20">
        
        {/* ========================================================
            HERO PERSUASIVO DE ALTO IMPACTO PARA DAVID ROJAS
           ======================================================== */}
        <section className="text-center space-y-6 max-w-4xl mx-auto relative">
          
          {/* Difuminados de Ambiente Vino y Azul */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#67141d]/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Pastilla de Categoría */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-black uppercase tracking-wider text-amber-400 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{data.heroTagline}</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {data.heroTitle}
          </h1>

          {/* Subtítulo Persuasivo */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            {data.heroSubtitle}
          </p>

          {/* Botones de Exploración Rápida */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                document.getElementById('lista-funcionalidades')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#67141d] to-[#8B1826] hover:opacity-95 text-white text-xs sm:text-sm font-black shadow-lg shadow-[#67141d]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Ver las 10 Funcionalidades en Detalle</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <a
              href="/cotizador"
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Abrir Cotizador en Vivo</span>
            </a>
          </div>

          {/* TARJETAS DE MÉTRICAS CLAVE */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 text-left">
            {data.metrics.map((m, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xs space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {m.value}
                </div>
                <div className="text-xs font-black text-slate-200 uppercase tracking-wide">
                  {m.label}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {m.sublabel}
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================================
            LISTA ORDENADA DETALLADA DE FUNCIONALIDADES (UNA POR UNA)
           ======================================================== */}
        <section id="lista-funcionalidades" className="space-y-8">
          
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 tracking-wider">
                <Award className="w-4 h-4" />
                <span>Desglose Funcional & Operativo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Todas las Capacidades del Sistema ({data.features.length})
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm sm:text-right">
              Cada módulo resuelve un cuello de botella real en las operaciones de Mauricio Marín.
            </p>
          </div>

          <div className="space-y-6">
            {data.features.map((feat, index) => (
              <div
                key={feat.id}
                className="bg-gradient-to-br from-slate-900/90 to-[#0A1424]/80 border border-slate-800/90 hover:border-slate-700 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5 transition-all relative group"
              >
                
                {/* Cabecera de la Funcionalidad */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 shrink-0">
                      #{String(feat.order || index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {feat.category}
                        </span>
                        {feat.badge && (
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/20 text-blue-300 border border-blue-500/30">
                            {feat.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {feat.title}
                      </h3>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta (Modo Dev o Modo Público) */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isDevMode && (
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleMoveFeature(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Subir orden"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveFeature(index, 'down')}
                          disabled={index === data.features.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Bajar orden"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFeature(feat)}
                          className="px-2 py-1 rounded text-xs font-bold text-amber-400 hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                          title="Editar textos"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeature(feat.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-950/50 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {feat.actionPath && (
                      <a
                        href={feat.actionPath}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors shadow-xs"
                      >
                        <span>{feat.actionText || 'Probar'}</span>
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Grid Explicativo en 2 Pasos: Adiós al Método Tradicional -> Solución Implementada & Beneficio Directo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* 1. Adiós al Método Tradicional */}
                  <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-2xl space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Adiós al Método Tradicional</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      {feat.problem}
                    </p>
                  </div>

                  {/* 2. Solución Implementada & Beneficio Directo */}
                  <div className="bg-blue-950/20 border border-blue-900/40 p-4 rounded-2xl space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>Solución Implementada & Beneficio Directo</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {feat.solution}
                    </p>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </section>

        {/* ========================================================
            SECCIÓN DE VENTA: INVENTARIO EJECUTIVO LLAVE EN MANO
            Todo Lo Que Recibe Tu Negocio (Punto por Punto)
           ======================================================== */}
        <section id="resumen-entregables" className="space-y-8 scroll-mt-20">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Inventario Ejecutivo Llave en Mano</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Todo Lo Que Estás Recibiendo: Punto por Punto
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              No estás adquiriendo un simple folleto web. Recibes un ecosistema digital de alta rentabilidad compuesto por 12 herramientas comerciales, operativas y tecnológicas diseñadas exclusivamente a la medida de Mauricio Marín.
            </p>
          </div>

          {/* Cuadrícula de 12 Entregables Ejecutivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DELIVERABLES_SUMMARY.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xs flex flex-col justify-between gap-4 hover:border-amber-400/40 hover:bg-slate-900/90 transition-all shadow-card group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-extrabold text-slate-400 tracking-wider uppercase">
                      #{idx + 1} • {item.pillar}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {item.summary}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-200">
                    {item.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-300 leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {item.actionPath && (
                  <div className="pt-2">
                    <a
                      href={item.actionPath}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-400 text-slate-200 hover:text-amber-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>{item.actionText || 'Ver en Vivo'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CHECKLIST EJECUTIVO RESUMIDO EN 1 SOLO BLOQUE DESTACADO */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-[#0A192F] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-amber-400" />
                  <span>Acta de Entrega Integral</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  Resumen de Funcionalidades que Recibe Mauricio Marín (Checklist de Entrega)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black self-start sm:self-auto">
                ✓ 100% Desarrollado y Operativo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {EXECUTIVE_CHECKLIST.map((text, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-[10px]">
                    {idx + 1}
                  </div>
                  <p className="text-slate-200 font-medium leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ========================================================
            TABLA COMPARATIVA: SITIO WEB TRADICIONAL VS ROYALTY
           ======================================================== */}
        <section id="tabla-comparativa" className="space-y-6 scroll-mt-20">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Decisión Inteligente de Inversión</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¿Por Qué Esta Plataforma y No una Web Tradicional?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Comparativa transparente entre lo que ofrece un diseñador común vs lo que hace crecer tu negocio.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Capacidad del Negocio</th>
                  <th className="py-4 px-4 sm:px-6 text-red-400 bg-red-950/10">Folleto Web Común ($100)</th>
                  <th className="py-4 px-4 sm:px-6 text-emerald-300 bg-emerald-950/20">Tu Plataforma Llave en Mano Mauricio Marín</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-white whitespace-nowrap sm:whitespace-normal">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 bg-red-950/5">
                      <span className="flex items-center gap-1.5 text-red-300">
                        <X className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{row.traditional}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-100 bg-amber-950/10 font-semibold">
                      <span className="flex items-center gap-1.5 text-amber-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                        <span>{row.royalty}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>

        {/* ========================================================
            CIERRE PERSUASIVO FINAL Y LLAMADO A LA ACCIÓN COMERCIAL
           ======================================================== */}
        <section className="bg-gradient-to-br from-[#67141d]/40 via-slate-900 to-[#0A192F] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10.5px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Propuesta Lista para Puesta en Marcha</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {data.closingTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {data.closingText}
              </p>
              
              <blockquote className="border-l-2 border-amber-400 pl-3 py-1 text-xs italic text-amber-200/90 font-medium">
                "{data.closingQuote}"
              </blockquote>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-3 w-full sm:w-auto">
              <img src={LOGO_DESTAQUEO} alt="Mauricio Marín" className="w-36 sm:w-44 object-contain drop-shadow-md" />
              
              {/* Botón Principal de WhatsApp para Formalizar */}
              <a
                href="https://wa.me/50661141421?text=Hola%20Mauricio%2C%20estoy%20revisando%20la%20plataforma%20completa%20de%20Destaqueos%20y%20Tanques%20S%C3%A9pticos%20Mauricio%20Mar%C3%ADn.%20Me%20parece%20excelente%2C%20coordinemos%20para%20formalizar%20la%20entrega%20llave%20en%20mano."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>Aprobar Plataforma y Poner en Marcha</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </a>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <a href="/cotizador" className="hover:text-amber-400 transition-colors underline">Probar Cotizador</a>
                <span>•</span>
                <a href="/agenda" className="hover:text-amber-400 transition-colors underline">Ver Agenda 24/7</a>
                <span>•</span>
                <a href="/detec/panel" className="hover:text-amber-400 transition-colors underline">Panel Admin</a>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* ========================================================
          MODAL DE ACCESO DESARROLLADOR (PIN PRIVADO: 1985)
         ======================================================== */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Acceso de Desarrollador
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPasscodeModalOpen(false);
                  setPasscodeError(false);
                  setPasscodeInput('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Ingrese el código de seguridad para activar la edición de textos y funcionalidades.
            </p>

            <form onSubmit={handleVerifyPasscode} className="space-y-3">
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError(false);
                }}
                placeholder="••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center tracking-widest text-lg font-mono text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />

              {passcodeError && (
                <p className="text-[11px] text-red-400 font-bold text-center">
                  Código de acceso incorrecto.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                Verificar Acceso
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE EDICIÓN DE FUNCIONALIDAD EN MODO DEV
         ======================================================== */}
      {editingFeature && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Editar Funcionalidad #{editingFeature.order}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingFeature(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFeatureEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={editingFeature.category}
                    onChange={(e) => setEditingFeature({ ...editingFeature, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">
                    Pastilla / Badge
                  </label>
                  <input
                    type="text"
                    value={editingFeature.badge || ''}
                    onChange={(e) => setEditingFeature({ ...editingFeature, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">
                  Título de la Funcionalidad
                </label>
                <input
                  type="text"
                  value={editingFeature.title}
                  onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-amber-400 uppercase mb-1">
                  Adiós al Método Tradicional (Enfoque Persuasivo)
                </label>
                <textarea
                  rows={3}
                  value={editingFeature.problem}
                  onChange={(e) => setEditingFeature({ ...editingFeature, problem: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-blue-400 uppercase mb-1">
                  Solución Implementada & Beneficio Directo
                </label>
                <textarea
                  rows={4}
                  value={editingFeature.solution}
                  onChange={(e) => setEditingFeature({ ...editingFeature, solution: e.target.value, impact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">
                    Texto de Acción
                  </label>
                  <input
                    type="text"
                    value={editingFeature.actionText || ''}
                    onChange={(e) => setEditingFeature({ ...editingFeature, actionText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">
                    Ruta de Acción (ej. /cotizador)
                  </label>
                  <input
                    type="text"
                    value={editingFeature.actionPath || ''}
                    onChange={(e) => setEditingFeature({ ...editingFeature, actionPath: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFeature(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
