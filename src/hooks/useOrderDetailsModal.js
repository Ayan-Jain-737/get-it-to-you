import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const useOrderDetailsModal = (isOpen, post) => {
  const { getJourneyHistory, currentUser } = useAppContext();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileTargetUid, setProfileTargetUid] = useState(null);
  const [counterpartyName, setCounterpartyName] = useState('Loading...');
  const [counterpartyUid, setCounterpartyUid] = useState(null);
  const { fetchPublicProfile } = useAppContext();

  useEffect(() => {
    if (!isOpen || !post) return;
    
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      const data = await getJourneyHistory(post.id);
      if (isMounted) {
        setHistory(data);
        if (data?.journey) {
          const cpUid = currentUser.uid === data.journey.runnerId 
            ? data.journey.requesterId 
            : data.journey.runnerId;
          setCounterpartyUid(cpUid);
          const cpProfile = await fetchPublicProfile(cpUid);
          if (cpProfile && isMounted) {
            setCounterpartyName(cpProfile.name);
          } else {
             setCounterpartyName('Student');
          }
        }
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
    counterpartyName,
    counterpartyUid
  };
};
