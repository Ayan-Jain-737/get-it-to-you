import React from 'react';
import { useReportModal } from '../hooks/useReportModal';

const ReportModal = ({ isOpen, onClose, reportedUserId, journeyId }) => {
  const {
    reason,
    setReason,
    details,
    setDetails,
    isSubmitting,
    handleSubmit
  } = useReportModal(onClose, reportedUserId, journeyId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-inverse-surface/40 backdrop-blur-sm transition-all duration-300">
      <div 
        className="absolute inset-0 z-0" 
        onClick={onClose}
      ></div>
      
      <div className="bg-surface-container-lowest w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold font-headline text-error mb-1">Report Issue</h2>
              <p className="text-sm text-on-surface-variant font-body">Please describe the problem you encountered.</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Reason</label>
              <div className="relative">
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full appearance-none bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                >
                  <option value="Never showed up">Never showed up</option>
                  <option value="Item damaged or missing">Item damaged or missing</option>
                  <option value="Inappropriate behavior">Inappropriate behavior</option>
                  <option value="Late delivery">Late delivery</option>
                  <option value="Other">Other</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Additional Details</label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium resize-none"
                placeholder="Optional context about what happened..."
                rows="4"
              ></textarea>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-error text-on-error font-bold text-sm tracking-wide shadow-lg shadow-error/20 hover:bg-error-dim transition-all active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">flag</span>
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
