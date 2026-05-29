import React from 'react';
import { X, Award, Star } from 'lucide-react';
import { usePublicProfileModal } from '../hooks/usePublicProfileModal';

const PublicProfileModal = ({ isOpen, onClose, targetUid }) => {
  const { profileData, loading } = usePublicProfileModal(isOpen, targetUid);

  if (!isOpen) return null;

  const renderBadges = (questState) => {
    const claimedQuests = Object.keys(questState || {}).filter(k => questState[k] === 'claimed');
    if (claimedQuests.length === 0) {
      return <p className="text-xs text-on-surface-variant italic text-center w-full col-span-2 py-4">No public badges yet.</p>;
    }
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        {claimedQuests.map(questId => (
          <div 
            key={questId} 
            className="flex flex-col items-center justify-center p-3 border-2 border-on-surface bg-primary-container shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center group"
          >
            <span className="material-symbols-outlined text-[32px] text-on-surface mb-2">military_tech</span>
            <span className="font-label-tag text-[10px] text-on-surface uppercase font-bold break-words w-full">
              {questId.replace(/-/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-margin-page bg-on-surface/85 backdrop-blur-sm font-body-md animate-in fade-in duration-100">
      <main className="relative z-50 w-full max-w-md bg-surface-container border-border-width border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Section */}
        <header className="p-4 border-b-border-width border-on-surface bg-surface-container-lowest flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">Player Profile</h2>
          <button 
            onClick={onClose}
            aria-label="Close modal" 
            className="w-10 h-10 flex items-center justify-center bg-surface-container border-2 border-on-surface shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <X size={20} className="text-on-surface" />
          </button>
        </header>

        {/* Profile Content */}
        <div className="p-6 bg-surface-container-lowest flex flex-col items-center">
          {loading ? (
            <div className="flex justify-center py-10 w-full">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : !profileData ? (
            <p className="text-center font-bold py-6">Profile not found.</p>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              {/* Avatar Icon */}
              <div className="w-20 h-20 border-border-width border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-primary-container flex items-center justify-center font-headline-xl text-3xl font-black text-on-surface">
                {(profileData.name || 'S')[0].toUpperCase()}
              </div>

              {/* Name and reliability score */}
              <h1 className="font-headline-lg text-headline-md text-on-surface uppercase bg-surface-container-lowest px-4 py-1 border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                {profileData.name}
              </h1>

              <div className="flex items-center gap-2 bg-secondary-container border-2 border-on-surface px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mt-2">
                <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="font-label-mono text-xs font-bold text-on-secondary-container uppercase">
                  Reliability Score: {profileData.reliabilityScore}%
                </span>
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-2 gap-4 border-2 border-on-surface p-3 shadow-[3px_3px_0px_0px_#000000] bg-surface-container w-full mt-4">
                <div className="text-center border-r-2 border-on-surface border-dashed">
                  <p className="font-label-mono text-[9px] uppercase text-on-surface-variant font-bold">Completed Runs</p>
                  <p className="font-headline-md text-lg font-black mt-1">
                    {(profileData.stats?.tasksCompleted || 0) + (profileData.stats?.requestsCompleted || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-label-mono text-[9px] uppercase text-on-surface-variant font-bold">Requests Posted</p>
                  <p className="font-headline-md text-lg font-black mt-1">
                    {profileData.stats?.requestsCompleted || 0}
                  </p>
                </div>
              </div>

              {/* Badges Trophy Room */}
              <div className="w-full mt-4">
                <h3 className="font-headline-md text-xs font-black text-on-surface uppercase mb-3 border-b-2 border-on-surface pb-1 flex items-center gap-1.5">
                  <Award size={14} /> Trophy Room
                </h3>
                {renderBadges(profileData.questState)}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicProfileModal;
