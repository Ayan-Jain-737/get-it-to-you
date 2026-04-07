import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PackageX } from 'lucide-react';
import ActiveJourney from './ActiveJourney';

const ActiveRunsList = () => {
  const { activeJourney, currentUser, feedData, trackJourney } = useAppContext();

  // If there's an active run and user is the runner, show the details directly
  if (activeJourney && activeJourney.runnerId === currentUser?.uid) {
    return <ActiveJourney />;
  }

  const history = feedData.filter(p => p.runnerId === currentUser?.uid && p.status === 'completed');
  const myActiveRuns = feedData.filter(p => p.runnerId === currentUser?.uid && p.status === 'accepted');

  const handleTrack = async (postId) => {
    await trackJourney(postId);
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-12">
        <h1 className="text-[2.5rem] leading-tight font-bold text-on-surface tracking-tight mb-2 font-headline">My Runs</h1>
        <p className="text-on-surface-variant font-body">Manage your active deliveries and past runs.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Active Run Placeholder */}
        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-bold flex items-center gap-2 font-headline text-on-surface">
              Active Run
            </h2>
          </div>
          {myActiveRuns.length === 0 ? (
            <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '1.5rem', marginBottom: '2rem', boxShadow: '0 12px 32px rgba(50,41,79,0.06)' }}>
              <PackageX size={64} style={{ marginBottom: '16px', opacity: 0.5, color: 'var(--on-surface-variant)' }} />
              <h2 className="font-headline" style={{ color: 'var(--on-surface)', marginBottom: '8px', fontSize: '1.5rem', fontWeight: 'bold' }}>No Active Deliveries</h2>
              <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center' }}>Accept a pickup or join a run from your Dashboard to start tracking!</p>
            </div>
          ) : (
            myActiveRuns.map(post => (
              <div key={`active-${post.id}`} className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_12px_32px_rgba(50,41,79,0.06)] relative overflow-hidden group mb-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-start justify-between mb-8 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-surface-container-highest text-2xl font-bold text-primary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="text-label-sm text-primary mb-0.5 uppercase tracking-wider font-bold">Requester</p>
                      <h3 className="text-xl font-bold text-on-surface font-headline">{post.requesterName}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-tertiary text-on-tertiary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">In Progress</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-bold text-on-surface mb-2">{post.details || 'Delivery via GITY'}</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-bold">From:</span> {post.location}</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-bold">To:</span> {post.destination}</p>
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant/15 flex gap-3">
                  <button className="flex-1 py-3 px-4 bg-gradient-to-br from-[#4a40e0] to-[#9795ff] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-95" onClick={() => handleTrack(post.id)}>
                    Resume Journey
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Right Column: History */}
        <aside className="w-full lg:w-[400px]">
          <div className="bg-surface-container rounded-[2rem] p-8 min-h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-on-surface font-headline">My Runs History</h2>
              <span className="material-symbols-outlined text-on-surface-variant">history</span>
            </div>
            
            <div className="space-y-6">
              {history.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic text-center py-8">No past runs found.</p>
              ) : (
                history.map(post => (
                  <div key={post.id} className="flex items-start gap-4 bg-surface-container-lowest p-4 rounded-[1.5rem] border border-outline-variant/10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-tertiary/10 rounded-bl-3xl"></div>
                    <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">directions_run</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-on-surface font-headline truncate w-[120px]">{post.requesterName}'s Drop</h4>
                        <span className="text-[10px] uppercase font-bold text-tertiary">Completed</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-3 truncate w-[200px]">{post.details || 'Campus Pick-up'}</p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">To:</span>
                           <span className="text-xs bg-surface-variant text-on-surface-variant px-2 py-1 rounded-md font-medium truncate max-w-[120px]">{post.destination}</span>
                         </div>
                         {post.price && post.price !== 'Free' && (
                           <div className="bg-[#ffc5aa]/20 px-2 py-1 rounded-md">
                             <span className="text-xs font-bold text-[#9b3f00]">+{post.price.includes('₹') ? post.price : `₹${post.price}`}</span>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
};

export default ActiveRunsList;
