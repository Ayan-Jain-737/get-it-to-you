import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-hot-toast';
import ReportModal from './ReportModal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const STATUS_STEPS = ['Accepted', 'Ready for Pickup', 'Walking Back', 'Arrived'];

// Custom pulsing marker for the Runner
const pulsingMarkerIcon = L.divIcon({
  className: 'custom-pulsing-marker',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-full h-full bg-[#4a40e0] rounded-full animate-ping opacity-75"></div>
      <div class="relative w-3 h-3 bg-[#4a40e0] rounded-full shadow-md border-2 border-white"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const VALID_CAMPUS_CENTER = [12.9716, 79.1591];
const isCoordsValid = (c) => c && typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng);
const VIT_COORDS = { 'Main Gate': [12.9716, 79.1591], 'SJT': [12.9712, 79.1635], 'TT': [12.9708, 79.1559], 'Library': [12.9710, 79.1585], 'Food Court': [12.9720, 79.1600], 'Hostels': [12.9750, 79.1580] };

const getSafeCoords = (loc) => {
  if (!loc) return VIT_COORDS['Main Gate'];
  if (typeof loc === 'string') return VIT_COORDS[loc] || VIT_COORDS['Main Gate'];
  if (loc.lat && loc.lng && !isNaN(loc.lat) && !isNaN(loc.lng)) return [loc.lat, loc.lng];
  if (Array.isArray(loc) && loc.length === 2 && !isNaN(loc[0]) && !isNaN(loc[1])) return loc;
  return VIT_COORDS['Main Gate'];
};

// Auto-pans the map when location updates
const MapUpdater = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    try {
      if (!isCoordsValid({ lat, lng })) return;
      if (!map || !map.getContainer()) return;
      map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.5 });
    } catch (err) {
      // Error silenced
    }
    
    return () => {
      try {
        if (map && typeof map.stop === 'function') map.stop();
      } catch (e) {}
    };
  }, [lat, lng, map]);
  return null;
};

