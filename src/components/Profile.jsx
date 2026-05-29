import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import OrderDetailsModal from './OrderDetailsModal';

const Profile = () => {
  const { userProfile, updateProfile, currentUser, getUserStats, claimQuestFromBoard } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('daily');
  
  const [name, setName] = useState(userProfile?.name || '');
  const [dorm, setDorm] = useState(userProfile?.dorm || "Main Gate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);

  const [stats, setStats] = useState({ tasksCompleted: 0, requestsCompleted: 0, cancelled: 0, pastRuns: [] });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [dailyTimeLeft, setDailyTimeLeft] = useState("");
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState("");

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
      
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const dailyDiff = midnight - now;
      const dHours = Math.floor(dailyDiff / (1000 * 60 * 60));
      const dMinutes = Math.floor((dailyDiff % (1000 * 60 * 60)) / (1000 * 60));
      setDailyTimeLeft(`${dHours}h ${dMinutes}m`);

      let daysUntilSunday = 7 - now.getDay();
      if (daysUntilSunday === 7) daysUntilSunday = 0; // if it's already sunday
      const nextSundayMidnight = new Date(now);
      nextSundayMidnight.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
      nextSundayMidnight.setHours(24, 0, 0, 0);
      const weeklyDiff = nextSundayMidnight - now;
      const wDays = Math.floor(weeklyDiff / (1000 * 60 * 60 * 24));
      const wHours = Math.floor((weeklyDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setWeeklyTimeLeft(`${wDays}d ${wHours}h`);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 60000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col items-center justify-center text-center" style={{ border: '2px solid #000', boxShadow: '4px 4px 0px #000' }}>
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
          

          <div className="bg-surface-container-lowest p-8 rounded-xl" style={{ border: '2px solid #000', boxShadow: '4px 4px 0px #000' }}>
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

        {/* Right Column: Quest Board */}
        <section className="lg:col-span-7">
          <div className="bg-[#fff] p-8 rounded-xl min-h-full" style={{ border: '2px solid #000', boxShadow: '4px 4px 0px #000' }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#000] font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">local_fire_department</span>
                  Available Quests
                </h2>
                <p className="text-sm font-bold text-[#666] mt-1">Complete tasks to earn GC and build your reputation.</p>
              </div>
            </div>

            <div className="space-y-6">
              
              {(() => {
                const questState = userProfile?.questState || {};
                const runs = stats.tasksCompleted || 0;
                
                // Helper to count weekend warrior (runs this week)
                const getWeekStr = (d) => {
                  const date = new Date(d.getTime());
                  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
                  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
                  const weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
                  return `${date.getUTCFullYear()}-W${weekNo}`;
                };
                const currentWeekStr = getWeekStr(new Date());
                const isWeekendWarriorDone = stats.pastRuns?.filter(r => r.status === 'Completed' && r.createdAt && getWeekStr(new Date(r.createdAt.seconds * 1000)) === currentWeekStr).length >= 5;
                const weeklyCount = stats.pastRuns?.filter(r => r.status === 'Completed' && r.createdAt && getWeekStr(new Date(r.createdAt.seconds * 1000)) === currentWeekStr).length || 0;
                
                const QuestCard = ({ id, title, desc, reward, completed, progress, total, icon, bg, accent, onClick }) => {
                  const isClaimed = questState[id] === 'claimed';
                  const isCompletedUnclaimed = !isClaimed && (completed || (progress !== undefined && progress >= total));
                  const isInProgress = !isClaimed && !isCompletedUnclaimed;
                  
                  const percent = isClaimed || isCompletedUnclaimed ? 100 : progress !== undefined ? (progress / total) * 100 : 0;
                  
                  const handleAction = async () => {
                    if (onClick) {
                      onClick();
                      return;
                    }
                    if (isCompletedUnclaimed) {
                      try {
                        await claimQuestFromBoard(id, reward);
                        toast.success(`Claimed ${reward} GC!`);
                      } catch (err) {
                        toast.error(err.message);
                      }
                    }
                  };

                  return (
                    <div className={`p-4 rounded-xl flex flex-col justify-center transition-all mb-4 ${isCompletedUnclaimed || onClick ? 'cursor-pointer hover:opacity-90 hover:scale-[1.01]' : ''}`} onClick={handleAction} style={{ border: '2px solid #000', boxShadow: isClaimed ? 'none' : '4px 4px 0px #000', background: isClaimed ? '#e0e0e0' : (isCompletedUnclaimed ? '#e8f5e9' : bg) }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-black ${isClaimed ? 'bg-[#bdbdbd]' : 'bg-[#fff]'}`}>
                            <span className={`material-symbols-outlined ${isClaimed ? 'text-[#000]' : ''}`} style={{ color: isClaimed ? '#000' : accent }}>{icon}</span>
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${isClaimed ? 'line-through text-[#666]' : ''}`}>{title}</h4>
                            <p className="text-xs font-bold text-[#666]">{desc}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end justify-center">
                          {isClaimed ? (
                            <span className="font-black text-[#000] uppercase bg-[#bdbdbd] px-2 py-1 rounded text-[10px]" style={{ border: '2px solid #000' }}>Claimed</span>
                          ) : isCompletedUnclaimed ? (
                            <button className="font-black text-[#000] uppercase bg-[#aed581] px-3 py-1 rounded shadow-sm hover:bg-[#8bc34a] transition-colors text-xs" style={{ border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}>
                              Claim {reward} GC
                            </button>
                          ) : (
                            <span className="font-black" style={{ color: accent }}>{reward} GC</span>
                          )}
                        </div>
                      </div>
                      {isInProgress && progress !== undefined && (
                        <div className="w-full flex items-center gap-3 mt-2">
                          <div className="flex-1 h-4 bg-[#fff] relative" style={{ border: '2px solid #000' }}>
                            <div className="absolute top-0 left-0 h-full" style={{ background: accent, width: `${percent}%`, borderRight: percent > 0 && percent < 100 ? '2px solid #000' : 'none' }}></div>
                          </div>
                          <span className="text-xs font-bold text-[#000] w-10 text-right">{progress}/{total}</span>
                        </div>
                      )}
                    </div>
                  );
                };

                const mockTrustFall = () => {
                  if (!questState.trustFall || questState.trustFall !== 'claimed') {
                    updateProfile({ questState: { ...questState, trustFall: true } });
                    toast.success("Trust Fall Mocked as Completed!");
                  }
                };

                const mockAmbassador = () => {
                  if (!questState.ambassador || questState.ambassador !== 'claimed') {
                    updateProfile({ questState: { ...questState, ambassador: true } });
                    toast.success("Ambassador Mocked as Completed!");
                  }
                };
                
                const TabButton = ({ id, label }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      onClick={() => setActiveTab(id)}
                      className={`flex-1 py-2 text-center font-bold uppercase tracking-widest text-sm transition-all ${isActive ? 'bg-[#e0e0e0] translate-y-[2px] translate-x-[2px]' : 'bg-[#fff] hover:bg-[#f5f5f5]'}`}
                      style={{ border: '2px solid #000', boxShadow: isActive ? 'none' : '4px 4px 0px #000' }}
                    >
                      {label}
                    </button>
                  );
                };

                const getDailyTimeLeft = () => {
                  const now = new Date();
                  const midnight = new Date(now);
                  midnight.setHours(24, 0, 0, 0);
                  const diffMs = midnight - now;
                  const h = Math.floor(diffMs / (1000 * 60 * 60));
                  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  return `${h}h ${m}m`;
                };

                const getWeeklyTimeLeft = () => {
                  const now = new Date();
                  const day = now.getDay();
                  const daysLeft = day === 0 ? 0 : 7 - day;
                  if (daysLeft === 0) return getDailyTimeLeft();
                  return `${daysLeft} days`;
                };

                return (
                  <>
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-6">
                      <TabButton id="daily" label="Daily" />
                      <TabButton id="weekly" label="Weekly" />
                      <TabButton id="milestones" label="Milestones" />
                    </div>

                    {activeTab === 'daily' && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-bold uppercase tracking-widest text-[#000]">Daily Quests</h3>
                          <span className="text-xs font-bold text-[#d32f2f] bg-[#ffebee] px-2 py-1 rounded" style={{ border: '2px solid #d32f2f' }}>
                            Resets in {getDailyTimeLeft()}
                          </span>
                        </div>
                        <QuestCard id="daily" title="The Daily Warmup" desc="Complete 1 delivery today." reward="10" icon="directions_run" bg="#fffdf5" accent="#e65100" completed={questState.daily} progress={questState.daily ? 1 : 0} total={1} />
                        <QuestCard id="sprinter" title="The Sprinter" desc="Complete a run in < 15 minutes." reward="30" icon="timer" bg="#ede7f6" accent="#4527a0" completed={questState.sprinter} />
                        <QuestCard id="rescuer" title="The Rescuer" desc="Accept a request sitting for > 25 minutes." reward="20" icon="healing" bg="#ffebee" accent="#c62828" completed={questState.rescuer} />
                        <QuestCard id="lastorder" title="The Last Order" desc="Complete a delivery requested between 6:30 PM - 7:00 PM." reward="15" icon="dark_mode" bg="#e0f7fa" accent="#006064" completed={questState.lastorder} />
                      </div>
                    )}

                    {activeTab === 'weekly' && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-bold uppercase tracking-widest text-[#000]">Weekly Quests</h3>
                          <span className="text-xs font-bold text-[#1976d2] bg-[#e3f2fd] px-2 py-1 rounded" style={{ border: '2px solid #1976d2' }}>
                            Ends in {getWeeklyTimeLeft()}
                          </span>
                        </div>
                        <QuestCard id="weekendWarrior" title="Weekend Warrior" desc="Complete 5 deliveries this week." reward="50" icon="workspace_premium" bg="#f5faff" accent="#0d47a1" completed={isWeekendWarriorDone} progress={weeklyCount} total={5} />
                        <QuestCard id="ironStreak" title="The Iron Streak" desc="Hit 5 concurrent weekly active streaks." reward="50" icon="local_fire_department" bg="#fff3e0" accent="#e65100" completed={questState.ironStreakCompleted} progress={questState.currentStreak || 0} total={5} />
                      </div>
                    )}

                    {activeTab === 'milestones' && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-bold uppercase tracking-widest text-[#000]">Onboarding</h3>
                        </div>
                        <QuestCard id="icebreaker" title="The Icebreaker" desc="Complete your very first delivery as a Runner." reward="50" icon="sports_martial_arts" bg="#fff8e1" accent="#ff8f00" completed={questState.icebreaker} progress={runs} total={1} />
                        <QuestCard id="trustFall" title="The Trust Fall" desc="Upload a profile picture (Click to mock)" reward="30" icon="verified_user" bg="#e8f5e9" accent="#2e7d32" completed={questState.trustFall} onClick={mockTrustFall} />
                        <QuestCard id="ambassador" title="The Ambassador" desc="Share your Runner Profile (Click to mock)" reward="40" icon="share" bg="#e3f2fd" accent="#1565c0" completed={questState.ambassador} onClick={mockAmbassador} />
                        <QuestCard id="wingman" title="The Wingman" desc="Refer a friend who completes a run." reward="25" icon="handshake" bg="#fce4ec" accent="#c2185b" completed={questState.wingman} progress={0} total={1} />
                        
                        <div className="flex justify-between items-center mb-3 pt-4">
                          <h3 className="text-lg font-bold uppercase tracking-widest text-[#000]">Milestones</h3>
                        </div>
                        <QuestCard id="milestone25" title="25 Deliveries" desc="Milestone reward" reward="50" icon="military_tech" bg="#fff0f5" accent="#880e4f" completed={questState.milestone25} progress={runs} total={25} />
                        <QuestCard id="milestone50" title="50 Deliveries" desc="Milestone reward" reward="100" icon="workspace_premium" bg="#fff0f5" accent="#880e4f" completed={questState.milestone50} progress={runs} total={50} />
                        <QuestCard id="milestone75" title="75 Deliveries" desc="Milestone reward" reward="150" icon="diamond" bg="#fff0f5" accent="#880e4f" completed={questState.milestone75} progress={runs} total={75} />
                        <QuestCard id="milestone100" title="The Centurion" desc="100 Lifetime Deliveries" reward="200" icon="stars" bg="#fff0f5" accent="#880e4f" completed={questState.milestone100} progress={runs} total={100} />
                      </div>
                    )}
                  </>
                );
              })()}
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
