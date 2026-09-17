import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'solid' | 'outline' | 'alert' | 'muted';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'solid', className = '' }) => {
  const variantStyles = {
    solid: 'bg-obsidian text-white border-obsidian',
    outline: 'bg-white text-obsidian border-surface-border',
    alert: 'bg-black text-white border-black font-semibold',
    muted: 'bg-surface-dim text-brand-grey border-surface-border'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider border transition-colors ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};
