import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
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

const STATUS_STEPS = ['Accepted', 'At Gate', 'Walking Back', 'Arrived'];

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

// Auto-pans the map when location updates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();

  const isRunner = activeJourney?.runnerId === currentUser?.uid;

  useEffect(() => {
    if (!isRunner || !activeJourney?.id) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateRunnerLocation(activeJourney.id, latitude, longitude).catch(err => console.error(err));
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRunner, activeJourney?.id]);

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

  if (!activeJourney) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(activeJourney.status);
  
  // Find the post to get user names
  const postInfo = feedData.find(p => p.id === activeJourney.postId) || {};
  const requesterName = postInfo.requesterName || 'Requester';
  const runnerName = postInfo.acceptedBy || 'Runner';

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
    try {
      await verifyOTPAndComplete(activeJourney.id, enteredOTP);
      toast.success("Delivery completed!", { style: { borderRadius: 'var(--radius-md)' } });
      navigate('/dashboard');
    } catch (err) {
      toast.error("Incorrect OTP", { style: { borderRadius: 'var(--radius-md)' } });
    } finally {
      setIsVerifying(false);
    }
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
  const isTooFar = distanceToTarget !== null && distanceToTarget > 200;

  if (isRunner) {
    // RUNNER VIEW (Shows info ABOUT the Requester)
    return (
      <main className="pt-8 px-6 max-w-2xl mx-auto space-y-8 pb-32 w-full">
        <header className="space-y-2">
          <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block">Active Run</span>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface font-headline">Track Journey</h1>
          <p className="text-on-surface-variant font-medium">Head to {postInfo.location} to pick up the parcel.</p>
        </header>

        <section className="relative h-[200px] w-full rounded-[2rem] overflow-hidden bg-surface-container shadow-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-[6rem] text-primary opacity-20">map</span>
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
            <div className="bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="bg-primary text-on-primary w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">navigation</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary opacity-70">Next Step</p>
                <p className="text-sm font-bold text-on-surface">Go to {postInfo.destination}</p>
              </div>
            </div>
            <div className="bg-primary p-3 rounded-full text-on-primary shadow-xl">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low p-6 rounded-[2rem] space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-primary">route</span> Delivery Progress
          </h2>
          <div className="relative flex justify-between px-2">
            <div className="absolute top-4 left-4 right-4 h-[2px] bg-outline-variant/30 -z-10"></div>
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    <span className={`material-symbols-outlined text-sm ${isCurrent && 'animate-pulse'}`} style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}>
                      {isCompleted ? 'check' : 'location_on'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="col-span-1 bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-[1rem] bg-surface-container-highest flex items-center justify-center text-2xl font-bold text-primary">
              {requesterName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Requester</p>
              <p className="text-lg font-bold text-on-surface font-headline">{requesterName}</p>
            </div>
          </div>

          <div className="col-span-1 bg-surface-container p-6 rounded-[2rem] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Destination</p>
              <p className="text-lg font-bold text-on-surface leading-tight mt-1">{postInfo.destination}</p>
            </div>
          </div>

          <div className="col-span-2 bg-surface-container-low p-6 rounded-[2.5rem] flex items-center gap-6">
            <div className="bg-surface-container-lowest p-4 rounded-3xl">
              <span className="material-symbols-outlined text-3xl text-primary">inventory_2</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Item Description</p>
              <p className="text-xl font-bold text-on-surface font-headline">{postInfo.details || 'Campus Pick-up'}</p>
            </div>
            <div className="bg-[#ffc5aa]/30 px-4 py-2 rounded-2xl text-center">
              <p className="text-[#9b3f00] font-bold text-lg">₹{postInfo.price || '0'}</p>
              <p className="text-[10px] font-bold text-[#9b3f00] uppercase">Earning</p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low p-6 rounded-[2rem]">
          <h2 className="text-xl font-bold font-headline mb-4 text-on-surface">Live Chat</h2>
          <div className="h-40 overflow-y-auto mb-4 space-y-2">
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
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface'}`}>
                    <p className="text-sm font-medium">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['I am 2 mins away', 'Waiting at the entrance', 'On my way', 'Almost there!'].map((reply, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setNewMessage(reply)}
                className="whitespace-nowrap bg-surface-container-highest/60 hover:bg-surface-variant backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary transition-colors border border-outline-variant/30"
              >
                {reply}
              </button>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input type="text" className="flex-1 bg-surface-container-lowest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Message requester..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dim transition-colors">
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {currentStepIndex < STATUS_STEPS.length - 1 && (
            <div className="flex flex-col gap-1">
              <button 
                onClick={handleNextStatus} 
                disabled={isTooFar}
                className="w-full bg-surface-container-highest text-on-surface font-bold py-5 rounded-[1.5rem] flex items-center justify-center gap-3 active:scale-95 transition-all outline-none border border-outline-variant/30 hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">where_to_vote</span>
                Advance to {STATUS_STEPS[currentStepIndex + 1]}
              </button>
              {isTooFar && (
                <p className="text-error text-xs text-center font-medium mt-2">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">location_disabled</span>
                  You must be within 200m of the destination to advance.
                </p>
              )}
              {isGeofenceDisabled && !isTooFar && (
                <p className="text-on-surface-variant text-[10px] text-center font-medium mt-2 opacity-70">
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">info</span>
                  Geofence disabled: Target location data missing.
                </p>
              )}
            </div>
          )}
        </section>

        <footer className="pt-4 pb-8">
          {activeJourney.status === 'Arrived' ? (
            <div className="bg-surface-container p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm border border-outline-variant/30">
              <p className="text-sm font-bold text-on-surface text-center">Enter Requester's OTP to Complete</p>
              <input 
                type="text" 
                maxLength="4" 
                value={enteredOTP} 
                onChange={(e) => setEnteredOTP(e.target.value.replace(/\D/g, ''))}
                className="bg-surface-container-lowest text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-2xl w-full border border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 text-on-surface"
                placeholder="0000"
              />
              <button 
                onClick={handleVerifyOTP}
                disabled={enteredOTP.length !== 4 || isVerifying}
                className="w-full py-4 rounded-[1.5rem] font-bold bg-primary text-white shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Complete'}
                {!isVerifying && <span className="material-symbols-outlined">task_alt</span>}
              </button>
            </div>
          ) : (
            <button 
              disabled={true}
              className="w-full py-6 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all text-lg tracking-tight bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
            >
              Waiting to arrive to complete...
              <span className="material-symbols-outlined">task_alt</span>
            </button>
          )}
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full mt-4 py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 transition-all text-sm tracking-wide border-2 border-error/50 text-error hover:bg-error/10"
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            Cancel Run
          </button>
        </footer>
        {renderCancelModal()}
      </main>
    );
  }

  // REQUESTER VIEW (Shows info ABOUT the Runner)
  return (
    <main className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-surface-container-lowest">
      {/* Full Bleed Background Map */}
      <div className="absolute inset-0 z-0">
        {activeJourney.runnerLocation && activeJourney.runnerLocation.lat ? (
          <MapContainer 
            center={[activeJourney.runnerLocation.lat, activeJourney.runnerLocation.lng]} 
            zoom={17} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
            />
            <Marker 
              position={[activeJourney.runnerLocation.lat, activeJourney.runnerLocation.lng]} 
              icon={pulsingMarkerIcon}
            />
            <MapUpdater center={[activeJourney.runnerLocation.lat, activeJourney.runnerLocation.lng]} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant font-medium">
            Locating runner...
          </div>
        )}
      </div>

      {/* Floating UI Bottom Sheet */}
      <div className="absolute bottom-0 left-0 w-full md:w-[450px] md:left-auto md:right-8 md:bottom-8 z-10 pointer-events-none">
        <div className="bg-surface-container-lowest/85 backdrop-blur-2xl rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-[0_-12px_40px_rgba(50,41,79,0.12)] md:shadow-2xl border border-outline-variant/20 max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col gap-6 pointer-events-auto">
          
          {/* Runner Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30">
              {runnerName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-label-sm text-primary font-bold uppercase tracking-wider mb-0.5">Your Runner</p>
              <h2 className="text-xl font-bold text-on-surface font-headline">{runnerName}</h2>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Heading to {postInfo.destination || 'you'}</p>
            </div>
          </div>

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
              {['Okay, thanks!', 'Take your time', 'Where are you?', 'I am here'].map((reply, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setNewMessage(reply)}
                  className="whitespace-nowrap bg-surface-container hover:bg-surface-variant backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary transition-colors border border-outline-variant/30"
                >
                  {reply}
                </button>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-1">
              <input type="text" className="flex-1 bg-surface-container hover:bg-surface-variant transition-colors rounded-xl px-3 py-2 text-xs focus:outline-none" placeholder="Message runner..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              <button type="submit" className="bg-primary text-white px-3 py-2 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>

          {/* OTP / Arrival State */}
          {activeJourney.status === 'Arrived' ? (
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-[1.5rem] text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Runner Arrived</p>
              <p className="text-on-surface font-medium text-xs mb-3">Share this code to confirm delivery.</p>
              <div className="text-4xl font-bold tracking-[0.2em] text-primary font-headline">
                {activeJourney.otpCode || '----'}
              </div>
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
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[14px]">flag</span>
              Report
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs border border-error/30 text-error hover:bg-error/10"
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
        reportedUserId={activeJourney.runnerId}
        journeyId={activeJourney.id}
      />
    </main>
  );
};

export default ActiveJourney;
