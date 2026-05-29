import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const useActiveRunsList = () => {
  const { activeJourney, currentUser, feedData, trackJourney } = useAppContext();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const handleTrack = async (postId) => {
    await trackJourney(postId);
    setShowMap(true);
  };

  const history = feedData.filter(p => p.runnerId === currentUser?.uid && p.status === 'completed');
  const myActiveRuns = feedData.filter(p => p.runnerId === currentUser?.uid && p.status === 'accepted');

  return {
    activeJourney,
    currentUser,
    selectedPost,
    setSelectedPost,
    showMap,
    setShowMap,
    handleTrack,
    history,
    myActiveRuns
  };
};
