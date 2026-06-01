import React, { useState } from 'react';
import { PackageX } from 'lucide-react';
import ActiveJourney from './ActiveJourney';
import OrderDetailsModal from './OrderDetailsModal';
import ReportModal from './ReportModal';
import SkeletonCard from './SkeletonCard';
import { useActiveRunsList } from '../hooks/useActiveRunsList';

const ActiveRunsList = () => {
  const [reportData, setReportData] = useState(null);
  const {
    activeJourney,
    currentUser,
    selectedPost,
    setSelectedPost,
    showMap,
    setShowMap,
    handleTrack,
    history,
    myActiveRuns,
    loading
  } = useActiveRunsList();

  if (showMap && activeJourney && activeJourney.runnerId === currentUser?.uid) {
    return (
      <div className="relative w-full h-[calc(100vh-80px)] bg-surface-container-low">
        <button 
          onClick={() => setShowMap(false)}
          className="absolute top-4 left-4 z-[9999] bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_#141414] px-4 py-2 font-headline-md text-body-md font-bold flex items-center gap-2 hover:-translate-y-1 transition-transform cursor-pointer active:translate-y-0 active:shadow-none"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Tasks List
        </button>
        <ActiveJourney />
      </div>
    );
  }

  return (
    <main className="p-margin-page md:p-stack-lg min-h-screen flex flex-col gap-stack-lg pb-32 md:pb-stack-lg font-body-md bg-surface-container-low text-on-surface">
      {/* Header */}
      <header className="flex items-end justify-between border-b-border-width border-on-surface pb-stack-sm mb-4">
        <div>
          <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-black uppercase tracking-tighter text-on-surface">My Tasks</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 border-l-border-width border-on-surface pl-stack-sm">
            Track runs you accepted and view completed tasks history.
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-gutter">
        {/* Left Column: Active Run */}
        <section className="flex-grow flex flex-col gap-stack-md">
          <div className="flex justify-between items-center bg-primary-container text-on-surface p-stack-sm border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] rotate-[-1deg] mb-2">
            <h2 className="font-headline-lg text-headline-md font-black uppercase tracking-tight">Active Run</h2>
            <span className="font-label-mono text-label-tag bg-surface-container-lowest border-2 border-on-surface px-2 py-0.5">{myActiveRuns.length} ACTIVE</span>
          </div>

          <div className="flex flex-col gap-stack-md">
            {loading && <SkeletonCard />}
            
            {!loading && myActiveRuns.length === 0 && (
              <div className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] p-stack-lg min-h-[250px] flex flex-col items-center justify-center text-center">
                <PackageX size={48} className="text-outline mb-stack-md" />
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Active Deliveries</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">Accept a request or route offer from the Marketplace to start running tasks!</p>
              </div>
            )}
            
            {!loading && myActiveRuns.map(post => (
                <div 
                  key={`active-${post.id}`} 
                  className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] p-stack-md flex flex-col relative hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#141414] transition-all cursor-pointer"
                  onClick={() => handleTrack(post.id)}
                >
                  <div className="flex items-start justify-between border-b-2 border-on-surface pb-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border-border-width border-on-surface bg-secondary-container flex items-center justify-center font-headline-md font-bold uppercase text-on-surface">
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <div>
                        <p className="font-label-mono text-label-tag text-on-surface-variant uppercase font-bold">Requester</p>
                        <h3 className="font-headline-md text-body-lg font-black text-on-surface">{post.requesterName}</h3>
                      </div>
                    </div>
                    <span className="bg-tertiary text-on-tertiary font-label-tag text-[9px] uppercase bg-error px-2 py-0.5 border border-on-surface">In Progress</span>
                  </div>
                  
                  <div className="mb-4 space-y-1 text-sm font-bold text-on-surface-variant">
                    <p className="text-on-surface text-base font-black uppercase mb-2">{post.details || 'Delivery via GITY'}</p>
                    <p><span className="text-on-surface font-black">From:</span> {post.location}</p>
                    <p><span className="text-on-surface font-black">To:</span> {post.destination}</p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleTrack(post.id); }}
                      className="w-full py-3 bg-primary-container hover:bg-primary-fixed-dim text-on-surface border-2 border-on-surface shadow-[3px_3px_0px_0px_#141414] font-bold uppercase text-xs active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                      Resume Journey
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Right Column: History */}
        <aside className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] p-6 min-h-full">
            <div className="flex items-center justify-between border-b-2 border-on-surface pb-3 mb-6">
              <h2 className="font-headline-lg text-headline-md font-black uppercase text-on-surface">Tasks History</h2>
              <span className="material-symbols-outlined text-on-surface-variant">history</span>
            </div>
            
            <div className="flex flex-col gap-stack-md">
              {history.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic text-center py-8">No past runs found.</p>
              ) : (
                history.map(post => (
                  <div 
                    key={post.id} 
                    className="flex flex-col border-2 border-on-surface p-3 bg-surface-container shadow-[2px_2px_0px_0px_#141414] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#141414] transition-all cursor-pointer" 
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-on-surface font-headline truncate w-36">{post.requesterName}'s Drop</h4>
                      <span className="font-label-tag text-[9px] uppercase bg-secondary-container text-on-secondary-container px-1.5 py-0.5 border border-on-surface">Completed</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3 truncate w-[300px]">{post.details || 'Campus Pick-up'}</p>
                    <div className="flex items-center justify-between border-t border-on-surface border-dashed pt-2 mt-1">
                      <span className="text-[10px] font-label-mono bg-surface-container-lowest border border-on-surface px-1.5 py-0.5 text-on-surface truncate max-w-[120px]">To: {post.destination}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setReportData({ reportedUserId: post.requesterId || post.acceptedBy, journeyId: post.id }); }}
                          className="text-[10px] uppercase font-bold text-error border border-error hover:bg-error/15 px-2 py-0.5 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px]">flag</span> Report
                        </button>
                        <span className="text-[10px] font-label-mono bg-primary-container text-on-surface px-2 py-0.5 border border-on-surface">
                          {`Reward: ${post.runnerReward || 50} GC`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <OrderDetailsModal 
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
      />
      <ReportModal 
        isOpen={!!reportData}
        onClose={() => setReportData(null)}
        reportedUserId={reportData?.reportedUserId}
        journeyId={reportData?.journeyId}
        reporterRole="runner"
      />
    </main>
  );
};

export default ActiveRunsList;
