'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
  confirmText = 'Continue',
  variant = 'danger'
}: ConfirmModalProps) {
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center p-2">
        
        {/* Icon Circle */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
        }`}>
          <AlertTriangle size={24} />
        </div>

        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all flex items-center justify-center gap-2 ${
               variant === 'danger' 
                 ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' 
                 : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
