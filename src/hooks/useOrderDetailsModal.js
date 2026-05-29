import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const useOrderDetailsModal = (isOpen, post) => {
  const { getJourneyHistory, currentUser } = useAppContext();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileTargetUid, setProfileTargetUid] = useState(null);

  useEffect(() => {
    if (!isOpen || !post) return;
    
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      const data = await getJourneyHistory(post.id);
      if (isMounted) {
        setHistory(data);
        setLoading(false);
      }
    };
    
    fetchHistory();
    return () => { isMounted = false; };
  }, [isOpen, post, getJourneyHistory]);

  return {
    currentUser,
    history,
    loading,
    profileTargetUid,
    setProfileTargetUid,
  };
};
