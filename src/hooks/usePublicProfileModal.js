import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const usePublicProfileModal = (isOpen, targetUid) => {
  const { fetchPublicProfile } = useAppContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !targetUid) return;
    let isMounted = true;
    setLoading(true);
    
    const fetchProfile = async () => {
      const data = await fetchPublicProfile(targetUid);
      if (isMounted) {
        setProfileData(data);
        setLoading(false);
      }
    };
    
    fetchProfile();
    return () => { isMounted = false; };
  }, [isOpen, targetUid, fetchPublicProfile]);

  return {
    profileData,
    loading
  };
};
