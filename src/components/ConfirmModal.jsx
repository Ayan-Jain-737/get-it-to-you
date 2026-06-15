import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false
}) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-surface-container-lowest w-full max-w-md flex flex-col shadow-[8px_8px_0px_#141414] border-4 border-[#141414] relative"
      >
        {/* Header */}
        <div className={`flex items-center gap-3 p-5 border-b-4 border-[#141414] ${isDestructive ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
          {isDestructive ? <AlertTriangle size={28} strokeWidth={2.5} /> : <CheckCircle size={28} strokeWidth={2.5} />}
          <h2 className="text-xl font-black uppercase tracking-widest m-0 leading-none">
            {title}
          </h2>
        </div>

        <div className="p-6 text-on-surface font-medium text-lg leading-relaxed font-mono">
          {message}
        </div>

        {/* Footer (Buttons) */}
        <div className="flex gap-4 p-5 bg-surface-container-high border-t-4 border-[#141414]">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-surface-container-lowest border-2 border-[#141414] text-on-surface font-black uppercase tracking-wide hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_#141414] transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 border-2 border-[#141414] font-black uppercase tracking-wide hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_#141414] transition-all ${isDestructive ? 'bg-error text-on-error' : 'bg-primary text-on-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
