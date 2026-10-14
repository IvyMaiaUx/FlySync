import React, { useId } from 'react';

interface FlySyncLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  isDarkTheme?: boolean;
}

export const FlySyncLogo: React.FC<FlySyncLogoProps> = ({
  size = 'md',
  showWordmark = true,
  subtitle,
  className = '',
  isDarkTheme = true
}) => {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ticketGId = `ticketG_${rawId}`;
  const jetGId = `jetG_${rawId}`;
  const trailGId = `trailG_${rawId}`;
  const glowId = `glow_${rawId}`;

  const sizeMap = {
    xs: { text: 'text-base', badge: 'w-6 h-6', subText: 'text-[9px]' },
    sm: { text: 'text-lg', badge: 'w-7 h-7', subText: 'text-[10px]' },
    md: { text: 'text-xl', badge: 'w-9 h-9', subText: 'text-[11px]' },
    lg: { text: 'text-2xl', badge: 'w-12 h-12', subText: 'text-xs' },
    xl: { text: 'text-3xl sm:text-4xl', badge: 'w-16 h-16', subText: 'text-xs sm:text-sm' },
    hero: { text: 'text-4xl sm:text-5xl', badge: 'w-20 h-20 sm:w-24 sm:h-24', subText: 'text-sm sm:text-base' }
  };

  const { text, badge, subText } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Exact Vector Brand Emblem from the Official Logo */}
      <div className={`relative ${badge} shrink-0 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center bg-gradient-to-br from-[#1F0A44] via-[#13062C] to-[#090218] border border-purple-700/50 group`}>
        {/* Ambient subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#22C55E]/10 via-transparent to-[#38BDF8]/20 pointer-events-none" />
        
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={ticketGId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="50%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id={jetGId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="40%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id={trailGId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <filter id={glowId}>
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Ambient subtle glow */}
          <circle cx="50" cy="50" r="30" fill="#22C55E" opacity="0.15" />
          <circle cx="60" cy="40" r="24" fill="#38BDF8" opacity="0.2" />

          {/* Sparkles */}
          <path d="M 28 26 Q 30 26 30 24 Q 30 26 32 26 Q 30 26 30 28 Q 30 26 28 26 Z" fill="#4ADE80" filter={`url(#${glowId})`} />
          <path d="M 68 56 Q 70 56 70 54 Q 70 56 72 56 Q 70 56 70 58 Q 70 56 68 56 Z" fill="#4ADE80" filter={`url(#${glowId})`} />
          <circle cx="75" cy="30" r="1.2" fill="#38BDF8" />
          <circle cx="22" cy="52" r="1.4" fill="#38BDF8" />

          {/* Center rotated group */}
          <g transform="translate(50, 48)">
            {/* TICKET (Rotated -30 deg) */}
            <g transform="rotate(-30)">
              <rect x="-24" y="-14" width="48" height="28" rx="5" fill={`url(#${ticketGId})`} />
              {/* Notches */}
              <circle cx="-24" cy="0" r="3" fill="#13062C" />
              <circle cx="24" cy="0" r="3" fill="#13062C" />
              {/* Percent symbols */}
              <circle cx="-9" cy="-4" r="3" stroke="#13062C" strokeWidth="2" fill="none" />
              <line x1="-6" y1="7" x2="7" y2="-7" stroke="#13062C" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="8" cy="4" r="3" stroke="#13062C" strokeWidth="2" fill="none" />
            </g>

            {/* Jet orbital trail */}
            <path
              d="M -30 10 C -34 4, -28 -3, -18 -4 C -5 -5, 8 2, 18 -6 C 22 -10, 26 -16, 30 -20 C 24 -14, 20 -8, 16 -4 C 7 5, -8 -1, -18 0 C -26 1, -29 7, -27 12 Z"
              fill={`url(#${trailGId})`}
              filter={`url(#${glowId})`}
            />

            {/* Jet Airplane (swooping at 38 deg) */}
            <g transform="translate(4, -5) rotate(38)">
              {/* Fuselage */}
              <path d="M 0 -17 C 1.2 -17, 2.5 -14, 2.7 -8 L 2.8 8 L 1.5 14 L 0 15 L -1.5 14 L -2.8 8 L -2.7 -8 C -2.5 -14, -1.2 -17, 0 -17 Z" fill={`url(#${jetGId})`} />
              {/* Fuselage Highlight */}
              <path d="M 0 -16 L 0.5 -6 L 0.5 11 L 0 14 Z" fill="#FFFFFF" opacity="0.9" />
              {/* Right Wing */}
              <path d="M 2.5 -2 L 19 4 L 18 6 L 2.5 2 Z" fill={`url(#${jetGId})`} />
              {/* Left Wing */}
              <path d="M -2.5 -2 L -19 4 L -18 6 L -2.5 2 Z" fill={`url(#${jetGId})`} />
              {/* Tail */}
              <path d="M 0 11 L 7 14 L 6.5 15 L 0 14 L -6.5 15 L -7 14 Z" fill="#0284C7" />
            </g>
          </g>
        </svg>
      </div>

      {/* FlySync Wordmark & Optional Subtitle */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className={`font-display font-extrabold tracking-tight ${text} leading-none flex items-center select-none`}>
            <span className={isDarkTheme ? 'text-white' : 'text-slate-900'}>Fly</span>
            <span className="text-[#22C55E]">Sync</span>
          </div>
          {subtitle && (
            <span className={`text-purple-300/80 font-medium tracking-normal mt-1 ${subText}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
