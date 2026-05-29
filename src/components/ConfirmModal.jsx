import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white w-full max-w-md flex flex-col shadow-[8px_8px_0px_#000] border-4 border-black relative"
      >
        {/* Header */}
        <div className={`flex items-center gap-3 p-5 border-b-4 border-black ${isDestructive ? 'bg-red-100 text-red-900' : 'bg-yellow-100 text-yellow-900'}`}>
          {isDestructive ? <AlertTriangle size={28} strokeWidth={2.5} /> : <CheckCircle size={28} strokeWidth={2.5} />}
          <h2 className="text-xl font-black uppercase tracking-widest m-0 leading-none">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-black font-medium text-lg leading-relaxed font-mono">
          {message}
        </div>

        {/* Footer (Buttons) */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t-4 border-black">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white border-2 border-black text-black font-black uppercase tracking-wide hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_#000] transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 border-2 border-black text-black font-black uppercase tracking-wide hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_#000] transition-all ${isDestructive ? 'bg-[#ff3b30] text-white' : 'bg-[#ffcc00]'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
