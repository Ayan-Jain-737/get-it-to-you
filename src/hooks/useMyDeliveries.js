import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const useMyDeliveries = () => {
  const { feedData, currentUser, trackJourney, activeJourney, loading, userProfile } = useAppContext();
  const navigate = useNavigate();
  const { openModal } = useOutletContext();
  const [reportData, setReportData] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const [showMap, setShowMap] = useState(() => {
    return userProfile?.tutorialComplete === false;
  });

  const handleTrack = async (postId) => {
    await trackJourney(postId);
    setShowMap(true);
  };

  const myAcceptedRequests = feedData.filter(
    post => post.requesterId === currentUser?.uid && post.status === 'accepted'
  );

  return {
    feedData,
    currentUser,
    activeJourney,
    navigate,
    openModal,
    reportData,
    setReportData,
    selectedPost,
    setSelectedPost,
    showMap,
    setShowMap,
    handleTrack,
    myAcceptedRequests,
    loading
  };
};
