import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { VIT_LOCATIONS, getHaversineDistance } from '../constants';

export const usePostModal = (initialType, onClose) => {
  const { createPost, userProfile } = useAppContext();
  const [postType, setPostType] = useState(initialType);
  const [location, setLocation] = useState(VIT_LOCATIONS[0].id);
  const [destination, setDestination] = useState(VIT_LOCATIONS[5].id);
  const [details, setDetails] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locObj = VIT_LOCATIONS.find(l => l.id === location);
  const destObj = VIT_LOCATIONS.find(l => l.id === destination);
  
  let distance = 0;
  let dynamicCost = 75;
  let runnerReward = 50;
  let zoneText = "Zone 2";
  
  if (locObj && destObj) {
    distance = getHaversineDistance(locObj.lat, locObj.lng, destObj.lat, destObj.lng);
    if (distance < 500) {
      dynamicCost = 50;
      runnerReward = 35;
      zoneText = "Zone 1";
    } else if (distance > 1500) {
      dynamicCost = 100;
      runnerReward = 70;
      zoneText = "Zone 3";
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await createPost({
      type: postType,
      location,
      destination,
      details,
      isUrgent
    });
    if (success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  return {
    postType,
    setPostType,
    location,
    setLocation,
    destination,
    setDestination,
    details,
    setDetails,
    isUrgent,
    setIsUrgent,
    dynamicCost,
    runnerReward,
    zoneText,
    handleSubmit,
    userProfile,
    isSubmitting
  };
};
