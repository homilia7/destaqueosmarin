import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  RefreshCw, 
  Upload, 
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Briefcase,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  Percent,
  Sparkles,
  MessageSquare,
  Download,
  FolderDown,
  FolderOpen,
  X,
  FileCheck,
  Eye,
  Bell,
  Link as LinkIcon,
  BookmarkPlus,
  Send
} from 'lucide-react';
import { JobQuote, QuoteItem, SavedQuoteEntry } from '../../types/quote';
import { getTodayDateString } from '../../utils/dateFormatter';
import { api } from '../../services/api';
import { FacebookIcon, InstagramIcon, SOCIAL_URLS } from '../common/SocialLinks';

const STORAGE_KEY = 'destaqueos_saved_job_quote';
const HISTORY_STORAGE_KEY = 'destaqueos_saved_quotes_history';
const DEFAULT_LOGO = '/camion-destaqueos.png';
const SHIELD_LOGO = '/camion-destaqueos.png';

interface JobQuoteManagerProps {
  quoteToEdit?: JobQuote | null;
  onClearQuoteToEdit?: () => void;
}

export const JobQuoteManager: React.FC<JobQuoteManagerProps> = ({
  quoteToEdit,
  onClearQuoteToEdit
}) => {
  const [activeMobileView, setActiveMobileView] = useState<'editor' | 'preview'>('editor');
  const [copied, setCopied] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWithTitle, setCopiedWithTitle] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'por_enviar' | 'todas'>('por_enviar');
  const [customFileName, setCustomFileName] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSavingLater, setIsSavingLater] = useState(false);
  const [savedLaterFeedback, setSavedLaterFeedback] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedLaterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpieza de temporizadores de auto-scroll y mensajes de 10s al desmontar
  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
      if (saveSuccessTimerRef.current) clearTimeout(saveSuccessTimerRef.current);
      if (savedLaterTimerRef.current) clearTimeout(savedLaterTimerRef.current);
    };
  }, []);

  // Llevar inmediatamente arriba a la bandeja de cotizaciones por enviar y enfocar panel
  const scrollToTopPanel = () => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    setIsHistoryOpen(true);
    setHistoryFilter('por_enviar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const panelEl = document.getElementById('cotizaciones-por-enviar-panel');
      if (panelEl) {
        panelEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 120);
  };

  // Formateador de fecha y hora local del usuario en Costa Rica (12h con AM/PM)
  const formatUserLocalTime = (isoOrUtcStr?: string | null): string => {
    if (!isoOrUtcStr) return '';
    try {
      const normalized = isoOrUtcStr.includes('T') ? isoOrUtcStr : isoOrUtcStr.replace(' ', 'T') + 'Z';
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return isoOrUtcStr;
      const time = d.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', hour12: true });
      const date = d.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${date} • ${time}`;
    } catch {
      return isoOrUtcStr;
    }
  };

  const getNowLocalTime12h = (): string => {
    return new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Generador de consecutivo inicial
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100 + Math.random() * 900);
    return `COT-${year}-${random}`;
  };

  const getInitialQuote = (): JobQuote => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            date: parsed.date || getTodayDateString()
          };
        }
      } catch (e) {
        // Fallback a nuevo
      }
    }

    return {
      id: `quote_${Date.now()}`,
      quoteNumber: generateQuoteNumber(),
      date: getTodayDateString(),
      companyName: 'Destaqueos y Tanques Sépticos Mauricio Marín',
      companyLogoUrl: DEFAULT_LOGO,
      customLogoUrl: null,
      clientName: '',
      clientLocation: '',
      clientPhone: '',
      workReference: 'Limpieza de tanque séptico y destaqueo de tuberías',
      scopeItems: [
        { id: '1', text: 'Inspección técnica preliminar del sistema de tanques y drenajes.' },
        { id: '2', text: 'Vaciado y succión con camión cisterna / sondeo electromecánico.' },
        { id: '3', text: 'Pruebas de evacuación y verificación de flujo continuo.' }
      ],
      laborCost: 45000,
      materialsCost: 15000,
      materialsDetail: 'Personal calificado, mangueras de alto vacío y equipo rotativo incluido.',
      applyIVA: false,
      ivaRate: 0.13,
      deliveryTime: '1 día hábil',
      paymentTerms: '100% contra entrega y satisfacción al cliente',
      checkpoints: {
        paymentOnDelivery: true,
        satisfactionGuarantee: true,
        certifiedMaterials: true,
        noHiddenCosts: true
      },
      responsibleName: 'Mauricio Marín',
      responsibleTitle: 'Especialista en Tanques Sépticos y Destaqueos',
      responsiblePhone: '6114-1421',
      instagramUrl: SOCIAL_URLS.instagram,
      whatsappUrl: 'https://wa.me/50661141421',
      emailContact: 'mauriciomarin@gmail.com',
      websiteUrl: 'https://destaqueosmarin.pages.dev',
      createdAt: new Date().toISOString()
    };
  };

  const [quote, setQuote] = useState<JobQuote>(getInitialQuote);

  // Historial de cotizaciones guardadas en el sistema
  const [savedHistory, setSavedHistory] = useState<SavedQuoteEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const historyRaw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (historyRaw) return JSON.parse(historyRaw);
      } catch (e) {}
    }
    return [];
  });

  // Cotización activa guardada o con estado en el sistema
  const activeSavedEntry = savedHistory.find((entry) => entry.id === quote.id);

  // Sincronización en tiempo real con Cloudflare D1
  const syncCloudQuotes = async () => {
    try {
      const remoteQuotes = await api.getQuotes();
      if (Array.isArray(remoteQuotes) && remoteQuotes.length > 0) {
        const mapped: SavedQuoteEntry[] = remoteQuotes.map((q: any) => ({
          id: q.id,
          fileName: q.file_name || `Cotizacion-${q.quote_number}`,
          savedAt: q.created_at || new Date().toISOString(),
          totalAmount: Number(q.total_amount) || 0,
          clientName: q.client_name || 'Cliente Particular',
          workReference: q.work_reference || 'Trabajo Técnico',
          status: (q.status as 'por_enviar' | 'enviada') || 'por_enviar',
          sentAt: q.status === 'enviada' ? (q.updated_at || null) : null,
          viewCount: Number(q.view_count) || 0,
          isDownloaded: Boolean(q.is_downloaded),
          downloadedAt: q.downloaded_at ? new Date(q.downloaded_at).toLocaleString('es-CR') : null,
          shareUrl: `${window.location.origin}/cotizacion/${q.id}`,
          quoteData: {
            id: q.id,
            quoteNumber: q.quote_number,
            date: q.date,
            status: (q.status as 'por_enviar' | 'enviada') || 'por_enviar',
            companyName: q.company_name || 'Destaqueos y Tanques Sépticos Mauricio Marín',
            companyLogoUrl: DEFAULT_LOGO,
            customLogoUrl: null,
            clientName: q.client_name || '',
            clientLocation: q.client_location || '',
            clientPhone: q.client_phone || '',
            workReference: q.work_reference || '',
            scopeItems: typeof q.scope_items === 'string' ? (() => { try { return JSON.parse(q.scope_items); } catch { return []; } })() : (q.scope_items || []),
            laborCost: Number(q.labor_cost) || 0,
            materialsCost: Number(q.materials_cost) || 0,
            materialsDetail: q.materials_detail || '',
            applyIVA: Boolean(q.apply_iva),
            ivaRate: 0.13,
            deliveryTime: q.delivery_time || '1 día hábil',
            paymentTerms: '100% contra entrega y satisfacción al cliente',
            checkpoints: {
              paymentOnDelivery: true,
              satisfactionGuarantee: true,
              certifiedMaterials: true,
              noHiddenCosts: true
            },
            responsibleName: q.responsible_name || 'Mauricio Marín',
            responsibleTitle: 'Especialista en Tanques Sépticos y Destaqueos',
            responsiblePhone: q.responsible_phone || '6114-1421',
            instagramUrl: SOCIAL_URLS.instagram,
            whatsappUrl: 'https://wa.me/50661141421',
            emailContact: 'mauriciomarin@gmail.com',
            websiteUrl: 'https://destaqueosmarin.pages.dev',
            createdAt: q.created_at || new Date().toISOString()
          }
        }));

        setSavedHistory((prev) => {
          const remoteIds = new Set(mapped.map((m) => m.id));
          const localOnly = prev.filter((p) => !remoteIds.has(p.id));
          const merged = [...mapped, ...localOnly];
          try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (e) {
      console.warn('Error sincronizando cotizaciones:', e);
    }
  };

  useEffect(() => {
    syncCloudQuotes();
    const interval = setInterval(() => {
      if (!document.hidden) {
        syncCloudQuotes();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Cargar cotización cuando se pasa desde la tarjeta de una cita
  useEffect(() => {
    if (quoteToEdit) {
      setQuote(quoteToEdit);
      setEditingQuoteId(quoteToEdit.id);
      setActiveMobileView('editor');
      setTimeout(() => {
        const el = document.getElementById('company-details-section') || document.getElementById('printable-quote-sheet');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [quoteToEdit]);

  // Auto-guardado de borrador activo en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quote));
    } catch (e) {}
  }, [quote]);

  // Cálculos financieros
  const labor = Number(quote.laborCost) || 0;
  const materials = Number(quote.materialsCost) || 0;
  const subtotal = labor + materials;
  const ivaAmount = quote.applyIVA ? Math.round(subtotal * (quote.ivaRate || 0.13)) : 0;
  const totalGeneral = subtotal + ivaAmount;

  // Manejador de subida de logo o foto del negocio
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 3 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQuote((prev) => ({ ...prev, customLogoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setQuote((prev) => ({ ...prev, customLogoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manejo de ítems de trabajo línea por línea
  const handleAddScopeItem = () => {
    const newItem: QuoteItem = {
      id: String(Date.now()),
      text: ''
    };
    setQuote((prev) => ({
      ...prev,
      scopeItems: [...prev.scopeItems, newItem]
    }));
  };

  const handleUpdateScopeItem = (id: string, text: string) => {
    setQuote((prev) => ({
      ...prev,
      scopeItems: prev.scopeItems.map((item) => (item.id === id ? { ...item, text } : item))
    }));
  };

  const handleRemoveScopeItem = (id: string) => {
    if (quote.scopeItems.length <= 1) return;
    setQuote((prev) => ({
      ...prev,
      scopeItems: prev.scopeItems.filter((item) => item.id !== id)
    }));
  };

  // Reiniciar cotización
  const handleResetQuote = (skipConfirm = false) => {
    if (skipConfirm || confirm('¿Desea crear una nueva cotización en blanco? Se restablecerán los campos para un nuevo cliente.')) {
      const fresh: JobQuote = {
        ...getInitialQuote(),
        id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quoteNumber: generateQuoteNumber(),
        date: getTodayDateString(),
        clientName: '',
        clientLocation: '',
        clientPhone: '',
        workReference: 'Destaqueo de tubería e inspección técnica',
        scopeItems: [
          { id: '1', text: 'Inspección técnica preliminar del sistema de tuberías.' },
          { id: '2', text: 'Destaqueo y desobstrucción con equipo electromecánico de alta presión.' },
          { id: '3', text: 'Pruebas de evacuación y verificación de flujo continuo.' }
        ],
        laborCost: 45000,
        materialsCost: 15000,
        materialsDetail: 'Materiales básicos de ensamble, accesorios PVC y selladores herméticos.',
        applyIVA: false,
        createdAt: new Date().toISOString()
      };
      setEditingQuoteId(null);
      setQuote(fresh);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
  };

  // Guardar en Cloudflare D1
  const saveToCloud = async (
    overrideName?: string, 
    status: 'por_enviar' | 'enviada' = 'por_enviar',
    quoteOverride?: JobQuote
  ) => {
    const activeQuote = quoteOverride || quote;
    const finalName = overrideName || customFileName.trim() || `Cotizacion-${activeQuote.quoteNumber}`;
    const laborVal = Number(activeQuote.laborCost) || 0;
    const materialsVal = Number(activeQuote.materialsCost) || 0;
    const sub = laborVal + materialsVal;
    const iva = activeQuote.applyIVA ? Math.round(sub * (activeQuote.ivaRate || 0.13)) : 0;
    const tot = sub + iva;

    setIsSyncing(true);
    try {
      await api.saveQuote({
        id: activeQuote.id,
        appointment_id: activeQuote.appointmentId || quote.appointmentId || null,
        quote_number: activeQuote.quoteNumber,
        date: activeQuote.date,
        company_name: activeQuote.companyName,
        client_name: activeQuote.clientName || 'Cliente Particular',
        client_location: activeQuote.clientLocation,
        client_phone: activeQuote.clientPhone,
        work_reference: activeQuote.workReference,
        scope_items: activeQuote.scopeItems,
        labor_cost: laborVal,
        materials_cost: materialsVal,
        materials_detail: activeQuote.materialsDetail,
        apply_iva: activeQuote.applyIVA ? 1 : 0,
        delivery_time: activeQuote.deliveryTime,
        total_amount: tot,
        file_name: finalName,
        status,
        responsible_name: activeQuote.responsibleName,
        responsible_phone: activeQuote.responsiblePhone
      });
      await syncCloudQuotes();
      window.dispatchEvent(new CustomEvent('destaqueos_quotes_updated'));
    } catch (err) {
      console.warn('Cloud save error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Guardar específicamente para Enviar Después (en "Cotizaciones por Enviar")
  const handleSaveQuoteForLater = async (shouldScrollToTop = true) => {
    setIsSavingLater(true);

    const now = new Date();
    const userTimeStr = now.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Determinar ID y consecutivo único para NUNCA sobreescribir ni borrar cotizaciones previas
    let targetId = quote.id;
    let targetQuoteNumber = quote.quoteNumber;

    const existingIndex = savedHistory.findIndex((item) => item.id === targetId);
    const isExplicitlyEditing = editingQuoteId === targetId;
    const clientNameTrimmed = quote.clientName.trim();
    const existingClientName = existingIndex !== -1 ? savedHistory[existingIndex].clientName.trim() : '';
    const clientChanged = existingIndex !== -1 && clientNameTrimmed !== existingClientName;

    // Si ya existe en el historial y no se cargó expresamente para editarla, o si el cliente cambió:
    // Se genera un nuevo registro independiente para proteger y registrar TODAS las cotizaciones
    if (existingIndex !== -1 && (!isExplicitlyEditing || clientChanged)) {
      targetId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      targetQuoteNumber = generateQuoteNumber();
    }

    const clientClean = (clientNameTrimmed || 'Cliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '-');
    const finalName = `Cotizacion-${clientClean}-${targetQuoteNumber}`;

    const quoteToSave: JobQuote = {
      ...quote,
      id: targetId,
      quoteNumber: targetQuoteNumber,
      status: 'por_enviar'
    };

    // 1. Guardar de forma optimista inmediata en LocalStorage y Estado para reactividad instantánea
    const existing = savedHistory.find((item) => item.id === targetId);
    const entry: SavedQuoteEntry = {
      id: targetId,
      appointmentId: quote.appointmentId,
      fileName: finalName,
      savedAt: now.toISOString(),
      totalAmount: totalGeneral,
      clientName: quote.clientName || 'Cliente Particular',
      workReference: quote.workReference || 'Trabajo Técnico',
      status: 'por_enviar',
      viewCount: existing?.viewCount || 0,
      isDownloaded: existing?.isDownloaded || false,
      downloadedAt: existing?.downloadedAt || null,
      shareUrl: `${window.location.origin}/cotizacion/${targetId}`,
      quoteData: quoteToSave
    };

    // Conservar todas las anteriores y añadir o actualizar únicamente la actual
    const updated = [entry, ...savedHistory.filter((item) => item.id !== targetId)];
    setSavedHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('destaqueos_quotes_updated', { detail: quoteToSave }));

    // Mantener sincronizado el editor con el ID asignado
    setQuote(quoteToSave);
    setEditingQuoteId(targetId);

    // 2. Notificaciones y apertura de bandeja con HORA EXACTA REAL DEL USUARIO
    setSaveSuccessMessage(`✅ Cotización guardada en "Cotizaciones por Enviar" (${targetQuoteNumber} • ${quote.clientName || 'Cliente Particular'}) guardada hoy a las ${userTimeStr}. Lista para enviar.`);
    setIsHistoryOpen(true);
    setHistoryFilter('por_enviar');
    setSavedLaterFeedback(true);

    // Cancelar temporizadores activos para renovar el ciclo
    if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    if (saveSuccessTimerRef.current) clearTimeout(saveSuccessTimerRef.current);
    if (savedLaterTimerRef.current) clearTimeout(savedLaterTimerRef.current);

    // Mantener los mensajes en verde y la tarjeta activa
    saveSuccessTimerRef.current = setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 15000);

    savedLaterTimerRef.current = setTimeout(() => {
      setSavedLaterFeedback(false);
    }, 12000);

    // Esperar exactamente 10 segundos antes de subir automáticamente si el usuario no le da clic a "Ver arriba"
    autoScrollTimerRef.current = setTimeout(() => {
      scrollToTopPanel();
    }, 10000);

    // 4. Sincronización en la nube (Cloudflare D1) sin alterar cotizaciones anteriores
    try {
      await saveToCloud(finalName, 'por_enviar', quoteToSave);
    } catch (err) {
      console.warn('Sync cloud error:', err);
    } finally {
      setIsSavingLater(false);
    }
  };

  // Alternar estado de cotización (por enviar vs enviada)
  const handleToggleQuoteStatus = async (id: string, currentStatus?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus: 'por_enviar' | 'enviada' = currentStatus === 'enviada' ? 'por_enviar' : 'enviada';
    try {
      await api.updateQuoteStatus(id, newStatus);
    } catch {}
    const updated = savedHistory.map((item) => 
      item.id === id ? { ...item, status: newStatus, sentAt: newStatus === 'enviada' ? new Date().toISOString() : null } : item
    );
    setSavedHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Enviar cualquier cotización guardada directamente por WhatsApp y marcarla como enviada
  const handleSendQuoteViaWhatsApp = async (entry: SavedQuoteEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const q = entry.quoteData;
    const laborVal = Number(q.laborCost) || 0;
    const matVal = Number(q.materialsCost) || 0;
    const sub = laborVal + matVal;
    const iva = q.applyIVA ? Math.round(sub * (q.ivaRate || 0.13)) : 0;
    const tot = sub + iva;

    const itemsList = q.scopeItems
      .filter((i) => i.text.trim())
      .map((i, idx) => `  ${idx + 1}. ${i.text}`)
      .join('\n');

    const shareUrl = `${window.location.origin}/cotizacion/${entry.id}`;

    const msg = `Hola *${q.clientName || 'Cliente'}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.

Ya realicé su cotización oficial para *${q.workReference || 'el servicio solicitado'}*.

📋 *COTIZACIÓN OFICIAL — ${q.companyName.toUpperCase()}*
*N° de Control:* ${q.quoteNumber}
*Fecha de Emisión:* ${q.date}
*Cliente / Lugar:* ${q.clientName || 'Cliente Particular'} ${q.clientLocation ? `(${q.clientLocation})` : ''}

🛠️ *Referencia del Trabajo:*
${q.workReference || 'Trabajo Técnico Especializado'}

📝 *Alcance de Trabajos a Realizar:*
${itemsList || '  • Trabajos técnicos especializados de acuerdo a inspección.'}

💰 *Desglose Económico:*
• Mano de Obra: ₡${laborVal.toLocaleString('es-CR')}
• Estimado de Materiales: ₡${matVal.toLocaleString('es-CR')}
• Subtotal: ₡${sub.toLocaleString('es-CR')}
${q.applyIVA ? `• IVA (13% Factura Electrónica): ₡${iva.toLocaleString('es-CR')}\n` : ''}*TOTAL GENERAL:* ₡${tot.toLocaleString('es-CR')}

⏱️ *Tiempo Estimado de Entrega:* ${q.deliveryTime}
✅ *Condiciones:* ${q.paymentTerms}
🛡️ *Garantía:* 100% satisfacción y servicio profesional garantizado.

🌐 *Ver y Descargar Cotización Oficial en Línea:*
👉 ${shareUrl}

👤 *Atendido por:* ${q.responsibleName} (${q.responsibleTitle})
📞 *Teléfono:* ${q.responsiblePhone}
📸 *Instagram:* ${SOCIAL_URLS.instagram}
🌐 *Web:* ${q.websiteUrl}

_Esta cotización fue generada de manera digital por Destaqueos y Tanques Sépticos Mauricio Marín._`;

    try {
      await api.updateQuoteStatus(entry.id, 'enviada');
    } catch {}

    const updated = savedHistory.map((item) => 
      item.id === entry.id ? { ...item, status: 'enviada' as const, sentAt: new Date().toISOString() } : item
    );
    setSavedHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    const text = encodeURIComponent(msg);
    const phone = q.clientPhone ? q.clientPhone.replace(/\D/g, '') : '';
    const url = phone.length >= 8 
      ? `https://wa.me/506${phone.slice(-8)}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Generar texto para WhatsApp con enlace dinámico
  const generateWhatsAppMessage = () => {
    const itemsList = quote.scopeItems
      .filter((i) => i.text.trim())
      .map((i, idx) => `  ${idx + 1}. ${i.text}`)
      .join('\n');

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://destaqueosmarin.pages.dev'}/cotizacion/${quote.id}`;

    const msg = `Hola *${quote.clientName || 'Cliente'}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.

Ya realicé su cotización oficial para *${quote.workReference || 'el servicio solicitado'}*.

📋 *COTIZACIÓN OFICIAL — ${quote.companyName.toUpperCase()}*
*N° de Control:* ${quote.quoteNumber}
*Fecha de Emisión:* ${quote.date}
*Cliente / Lugar:* ${quote.clientName || 'Cliente Particular'} ${quote.clientLocation ? `(${quote.clientLocation})` : ''}

🛠️ *Referencia del Trabajo:*
${quote.workReference || 'Trabajo Técnico Especializado'}

📝 *Alcance de Trabajos a Realizar:*
${itemsList || '  • Trabajos técnicos especializados de acuerdo a inspección.'}

💰 *Desglose Económico:*
• Mano de Obra: ₡${labor.toLocaleString('es-CR')}
• Estimado de Materiales: ₡${materials.toLocaleString('es-CR')}
• Subtotal: ₡${subtotal.toLocaleString('es-CR')}
${quote.applyIVA ? `• IVA (13% Factura Electrónica): ₡${ivaAmount.toLocaleString('es-CR')}\n` : ''}*TOTAL GENERAL:* ₡${totalGeneral.toLocaleString('es-CR')}

⏱️ *Tiempo Estimado de Entrega:* ${quote.deliveryTime}
✅ *Condiciones:* ${quote.paymentTerms}
🛡️ *Garantía:* 100% satisfacción y servicio profesional garantizado.

🌐 *Ver y Descargar Cotización Oficial en Línea:*
👉 ${shareUrl}

👤 *Atendido por:* ${quote.responsibleName} (${quote.responsibleTitle})
📞 *Teléfono:* ${quote.responsiblePhone}
📸 *Instagram:* ${SOCIAL_URLS.instagram}
🌐 *Web:* ${quote.websiteUrl}

_Esta cotización fue generada de manera digital por Destaqueos y Tanques Sépticos Mauricio Marín._`;

    return msg;
  };

  const handleShareWhatsApp = async () => {
    await saveToCloud(undefined, 'enviada');
    setSavedHistory((prev) => 
      prev.map((item) => item.id === quote.id ? { ...item, status: 'enviada', sentAt: new Date().toISOString() } : item)
    );
    const text = encodeURIComponent(generateWhatsAppMessage());
    const phone = quote.clientPhone ? quote.clientPhone.replace(/\D/g, '') : '';
    const url = phone.length >= 8 
      ? `https://wa.me/506${phone.slice(-8)}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateWhatsAppMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleOpenShareModal = async () => {
    await saveToCloud(undefined, 'enviada');
    setSavedHistory((prev) => 
      prev.map((item) => item.id === quote.id ? { ...item, status: 'enviada', sentAt: new Date().toISOString() } : item)
    );
    setIsShareModalOpen(true);
  };

  const handleCopyShareLink = async (customId?: string, withHeader = false) => {
    const targetId = customId || quote.id;
    const url = `${window.location.origin}/cotizacion/${targetId}`;
    
    let textToCopy = url;
    if (withHeader) {
      const client = quote.clientName ? quote.clientName.trim() : 'Cliente Particular';
      textToCopy = `Hola *${client}*, le saluda el técnico de *Destaqueos y Tanques Sépticos Mauricio Marín* 🚛.\n\nYa realicé su cotización oficial para ${quote.workReference || 'el trabajo solicitado'}.\n\n📋 *COTIZACIÓN OFICIAL — ${quote.companyName.toUpperCase()}*\n*N°:* ${quote.quoteNumber} | *Cliente:* ${client}\n💰 *Monto Cotizado:* ₡${totalGeneral.toLocaleString('es-CR')}\n\n👉 *Consulte y descargue su cotización oficial aquí:*\n${url}`;
      setCopiedWithTitle(true);
      setTimeout(() => setCopiedWithTitle(false), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (e) {}
  };

  // Abrir Modal de Guardar y Descargar con nombre sugerido
  const handleOpenDownloadModal = () => {
    const clientClean = quote.clientName.trim()
      ? quote.clientName.trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '-')
      : 'Cliente';
    const suggested = `Cotizacion-${clientClean}-${quote.quoteNumber}`;
    setCustomFileName(suggested);
    setIsDownloadModalOpen(true);
  };

  // Guardar en el sistema (Historial persistente y Cloudflare D1)
  const handleSaveToSystem = async () => {
    const now = new Date();
    const userTimeStr = now.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', hour12: true });

    let targetId = quote.id;
    let targetQuoteNumber = quote.quoteNumber;

    const existingIndex = savedHistory.findIndex((item) => item.id === targetId);
    const isExplicitlyEditing = editingQuoteId === targetId;
    const clientNameTrimmed = quote.clientName.trim();
    const existingClientName = existingIndex !== -1 ? savedHistory[existingIndex].clientName.trim() : '';
    const clientChanged = existingIndex !== -1 && clientNameTrimmed !== existingClientName;

    if (existingIndex !== -1 && (!isExplicitlyEditing || clientChanged)) {
      targetId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      targetQuoteNumber = generateQuoteNumber();
    }

    const finalName = customFileName.trim() || `Cotizacion-${targetQuoteNumber}`;
    const quoteToSave: JobQuote = { ...quote, id: targetId, quoteNumber: targetQuoteNumber };

    await saveToCloud(finalName, undefined, quoteToSave);

    const existing = savedHistory.find((item) => item.id === targetId);
    const entryStatus = existing?.status || 'por_enviar';
    const entry: SavedQuoteEntry = {
      id: targetId,
      appointmentId: quote.appointmentId,
      fileName: finalName,
      savedAt: now.toISOString(),
      totalAmount: totalGeneral,
      clientName: quote.clientName || 'Cliente Particular',
      workReference: quote.workReference || 'Trabajo Técnico',
      status: entryStatus,
      sentAt: existing?.sentAt || null,
      viewCount: existing?.viewCount || 0,
      isDownloaded: existing?.isDownloaded || false,
      downloadedAt: existing?.downloadedAt || null,
      shareUrl: `${window.location.origin}/cotizacion/${targetId}`,
      quoteData: { ...quoteToSave, status: entryStatus }
    };

    const updated = [entry, ...savedHistory.filter((item) => item.id !== targetId)];
    setSavedHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('destaqueos_quotes_updated', { detail: quoteToSave }));

    setQuote(quoteToSave);
    setEditingQuoteId(targetId);

    setSaveSuccessMessage(`✅ Guardado con éxito como "${finalName}" a las ${userTimeStr} en el sistema.`);
    if (saveSuccessTimerRef.current) clearTimeout(saveSuccessTimerRef.current);
    saveSuccessTimerRef.current = setTimeout(() => setSaveSuccessMessage(null), 10000);
  };

  // Cargar cotización desde el historial
  const handleLoadFromHistory = (entry: SavedQuoteEntry) => {
    if (confirm(`¿Desea cargar la cotización "${entry.fileName}"? Reemplazará los campos actuales del editor.`)) {
      setEditingQuoteId(entry.id);
      setQuote(entry.quoteData);
      setIsHistoryOpen(false);
      setActiveMobileView('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Eliminar del historial y de D1
  const handleDeleteFromHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta cotización del historial guardado?')) {
      try {
        await api.deleteQuote(id);
      } catch (err) {}
      const updated = savedHistory.filter((item) => item.id !== id);
      setSavedHistory(updated);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {}
    }
  };

  // Descarga limpia como PDF (Impresión dirigida exclusivamente a la hoja de cotización)
  const handlePrintOrDownloadPDF = (fileName?: string) => {
    const targetName = fileName || customFileName.trim() || `Cotizacion-${quote.quoteNumber}`;
    const previousTitle = document.title;
    document.title = targetName.replace(/\.pdf$/i, '');
    
    window.print();

    setTimeout(() => {
      document.title = previousTitle;
    }, 1500);
  };

  // Descarga directa como archivo HTML membretado sin conexión
  const handleDownloadHTML = () => {
    const finalName = customFileName.trim() || `Cotizacion-${quote.quoteNumber}`;
    const currentLogoUrl = quote.customLogoUrl || quote.companyLogoUrl || DEFAULT_LOGO;

    const itemsHTML = quote.scopeItems
      .filter((i) => i.text.trim())
      .map((i, idx) => `<tr><td style="padding: 6px 10px; font-weight: bold; width: 24px;">${idx + 1}.</td><td style="padding: 6px 10px;">${i.text}</td></tr>`)
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${finalName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 25px; color: #0f172a; background: #ffffff; }
    .sheet { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .top-bar { height: 6px; background: linear-gradient(90deg, #67141d, #8B1826, #0066CC); margin: -32px -32px 24px -32px; border-radius: 16px 16px 0 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
    .company { font-size: 20px; font-weight: 900; color: #67141d; margin: 0; }
    .badge { background: #67141d; color: white; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 900; display: inline-block; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin: 18px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .total-row { background: #fdf2f3; color: #67141d; font-weight: 900; font-size: 16px; }
    .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    @media print { body { padding: 0; } .sheet { border: none; box-shadow: none; padding: 10px; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top-bar"></div>
    <div class="header">
      <div>
        <h1 class="company">${quote.companyName}</h1>
        <p style="margin: 3px 0; font-size: 12px; color: #64748b; font-weight: bold;">Especialistas en Tuberías & Detección Técnica</p>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Costa Rica • Tel. ${quote.responsiblePhone}</p>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 900; font-family: monospace; font-size: 14px; color: #0f172a;">${quote.quoteNumber}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Fecha: <strong>${quote.date}</strong></div>
      </div>
    </div>

    <div class="box">
      <strong>Cotizado Para:</strong> ${quote.clientName || 'Cliente Particular'}<br>
      <strong>Lugar / Ubicación:</strong> ${quote.clientLocation || 'Área Metropolitana'}<br>
      ${quote.clientPhone ? `<strong>Teléfono:</strong> ${quote.clientPhone}<br>` : ''}
      <strong>Referencia:</strong> ${quote.workReference || 'Trabajo Técnico Especializado'}
    </div>

    <div style="margin: 18px 0;">
      <strong style="font-size: 12px; text-transform: uppercase; color: #475569;">Alcance de Trabajos a Realizar:</strong>
      <table>${itemsHTML}</table>
    </div>

    <div style="margin: 18px 0;">
      <strong style="font-size: 12px; text-transform: uppercase; color: #475569;">Desglose Económico:</strong>
      <table>
        <thead><tr><th>Concepto</th><th style="text-align: right;">Monto Estimado</th></tr></thead>
        <tbody>
          <tr><td>Mano de Obra Calificada</td><td style="text-align: right; font-weight: bold;">₡${labor.toLocaleString('es-CR')}</td></tr>
          <tr><td>Estimado de Materiales (${quote.materialsDetail || 'Insumos de instalación'})</td><td style="text-align: right; font-weight: bold;">₡${materials.toLocaleString('es-CR')}</td></tr>
          <tr style="background: #f8fafc;"><td>Subtotal:</td><td style="text-align: right; font-weight: bold;">₡${subtotal.toLocaleString('es-CR')}</td></tr>
          ${quote.applyIVA ? `<tr style="background: #f8fafc;"><td>IVA 13% (Factura Electrónica):</td><td style="text-align: right; font-weight: bold;">₡${ivaAmount.toLocaleString('es-CR')}</td></tr>` : ''}
          <tr class="total-row"><td>TOTAL GENERAL COTIZADO:</td><td style="text-align: right;">₡${totalGeneral.toLocaleString('es-CR')}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="box" style="font-size: 12px;">
      <strong>Tiempo Estimado de Entrega:</strong> ${quote.deliveryTime}<br>
      <strong>Condiciones:</strong> ${quote.paymentTerms} (Materiales certificados y garantía técnica por escrito).
    </div>

    <div class="footer">
      <div>
        <div style="font-size: 15px; font-weight: bold; color: #67141d;">${quote.responsibleName}</div>
        <div style="font-size: 11px; color: #64748b;">${quote.responsibleTitle}</div>
        <div style="font-size: 12px; font-weight: bold; color: #0066CC;">Tel: ${quote.responsiblePhone}</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #475569;">
        <div><strong>WhatsApp Directo:</strong> 6114-1421</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${quote.websiteUrl}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalName.endsWith('.html') ? finalName : finalName + '.html'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentLogo = quote.customLogoUrl || quote.companyLogoUrl || DEFAULT_LOGO;

  const pendingQuotes = savedHistory.filter((item) => (item.status || 'por_enviar') === 'por_enviar');
  const sentQuotes = savedHistory.filter((item) => item.status === 'enviada');
  const itemsToDisplay = historyFilter === 'por_enviar' ? pendingQuotes : savedHistory;

  return (
    <div className="space-y-6">
      
      {/* Barra de Acciones y Switch de Vista Móvil */}
      <div className="no-print bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-dark flex items-center gap-2">
              <span>Cotizador de Trabajos</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Automático
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Cree cotizaciones automáticas con desglose de mano de obra, materiales e IVA.
            </p>
          </div>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Switch Móvil */}
          <div className="flex md:hidden bg-slate-100 p-1 rounded-2xl text-xs font-black w-full justify-center mb-1">
            <button
              type="button"
              onClick={() => setActiveMobileView('editor')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeMobileView === 'editor' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500'
              }`}
            >
              Editar Datos
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileView('preview')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeMobileView === 'preview' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500'
              }`}
            >
              Ver Documento
            </button>
          </div>

          {/* BOTÓN MANDATORIO: Guardar Cotización para Enviar Después */}
          <button
            type="button"
            onClick={() => handleSaveQuoteForLater(false)}
            disabled={isSavingLater || isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Guardar cotización en 'Cotizaciones por Enviar' para enviarla luego al cliente"
          >
            {isSavingLater ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <BookmarkPlus className="w-4 h-4" />
            )}
            <span>{isSavingLater ? 'Guardando...' : 'Guardar Cotización'}</span>
          </button>

          {/* BOTÓN: Cotizaciones por Enviar (con contador de pendientes) */}
          <button
            type="button"
            onClick={() => {
              setIsHistoryOpen(!isHistoryOpen);
              setHistoryFilter('por_enviar');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              pendingQuotes.length > 0
                ? 'text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-xs'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200'
            }`}
            title="Ver cotizaciones guardadas para enviar después"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Por Enviar</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              pendingQuotes.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {pendingQuotes.length}
            </span>
          </button>

          {/* Botón: Compartir Enlace Dinámico con Cliente */}
          <button
            type="button"
            onClick={handleOpenShareModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Compartir link dinámico con el cliente y rastrear descarga en vivo"
          >
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Compartir Enlace</span>
          </button>

          {/* Botón: Descargar / Guardar con Nombre */}
          <button
            type="button"
            onClick={handleOpenDownloadModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Poner nombre, guardar en el sistema y descargar"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Enviar cotización formateada por WhatsApp con enlace directo"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrintOrDownloadPDF()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue/90 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Imprimir solo la hoja de cotización oficial"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
            title="Copiar texto de cotización"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleResetQuote(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
            title="Crear nueva cotización en blanco para otro cliente"
          >
            <Plus className="w-4 h-4 text-brand-blue" />
            <span className="hidden sm:inline">Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* AVISO DE COTIZACIÓN ASOCIADA A CITA DE CLIENTE */}
      {quote.appointmentId && (
        <div className="no-print bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 text-emerald-950 font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3" />
              Para Cliente
            </span>
            <span>
              Cotización personalizada para: <strong>{quote.clientName || 'Cliente Particular'}</strong> {quote.clientPhone ? `• Tel: ${quote.clientPhone}` : ''} {quote.workReference ? `• ${quote.workReference}` : ''}
            </span>
          </div>
          {onClearQuoteToEdit && (
            <button
              type="button"
              onClick={() => {
                onClearQuoteToEdit();
                handleResetQuote(true);
              }}
              className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-black border border-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cotización en Blanco</span>
            </button>
          )}
        </div>
      )}

      {/* AVISO DE COTIZACIÓN EN EDICIÓN */}
      {editingQuoteId && (
        <div className="no-print bg-amber-50 border border-amber-300 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[10px] font-black uppercase">
              Modo Edición
            </span>
            <span>Editando cotización guardada: <strong>{quote.quoteNumber}</strong> ({quote.clientName || 'Sin cliente'})</span>
          </div>
          <button
            type="button"
            onClick={() => handleResetQuote(true)}
            className="px-3 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-black border border-amber-300 text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Otra Nueva</span>
          </button>
        </div>
      )}

      {/* MENSAJE DE CONFIRMACIÓN DE GUARDADO CON HORA EXACTA (10 SEGUNDOS) */}
      {saveSuccessMessage && (
        <div className="no-print bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-black">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={scrollToTopPanel}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-black underline cursor-pointer"
            >
              Ver arriba ↑
            </button>
            <button
              type="button"
              onClick={() => {
                if (saveSuccessTimerRef.current) clearTimeout(saveSuccessTimerRef.current);
                setSaveSuccessMessage(null);
              }}
              className="p-1 hover:bg-white/20 rounded-lg text-white cursor-pointer"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ALERTA DE ESTADO EN TIEMPO REAL: Si el cliente ya descargó la cotización */}
      {activeSavedEntry?.isDownloaded && (
        <div className="no-print bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  ¡Notificación: Cotización Descargada por el Cliente!
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                  {activeSavedEntry.downloadedAt}
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                El cliente <strong>{activeSavedEntry.clientName || quote.clientName}</strong> ya descargó el PDF oficial. Toma esto en cuenta antes de modificar costos o alcances.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenShareModal}
            className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            Ver Enlace / Estado
          </button>
        </div>
      )}

      {/* Si fue vista pero aún no descargada */}
      {activeSavedEntry && Boolean(activeSavedEntry.viewCount && activeSavedEntry.viewCount > 0 && !activeSavedEntry.isDownloaded) && (
        <div className="no-print bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 block">
                El cliente abrió el enlace {activeSavedEntry.viewCount} {activeSavedEntry.viewCount === 1 ? 'vez' : 'veces'}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                Aún no la ha descargado. Puedes ajustar cualquier detalle si te solicita cambios.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenShareModal}
            className="shrink-0 px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
          >
            Detalles del Enlace
          </button>
        </div>
      )}

      {/* PANEL DESPLEGABLE DE COTIZACIONES POR ENVIAR & GUARDADAS */}
      {isHistoryOpen && (
        <div id="cotizaciones-por-enviar-panel" className="no-print bg-white p-5 rounded-3xl border-2 border-amber-300/80 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
                  <span>Cotizaciones por Enviar & Guardadas</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                    {pendingQuotes.length} pendientes
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Gestiona las cotizaciones listas para enviar a tus clientes o que guardaste para después.
                </p>
              </div>
            </div>

            {/* Pestañas de Filtro y Botón Cerrar */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-black">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('por_enviar')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyFilter === 'por_enviar'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-brand-dark'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Por Enviar ({pendingQuotes.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('todas')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyFilter === 'todas'
                      ? 'bg-brand-dark text-white shadow-xs'
                      : 'text-slate-600 hover:text-brand-dark'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Todas ({savedHistory.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                title="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista de Cotizaciones o Estado Vacío */}
          {itemsToDisplay.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider">
                {historyFilter === 'por_enviar' 
                  ? 'No tienes cotizaciones pendientes por enviar' 
                  : 'Aún no hay cotizaciones guardadas'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {historyFilter === 'por_enviar'
                  ? 'Todas las cotizaciones han sido enviadas o puedes crear una nueva y presionar "Guardar Cotización" para almacenarla aquí.'
                  : 'Empieza rellenando el formulario y pulsa "Guardar Cotización" para conservarla.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1">
              {itemsToDisplay.map((item) => {
                const isPending = (item.status || 'por_enviar') === 'por_enviar';
                return (
                  <div
                    key={item.id}
                    onClick={() => handleLoadFromHistory(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative group shadow-xs ${
                      isPending 
                        ? 'bg-amber-50/40 hover:bg-amber-50 border-amber-200 hover:border-amber-400' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-6">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-black text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {item.quoteData?.quoteNumber || item.fileName}
                          </span>
                          {/* Badges de Estado Principal */}
                          {item.status === 'aceptada' ? (
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              <span>Aceptada por Cliente</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                              <Clock className="w-3 h-3" />
                              <span>Por Enviar</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                              <Send className="w-3 h-3" />
                              <span>Enviada</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-brand-dark truncate mt-1">
                          {item.fileName}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteFromHistory(item.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 absolute top-2.5 right-2.5 transition-colors"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] space-y-0.5">
                      <p className="text-slate-600 truncate font-semibold">
                        Cliente: <span className="text-brand-dark font-black">{item.clientName}</span>
                      </p>
                      {item.quoteData?.clientPhone && (
                        <p className="text-slate-400 font-medium text-[10px]">
                          Tel: {item.quoteData.clientPhone}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.workReference}
                      </p>
                    </div>

                    {/* Alertas de interacción del cliente */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.isDownloaded ? (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Descargada ({item.downloadedAt || 'Cliente'})</span>
                        </span>
                      ) : Boolean(item.viewCount && item.viewCount > 0) ? (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <Eye className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>Vista {item.viewCount} {item.viewCount === 1 ? 'vez' : 'veces'}</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Fecha, Hora Real del Usuario y Monto Total */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="font-mono text-slate-600 font-bold text-[10px] flex items-center gap-1" title="Fecha y hora exacta de guardado">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{formatUserLocalTime(item.savedAt)}</span>
                      </span>
                      <span className="font-black text-emerald-800 text-xs">
                        ₡{item.totalAmount.toLocaleString('es-CR')}
                      </span>
                    </div>

                    {/* Acciones directas por cotización */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100">
                      {/* Botón WhatsApp: envía y marca como enviada */}
                      <button
                        type="button"
                        onClick={(e) => handleSendQuoteViaWhatsApp(item, e)}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                        title="Enviar cotización oficial por WhatsApp y marcar como enviada"
                      >
                        <MessageSquare className="w-3 h-3 fill-white" />
                        <span>Enviar WhatsApp</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Botón Cargar en Editor */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadFromHistory(item);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Cargar en el editor para modificar o revisar"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        {/* Copiar enlace */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyShareLink(item.id);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                          title="Copiar link dinámico para enviar al cliente"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Link</span>
                        </button>

                        {/* Alternar estado */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleQuoteStatus(item.id, item.status, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title={isPending ? 'Marcar como enviada' : 'Mover de vuelta a Por Enviar'}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {/* Ver enlace online */}
                        <a
                          href={`/cotizacion/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-100"
                          title="Abrir vista de cliente en nueva pestaña"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE GUARDAR Y DESCARGAR CON NOMBRE PERSONALIZADO */}
      {isDownloadModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-dark">Guardar y Descargar Cotización</h3>
                  <p className="text-[11px] text-slate-500">Asigne un nombre para identificarla y descargarla</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-brand-dark uppercase tracking-wider">
                Nombre de la Cotización / Archivo:
              </label>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="Ej. Cotizacion-Casa-Curridabat"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                autoFocus
              />
              <p className="text-[10px] text-slate-400">
                Este nombre se usará para el archivo guardado y descargado.
              </p>
            </div>

            {/* Opciones de Acción */}
            <div className="space-y-2 pt-1">
              {/* Botón 1: Guardar en el sistema */}
              <button
                type="button"
                onClick={handleSaveToSystem}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <FolderDown className="w-4 h-4" />
                <span>1. Guardar en el Sistema</span>
              </button>

              {/* Botón 2: Descargar PDF Oficial con ese nombre */}
              <button
                type="button"
                onClick={() => {
                  handleSaveToSystem();
                  handlePrintOrDownloadPDF(customFileName);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-brand-blue hover:bg-brand-blue/90 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>2. Descargar como PDF (Hoja Oficial)</span>
              </button>

              {/* Botón 3: Descargar Archivo HTML Independiente */}
              <button
                type="button"
                onClick={() => {
                  handleSaveToSystem();
                  handleDownloadHTML();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>3. Descargar Archivo HTML Membretado</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COMPARTIR ENLACE DINÁMICO Y RASTREO EN VIVO */}
      {isShareModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-dark">Enlace Dinámico de Cotización</h3>
                  <p className="text-[11px] text-slate-500">Compártelo con tu cliente para que la vea y descargue en línea</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado de Descarga en Tiempo Real */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              activeSavedEntry?.isDownloaded 
                ? 'bg-emerald-50 border-emerald-300' 
                : activeSavedEntry?.viewCount && activeSavedEntry.viewCount > 0
                ? 'bg-amber-50 border-amber-300'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Rastreo de Apertura y Descarga
                </span>
                {activeSavedEntry?.isDownloaded ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>DESCARGADA</span>
                  </span>
                ) : activeSavedEntry?.viewCount && activeSavedEntry.viewCount > 0 ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-amber-700" />
                    <span>VISTA {activeSavedEntry.viewCount} VECES</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    PENDIENTE
                  </span>
                )}
              </div>

              {activeSavedEntry?.isDownloaded ? (
                <div className="text-xs text-emerald-900 font-bold space-y-0.5">
                  <p>✅ El cliente ya descargó el documento oficial en PDF.</p>
                  <p className="text-[11px] text-emerald-700 font-normal">
                    Registrado el: <strong>{activeSavedEntry.downloadedAt}</strong>. El cliente ya cuenta con la copia formal de esta cotización.
                  </p>
                </div>
              ) : activeSavedEntry?.viewCount && activeSavedEntry.viewCount > 0 ? (
                <div className="text-xs text-amber-900 font-bold space-y-0.5">
                  <p>👁️ El cliente ya abrió la cotización en su navegador ({activeSavedEntry.viewCount} visitas), pero aún no la descarga.</p>
                  <p className="text-[11px] text-amber-700 font-normal">
                    Puedes realizar ajustes en el editor; el cliente verá los cambios cuando vuelva a abrir el enlace.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-600 font-medium space-y-0.5">
                  <p>⏳ El enlace está activo y sincronizado en la nube.</p>
                  <p className="text-[11px] text-slate-500 font-normal">
                    En cuanto tu cliente lo abra o descargue, te aparecerá la notificación de estado de manera automática.
                  </p>
                </div>
              )}
            </div>

            {/* VISTA PREVIA VISUAL DE CÓMO SE VE EL TÍTULO EN WHATSAPP */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <span>Título generado para WhatsApp:</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                  Vista Previa Enlace
                </span>
              </div>
              
              <div className="bg-[#f0f2f5] p-2.5 rounded-xl border border-slate-300 flex items-center gap-3 shadow-xs">
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img src={DEFAULT_LOGO} alt="Destaqueos Mauricio Marín" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-black text-slate-900 truncate">
                    📋 Cotización Oficial: {quote.clientName || 'Cliente'} ({quote.quoteNumber})
                  </h5>
                  <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-tight">
                    Cotización formal de {quote.companyName}. Monto: ₡{totalGeneral.toLocaleString('es-CR')}. Toque para consultar y descargar en PDF.
                  </p>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate">
                    destaqueosmarin.pages.dev/cotizacion/...
                  </span>
                </div>
              </div>
            </div>

            {/* Input con Botones de Copiado */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-brand-dark uppercase tracking-wider">
                Enlace Único de la Cotización:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/cotizacion/${quote.id}`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-brand-dark select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(quote.id, false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  title="Copiar solo la dirección web"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? '¡Copiado!' : 'Solo Link'}</span>
                </button>
              </div>

              {/* Botón Destacado: Copiar con Título de Cotización */}
              <button
                type="button"
                onClick={() => handleCopyShareLink(quote.id, true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                title="Copiar texto con encabezado formal de cotización y enlace web para WhatsApp"
              >
                {copiedWithTitle ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-indigo-600" />}
                <span>{copiedWithTitle ? '¡Copiado con Encabezado Oficial!' : 'Copiar Enlace con Título para WhatsApp'}</span>
              </button>
            </div>

            {/* Botones de Envío Rápido y Vista Previa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Enviar por WhatsApp</span>
              </button>

              <a
                href={`/cotizacion/${quote.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span>Abrir como Cliente</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cuadrícula Principal: Formulario a la Izquierda / Hoja en Vivo a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            COLUMNA IZQUIERDA: FORMULARIO DE EDICIÓN ÁGIL
           ======================================================== */}
        <div className={`no-print lg:col-span-5 space-y-5 ${
          activeMobileView === 'preview' ? 'hidden lg:block' : 'block'
        }`}>
          
          {/* BLOQUE 1: Identidad, Logo y Consecutivo */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4 text-brand-blue" />
              <span>1. Empresa y Logo de Cotización</span>
            </h3>

            {/* Logo oficial y subida de foto personalizada */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-1.5 overflow-hidden shadow-xs shrink-0">
                <img 
                  src={currentLogo} 
                  alt="Logo Cotización" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block truncate">
                  {quote.customLogoUrl ? 'Foto personalizada cargada' : 'Logo Oficial: Camión Cisterna Mauricio Marín'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload-input"
                  />
                  <label
                    htmlFor="logo-upload-input"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-blue bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Subir Foto / Logo</span>
                  </label>

                  {quote.customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Restablecer oficial
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  value={quote.companyName}
                  onChange={(e) => setQuote({ ...quote, companyName: e.target.value })}
                  placeholder="Destaqueos y Tanques Sépticos Mauricio Marín"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  N° Cotización (Consecutivo)
                </label>
                <input
                  type="text"
                  value={quote.quoteNumber}
                  onChange={(e) => setQuote({ ...quote, quoteNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Fecha de Emisión (Automática / Editable)
              </label>
              <input
                type="date"
                value={quote.date}
                onChange={(e) => setQuote({ ...quote, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          {/* BLOQUE 2: Datos del Cliente y Lugar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-brand-blue" />
              <span>2. Cliente y Lugar de Trabajo</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Nombre del Cliente o Empresa
              </label>
              <input
                type="text"
                value={quote.clientName}
                onChange={(e) => setQuote({ ...quote, clientName: e.target.value })}
                placeholder="Ej: Lic. Mauricio Alvarado / Condominio Montesol"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Lugar / Dirección
                </label>
                <input
                  type="text"
                  value={quote.clientLocation}
                  onChange={(e) => setQuote({ ...quote, clientLocation: e.target.value })}
                  placeholder="Ej: Curridabat, San José"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={quote.clientPhone}
                  onChange={(e) => setQuote({ ...quote, clientPhone: e.target.value })}
                  placeholder="Ej: 8888-0000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </div>
          </div>

          {/* BLOQUE 3: Referencia y Alcance Línea por Línea */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4 text-brand-blue" />
              <span>3. Trabajo y Descripción Línea por Línea</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Referencia del Trabajo
              </label>
              <input
                type="text"
                value={quote.workReference}
                onChange={(e) => setQuote({ ...quote, workReference: e.target.value })}
                placeholder="Ej: Instalación de tubería sanitaria y destaqueo de tramo principal"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Puntos a Realizar (Línea por Línea):
                </label>
                <button
                  type="button"
                  onClick={handleAddScopeItem}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:text-brand-dark transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Punto</span>
                </button>
              </div>

              <div className="space-y-2">
                {quote.scopeItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateScopeItem(item.id, e.target.value)}
                      placeholder={`Punto ${idx + 1} del trabajo...`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                    {quote.scopeItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScopeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar punto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BLOQUE 4: Desglose de Mano de Obra, Materiales e IVA */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>4. Desglose Económico</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Mano de Obra (₡)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₡</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={quote.laborCost || ''}
                    onChange={(e) => setQuote({ ...quote, laborCost: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Estimado de Materiales (₡)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₡</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={quote.materialsCost || ''}
                    onChange={(e) => setQuote({ ...quote, materialsCost: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Detalle / Lista de Materiales Estimados
              </label>
              <textarea
                rows={2}
                value={quote.materialsDetail}
                onChange={(e) => setQuote({ ...quote, materialsDetail: e.target.value })}
                placeholder="Ej: Tubería PVC 4 pulgadas, codos sanitarios, pegamento, cemento rápido..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
              />
            </div>

            {/* Checkbox IVA Factura Electrónica */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-brand-dark block">
                  ¿Aplica IVA para Factura Electrónica?
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Se añade 13% sobre el subtotal si el cliente lo requiere.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={quote.applyIVA}
                  onChange={(e) => setQuote({ ...quote, applyIVA: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Resumen Calculado */}
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/70 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Subtotal (Mano de obra + Materiales):</span>
                <span>₡{subtotal.toLocaleString('es-CR')}</span>
              </div>
              {quote.applyIVA && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>IVA 13%:</span>
                  <span>₡{ivaAmount.toLocaleString('es-CR')}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-950 font-black text-sm pt-1 border-t border-emerald-200">
                <span>Total General:</span>
                <span>₡{totalGeneral.toLocaleString('es-CR')}</span>
              </div>
            </div>
          </div>

          {/* BLOQUE 5: Tiempo de Entrega y Checkpoints */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              <span>5. Tiempo de Entrega y Condiciones</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Tiempo Estimado de Ejecución / Entrega
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                {['Mismo día', '1 día hábil', '2 días hábiles', '1 semana'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setQuote({ ...quote, deliveryTime: opt })}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      quote.deliveryTime === opt
                        ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={quote.deliveryTime}
                onChange={(e) => setQuote({ ...quote, deliveryTime: e.target.value })}
                placeholder="Personalizar tiempo..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Checkpoints y Garantías Incluidas:
              </label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={quote.checkpoints.paymentOnDelivery}
                    onChange={(e) => setQuote({
                      ...quote,
                      checkpoints: { ...quote.checkpoints, paymentOnDelivery: e.target.checked }
                    })}
                    className="rounded text-brand-blue focus:ring-brand-blue"
                  />
                  <span>100% contra entrega y total satisfacción al cliente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={quote.checkpoints.certifiedMaterials}
                    onChange={(e) => setQuote({
                      ...quote,
                      checkpoints: { ...quote.checkpoints, certifiedMaterials: e.target.checked }
                    })}
                    className="rounded text-brand-blue focus:ring-brand-blue"
                  />
                  <span>Materiales certificados y de primera calidad constructiva</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={quote.checkpoints.satisfactionGuarantee}
                    onChange={(e) => setQuote({
                      ...quote,
                      checkpoints: { ...quote.checkpoints, satisfactionGuarantee: e.target.checked }
                    })}
                    className="rounded text-brand-blue focus:ring-brand-blue"
                  />
                  <span>Garantía técnica por escrito en mano de obra</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={quote.checkpoints.noHiddenCosts}
                    onChange={(e) => setQuote({
                      ...quote,
                      checkpoints: { ...quote.checkpoints, noHiddenCosts: e.target.checked }
                    })}
                    className="rounded text-brand-blue focus:ring-brand-blue"
                  />
                  <span>Sin cobros ocultos ni sobrecostos imprevistos</span>
                </label>
              </div>
            </div>
          </div>

          {/* BLOQUE 6: Firma del Responsable */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-brand-blue" />
              <span>6. Datos del Responsable que Firma</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nombre del Especialista
                </label>
                <input
                  type="text"
                  value={quote.responsibleName}
                  onChange={(e) => setQuote({ ...quote, responsibleName: e.target.value })}
                  placeholder="Mauricio Marín"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={quote.responsiblePhone}
                  onChange={(e) => setQuote({ ...quote, responsiblePhone: e.target.value })}
                  placeholder="6114-1421"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </div>
          </div>

          {/* TARJETA DE ACCIÓN DIRECTA: GUARDAR EN COTIZACIONES POR ENVIAR */}
          <div className={`p-4 sm:p-5 rounded-3xl border-2 shadow-soft space-y-3 transition-all ${
            savedLaterFeedback 
              ? 'bg-emerald-50 border-emerald-400 ring-4 ring-emerald-200' 
              : 'bg-gradient-to-br from-amber-500/10 via-amber-50 to-amber-100/40 border-amber-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs shrink-0 transition-colors ${
                savedLaterFeedback ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {savedLaterFeedback ? <CheckCircle2 className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`text-xs font-black uppercase tracking-wider ${
                  savedLaterFeedback ? 'text-emerald-950' : 'text-amber-950'
                }`}>
                  {savedLaterFeedback ? '¡Cotización Guardada con Éxito!' : '¿Deseas enviar esta cotización más tarde?'}
                </h4>
                <p className={`text-[11px] font-medium ${
                  savedLaterFeedback ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  {savedLaterFeedback 
                    ? `Guardada en "Cotizaciones por Enviar" (${quote.quoteNumber}) a las ${getNowLocalTime12h()}. La puedes revisar o enviar por WhatsApp arriba.`
                    : <>Presiona el botón para guardarla en <strong>"Cotizaciones por Enviar"</strong>. Podrás revisarla, editarla o mandarla por WhatsApp en cualquier momento.</>
                  }
                </p>
              </div>
            </div>

            {/* Mensaje de confirmación visual inmediato en la propia tarjeta (10 segundos) */}
            {savedLaterFeedback && (
              <div className="bg-emerald-600 text-white p-3 rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  <span>✅ Guardada a las {getNowLocalTime12h()} en pendientes ({quote.quoteNumber})</span>
                </div>
                <button
                  type="button"
                  onClick={scrollToTopPanel}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-black underline cursor-pointer whitespace-nowrap"
                  title="Subir de inmediato a cotizaciones por enviar"
                >
                  Ver arriba ↑
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSaveQuoteForLater(true)}
              disabled={isSavingLater || isSyncing}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                savedLaterFeedback
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-white'
              }`}
            >
              {isSavingLater ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando en Cotizaciones por Enviar...</span>
                </>
              ) : savedLaterFeedback ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✅ ¡Guardada en Cotizaciones por Enviar!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Guardar en Cotizaciones por Enviar</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* ========================================================
            COLUMNA DERECHA: DOCUMENTO OFICIAL EN VIVO (PREVIEW / PRINT)
           ======================================================== */}
        <div className={`lg:col-span-7 ${
          activeMobileView === 'editor' ? 'hidden lg:block' : 'block'
        }`}>
          
          {/* Barra de Estado del Enlace Dinámico para el Administrador */}
          <div className="no-print mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-brand-dark">Rastreo de Enlace:</span>
              {activeSavedEntry?.isDownloaded ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Descargada ({activeSavedEntry.downloadedAt})</span>
                </span>
              ) : activeSavedEntry?.viewCount && activeSavedEntry.viewCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vista ({activeSavedEntry.viewCount} {activeSavedEntry.viewCount === 1 ? 'visita' : 'visitas'}) • No descargada aún</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enlace dinámico listo para enviar</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleOpenShareModal}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Compartir / Notificaciones</span>
              </button>
            </div>
          </div>

          {/* Contenedor Imprimible Oficial (Hoja Membretada) con ID único para aislamiento en impresión */}
          <div 
            id="printable-quote-sheet"
            className="print-area bg-white rounded-3xl p-5 sm:p-7 print:p-3 border border-slate-200/90 shadow-xl space-y-3.5 print:space-y-2 text-brand-dark font-sans relative overflow-hidden"
          >
            {/* Barra Decorativa Superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-[#FF5E0E] shadow-xs z-10" />

            {/* Difuminado Profesional en la Cabecera */}
            <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-emerald-500/10 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 left-0 w-64 h-32 bg-gradient-to-br from-emerald-600/15 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-emerald-600/[0.03] to-transparent pointer-events-none" />

            {/* ENCABEZADO OFICIAL DE LA COTIZACIÓN */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5 pt-1 relative z-10">
              {/* Logo y Nombre Comercial */}
              <div className="flex items-center gap-3">
                <div className="w-20 sm:w-24 h-12 sm:h-14 flex items-center justify-center shrink-0">
                  <img 
                    src={currentLogo} 
                    alt="Logo Empresa" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-[#67141d] leading-tight">
                    {quote.companyName}
                  </h1>
                  <p className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Especialistas en Tuberías & Detección Técnica
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Costa Rica • Tel. {quote.responsiblePhone}
                  </p>
                </div>
              </div>

              {/* Consecutivo y Fecha */}
              <div className="bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto text-left sm:text-right border sm:border-0 border-slate-100">
                <div className="text-xs sm:text-sm font-mono font-black text-brand-dark">
                  {quote.quoteNumber}
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                  Fecha: <span className="text-brand-dark font-extrabold">{quote.date}</span>
                </div>
                <div className="text-[9.5px] text-slate-400 font-semibold">
                  Validez: 15 días naturales
                </div>
              </div>
            </div>

            {/* DATOS DEL CLIENTE Y LUGAR */}
            <div className="bg-slate-50/80 p-2.5 sm:p-3 print:p-2 rounded-xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs relative z-10">
              <div>
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                  Cotizado Para:
                </span>
                <span className="text-xs sm:text-sm font-black text-brand-dark block mt-0.5">
                  {quote.clientName || 'Cliente Particular'}
                </span>
                {quote.clientPhone && (
                  <span className="text-slate-500 font-semibold flex items-center gap-1 mt-0.5 text-[11px]">
                    <Phone className="w-3 h-3 text-brand-blue" />
                    <span>{quote.clientPhone}</span>
                  </span>
                )}
              </div>

              <div>
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                  Lugar / Ubicación del Trabajo:
                </span>
                <span className="text-xs font-extrabold text-slate-700 block mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-orange shrink-0" />
                  <span>{quote.clientLocation || 'Área Metropolitana / A convenir'}</span>
                </span>
              </div>
            </div>

            {/* REFERENCIA PRINCIPAL */}
            <div className="relative z-10">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                Referencia del Proyecto / Trabajo:
              </span>
              <div className="bg-blue-50/50 py-1.5 px-3 rounded-lg border border-blue-100 font-extrabold text-brand-dark text-xs">
                {quote.workReference || 'Trabajos Técnicos Especializados de Destaqueo y Fontanería'}
              </div>
            </div>

            {/* DESCRIPCIÓN DE ALCANCE LÍNEA POR LÍNEA (Hasta 7 items en una sola hoja) */}
            <div className="relative z-10">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Alcance y Puntos de Trabajo a Realizar:
              </span>
              <div className="space-y-1 print:space-y-0.5">
                {quote.scopeItems
                  .filter((item) => item.text.trim())
                  .map((item, idx) => (
                    <div key={item.id} className="flex items-start gap-2 text-[11px] sm:text-xs print:text-[10.5px] text-slate-700 leading-snug">
                      <span className="w-4 h-4 rounded bg-[#67141d]/10 text-[#67141d] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-semibold">{item.text}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* TABLA FORMAL DE DESGLOSE ECONÓMICO */}
            <div className="relative z-10">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Desglose Económico de la Propuesta:
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-black uppercase text-[9.5px] border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-3 text-left">Concepto</th>
                      <th className="py-1.5 px-3 text-right">Monto Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px] sm:text-xs">
                    <tr>
                      <td className="py-1.5 px-3 font-bold">Mano de Obra Calificada y Ejecución Técnica</td>
                      <td className="py-1.5 px-3 text-right font-extrabold text-brand-dark">
                        ₡{labor.toLocaleString('es-CR')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3">
                        <div className="font-bold">Estimado de Materiales e Insumos</div>
                        {quote.materialsDetail && (
                          <div className="text-[9.5px] text-slate-400 italic">
                            {quote.materialsDetail}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-right font-extrabold text-brand-dark">
                        ₡{materials.toLocaleString('es-CR')}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/60 font-bold">
                      <td className="py-1 px-3 text-slate-600">Subtotal de la Obra:</td>
                      <td className="py-1 px-3 text-right font-black text-brand-dark">
                        ₡{subtotal.toLocaleString('es-CR')}
                      </td>
                    </tr>
                    {quote.applyIVA && (
                      <tr className="bg-slate-50/60 font-bold text-slate-600">
                        <td className="py-1 px-3">IVA (13% - Factura Electrónica):</td>
                        <td className="py-1 px-3 text-right font-black text-emerald-800">
                          ₡{ivaAmount.toLocaleString('es-CR')}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-[#67141d]/5 font-black text-xs sm:text-sm text-[#67141d]">
                      <td className="py-2 px-3">TOTAL GENERAL COTIZADO:</td>
                      <td className="py-2 px-3 text-right font-black text-sm sm:text-base">
                        ₡{totalGeneral.toLocaleString('es-CR')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TIEMPO DE ENTREGA Y CHECKPOINTS COMPACTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs relative z-10">
              
              {/* Tiempo de Entrega */}
              <div className="bg-slate-50 p-2 sm:p-2.5 print:p-2 rounded-xl border border-slate-200/80 space-y-0.5">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                  Tiempo Estimado de Entrega:
                </span>
                <div className="font-black text-brand-dark text-xs sm:text-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-blue" />
                  <span>{quote.deliveryTime || '1 día hábil'}</span>
                </div>
                <p className="text-[9.5px] text-slate-400">
                  Sujeto a confirmación tras inicio de labores.
                </p>
              </div>

              {/* Checkpoints de Calidad */}
              <div className="bg-slate-50 p-2 sm:p-2.5 print:p-2 rounded-xl border border-slate-200/80 space-y-1 text-[10px] sm:text-[11px]">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                  Condiciones y Compromisos:
                </span>
                <div className="space-y-0.5 font-bold text-slate-700">
                  {quote.checkpoints.paymentOnDelivery && (
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Pago 100% contra entrega y satisfacción</span>
                    </div>
                  )}
                  {quote.checkpoints.certifiedMaterials && (
                    <div className="flex items-center gap-1.5 text-brand-dark">
                      <CheckCircle2 className="w-3 h-3 shrink-0 text-brand-blue" />
                      <span>Materiales certificados y garantía técnica por escrito</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FIRMA OFICIAL, REDES SOCIALES Y WHATSAPP DIRECTO */}
            <div className="pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
              
              {/* Firma y Sello Escudo */}
              <div className="flex items-center gap-3 text-center sm:text-left">
                <img 
                  src={SHIELD_LOGO} 
                  alt="Mauricio Marín" 
                  className="w-10 h-10 object-contain shrink-0 drop-shadow-xs hidden sm:block"
                />
                <div className="space-y-0.5">
                  <div className="font-script text-base sm:text-lg text-emerald-800 font-bold tracking-wider leading-none">
                    {quote.responsibleName}
                  </div>
                  <div className="h-0.5 w-28 bg-slate-300 mx-auto sm:mx-0 my-0.5" />
                  <h4 className="text-[11px] font-black text-brand-dark leading-tight">{quote.responsibleName}</h4>
                  <p className="text-[9.5px] font-bold text-slate-400 leading-tight">{quote.responsibleTitle}</p>
                  <p className="text-[10.5px] font-black text-brand-blue leading-tight">Tel: {quote.responsiblePhone}</p>
                </div>
              </div>

              {/* Redes Sociales Oficiales y Botón de WhatsApp Directo */}
              <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
                <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">
                  Contacto Directo & Redes Oficiales:
                </span>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                  {/* Facebook */}
                  <a
                    href={SOCIAL_URLS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white bg-[#1877F2] hover:bg-[#1567d3] transition-all shadow-xs text-[10px] sm:text-[10.5px] font-bold cursor-pointer"
                    title="Página Oficial de Facebook"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </a>

                  {/* Instagram */}
                  <a
                    href={SOCIAL_URLS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 transition-all shadow-xs text-[10px] sm:text-[10.5px] font-bold cursor-pointer"
                    title="Perfil Oficial de Instagram"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>

                  {/* WhatsApp Directo */}
                  <a
                    href={`https://wa.me/50661141421?text=${encodeURIComponent(`Hola Mauricio, le escribo desde la cotización ${quote.quoteNumber} (${quote.clientName || 'Cliente'}) para coordinar el trabajo.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all shadow-xs text-[10px] sm:text-[10.5px] font-black cursor-pointer"
                    title="Enviar mensaje directo a Mauricio por WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp Directo (6114-1421)</span>
                  </a>
                </div>
                <div className="text-[9.5px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span>Destaqueos y Tanques Sépticos Mauricio Marín</span>
                  <span>•</span>
                  <span className="text-brand-blue font-bold">https://destaqueosmarin.pages.dev</span>
                </div>
              </div>
            </div>

            {/* Pie Legal Mínimo y Logo Escudo */}
            <div className="pt-2 border-t border-slate-100 text-[8.5px] text-slate-400 text-center flex flex-row items-center justify-between gap-1 relative z-10">
              <span>Documento emitido electrónicamente con plena validez comercial.</span>
              <div className="flex items-center gap-1.5">
                <img src={SHIELD_LOGO} alt="Mauricio Marín" className="w-3.5 h-4 object-contain inline-block opacity-75" />
                <span>Destaqueos y Tanques Sépticos Mauricio Marín • Mauricio Marín</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
