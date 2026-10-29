import React, { useState } from 'react';
import { Star, Copy, Check, ExternalLink, Trash2, MessageSquareText, ShieldCheck, Phone, AlertTriangle } from 'lucide-react';
import { Review } from '../../types/review';
import { formatDateToSpanish } from '../../utils/dateFormatter';

interface AdminReviewsCardProps {
  reviews: Review[];
  onDeleteReview?: (id: string) => Promise<boolean>;
}

export const AdminReviewsCard: React.FC<AdminReviewsCardProps> = ({
  reviews,
  onDeleteReview
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const reviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/calificar`
    : 'https://legacydetec.pages.dev/calificar';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  // Normalizador y detector de enlaces compartidos o duplicados por número telefónico
  const normalizePhone = (phone?: string): string => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 6 ? digits.slice(-8) : phone.trim().toLowerCase();
  };

  const phoneCounts = reviews.reduce((acc, r) => {
    const key = normalizePhone(r.client_phone);
    if (key) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sharedPhonesCount = Object.values(phoneCounts).filter((c) => c > 1).length;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft space-y-4">
      {/* Encabezado y Estadísticas */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-brand-dark">Testimonios y Reseñas</h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              {totalReviews} opiniones de clientes reales recibidas
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-500 font-black text-sm justify-end">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{avgRating}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Promedio</span>
        </div>
      </div>

      {/* Caja de Enlace Rápido para Clientes */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-brand-dark flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
            <span>Enlace Oficial de Calificación:</span>
          </span>
          <a
            href="/calificar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-brand-blue font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Probar</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={reviewUrl}
            className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-600 select-all"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-blue text-white hover:bg-brand-blue/90'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Comparta este enlace o use los botones de WhatsApp en cada cita completada. Las calificaciones aparecen inmediatamente en la web.
        </p>
      </div>

      {/* Lista de Opiniones Recibidas */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-brand-dark flex items-center gap-1">
            <MessageSquareText className="w-3.5 h-3.5 text-brand-blue" />
            <span>Opiniones Publicadas ({reviews.length}):</span>
          </h4>
          {sharedPhonesCount > 0 && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{sharedPhonesCount} Enlace(s) Compartido(s)</span>
            </span>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-500">Aún no hay comentarios de clientes</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Al terminar un trabajo, envíe el enlace de WhatsApp al cliente para recibir su opinión.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {reviews.map((rev) => {
              const phoneKey = normalizePhone(rev.client_phone);
              const countForThisPhone = phoneKey ? (phoneCounts[phoneKey] || 0) : 0;
              const isSharedLink = countForThisPhone > 1;

              return (
                <div
                  key={rev.id}
                  className={`p-3 rounded-2xl border text-xs space-y-2 transition-colors ${
                    isSharedLink
                      ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50/70'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="font-extrabold text-brand-dark">{rev.client_name}</h5>
                        {rev.client_phone ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Phone className="w-2.5 h-2.5 text-brand-blue" />
                            <span>{rev.client_phone}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sin celular</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-blue font-bold">{rev.service_type || 'Detección de Fugas'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(Number(rev.rating || 5))].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      {onDeleteReview && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`¿Eliminar la opinión de ${rev.client_name}?`)) {
                              setIsDeleting(rev.id);
                              await onDeleteReview(rev.id);
                              setIsDeleting(null);
                            }
                          }}
                          disabled={isDeleting === rev.id}
                          className="ml-2 p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Eliminar opinión"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alerta si el cliente compartió el enlace con otra persona */}
                  {isSharedLink && (
                    <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-[11px] font-medium leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-amber-950">
                          ⚠️ Enlace Compartido — Celular repetido {countForThisPhone} veces ({rev.client_phone})
                        </p>
                        <p className="text-[10px] text-amber-800 mt-0.5">
                          El cliente original compartió su enlace exclusivo con un tercero para generar esta opinión adicional.
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-slate-600 italic">"{rev.comment}"</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px] text-slate-400">
                    <span className="text-emerald-700 font-bold">✓ Verificado en web</span>
                    <span>{formatDateToSpanish(rev.created_at.split('T')[0])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
