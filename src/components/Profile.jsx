import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import OrderDetailsModal from './OrderDetailsModal';

const Profile = () => {
  const { userProfile, updateProfile, currentUser, getUserStats } = useAppContext();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [dorm, setDorm] = useState(userProfile?.dorm || "Main Gate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);

  const [stats, setStats] = useState({ tasksCompleted: 0, requestsCompleted: 0, cancelled: 0, pastRuns: [] });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (currentUser?.uid) {
        setIsLoadingStats(true);
        const data = await getUserStats(currentUser.uid);
        setStats(data);
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, [currentUser?.uid, getUserStats]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ name, dorm });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const completedRuns = stats.tasksCompleted + stats.requestsCompleted;
  const totalRuns = completedRuns + stats.cancelled;
  const reliabilityScore = totalRuns === 0 ? 100 : Math.round((completedRuns / totalRuns) * 100);
  
  // Calculate SVG stroke dasharray for the circular progress (circumference = 2 * pi * r)
  // r = 36, circumference = 226.19
  const circumference = 226.19;
  const strokeDashoffset = circumference - (reliabilityScore / 100) * circumference;

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-12">
        <h1 className="text-[2.5rem] leading-tight font-bold text-on-surface tracking-tight mb-2 font-headline">Your Profile</h1>
        <p className="text-on-surface-variant font-body">Manage your preferences and view your reliability metrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Reliability */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_12px_32px_rgba(50,41,79,0.06)] flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle 
                  cx="50" cy="50" r="36" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-surface-variant" 
                />
                {/* Progress circle */}
                <circle 
                  cx="50" cy="50" r="36" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  className={reliabilityScore >= 80 ? 'text-tertiary-container' : reliabilityScore >= 50 ? 'text-[#ffc5aa]' : 'text-error'}
                  strokeDasharray={circumference}
                  strokeDashoffset={isLoadingStats ? circumference : strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black font-headline text-on-surface">
                  {isLoadingStats ? '-' : reliabilityScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Score</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Reliability Score</h2>
            <p className="text-sm text-on-surface-variant max-w-xs mb-6">
              Your score is based on completed deliveries vs. cancellations. A high score builds trust within the GITY network.
            </p>

            <div className="flex gap-3 w-full">
              <div className="flex-1 bg-surface-container p-3 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider mb-1">Total Requests</p>
                <p className="text-lg font-bold text-on-surface font-headline">{isLoadingStats ? '-' : stats.requestsCompleted}</p>
              </div>
              <div className="flex-1 bg-surface-container p-3 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider mb-1">Total Tasks</p>
                <p className="text-lg font-bold text-on-surface font-headline">{isLoadingStats ? '-' : stats.tasksCompleted}</p>
              </div>
              <div className="flex-1 bg-surface-container p-3 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-error tracking-wider mb-1">Cancelled</p>
                <p className="text-lg font-bold text-error font-headline">{isLoadingStats ? '-' : stats.cancelled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-container p-8 rounded-[2rem]">
            <h2 className="text-xl font-bold text-on-surface font-headline mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              Preferences
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-label-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  required
                  className="w-full bg-surface-container-lowest hover:bg-surface-container-highest transition-colors text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-label-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Location / Dorm</label>
                <select 
                  value={dorm} 
                  onChange={(e) => setDorm(e.target.value)}
                  className="w-full bg-surface-container-lowest hover:bg-surface-container-highest transition-colors text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option disabled value="">Select Core Landmark</option>
                  <option value="Main Gate">Main Gate</option>
                  <option value="Food Court">Food Court</option>
                  <option value="SJT">SJT</option>
                  <option value="TT">TT</option>
                  <option value="Library">Library</option>
                  <option value="Hostels">Hostels</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm tracking-wide shadow-md hover:bg-primary-dim transition-all active:scale-[0.98]"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              {saved && <p className="text-sm font-bold text-tertiary text-center animate-pulse">Changes saved successfully!</p>}
            </form>
          </div>
        </section>

        {/* Right Column: Trust Evidence */}
        <section className="lg:col-span-7">
          <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-[2rem] min-h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-on-surface font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">verified_user</span>
                  Trust Evidence
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">A verifiable history of your completed deliveries.</p>
              </div>
            </div>

            <div className="space-y-6">
              {isLoadingStats ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-surface-variant/30 rounded-xl"></div>
                  ))}
                </div>
              ) : stats.pastRuns?.length === 0 ? (
                <div className="text-center py-12 bg-surface-container rounded-2xl">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50 mb-3">inventory_2</span>
                  <p className="text-on-surface font-bold">No completed runs yet</p>
                  <p className="text-sm text-on-surface-variant">Accept a request to build your trust evidence.</p>
                </div>
              ) : (
                stats.pastRuns?.map((run, idx) => (
                  <div key={run.id || idx} onClick={() => setSelectedRun(run)} className="flex items-start gap-4 p-4 rounded-2xl border border-outline-variant/10 hover:bg-surface-container-highest transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-tertiary text-xl">task_alt</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-on-surface text-sm">Delivered to {run.destination || 'Campus'}</h4>
                        {run.status === 'Completed' && (
                          <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded uppercase font-bold tracking-wider">Verified</span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mb-2">Picked up from {run.pickupLocation || run.pickup || run.location || 'Campus Landmark'}</p>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {run.createdAt ? new Date(run.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>
      
      <OrderDetailsModal 
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        post={selectedRun}
      />
    </main>
  );
};

export default Profile;
