import React from 'react';
import { Orbit, Sparkles, Zap } from 'lucide-react';

interface NexoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'AI Skill Intelligence Platform',
  theme = 'dark',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs',
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Futuristic Nexora Gradient Hex-Orb Icon */}
      <div
        className={`${iconSizes[size].split(' ')[0]} ${iconSizes[size].split(' ')[1]} rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-950/50 flex-shrink-0 relative group`}
      >
        <div className="w-full h-full bg-slate-950/70 backdrop-blur-md rounded-[14px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/10" />
          <Orbit className="w-1/2 h-1/2 text-emerald-300 transform group-hover:rotate-45 transition-transform duration-500" />
          <Zap className="w-2.5 h-2.5 text-cyan-300 absolute -top-0.5 -right-0.5 fill-cyan-300" />
        </div>
      </div>

      {/* Brand Text */}
      <div className="min-w-0 flex flex-col justify-center">
        <div className={`font-black tracking-tight leading-none ${textSizes[size]} ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Nexora<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">-Skill</span>
        </div>
        {showSubtitle && (
          <div className={`font-semibold uppercase tracking-wider mt-0.5 truncate ${subTextSizes[size]} ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            {subtitleText}
          </div>
        )}
      </div>
    </div>
  );
};