const ActiveJourney = () => {
  const { activeJourney, updateJourneyStatus, completeHandoff, currentUser, feedData, cancelJourney, generateHandoffOTP, verifyOTPAndComplete, updateRunnerLocation } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const navigate = useNavigate();

  const isRunner = activeJourney?.runnerId === currentUser?.uid;

  // The Trigger: Watch journeyData and conditionally open the Map component
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

  // Real Geolocation Heartbeat (Throttled 10s)
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRunner, activeJourney?.id, isSimulating, updateRunnerLocation]);

  // Find the post to get user names and coords
  const postInfo = feedData.find(p => p.id === activeJourney?.postId) || {};
  const requesterName = postInfo.requesterName || 'Requester';
  const runnerName = postInfo.acceptedBy || 'Runner';

  // Simulated Movement for Testing
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
      
      // Simulation Sanitizer: Delete non-numeric values
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

  if (!activeJourney) {
    return (
      <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-surface-container-lowest gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-medium animate-pulse">Connecting to live tracking...</p>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(activeJourney.status);

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

  const renderCancelModal = () => {
    if (!showCancelModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
        <div className="bg-surface-container-lowest rounded-[2rem] p-6 w-full max-w-sm shadow-xl space-y-4 border border-outline-variant/30">
          <h3 className="text-xl font-bold text-on-surface font-headline flex items-center gap-2">
            <span className="material-symbols-outlined text-error">warning</span>
            Cancel Run
          </h3>
          <p className="text-sm text-on-surface-variant">Are you sure you want to cancel this journey? Please provide a reason.</p>
          <form onSubmit={handleCancel} className="space-y-4">
            <select 
              value={cancelReason} 
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-surface-container hover:bg-surface-variant transition-colors rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="">Select a reason...</option>
              <option value="Runner unavailable">Runner unavailable</option>
              <option value="Requester cancelled">Requester cancelled</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>
            {cancelReason === 'Other' && (
              <input 
                type="text" 
                placeholder="Type your reason..." 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-surface-container hover:bg-surface-variant transition-colors rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              />
            )}
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl font-bold text-on-surface-variant bg-surface-container hover:bg-surface-variant transition-colors"
              >
                Nevermind
              </button>
              <button 
                type="submit" 
                disabled={!cancelReason.trim() || isCancelling}
                className="flex-1 py-3 rounded-xl font-bold text-on-error bg-error hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
      const nextStatus = STATUS_STEPS[currentStepIndex + 1];
      await updateJourneyStatus(nextStatus);
      if (nextStatus === 'Arrived') {
        await generateHandoffOTP(activeJourney.id);
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
    setOtpError(false); // Force clear the boolean error state
    setErrorMessage(""); // Force clear any error text
    setEnteredOTP(value.replace(/\D/g, '')); // Update the state, strip non-digits
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

  // Prepare map coordinates
  const pickupArr = getSafeCoords(postInfo?.locationCoords || postInfo?.location);
  const destArr = getSafeCoords(postInfo?.destinationCoords || postInfo?.destination);
  const pickupCoords = { lat: pickupArr[0], lng: pickupArr[1] };
  const destCoords = { lat: destArr[0], lng: destArr[1] };
  
  const centerCoords = getSafeCoords(activeJourney?.runnerLocation || postInfo?.locationCoords || postInfo?.location);
  const mapLat = centerCoords[0];
  const mapLng = centerCoords[1];

  return (
    <main className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-surface-container-lowest flex flex-col md:flex-row">
      
      {/* 1. Full Bleed Background Map (Shared for both Runner & Requester) */}
      <div className="absolute inset-0 z-0">
        {isMapReady && (
          <MapContainer 
            key={JSON.stringify(activeJourney?.runnerLocation)}
            center={isCoordsValid(activeJourney?.runnerLocation) ? [activeJourney.runnerLocation.lat, activeJourney.runnerLocation.lng] : VALID_CAMPUS_CENTER}
            zoom={17} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
            />
            {isCoordsValid(pickupCoords) && isCoordsValid(destCoords) && (
              <Polyline positions={[pickupArr, destArr]} pathOptions={{ color: '#4a40e0', dashArray: '5, 10', weight: 4 }} />
            )}
            {isCoordsValid(activeJourney?.runnerLocation) && (
              <Marker 
                position={[activeJourney.runnerLocation.lat, activeJourney.runnerLocation.lng]} 
                icon={pulsingMarkerIcon}
              />
            )}
            <MapUpdater lat={mapLat} lng={mapLng} />
          </MapContainer>
        )}
      </div>

      {/* 2. Floating UI Bottom Sheet */}
      <div className="absolute bottom-0 left-0 w-full md:w-[450px] md:left-auto md:right-8 md:bottom-8 z-10 pointer-events-none">
        <div className="bg-surface-container-lowest/85 backdrop-blur-2xl rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-[0_-12px_40px_rgba(50,41,79,0.12)] md:shadow-2xl border border-outline-variant/20 max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col gap-6 pointer-events-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30">
                {isRunner ? requesterName[0].toUpperCase() : runnerName[0].toUpperCase()}
              </div>
              <div>
                <p className="text-label-sm text-primary font-bold uppercase tracking-wider mb-0.5">{isRunner ? 'Requester' : 'Your Runner'}</p>
                <h2 className="text-xl font-bold text-on-surface font-headline">{isRunner ? requesterName : runnerName}</h2>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  {isRunner ? `Pickup: ${postInfo.location}` : `Heading to ${postInfo.destination || 'you'}`}
                </p>
              </div>
            </div>
            
            {/* Dev Toggle */}
            {isRunner && (
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={`p-2 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors ${isSimulating ? 'bg-error/20 text-error' : 'bg-surface-container text-on-surface-variant'}`}
                title="Simulate Movement"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSimulating ? 'stop_circle' : 'play_circle'}
                </span>
              </button>
            )}
          </div>

          {/* Reward Bar (Runner Only) */}
          {isRunner && (
            <div className="bg-[#ffc5aa]/20 border border-[#ffc5aa]/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b3f00] opacity-80">Reward</p>
                <p className="text-[#9b3f00] font-bold text-lg">{postInfo.type === 'request' || activeJourney.postType === 'request' ? `${postInfo.runnerReward || 50} GC` : (postInfo.price && postInfo.price !== 'Free' ? postInfo.price : 'Good Karma')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b3f00] opacity-80">Deliver To</p>
                <p className="text-[#9b3f00] font-bold text-sm truncate max-w-[120px]">{postInfo.destination}</p>
              </div>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">Journey Progress</h3>
            <div className="space-y-4">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={idx} className="flex gap-4 relative">
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`absolute left-3 top-8 w-[2px] h-[calc(100%-8px)] ${isCompleted ? 'bg-primary' : 'bg-outline-variant/30'}`}></div>
                    )}
                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {isCompleted && !isCurrent ? (
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      ) : null}
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-sm font-bold font-headline ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>{step}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Live Chat</h3>
            <div className="h-32 overflow-y-auto mb-3 space-y-2 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20">
              {messages.map(msg => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-surface-container-highest px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-wide border border-outline-variant/50">
                        {msg.text}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-1.5 rounded-2xl max-w-[80%] ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface'}`}>
                      <p className="text-xs font-medium">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {(isRunner ? ['I am 2 mins away', 'Waiting at the entrance', 'On my way', 'Almost there!'] : ['Okay, thanks!', 'Take your time', 'Where are you?', 'I am here']).map((reply, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => sendQuickMessage(reply)}
                  className="whitespace-nowrap bg-surface-container hover:bg-surface-variant backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary transition-colors border border-outline-variant/30"
                >
                  {reply}
                </button>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-1">
              <input type="text" className="flex-1 bg-surface-container hover:bg-surface-variant transition-colors rounded-xl px-3 py-2 text-xs focus:outline-none" placeholder="Message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              <button type="submit" className="bg-primary text-white px-3 py-2 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>

          {/* Advance Status Button (Runner Only) */}
          {isRunner && currentStepIndex < STATUS_STEPS.length - 1 && (
            <div className="flex flex-col gap-1">
              <button 
                onClick={handleNextStatus} 
                disabled={isTooFar && !isSimulating}
                className="w-full font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all outline-none disabled:cursor-not-allowed"
                style={{
                  border: '2px solid #000',
                  boxShadow: (isTooFar && !isSimulating) ? 'none' : '4px 4px 0px #000',
                  background: (isTooFar && !isSimulating) ? '#ccc' : 'var(--primary)',
                  color: (isTooFar && !isSimulating) ? '#666' : '#fff'
                }}
              >
                {isTooFar && !isSimulating ? (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Locked ({Math.round(distanceToTarget)}m away)
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">where_to_vote</span>
                    Advance to {STATUS_STEPS[currentStepIndex + 1]}
                  </>
                )}
              </button>
            </div>
          )}

          {/* OTP / Arrival State */}
          {activeJourney.status === 'Arrived' ? (
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-[1.5rem] text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Runner Arrived</p>
              {isRunner ? (
                <>
                  <p className="text-on-surface font-medium text-xs mb-3">Enter Requester's OTP to Complete</p>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      maxLength="4" 
                      value={enteredOTP} 
                      onChange={(e) => handleOtpInput(e.target.value)}
                      className="bg-surface-container-lowest text-center text-xl font-bold tracking-[0.5em] py-3 rounded-xl w-full border focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                      style={{ border: otpError ? '2px solid red' : '2px solid #000', boxShadow: '4px 4px 0px #000' }}
                      placeholder="0000"
                    />
                    <button 
                      onClick={handleVerifyOTP}
                      disabled={enteredOTP.length !== 4 || isVerifying}
                      className="py-3 px-4 rounded-xl font-bold bg-primary text-white active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-red-500 font-bold text-xs mt-2">{errorMessage}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-on-surface font-medium text-xs mb-3">Share this code to confirm delivery.</p>
                  <div className="text-4xl font-bold tracking-[0.2em] text-primary font-headline">
                    {activeJourney.otpCode || '----'}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full py-4 rounded-xl bg-surface-container/50 text-on-surface-variant font-bold text-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              OTP unlocks upon arrival
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs hover:bg-surface-container"
              style={{ border: '2px solid #000', background: '#fff', color: '#000', boxShadow: '2px 2px 0px #000' }}
            >
              <span className="material-symbols-outlined text-[14px]">flag</span>
              Report
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={activeJourney.status === 'Arrived' || isAtDestination}
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-error hover:text-white"
              style={{
                border: '2px solid #000',
                background: (activeJourney.status === 'Arrived' || isAtDestination) ? '#eee' : '#fff',
                color: (activeJourney.status === 'Arrived' || isAtDestination) ? '#999' : 'var(--error)',
                boxShadow: (activeJourney.status === 'Arrived' || isAtDestination) ? 'none' : '2px 2px 0px #000'
              }}
            >
              <span className="material-symbols-outlined text-[14px]">cancel</span>
              Cancel
            </button>
          </div>

        </div>
      </div>

      {renderCancelModal()}
      
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={isRunner ? activeJourney.requesterId : activeJourney.runnerId}
        journeyId={activeJourney.id}
      />
    </main>
  );
};

export default ActiveJourney;
