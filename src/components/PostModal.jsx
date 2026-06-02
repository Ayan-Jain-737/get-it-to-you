import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { usePostModal } from '../hooks/usePostModal';
import { useScrollLock } from '../hooks/useScrollLock';
import { VIT_LOCATIONS } from '../constants';
import SearchableDropdown from './SearchableDropdown';

const groupedLocations = VIT_LOCATIONS.reduce((acc, loc) => {
  if (!acc[loc.category]) acc[loc.category] = [];
  acc[loc.category].push(loc);
  return acc;
}, {});

const dropdownOptions = Object.entries(groupedLocations).map(([category, locs]) => ({
  groupLabel: category,
  options: locs.map(loc => ({ value: loc.id, label: loc.label }))
}));

import { useTutorial } from './Tutorial/useTutorial';

const PostModal = ({ initialType = 'request', onClose }) => {
  useScrollLock(true);
  const { step, advanceStep, isActive } = useTutorial();
  const {
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
  } = usePostModal(initialType, onClose);

  // Auto-advance tutorial when fields are filled
  useEffect(() => {
    if (!isActive) return;
    if (step === 8 && location) advanceStep(); // step 8: post-pickup
    if (step === 9 && destination) advanceStep(); // step 9: post-dropoff
  }, [isActive, step, location, destination, advanceStep]);

  return (
    <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-page z-[200] font-body-md animate-in fade-in duration-100">
      <div data-tutorial="post-modal" className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container-lowest border-border-width border-on-surface shadow-[8px_8px_0px_0px_#141414] p-stack-md flex flex-col gap-stack-md relative animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b-border-width border-on-surface pb-stack-sm mb-2">
          <h2 className="font-headline-lg text-headline-md uppercase tracking-tight text-on-surface">Create a Post</h2>
          <button 
            onClick={onClose}
            className="border-2 border-on-surface p-1 shadow-[2px_2px_0px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-primary-container bg-surface-container-lowest transition-all flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">

          {/* Pickup Selection */}
          <div className="flex flex-col gap-1" data-tutorial="post-pickup">
            <label className="font-label-mono text-label-tag uppercase text-on-surface-variant font-bold">
              {postType === 'offer' ? 'I Am Going To' : 'Pickup From'}
            </label>
            <SearchableDropdown
              options={dropdownOptions}
              value={location}
              onChange={setLocation}
              placeholder="Select a location..."
            />
          </div>

          {/* Dropoff Selection */}
          <div className="flex flex-col gap-1" data-tutorial="post-dropoff">
            <label className="font-label-mono text-label-tag uppercase text-on-surface-variant font-bold">
              {postType === 'offer' ? 'I Will Return To' : 'Drop-off At'}
            </label>
            <SearchableDropdown
              options={dropdownOptions}
              value={destination}
              onChange={setDestination}
              placeholder="Select a destination..."
            />
          </div>

          {/* Urgent Selector (Request Only) */}
          {postType === 'request' && (
            <label className="flex items-center gap-2 cursor-pointer font-label-mono text-label-tag text-on-surface font-bold uppercase mt-1">
              <input 
                type="checkbox" 
                checked={isUrgent} 
                onChange={(e) => setIsUrgent(e.target.checked)} 
                className="w-5 h-5 border-2 border-on-surface checked:bg-primary rounded-none focus:ring-0 focus:ring-offset-0"
              />
              Mark as URGENT
            </label>
          )}

          {/* Specific Details */}
          <div className="flex flex-col gap-1" data-tutorial="post-details">
            <label className="font-label-mono text-label-tag uppercase text-on-surface-variant font-bold">Specific Details</label>
            <textarea
              rows="2"
              placeholder={postType === 'request' ? "e.g. Swiggy order arriving in 10 mins..." : "e.g. Can carry small packages, meeting near main entrance..."}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-3 border-2 border-on-surface bg-surface-container-lowest font-body-md text-body-md outline-none focus:bg-primary-container transition-colors shadow-[2px_2px_0px_0px_#141414] resize-none"
              required
            />
          </div>

          {/* Cost breakdown */}
          <div className="p-stack-sm bg-surface-container-highest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] flex flex-col items-center justify-center">
            <span className="font-headline-md text-body-lg font-black text-on-surface">
              {postType === 'request' ? `Cost: ${dynamicCost} GC` : `Reward: ${runnerReward} GC`}
            </span>
            <span className="font-label-mono text-[11px] text-on-surface-variant">
              {postType === 'request' ? `(${zoneText} - Deducted instantly)` : `(${zoneText} - Earned on delivery)`}
            </span>
          </div>

          {/* Insufficient Funds Warning */}
          {postType === 'request' && (userProfile?.gcBalance < dynamicCost) && (
            <div className="bg-tertiary-container text-on-tertiary-container border-2 border-on-surface p-2 text-center font-body-md font-bold uppercase text-xs">
              ⚠️ Insufficient funds ({dynamicCost} GC required). You have {userProfile?.gcBalance || 0} GC.
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            data-tutorial="post-submit" 
            disabled={isSubmitting || (postType === 'request' && (userProfile?.gcBalance < dynamicCost)) || !location || !destination || !details.trim()}
            className="w-full p-stack-sm bg-primary-container hover:bg-primary-fixed-dim text-on-surface border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] font-headline-md text-body-lg font-bold active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span> PROCESSING...
              </>
            ) : (
              postType === 'request' ? `Post Request (${dynamicCost} GC)` : 'Post Availability'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
