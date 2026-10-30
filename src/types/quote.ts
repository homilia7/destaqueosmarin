export interface QuoteItem {
  id: string;
  text: string;
}

export interface JobQuote {
  id: string;
  appointmentId?: string;
  quoteNumber: string;
  date: string;
  companyName: string;
  companyLogoUrl: string;
  customLogoUrl?: string | null;
  clientName: string;
  clientLocation: string;
  clientPhone: string;
  workReference: string;
  scopeItems: QuoteItem[];
  laborCost: number;
  materialsCost: number;
  materialsDetail: string;
  applyIVA: boolean;
  ivaRate: number; // typically 0.13
  deliveryTime: string;
  paymentTerms: string;
  checkpoints: {
    paymentOnDelivery: boolean;
    satisfactionGuarantee: boolean;
    certifiedMaterials: boolean;
    noHiddenCosts: boolean;
  };
  responsibleName: string;
  responsibleTitle: string;
  responsiblePhone: string;
  instagramUrl: string;
  whatsappUrl: string;
  emailContact: string;
  websiteUrl: string;
  createdAt: string;
  status?: 'por_enviar' | 'enviada' | 'aceptada';
}

export interface SavedQuoteEntry {
  id: string;
  appointmentId?: string;
  fileName: string;
  savedAt: string;
  totalAmount: number;
  clientName: string;
  workReference: string;
  quoteData: JobQuote;
  status?: 'por_enviar' | 'enviada' | 'aceptada';
  sentAt?: string | null;
  viewCount?: number;
  isDownloaded?: boolean;
  downloadedAt?: string | null;
  shareUrl?: string;
}
