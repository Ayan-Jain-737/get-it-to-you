import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const useDashboard = () => {
  const navigate = useNavigate();
  const { feedData, acceptRequest, deletePost, currentUser } = useAppContext();
  const { openModal } = useOutletContext();
  const [profileTargetUid, setProfileTargetUid] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  const handleAccept = async (postId, type) => {
    await acceptRequest(postId, type);
    if (type === 'offer') {
      navigate('/deliveries');
    } else {
      navigate('/active-runs');
    }
  };

  const handleDelete = (postId) => {
    setPostToDelete(postId);
  };
  
  const confirmDelete = async () => {
    if (postToDelete) {
      await deletePost(postToDelete);
      setPostToDelete(null);
    }
  };

  const pickups = feedData.filter(post => post.type === 'request' && post.status === 'open');
  const offers = feedData.filter(post => post.type === 'offer' && post.status === 'open');

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return {
    currentUser,
    openModal,
    profileTargetUid,
    setProfileTargetUid,
    postToDelete,
    setPostToDelete,
    handleAccept,
    handleDelete,
    confirmDelete,
    pickups,
    offers,
    getTimeAgo
  };
};
