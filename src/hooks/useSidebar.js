import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const useSidebar = () => {
  const { logout, userProfile, currentUser, getUserStats } = useAppContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [reliabilityScore, setReliabilityScore] = useState(100);

  useEffect(() => {
    const fetchScore = async () => {
      if (currentUser?.uid) {
        const stats = await getUserStats(currentUser.uid);
        const completedRuns = (stats.tasksCompleted || 0) + (stats.requestsCompleted || 0);
        const totalRuns = completedRuns + (stats.cancelled || 0);
        setReliabilityScore(totalRuns === 0 ? 100 : Math.round((completedRuns / totalRuns) * 100));
      }
    };
    fetchScore();
  }, [currentUser?.uid, getUserStats]);

  return {
    logout,
    userProfile,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    reliabilityScore,
  };
};
