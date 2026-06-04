import React from 'react';
import { toast } from 'react-hot-toast';
import OrderDetailsModal from './OrderDetailsModal';
import { useProfile } from '../hooks/useProfile';

const Profile = () => {
  const {
    userProfile,
    claimQuestFromBoard,
    withdrawFromOverflow,
    activeTab,
    setActiveTab,
    name,
    setName,
    dorm,
    setDorm,
    saving,
    saved,
    selectedRun,
    setSelectedRun,
    withdrawAmount,
    setWithdrawAmount,
    isWithdrawing,
    setIsWithdrawing,
    stats,
    isLoadingStats,
    dailyTimeLeft,
    weeklyTimeLeft,
    handleSave,
    reliabilityScore,
    circumference,
    strokeDashoffset,
    claimingQuestId,
    setClaimingQuestId,
    restartTutorial
  } = useProfile();

  return (
    <main className="p-margin-page md:p-stack-lg min-h-screen flex flex-col gap-stack-lg pb-32 md:pb-stack-lg font-body-md bg-transparent text-on-surface">
      {/* Header */}
      <header className="flex items-end justify-between border-b-border-width border-on-surface pb-stack-sm mb-4">
        <div>
          <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-black uppercase tracking-tighter text-on-surface">Economy Vault</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 border-l-border-width border-on-surface pl-stack-sm">
            Manage your finances and claim earnings.
          </p>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Wallet, Reserve, Preferences */}
        <section className="lg:col-span-5 flex flex-col gap-stack-md">
          {/* Main Wallet Cap display */}
          <div className="bg-surface-container-lowest border-border-width border-on-surface neo-shadow p-stack-lg relative overflow-hidden group" data-tutorial="wallet-card">
            <div className="bg-surface-container-lowest border-[3px] border-on-surface shadow-[6px_6px_0px_0px_#141414] p-6 mb-6">
              <div className="font-label-mono text-body-md uppercase mb-2 tracking-widest text-on-surface-variant">GITY Coins (GC) Available</div>
              <div className="font-headline-xl text-headline-xl font-black text-on-surface mb-2">
                {userProfile?.gcBalance || 0} <span className="text-[24px] text-surface-tint">/ 300</span>
              </div>
              <div className="w-full h-4 bg-surface-container-highest border-[3px] border-on-surface relative overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out" 
                  style={{ width: `${Math.min(100, ((userProfile?.gcBalance || 0) / 300) * 100)}%` }} 
                />
              </div>
              <div className="flex justify-between text-[11px] font-label-mono font-bold uppercase text-on-surface-variant">
                <span>Capacity</span>
                <span>{Math.round(Math.min(100, ((userProfile?.gcBalance || 0) / 300) * 100))}%</span>
              </div>
            </div>
          </div>

          {/* Reliability Chart */}
          <div className="bg-surface-container-lowest p-6 border-border-width border-on-surface neo-shadow flex flex-col items-center justify-center text-center">
            <div className="relative w-28 h-28 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="36" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-surface-variant" 
                />
                <circle 
                  cx="50" cy="50" r="36" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  className={reliabilityScore >= 80 ? 'text-secondary-container' : reliabilityScore >= 50 ? 'text-primary' : 'text-error'}
                  strokeDasharray={circumference}
                  strokeDashoffset={isLoadingStats ? circumference : strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-headline text-on-surface">
                  {isLoadingStats ? '-' : reliabilityScore}%
                </span>
                <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Score</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold font-headline text-on-surface mb-1">Reliability Index</h2>
            <p className="text-xs text-on-surface-variant max-w-xs mb-4">
              Determined by your completion rate. High ratings unlock quests and rewards.
            </p>

            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="bg-surface-container p-2 border border-on-surface text-center">
                <p className="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Requests</p>
                <p className="text-md font-bold text-on-surface font-headline">{isLoadingStats ? '-' : stats.requestsCompleted}</p>
              </div>
              <div className="bg-surface-container p-2 border border-on-surface text-center">
                <p className="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Tasks</p>
                <p className="text-md font-bold text-on-surface font-headline">{isLoadingStats ? '-' : stats.tasksCompleted}</p>
              </div>
              <div className="bg-surface-container p-2 border border-on-surface text-center">
                <p className="text-[8px] uppercase font-bold text-error tracking-wider">Cancelled</p>
                <p className="text-md font-bold text-error font-headline">{isLoadingStats ? '-' : stats.cancelled}</p>
              </div>
            </div>
          </div>

          {/* Reserve Bank / Overflow Tank */}
          <div className="bg-primary-container p-6 border-border-width border-on-surface neo-shadow flex flex-col relative overflow-hidden" data-tutorial="reserve-vault">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-on-surface text-2xl">account_balance</span>
                <h2 className="text-lg font-bold font-headline text-on-surface uppercase">Reserve Vault</h2>
              </div>
              <p className="text-xs font-bold text-on-surface-variant mb-4">
                Credits exceeded the 300 GC maximum limits. Held securely here.
              </p>
              
              <div className="flex items-center justify-between bg-surface-container-lowest p-3 border-2 border-on-surface mb-4">
                <span className="font-bold uppercase tracking-wider text-[10px]">Reserve Balance</span>
                <span className="font-black text-lg">{userProfile?.overflowBalance || 0} GC</span>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount"
                  max={userProfile?.overflowBalance || 0}
                  className="flex-grow px-3 py-2 border-2 border-on-surface bg-surface-container-lowest font-bold focus:outline-none text-sm"
                  disabled={(userProfile?.gcBalance || 0) >= 300 || (userProfile?.overflowBalance || 0) === 0}
                />
                <button 
                  onClick={async () => {
                    try {
                      setIsWithdrawing(true);
                      await withdrawFromOverflow(withdrawAmount);
                      setWithdrawAmount('');
                    } catch (e) {
                      // handled by context toast
                    } finally {
                      setIsWithdrawing(false);
                    }
                  }}
                  disabled={(userProfile?.gcBalance || 0) >= 300 || isWithdrawing || !withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > (userProfile?.overflowBalance || 0) || (userProfile?.gcBalance || 0) + parseInt(withdrawAmount) > 300}
                  className="bg-surface-container-lowest text-on-surface border-2 border-on-surface font-bold px-4 py-2 hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:pointer-events-none uppercase text-xs shadow-[2px_2px_0px_0px_#141414]"
                >
                  {isWithdrawing ? '...' : 'Withdraw'}
                </button>
              </div>
              {(userProfile?.gcBalance || 0) >= 300 && (
                <p className="text-error text-[10px] font-bold mt-2 text-center">
                  Wallet full. Spend GC to withdraw.
                </p>
              )}
            </div>
          </div>


        </section>

        {/* Right Column: Quest Board */}
        <section className="lg:col-span-7">
          <div className="bg-surface-container-lowest p-6 border-border-width border-on-surface neo-shadow min-h-full">
            <div className="flex flex-col mb-6" data-tutorial="quest-board">
              <h2 className="text-xl font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_fire_department</span>
                Available Quests
              </h2>
              <p className="text-xs font-bold text-on-surface-variant mt-1">Complete tasks to earn GC and build reputation.</p>
            </div>

            <div className="space-y-4">
              {(() => {
                const questState = userProfile?.questState || {};
                const runs = stats.tasksCompleted || 0;
                
                const getWeekStr = (d) => {
                  const date = new Date(d.getTime());
                  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
                  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
                  const weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
                  return `${date.getUTCFullYear()}-W${weekNo}`;
                };
                const currentWeekStr = getWeekStr(new Date());
                const weeklyCount = stats.pastRuns?.filter(r => r.status === 'Completed' && r.createdAt && getWeekStr(new Date(r.createdAt.seconds * 1000)) === currentWeekStr).length || 0;
                const isWeekendWarriorDone = weeklyCount >= 5;

                const QuestCard = ({ id, title, desc, reward, completed, progress, total, icon, bg, accent, onClick }) => {
                  const isClaimed = questState[id] === 'claimed';
                  const isCompletedUnclaimed = !isClaimed && (completed || (progress !== undefined && progress >= total));
                  const isInProgress = !isClaimed && !isCompletedUnclaimed;
                  
                  const percent = isClaimed || isCompletedUnclaimed ? 100 : progress !== undefined ? (progress / total) * 100 : 0;
                  
                  const handleAction = async () => {
                    if (claimingQuestId) return;
                    if (onClick) {
                      onClick();
                      return;
                    }
                    if (isCompletedUnclaimed) {
                      setClaimingQuestId(id);
                      try {
                        await claimQuestFromBoard(id, reward);
                        toast.success(`Claimed ${reward} GC!`);
                      } catch (err) {
                        toast.error(err.message);
                      } finally {
                        setClaimingQuestId(null);
                      }
                    }
                  };

                  const isLoading = claimingQuestId === id;

                  return (
                    <div 
                      className={`p-4 border-2 border-on-surface flex flex-col justify-center transition-all mb-4 relative overflow-hidden ${isCompletedUnclaimed || onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#141414]' : ''} ${claimingQuestId ? 'opacity-75 pointer-events-none' : ''}`}
                      onClick={handleAction}
                      style={{ 
                        boxShadow: isClaimed ? 'none' : '4px 4px 0px 0px #141414', 
                        background: isClaimed ? '#e2e2e2' : (isCompletedUnclaimed ? '#d4f5d4' : bg) 
                      }}
                    >
                      {isClaimed && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="border-4 border-on-surface px-4 py-1 font-headline-xl text-headline-md font-black uppercase text-on-surface transform -rotate-12 bg-surface-container-lowest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            CLAIMED
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border-2 border-on-surface bg-surface-container-lowest flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined" style={{ color: isClaimed ? '#888' : accent }}>{icon}</span>
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm text-on-surface ${isClaimed ? 'line-through text-on-surface-variant' : ''}`}>{title}</h4>
                            <p className="text-xs font-bold text-on-surface-variant">{desc}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end justify-center">
                          {isClaimed ? null : isCompletedUnclaimed ? (
                            <button data-tutorial={`${id}-claim-btn`} disabled={isLoading} className="font-black text-on-surface uppercase bg-primary-container px-3 py-1 border-2 border-on-surface shadow-[2px_2px_0px_0px_#141414] text-xs flex items-center justify-center gap-1 disabled:opacity-50 disabled:shadow-[2px_2px_0px_0px_#141414]">
                              {isLoading ? <><span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>...</> : `Claim ${reward} GC`}
                            </button>
                          ) : (
                            <span className="font-black font-label-mono text-xs" style={{ color: accent }}>{reward} GC</span>
                          )}
                        </div>
                      </div>

                      {isInProgress && progress !== undefined && (
                        <div className="w-full flex items-center gap-3 mt-2">
                          <div className="flex-1 h-3 bg-surface-container-lowest border-2 border-on-surface relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full" style={{ background: accent, width: `${percent}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-on-surface w-10 text-right">{progress}/{total}</span>
                        </div>
                      )}
                    </div>
                  );
                };

                const hasDailyClaimable = questState.daily === true || questState.sprinter === true || questState.rescuer === true || questState.lastorder === true;
                const hasWeeklyClaimable = questState.weekendWarrior === true || questState.ironStreakCompleted === true;
                const hasMilestonesClaimable = [
                  questState.icebreaker, 
                  questState.milestone25, questState.milestone50, questState.milestone75, questState.milestone100
                ].includes(true) || (!!userProfile?.avatar && questState.photogenic !== 'claimed');

                const TabButton = ({ id, label, hasClaimable }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      onClick={() => setActiveTab(id)}
                      data-tutorial={`quest-tab-${id}`}
                      className={`relative flex-1 py-2 text-center font-bold uppercase tracking-widest text-[11px] transition-all border-2 border-on-surface ${isActive ? 'bg-primary-container text-on-surface shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low shadow-[3px_3px_0px_0px_#141414]'}`}
                    >
                      {label}
                      {hasClaimable && (
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full animate-pulse border border-on-surface"></span>
                      )}
                    </button>
                  );
                };

                return (
                  <>
                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6">
                      <TabButton id="daily" label="Daily" hasClaimable={hasDailyClaimable} />
                      <TabButton id="weekly" label="Weekly" hasClaimable={hasWeeklyClaimable} />
                      <TabButton id="milestones" label="Milestones" hasClaimable={hasMilestonesClaimable} />
                    </div>

                    {activeTab === 'daily' && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">Daily Quests</h3>
                          <span className="text-[10px] font-bold text-error bg-error-container px-2 py-0.5 border border-error uppercase">
                            Resets in {dailyTimeLeft || getDailyTimeLeft()}
                          </span>
                        </div>
                        <QuestCard id="daily" title="The Daily Warmup" desc="Complete 1 delivery today." reward="3" icon="directions_run" bg="#fffdf5" accent="#626200" completed={questState.daily} progress={questState.daily ? 1 : 0} total={1} />
                        <QuestCard id="sprinter" title="The Sprinter" desc="Complete a run in < 15 minutes." reward="8" icon="timer" bg="#fdf5ff" accent="#626200" completed={questState.sprinter} />
                        <QuestCard id="rescuer" title="The Rescuer" desc="Accept a request sitting for > 25 minutes." reward="5" icon="healing" bg="#fff5f5" accent="#ba1a1a" completed={questState.rescuer} />
                        <QuestCard id="lastorder" title="The Last Order" desc="Complete a delivery requested between 6:30 PM - 7:00 PM." reward="5" icon="dark_mode" bg="#f5faff" accent="#006e20" completed={questState.lastorder} />
                      </div>
                    )}

                    {activeTab === 'weekly' && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">Weekly Quests</h3>
                          <span className="text-[10px] font-bold text-secondary bg-secondary-container px-2 py-0.5 border border-secondary uppercase">
                            Ends in {weeklyTimeLeft || getWeeklyTimeLeft()}
                          </span>
                        </div>
                        <QuestCard id="weekendWarrior" title="Weekend Warrior" desc="Complete 5 deliveries this week." reward="15" icon="workspace_premium" bg="#f5fffa" accent="#006e20" completed={isWeekendWarriorDone || questState.weekendWarrior === true || questState.weekendWarrior === 'claimed'} progress={weeklyCount || userProfile?.stats?.weeklyTasksCompleted || 0} total={5} />
                        <QuestCard id="ironStreakCompleted" title="The Iron Streak" desc="Hit 5 concurrent weekly active streaks." reward="15" icon="local_fire_department" bg="#fff9f5" accent="#c00100" completed={questState.ironStreakCompleted} progress={questState.currentStreak || 0} total={5} />
                      </div>
                    )}

                    {activeTab === 'milestones' && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Onboarding</h3>
                        </div>
                        <QuestCard id="icebreaker" title="The Icebreaker" desc="Complete your very first delivery as a Runner." reward="25" icon="sports_martial_arts" bg="#fffdf5" accent="#626200" completed={questState.icebreaker} progress={runs} total={1} />
                        <div data-tutorial="quest-rookie">
                          <QuestCard id="rookieTraining" title="Rookie Training Complete" desc="Complete the GITY tutorial to unlock the platform." reward="10" icon="school" bg="#f0f8ff" accent="#4F46E5" completed={questState.rookieTraining === true || questState.rookieTraining === 'claimed'} progress={questState.rookieTraining ? 34 : (userProfile?.tutorialStep || 0)} total={34} />
                        </div>

                        <QuestCard id="photogenic" title="Photogenic" desc="Upload a profile photo to stand out." reward="25" icon="add_a_photo" bg="#f4f0ef" accent="#9c4146" completed={!!userProfile?.avatar || questState.photogenic === 'claimed'} progress={userProfile?.avatar ? 1 : 0} total={1} />
                        
                        <div className="flex justify-between items-center mb-2 pt-4 border-t-2 border-dashed border-on-surface">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Lifetime Milestones</h3>
                        </div>
                        <QuestCard id="milestone25" title="25 Deliveries" desc="Milestone reward" reward="30" icon="military_tech" bg="#fff5fa" accent="#ba1a1a" completed={questState.milestone25} progress={runs} total={25} />
                        <QuestCard id="milestone50" title="50 Deliveries" desc="Milestone reward" reward="50" icon="workspace_premium" bg="#fff5fa" accent="#ba1a1a" completed={questState.milestone50} progress={runs} total={50} />
                        <QuestCard id="milestone75" title="75 Deliveries" desc="Milestone reward" reward="75" icon="diamond" bg="#fff5fa" accent="#ba1a1a" completed={questState.milestone75} progress={runs} total={75} />
                        <QuestCard id="milestone100" title="The Centurion" desc="100 Lifetime Deliveries" reward="100" icon="stars" bg="#fff5fa" accent="#ba1a1a" completed={questState.milestone100} progress={runs} total={100} />
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

// Helper fallback generators for resets
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

export default Profile;
