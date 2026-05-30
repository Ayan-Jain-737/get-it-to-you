import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReportModal from './ReportModal';
import PublicProfileModal from './PublicProfileModal';
import { useActiveJourney } from '../hooks/useActiveJourney';

const STATUS_STEPS = ['Accepted', 'Ready for Pickup', 'Walking Back', 'Arrived'];

// Custom pulsing marker for the Runner
const pulsingMarkerIcon = L.divIcon({
  className: 'custom-pulsing-marker',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-full h-full bg-[#626200] rounded-full animate-ping opacity-75"></div>
      <div class="relative w-3 h-3 bg-[#626200] rounded-full shadow-md border-2 border-white"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const VALID_CAMPUS_CENTER = [12.9716, 79.1591];
const isCoordsValid = (c) => c && typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng);
const VIT_COORDS = { 'Main Gate': [12.9716, 79.1591], 'SJT': [12.9712, 79.1635], 'TT': [12.9708, 79.1559], 'Library': [12.9710, 79.1585], 'Food Court': [12.9720, 79.1600], 'Hostels': [12.9750, 79.1580] };

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
  const {
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
    mapLng
  } = useActiveJourney();

  if (!activeJourney) {
    return (
      <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-surface-container-lowest gap-4 font-body-md">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-black animate-pulse uppercase text-xs tracking-wider">Connecting to live tracking...</p>
      </div>
    );
  }

  const renderCancelModal = () => {
    if (!showCancelModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm font-body-md animate-in fade-in duration-100">
        <div className="bg-surface-container-lowest border-border-width border-on-surface shadow-[8px_8px_0px_0px_#000000] p-6 w-full max-w-sm flex flex-col gap-4">
          <h3 className="text-xl font-bold text-on-surface font-headline uppercase flex items-center gap-2 border-b-2 border-on-surface pb-2">
            <span className="material-symbols-outlined text-error">warning</span>
            Cancel Run
          </h3>
          <p className="text-xs font-bold text-on-surface-variant">Are you sure you want to cancel this journey? Please select a reason.</p>
          <form onSubmit={handleCancel} className="space-y-4">
            <select 
              value={cancelReason} 
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-surface-container-lowest border-2 border-on-surface p-3 font-bold focus:outline-none text-sm"
            >
              <option value="">Select a reason...</option>
              {isRunner ? (
                <>
                  <option value="Runner unavailable">I am no longer available</option>
                  <option value="Item not found">Cannot find the item/location</option>
                  <option value="Emergency">Emergency</option>
                </>
              ) : (
                <>
                  <option value="No longer needed">No longer needed</option>
                  <option value="Runner unresponsive">Runner is unresponsive</option>
                  <option value="Emergency">Emergency</option>
                </>
              )}
              <option value="Other">Other</option>
            </select>
            {cancelReason === 'Other' && (
              <input 
                type="text" 
                placeholder="Type your reason..." 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-surface-container-lowest border-2 border-on-surface p-3 font-bold focus:outline-none text-sm"
              />
            )}
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-3 bg-surface-container border-2 border-on-surface font-bold uppercase text-xs"
              >
                Nevermind
              </button>
              <button 
                type="submit" 
                disabled={!cancelReason.trim() || isCancelling}
                className="flex-1 py-3 bg-tertiary text-on-error border-2 border-on-surface font-bold uppercase text-xs shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <main className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-surface-container-lowest flex flex-col md:flex-row font-body-md selection:bg-primary-container selection:text-on-surface">
      
      {/* 1. Full Bleed Background Map */}
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
              <Polyline positions={[pickupArr, destArr]} pathOptions={{ color: '#626200', dashArray: '5, 10', weight: 4 }} />
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
      <div className="absolute bottom-0 left-0 w-full md:w-[460px] md:left-auto md:right-8 md:top-8 md:bottom-8 z-10 pointer-events-none flex flex-col justify-end">
        <div className="bg-surface-container-lowest border-t-4 md:border-4 border-on-surface p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] md:max-h-full overflow-y-auto flex flex-col gap-5 pointer-events-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-on-surface pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-on-surface bg-primary-container flex items-center justify-center text-lg font-black uppercase text-on-surface flex-shrink-0">
                {isRunner ? requesterName[0].toUpperCase() : runnerName[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-label-mono text-[9px] text-on-surface-variant uppercase font-bold">{isRunner ? 'Requester' : 'Your Runner'}</p>
                <h2 
                  className="font-headline-md text-body-lg font-black text-on-surface truncate underline cursor-pointer hover:text-primary transition-all"
                  onClick={() => setProfileTargetUid(isRunner ? activeJourney?.requesterId : activeJourney?.runnerId)}
                >
                  {isRunner ? requesterName : runnerName}
                </h2>
                <p className="text-xs text-on-surface-variant font-bold truncate">
                  {isRunner ? `Pickup: ${postInfo.location}` : `Heading to: ${postInfo.destination || 'you'}`}
                </p>
              </div>
            </div>
            
            {/* Dev Simulator Toggle */}
            {isRunner && (
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={`p-2 border-2 border-on-surface transition-colors flex items-center justify-center ${isSimulating ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container text-on-surface'}`}
                title="Simulate Movement"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSimulating ? 'stop_circle' : 'play_circle'}
                </span>
              </button>
            )}
          </div>

          {/* Reward & Route Box */}
          <div className="bg-[#ffc5aa]/20 border-2 border-on-surface p-3 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000] rotate-[0.5deg]">
            <div>
              <p className="font-label-mono text-[9px] font-bold uppercase text-[#9b3f00]">Reward</p>
              <p className="text-[#9b3f00] font-black text-base">
                {`${postInfo.runnerReward || 50} GC`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-label-mono text-[9px] font-bold uppercase text-[#9b3f00]">Destination</p>
              <p className="text-[#9b3f00] font-bold text-xs truncate max-w-[150px]">{postInfo.destination}</p>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-surface-container-low border-2 border-on-surface p-4 shadow-[2px_2px_0px_0px_#000000]">
            <h3 className="font-label-mono text-[10px] font-bold uppercase text-on-surface mb-3 border-b border-on-surface pb-1">Route Status</h3>
            <div className="space-y-3 relative pl-6">
              <div className="absolute left-[9px] top-3 bottom-3 w-1 bg-on-surface"></div>
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={idx} className="flex gap-3 relative items-center">
                    <div 
                      className={`absolute -left-[22px] w-5 h-5 border-2 border-on-surface rounded-full flex items-center justify-center z-10 shadow-[1px_1px_0px_0px_#000000] ${isCompleted ? 'bg-primary-container text-on-surface' : 'bg-surface-container-lowest'}`}
                    >
                      {isCompleted && !isCurrent && (
                        <span className="material-symbols-outlined text-[10px] font-black">check</span>
                      )}
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-on-surface animate-pulse"></span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>{step}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-surface-container border-2 border-on-surface p-4 shadow-[2px_2px_0px_0px_#000000] flex flex-col">
            <h3 className="font-headline-md text-xs font-black mb-3 border-b-2 border-on-surface pb-1 uppercase tracking-wide">Live Chat</h3>
            <div className="h-32 overflow-y-auto mb-3 space-y-2 bg-surface-container-lowest p-3 border border-on-surface">
              {messages.map(msg => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-1.5">
                      <div className="bg-surface-container-highest px-2 py-0.5 border border-on-surface text-[9px] font-bold text-on-surface-variant uppercase tracking-wide">
                        {msg.text}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-1 border-2 border-on-surface max-w-[85%] text-xs font-bold ${msg.sender === 'me' ? 'bg-primary-container text-on-surface shadow-[1px_1px_0px_0px_#000000]' : 'bg-surface-container-lowest text-on-surface'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Quick Reply Suggestions */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {(isRunner ? ['2 mins away', 'Waiting at entrance', 'On my way', 'Almost there!'] : ['Okay, thanks!', 'Take your time', 'Where are you?', 'I am here']).map((reply, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => sendQuickMessage(reply)}
                  className="whitespace-nowrap bg-surface-container-lowest hover:bg-surface-variant border border-on-surface px-2.5 py-1 text-[9px] font-bold uppercase transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
            
            {/* Message Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-surface-container-lowest border-2 border-on-surface px-3 py-2 text-xs focus:outline-none" 
                placeholder="TYPE MESSAGE..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
              />
              <button 
                type="submit" 
                className="bg-primary-container text-on-surface border-2 border-on-surface px-3 flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <span className="material-symbols-outlined text-[16px] font-black">send</span>
              </button>
            </form>
          </div>

          {/* Advance Status Button (Runner Only) */}
          {isRunner && currentStepIndex < STATUS_STEPS.length - 1 && (
            <button 
              onClick={handleNextStatus} 
              disabled={(isTooFar && !isSimulating) || isUpdatingStatus}
              className="w-full font-headline-md text-body-lg font-black py-3 border-2 border-on-surface transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: (isTooFar && !isSimulating) ? 'none' : '4px 4px 0px #000',
                background: (isTooFar && !isSimulating) ? '#e2e2e2' : 'var(--primary-container)',
                color: '#000'
              }}
            >
              {isUpdatingStatus ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span> PROCESSING...
                </>
              ) : isTooFar && !isSimulating ? (
                <>
                  <span className="material-symbols-outlined">lock</span>
                  Locked ({Math.round(distanceToTarget || 0)}m away)
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">where_to_vote</span>
                  Advance to {STATUS_STEPS[currentStepIndex + 1]}
                </>
              )}
            </button>
          )}

          {/* OTP Handoff Section */}
          {activeJourney.status === 'Arrived' ? (
            <div className="bg-secondary-container border-2 border-on-surface p-4 text-center shadow-[4px_4px_0px_0px_#000000] rotate-[-1deg]">
              <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">Runner Arrived</p>
              {isRunner ? (
                <>
                  <p className="text-on-surface font-bold text-xs mb-3">ENTER REQUESTER OTP TO COMPLETE RUN</p>
                  <div className="flex gap-2 items-center justify-center">
                    <input 
                      type="text" 
                      maxLength="4" 
                      value={enteredOTP} 
                      onChange={(e) => handleOtpInput(e.target.value)}
                      className="bg-surface-container-lowest text-center text-xl font-black tracking-[0.5em] py-2 rounded-none border-2 border-on-surface w-full max-w-[150px] focus:outline-none focus:bg-primary-container"
                      placeholder="0000"
                    />
                    <button 
                      onClick={handleVerifyOTP}
                      disabled={enteredOTP.length !== 4 || isVerifying}
                      className="py-2.5 px-4 bg-surface-container-lowest text-on-surface font-bold border-2 border-on-surface shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase text-xs"
                    >
                      {isVerifying ? '...' : 'Verify'}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-error font-bold text-[11px] mt-2">{errorMessage}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-on-surface font-bold text-xs mb-2">SHARE THIS CODE WITH RUNNER TO CONFIRM</p>
                  <div className="text-4xl font-black tracking-[0.25em] text-on-surface font-headline bg-surface-container-lowest py-2 border-2 border-on-surface shadow-[2px_2px_0px_0px_#000000] inline-block px-6">
                    {activeJourney.otpCode || '----'}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full py-3 bg-surface-container/50 border-2 border-on-surface border-dashed text-on-surface-variant font-bold text-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              OTP UNLOCKS UPON ARRIVAL
            </div>
          )}

          {/* Report & Cancel buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="flex-1 py-2.5 border-2 border-on-surface bg-surface-container-lowest text-on-surface shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase text-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[14px]">flag</span> Report
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={activeJourney.status === 'Arrived' || isAtDestination}
              className="flex-1 py-2.5 border-2 border-on-surface bg-surface-container-lowest text-error shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[14px]">cancel</span> Cancel
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
        reporterRole={isRunner ? 'runner' : 'requester'}
      />

      <PublicProfileModal 
        isOpen={!!profileTargetUid}
        onClose={() => setProfileTargetUid(null)}
        targetUid={profileTargetUid}
      />
    </main>
  );
};

export default ActiveJourney;
