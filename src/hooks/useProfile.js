import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

export const useProfile = () => {
  const { userProfile, updateProfile, currentUser, getUserStats, claimQuestFromBoard, withdrawFromOverflow, restartTutorial } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('daily');
  
  const [name, setName] = useState(userProfile?.name || '');
  const [dorm, setDorm] = useState(userProfile?.dorm || "Main Gate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [claimingQuestId, setClaimingQuestId] = useState(null);

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

        const getWeekStr = (d) => {
          const date = new Date(d.getTime());
          date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
          const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
          const weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
          return `${date.getUTCFullYear()}-W${weekNo}`;
        };
        const currentWeekStr = getWeekStr(new Date());
        const weeklyCount = data.pastRuns?.filter(r => r.status === 'Completed' && r.createdAt && getWeekStr(new Date(r.createdAt.seconds * 1000)) === currentWeekStr).length || 0;
        
        const questState = userProfile?.questState || {};
        if (weeklyCount >= 5 && questState.weekendWarrior === undefined) {
           updateProfile({ questState: { ...questState, weekendWarrior: true } });
        }
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
  
  const circumference = 226.19;
  const strokeDashoffset = circumference - (reliabilityScore / 100) * circumference;

  return {
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
  };
};
