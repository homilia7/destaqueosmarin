import React from 'react';

interface AnimatedEagleLogoProps {
  className?: string;
  imgClassName?: string;
}

export const AnimatedEagleLogo: React.FC<AnimatedEagleLogoProps> = ({
  className = 'w-8 h-8',
  imgClassName = ''
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none group shrink-0 ${className}`}>
      {/* Resplandor celeste/cian sutil por DETRÁS del cuadro (aura posterior sin borde rígido visible) */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400/60 via-sky-400/50 to-blue-500/60 blur-[3px] pointer-events-none -z-10 animate-pulse" />

      {/* Cuadro principal 100% BLANCO sin recuadros ni círculos extraños */}
      <div className="w-full h-full bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden shadow-xs relative z-10 border border-white">
        
        {/* Haz de luz sutil que barre el águila periódicamente */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-100/40 via-white/90 to-transparent animate-eagle-sheen z-20" />

        {/* Imagen del águila */}
        <img
          src="/logo.png"
          alt="Logo Águila Royality Detección de Fugas"
          className={`w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105 ${imgClassName}`}
        />
      </div>
    </div>
  );
};
