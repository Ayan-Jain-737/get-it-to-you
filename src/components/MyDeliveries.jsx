import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

import ActiveJourney from './ActiveJourney';

const MyDeliveries = () => {
  const { feedData, currentUser, trackJourney, activeJourney } = useAppContext();
  const navigate = useNavigate();
  const { openModal } = useOutletContext();

  const handleTrack = async (postId) => {
    await trackJourney(postId);
  };

  if (activeJourney && activeJourney.requesterId === currentUser?.uid) {
    return <ActiveJourney />;
  }

  const myAcceptedRequests = feedData.filter(
    post => post.requesterId === currentUser?.uid && post.status === 'accepted'
  );

  return (
    <main className="max-w-screen-2xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-12">
        <h1 className="text-[2.5rem] leading-tight font-bold text-on-surface tracking-tight mb-2 font-headline">My Deliveries</h1>
        <p className="text-on-surface-variant font-body">Track your active orders and manage your delivery history.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Active Requests */}
        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-bold flex items-center gap-2 font-headline text-on-surface">
              Active Requests
              {myAcceptedRequests.length > 0 && <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Live</span>}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {myAcceptedRequests.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-[0_12px_32px_rgba(50,41,79,0.06)] text-center">
                <span className="material-symbols-outlined text-[3rem] mb-4 opacity-50 text-on-surface-variant">package_2</span>
                <h3 className="text-xl font-bold text-on-surface font-headline mb-2">No Active Deliveries</h3>
                <p className="text-on-surface-variant">Your current pickup requests will appear here once accepted.</p>
              </div>
            ) : (
              myAcceptedRequests.map(post => (
                <div key={post.id} className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_12px_32px_rgba(50,41,79,0.06)] relative overflow-hidden group cursor-pointer" onClick={() => handleTrack(post.id)}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                  <div className="flex items-start justify-between mb-8 relative">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-surface-container-highest text-2xl font-bold text-primary">
                        {(post.acceptedBy || 'R')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-label-sm text-primary mb-0.5 uppercase tracking-wider font-bold">Runner</p>
                        <h3 className="text-xl font-bold text-on-surface font-headline">{post.acceptedBy || 'Runner'}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant mb-0.5 uppercase tracking-widest font-bold">ETA</p>
                      <p className="text-xl font-black text-primary font-headline">12 mins</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 relative">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <div className="w-0.5 h-8 bg-primary/20 my-1"></div>
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-4">
                          <p className="text-label-sm text-tertiary font-bold mb-1 uppercase tracking-wider">Delivery Assigned</p>
                          <p className="text-sm text-on-surface-variant font-medium">The runner is handling your request.</p>
                        </div>
                        <div className="bg-surface-container rounded-xl p-3 flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant">directions_run</span>
                          <span className="text-sm font-bold text-on-surface">Heading to {post.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-outline-variant/15 flex gap-3">
                    <button className="flex-1 py-3 px-4 bg-gradient-to-br from-[#4a40e0] to-[#9795ff] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-95" onClick={(e) => { e.stopPropagation(); handleTrack(post.id); }}>
                      Open Journey Tracker
                    </button>
                    <button 
                      className="p-3 bg-surface-container text-on-surface rounded-xl hover:bg-surface-container-highest transition-colors active:scale-95"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Request History */}
        <aside className="w-full lg:w-[400px]">
          <div className="bg-surface-container rounded-[2rem] p-8 min-h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-on-surface font-headline">Request History</h2>
              <span className="material-symbols-outlined text-on-surface-variant">history</span>
            </div>
            
            <div className="space-y-8">
              {feedData.filter(p => p.requesterId === currentUser?.uid && p.status === 'completed').length === 0 ? (
                <p className="text-sm text-on-surface-variant italic text-center py-8">No past history found.</p>
              ) : (
                feedData.filter(p => p.requesterId === currentUser?.uid && p.status === 'completed').map(post => (
                  <div key={post.id} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">package_2</span>
                    </div>
                    <div className="flex-1 border-b border-outline-variant/10 pb-6">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-on-surface font-headline truncate w-32">{post.details || 'Campus Pick-up'}</h4>
                        <span className="text-[10px] uppercase font-bold text-tertiary">Completed</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-3">Delivered to {post.destination}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-surface-container-lowest px-2 py-1 rounded-md text-on-surface-variant font-medium truncate max-w-24">{post.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <button 
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-gradient-to-br from-[#4a40e0] to-[#9795ff] text-white rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(74,64,224,0.3)] transition-transform hover:scale-110 active:scale-95 group z-50 pointer-events-auto"
        onClick={() => openModal && openModal('request')}
      >
        <span className="material-symbols-outlined text-3xl">add</span>
        <span className="absolute right-20 bg-on-surface text-surface py-2 px-4 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">New Delivery</span>
      </button>
    </main>
  );
};

export default MyDeliveries;
