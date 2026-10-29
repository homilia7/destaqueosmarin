import React from 'react';
import { MessageSquare } from 'lucide-react';

export const SOCIAL_URLS = {
  facebook: 'https://www.facebook.com',
  instagram: 'https://www.instagram.com',
  whatsapp: 'https://wa.me/50661141421'
};

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

interface SocialLinksProps {
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md';
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  className = '',
  showLabels = false,
  size = 'md'
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const btnPadding = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Facebook */}
      <a
        href={SOCIAL_URLS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Página oficial de Facebook"
        title="Síguenos en Facebook"
        className={`inline-flex items-center gap-2 rounded-xl text-white bg-[#1877F2]/90 hover:bg-[#1877F2] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all ${btnPadding}`}
      >
        <FacebookIcon className={iconSize} />
        {showLabels && <span className="text-xs font-bold pr-1">Facebook</span>}
      </a>

      {/* Instagram */}
      <a
        href={SOCIAL_URLS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Perfil oficial de Instagram"
        title="Síguenos en Instagram"
        className={`inline-flex items-center gap-2 rounded-xl text-white bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all ${btnPadding}`}
      >
        <InstagramIcon className={iconSize} />
        {showLabels && <span className="text-xs font-bold pr-1">Instagram</span>}
      </a>

      {/* WhatsApp */}
      <a
        href={SOCIAL_URLS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atención directa por WhatsApp"
        title="Chatear por WhatsApp"
        className={`inline-flex items-center gap-2 rounded-xl text-white bg-[#25D366] hover:bg-[#20ba5a] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all ${btnPadding}`}
      >
        <MessageSquare className={`${iconSize} fill-white`} />
        {showLabels && <span className="text-xs font-bold pr-1">WhatsApp</span>}
      </a>
    </div>
  );
};
