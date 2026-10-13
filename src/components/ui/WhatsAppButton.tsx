'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  phone?: string | null;
  message: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'icon' | 'badge';
  className?: string;
  title?: string;
}

export default function WhatsAppButton({
  phone,
  message,
  label = 'WhatsApp',
  variant = 'primary',
  className = '',
  title = 'Send WhatsApp message',
}: WhatsAppButtonProps) {
  const url = buildWhatsAppLink(phone, message);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={title}
        aria-label={title}
        className={`p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all inline-flex items-center justify-center ${className}`}
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={title}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-all ${className}`}
      >
        <MessageSquare className="w-3 h-3 text-emerald-600" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={title}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-400 transition-all shadow-sm ${className}`}
      >
        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm transition-all hover:shadow ${className}`}
    >
      <MessageSquare className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
