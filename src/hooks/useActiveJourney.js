import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const STATUS_STEPS = ['Accepted', 'Ready for Pickup', 'Walking Back', 'Arrived'];

const isCoordsValid = (c) => c && typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng);
const VIT_COORDS = { 'Main Gate': [12.9716, 79.1591], 'SJT': [12.9712, 79.1635], 'TT': [12.9708, 79.1559], 'Library': [12.9710, 79.1585], 'Food Court': [12.9720, 79.1600], 'Hostels': [12.9750, 79.1580] };

const getSafeCoords = (loc) => {
  if (!loc) return VIT_COORDS['Main Gate'];
  if (typeof loc === 'string') return VIT_COORDS[loc] || VIT_COORDS['Main Gate'];
  if (loc.lat && loc.lng && !isNaN(loc.lat) && !isNaN(loc.lng)) return [loc.lat, loc.lng];
  if (Array.isArray(loc) && loc.length === 2 && !isNaN(loc[0]) && !isNaN(loc[1])) return loc;
  return VIT_COORDS['Main Gate'];
};

const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export const useActiveJourney = () => {
  const { activeJourney, updateJourneyStatus, currentUser, userProfile, feedData, cancelJourney, generateHandoffOTP, verifyOTPAndComplete, updateRunnerLocation } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [profileTargetUid, setProfileTargetUid] = useState(null);
  const navigate = useNavigate();

  const isRunner = activeJourney?.runnerId === currentUser?.uid;

  useEffect(() => {
    if (activeJourney) {
      const postInfo = feedData.find(p => p.id === activeJourney.postId) || {};
      const runnerValid = isCoordsValid(activeJourney.runnerLocation);
      const pickupValid = isCoordsValid(postInfo.locationCoords);
      
      if (runnerValid || pickupValid) {
        setIsMapReady(true);
      } else {
        setIsMapReady(false);
      }
    }
  }, [activeJourney, feedData]);

  useEffect(() => {
    if (!isRunner || !activeJourney?.id || isSimulating) return;
    
    let lastSyncTime = 0;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const now = Date.now();
        if (now - lastSyncTime > 10000) {
          updateRunnerLocation(activeJourney.id, latitude, longitude).catch(err => console.error(err));
          lastSyncTime = now;
        }
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRunner, activeJourney?.id, isSimulating, updateRunnerLocation]);

  const postInfo = feedData.find(p => p.id === activeJourney?.postId) || {};
  const requesterName = postInfo.requesterName || 'Requester';
  const runnerName = postInfo.acceptedBy || 'Runner';

  useEffect(() => {
    if (!isRunner || !activeJourney?.id || !isSimulating) return;
    
    const targetArr = getSafeCoords(postInfo.destinationCoords || postInfo.destination);
    let target = { lat: targetArr[0], lng: targetArr[1] };
    
    const currentArr = getSafeCoords(activeJourney.runnerLocation || postInfo.locationCoords || postInfo.location);
    let current = { lat: currentArr[0], lng: currentArr[1] };
    
    let lastSimSync = 0;

    const interval = setInterval(() => {
      let nextLat = current.lat + (target.lat - current.lat) * 0.05;
      let nextLng = current.lng + (target.lng - current.lng) * 0.05;
      
      if (isNaN(nextLat) || isNaN(nextLng) || typeof nextLat !== 'number' || typeof nextLng !== 'number') return;

      current = { lat: nextLat, lng: nextLng };
      
      const now = Date.now();
      if (now - lastSimSync > 5000) {
        updateRunnerLocation(activeJourney.id, nextLat, nextLng).catch(() => {});
        lastSimSync = now;
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isRunner, activeJourney?.id, isSimulating]);

  useEffect(() => {
    if (!activeJourney || !activeJourney.id) return;
    
    if (activeJourney.id.startsWith('mock')) {
       setMessages([{ id: 1, sender: 'system', text: 'Connection established between Runner and Requester.' }]);
       return;
    }
    const q = query(collection(db, 'journeys', activeJourney.id, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          type: data.type || 'user',
          sender: data.senderId === currentUser?.uid ? 'me' : 'other',
          timestamp: data.timestamp
        };
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeJourney?.id, currentUser?.uid]);

  const currentStepIndex = STATUS_STEPS.indexOf(activeJourney?.status);

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await cancelJourney(activeJourney.id, cancelReason, activeJourney.postId);
      setShowCancelModal(false);
      navigate('/dashboard');
    } catch (err) {
      console.error("Cancellation failed", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeJourney?.id) return;
    
    if (activeJourney.id.startsWith('mock')) {
       setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: newMessage, type: 'user' }]);
       setNewMessage('');
       return;
    }
    try {
      await addDoc(collection(db, 'journeys', activeJourney.id, 'messages'), {
        type: 'user',
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const sendQuickMessage = async (text) => {
    if (!text.trim() || !activeJourney?.id) return;
    
    if (activeJourney.id.startsWith('mock')) {
       setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text, type: 'user' }]);
       return;
    }
    try {
      await addDoc(collection(db, 'journeys', activeJourney.id, 'messages'), {
        type: 'user',
        text,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleNextStatus = async () => {
    if (currentStepIndex < STATUS_STEPS.length - 1) {
      setIsUpdatingStatus(true);
      const nextStatus = STATUS_STEPS[currentStepIndex + 1];
      try {
        await updateJourneyStatus(nextStatus);
        if (nextStatus === 'Arrived') {
          await generateHandoffOTP(activeJourney.id);
        }
      } catch (err) {
        console.error("Status update failed", err);
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (enteredOTP.length !== 4) return;
    setIsVerifying(true);
    setOtpError(false);
    setErrorMessage("");
    try {
      await verifyOTPAndComplete(activeJourney.id, enteredOTP);
      toast.success("Delivery completed!", { style: { borderRadius: 'var(--radius-md)' } });
      navigate('/dashboard');
    } catch (err) {
      setOtpError(true);
      setErrorMessage("Incorrect OTP. Please try again.");
      toast.error("Incorrect OTP", { style: { borderRadius: 'var(--radius-md)' } });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpInput = (value) => {
    setOtpError(false); 
    setErrorMessage(""); 
    setEnteredOTP(value.replace(/\D/g, ''));
  };

  let distanceToTarget = null;
  let isGeofenceDisabled = false;

  if (isRunner) {
    let targetCoords = null;
    if (currentStepIndex === 0) targetCoords = postInfo.locationCoords;
    else if (currentStepIndex === 2) targetCoords = postInfo.destinationCoords;

    if ((currentStepIndex === 0 || currentStepIndex === 2) && (!targetCoords?.lat || !targetCoords?.lng)) {
      isGeofenceDisabled = true;
    } else if (targetCoords?.lat && targetCoords?.lng && activeJourney?.runnerLocation?.lat) {
      distanceToTarget = getDistanceFromLatLonInM(activeJourney.runnerLocation.lat, activeJourney.runnerLocation.lng, targetCoords.lat, targetCoords.lng);
    }
  }
  const isTooFar = distanceToTarget !== null && distanceToTarget > 10;
  const isAtDestination = currentStepIndex === 2 && distanceToTarget !== null && distanceToTarget <= 10;

  const pickupArr = getSafeCoords(postInfo?.locationCoords || postInfo?.location);
  const destArr = getSafeCoords(postInfo?.destinationCoords || postInfo?.destination);
  const pickupCoords = { lat: pickupArr[0], lng: pickupArr[1] };
  const destCoords = { lat: destArr[0], lng: destArr[1] };
  
  const centerCoords = getSafeCoords(activeJourney?.runnerLocation || postInfo?.locationCoords || postInfo?.location);
  const mapLat = centerCoords[0];
  const mapLng = centerCoords[1];

  return {
    activeJourney,
    currentUser,
    messages,
    newMessage,
    setNewMessage,
    showCancelModal,
    setShowCancelModal,
    cancelReason,
    setCancelReason,
    isCancelling,
    enteredOTP,
    otpError,
    errorMessage,
    isVerifying,
    isUpdatingStatus,
    showReportModal,
    setShowReportModal,
    isSimulating,
    setIsSimulating,
    isMapReady,
    profileTargetUid,
    setProfileTargetUid,
    isRunner,
    postInfo,
    requesterName,
    runnerName,
    currentStepIndex,
    handleCancel,
    handleSendMessage,
    sendQuickMessage,
    handleNextStatus,
    handleVerifyOTP,
    handleOtpInput,
    isTooFar,
    isAtDestination,
    isGeofenceDisabled,
    pickupArr,
    destArr,
    pickupCoords,
    destCoords,
    mapLat,
    mapLng,
    userProfile
  };
};
