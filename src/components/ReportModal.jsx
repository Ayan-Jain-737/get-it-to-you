import React from 'react';
import { useReportModal } from '../hooks/useReportModal';
import { X } from 'lucide-react';

const REQUESTER_REASONS = [
  "Runner never arrived",
  "Runner asked for more GC",
  "Runner marked as completed without delivery",
  "Unprofessional behavior",
  "Other"
];

const RUNNER_REASONS = [
  "Requester is unreachable",
  "Requester provided wrong location",
  "Package was unsafe/prohibited",
  "Requester refused to provide OTP",
  "Unprofessional behavior",
  "Other"
];

const ReportModal = ({ isOpen, onClose, reportedUserId, journeyId, reporterRole }) => {
  const {
    reason,
    setReason,
    details,
    setDetails,
    isSubmitting,
    handleSubmit
  } = useReportModal(onClose, reportedUserId, journeyId, reporterRole === 'runner' ? RUNNER_REASONS[0] : REQUESTER_REASONS[0]);

  if (!isOpen) return null;

  const reasonsList = reporterRole === 'runner' ? RUNNER_REASONS : REQUESTER_REASONS;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-margin-page bg-on-surface/85 backdrop-blur-sm font-body-md animate-in fade-in duration-100">
      <div 
        className="absolute inset-0 z-0" 
        onClick={onClose}
      ></div>
      
      <div className="bg-surface-container-lowest w-full max-w-md border-border-width border-on-surface shadow-[8px_8px_0px_0px_#000000] relative z-10 overflow-hidden animate-in zoom-in-95 duration-150 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b-2 border-on-surface pb-3">
          <div>
            <h2 className="font-headline-lg text-headline-md uppercase tracking-tight text-error leading-none">
              Report {reporterRole === 'runner' ? 'Requester' : 'Runner'}
            </h2>
            <p className="text-xs font-bold text-on-surface-variant mt-1.5">Help us understand the issue with this run.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 border-2 border-on-surface flex items-center justify-center bg-surface-container shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <X size={20} className="text-on-surface" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-mono text-label-tag uppercase text-on-surface-variant font-bold">Reason</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border-2 border-on-surface bg-surface-container-lowest font-body-md text-body-md focus:bg-primary-container outline-none transition-colors"
            >
              {reasonsList.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-mono text-label-tag uppercase text-on-surface-variant font-bold">Additional Details</label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-3 border-2 border-on-surface bg-surface-container-lowest font-body-md text-body-md focus:bg-primary-container outline-none transition-colors resize-none"
              placeholder="Provide optional context about what happened..."
              rows="4"
            ></textarea>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 bg-tertiary hover:bg-red-700 text-on-error border-2 border-on-surface shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase text-xs flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] font-black">flag</span>
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
