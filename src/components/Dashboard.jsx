import React from 'react';
import PublicProfileModal from './PublicProfileModal';
import ConfirmModal from './ConfirmModal';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const {
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
  } = useDashboard();

  return (
    <main className="p-margin-page md:p-stack-lg min-h-screen flex flex-col gap-stack-lg pb-32 md:pb-stack-lg font-body-md bg-surface-container-low">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md border-b-border-width border-on-surface pb-stack-sm">
        <div>
          <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-black uppercase tracking-tighter text-on-surface">Marketplace</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 border-l-border-width border-on-surface pl-stack-sm">
            The peer-to-peer micro-logistics exchange for campus life.
          </p>
        </div>
      </section>

      {/* Split-Feed Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Left Column: Need a Pickup */}
        <section className="flex flex-col gap-stack-md">
          <div className="flex justify-between items-center bg-primary-container text-on-surface p-stack-sm border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] rotate-[-1deg]">
            <h2 className="font-headline-lg text-headline-md font-black uppercase tracking-tight">Need a Pickup</h2>
            <span className="font-label-mono text-label-tag bg-surface-container-lowest border-2 border-on-surface px-2 py-0.5">{pickups.length} ACTIVE</span>
          </div>

          <div className="flex flex-col gap-stack-md mt-2">
            {pickups.map(post => (
              <article 
                key={post.id} 
                className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] flex flex-col relative group transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000]"
              >
                {post.isUrgent && (
                  <div className="absolute -top-3 -left-3 bg-tertiary text-on-error border-border-width border-on-surface px-stack-sm py-1 font-label-mono text-label-tag font-black z-20 shadow-[4px_4px_0px_0px_#000000] rotate-3">
                    URGENT
                  </div>
                )}
                
                <div className="absolute top-stack-sm right-stack-sm bg-surface-variant border-2 border-on-surface px-2 py-0.5 font-label-tag text-label-tag z-10">
                  {getTimeAgo(post.createdAt)}
                </div>

                <div className="p-stack-md flex-1 flex flex-col gap-stack-md border-b-border-width border-on-surface">
                  <div className="flex items-center gap-stack-sm pr-24">
                    <div className="w-10 h-10 border-border-width border-on-surface bg-secondary-container flex items-center justify-center font-headline-md font-bold uppercase text-on-surface flex-shrink-0">
                      {post.requesterName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-headline-md text-body-lg font-bold leading-tight truncate">
                        <span 
                          onClick={() => setProfileTargetUid(post.requesterId)}
                          className="cursor-pointer underline hover:text-primary transition-colors"
                        >
                          {post.requesterName}
                        </span>
                      </div>
                      {post.requesterScore && (
                        <div className="inline-flex items-center gap-1 bg-surface-container-highest border-2 border-on-surface px-1 font-label-tag text-label-tag mt-1">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {post.requesterScore}% Reliability
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`p-stack-sm border-border-width border-on-surface mt-2 relative overflow-hidden ${post.isUrgent ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-primary-container text-on-surface'}`}>
                    <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none text-on-surface">
                      <span className="material-symbols-outlined text-9xl">directions_run</span>
                    </div>
                    <h3 className="font-headline-md text-body-lg font-bold mb-2 break-words">{post.details || 'Large Box'}</h3>
                    <div className="font-body-md text-body-md flex flex-col gap-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-on-surface block flex-shrink-0"></span>
                        <span className="truncate">From: {post.location}</span>
                      </div>
                      <div className="w-1 h-3 bg-on-surface ml-1"></div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-on-surface block bg-surface-container-lowest flex-shrink-0"></span>
                        <span className="truncate">To: {post.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-stack-sm flex justify-between items-center bg-surface-container-high border-b-border-width border-on-surface">
                  <div className="font-label-mono text-label-tag text-on-surface-variant uppercase">
                    {currentUser && post.requesterId === currentUser.uid ? 'Cost' : 'Reward'}
                  </div>
                  <div className="font-headline-lg text-body-lg font-black bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] px-stack-sm py-1 -rotate-2">
                    {currentUser && post.requesterId === currentUser.uid ? `75 GC` : `50 GC`}
                  </div>
                </div>

                {(!currentUser || post.requesterId !== currentUser.uid) ? (
                  <button 
                    onClick={() => handleAccept(post.id, 'request')}
                    className="w-full p-stack-sm bg-secondary-container hover:bg-secondary-fixed border-none font-headline-md text-body-lg font-bold active:bg-secondary-fixed-dim transition-colors text-center uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Accept Task <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="w-full p-stack-sm bg-tertiary text-on-error hover:bg-red-700 border-none font-headline-md text-body-lg font-bold transition-colors text-center uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Remove Request <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </article>
            ))}

            {pickups.length === 0 && (
              <div className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] p-stack-lg min-h-[250px] flex flex-col items-center justify-center relative">
                <span className="material-symbols-outlined text-5xl text-outline mb-stack-md">assignment</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Active Requests</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">There are no current pickup requests. Be the first to broadcast a need!</p>
              </div>
            )}

            <button 
              onClick={() => openModal('request')}
              className="w-full p-stack-md bg-primary-container border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] font-headline-md text-headline-md font-bold active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase flex items-center justify-center gap-2 mt-2 hover:bg-primary-fixed-dim"
            >
              <span className="material-symbols-outlined font-black">add_circle</span> Post Request
            </button>
          </div>
        </section>

        {/* Right Column: Ready for Pickup */}
        <section className="flex flex-col gap-stack-md">
          <div className="flex justify-between items-center bg-secondary-container text-on-surface p-stack-sm border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] rotate-[1deg]">
            <h2 className="font-headline-lg text-headline-md font-black uppercase tracking-tight">Ready for Pickup</h2>
            <span className="font-label-mono text-label-tag bg-surface-container-lowest border-2 border-on-surface px-2 py-0.5">{offers.length} ACTIVE</span>
          </div>

          <div className="flex flex-col gap-stack-md mt-2">
            {offers.map(post => (
              <article 
                key={post.id} 
                className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] flex flex-col relative group transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000]"
              >
                <div className="absolute top-stack-sm right-stack-sm bg-surface-variant border-2 border-on-surface px-2 py-0.5 font-label-tag text-label-tag z-10">
                  {getTimeAgo(post.createdAt)}
                </div>

                <div className="p-stack-md flex-1 flex flex-col gap-stack-md border-b-border-width border-on-surface">
                  <div className="flex items-center gap-stack-sm pr-24">
                    <div className="w-10 h-10 border-border-width border-on-surface bg-primary-container flex items-center justify-center font-headline-md font-bold uppercase text-on-surface flex-shrink-0">
                      {post.requesterName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-headline-md text-body-lg font-bold leading-tight truncate">
                        <span 
                          onClick={() => setProfileTargetUid(post.requesterId)}
                          className="cursor-pointer underline hover:text-primary transition-colors"
                        >
                          {post.requesterName}
                        </span>
                      </div>
                      {post.requesterScore && (
                        <div className="inline-flex items-center gap-1 bg-surface-container-highest border-2 border-on-surface px-1 font-label-tag text-label-tag mt-1">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {post.requesterScore}% Reliability
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-surface-variant p-stack-sm border-border-width border-on-surface mt-2 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none text-on-surface">
                      <span className="material-symbols-outlined text-9xl">directions_walk</span>
                    </div>
                    <h3 className="font-headline-md text-body-lg font-bold mb-2 break-words">Heading to: {post.destination}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{post.details}</p>
                  </div>
                </div>

                <div className="p-stack-sm flex justify-between items-center bg-surface-container-high border-b-border-width border-on-surface">
                  <div className="font-label-mono text-label-tag text-on-surface-variant uppercase">
                    {currentUser && post.requesterId === currentUser.uid ? 'Reward' : 'Cost'}
                  </div>
                  <div className="font-headline-lg text-body-lg font-black bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] px-stack-sm py-1 rotate-2">
                    {currentUser && post.requesterId === currentUser.uid ? `50 GC` : `75 GC`}
                  </div>
                </div>

                {(!currentUser || post.requesterId !== currentUser.uid) ? (
                  <button 
                    onClick={() => handleAccept(post.id, 'offer')}
                    className="w-full p-stack-sm bg-secondary-container hover:bg-secondary-fixed border-none font-headline-md text-body-lg font-bold active:bg-secondary-fixed-dim transition-colors text-center uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Ask for Pickup <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="w-full p-stack-sm bg-tertiary text-on-error hover:bg-red-700 border-none font-headline-md text-body-lg font-bold transition-colors text-center uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Remove Offer <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </article>
            ))}

            {offers.length === 0 && (
              <div className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] p-stack-lg min-h-[250px] flex flex-col items-center justify-center relative">
                <span className="material-symbols-outlined text-5xl text-outline mb-stack-md">directions_walk</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Active Offers</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">No runners are broadcasting their routes right now. Check back shortly!</p>
              </div>
            )}

            <button 
              onClick={() => openModal('offer')}
              className="w-full p-stack-md bg-primary-container border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] font-headline-md text-headline-md font-bold active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase flex items-center justify-center gap-2 mt-2 hover:bg-primary-fixed-dim"
            >
              <span className="material-symbols-outlined">local_shipping</span> I'm Ready for Pickup
            </button>
          </div>
        </section>
      </div>

      <PublicProfileModal 
        isOpen={!!profileTargetUid} 
        targetUid={profileTargetUid} 
        onClose={() => setProfileTargetUid(null)} 
      />

      <ConfirmModal
        isOpen={!!postToDelete}
        title="Remove Post"
        message="Are you sure you want to remove this post? This action cannot be undone."
        confirmText="Remove"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </main>
  );
};

export default Dashboard;
