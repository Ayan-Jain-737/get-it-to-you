import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

export const useReportModal = (onClose, reportedUserId, journeyId) => {
  const { submitReport } = useAppContext();
  const [reason, setReason] = useState('Never showed up');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitReport(reportedUserId, journeyId, reason, details);
      toast.success("Report submitted successfully.", { style: { borderRadius: 'var(--radius-md)' } });
      onClose();
    } catch (err) {
      toast.error("Failed to submit report.", { style: { borderRadius: 'var(--radius-md)' } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reason,
    setReason,
    details,
    setDetails,
    isSubmitting,
    handleSubmit
  };
};
