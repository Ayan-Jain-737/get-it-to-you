import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster, toast } from 'react-hot-toast';

export const QuestToastContent = ({ runs, prevRuns, visible }) => {
  const [animatedRuns, setAnimatedRuns] = useState(prevRuns);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRuns(runs);
    }, 600);
    return () => clearTimeout(timer);
  }, [runs]);

  const currentWeekend = animatedRuns % 5 === 0 && animatedRuns > 0 ? 5 : animatedRuns % 5;
  const weekendTarget = 5;
  const milestoneTarget = runs <= 25 ? 25 : runs <= 50 ? 50 : runs <= 75 ? 75 : 100;

  return (
    <div className={`${visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-[90vw] md:w-[400px] bg-surface-container-lowest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 border-on-surface flex flex-col p-4`}>
      <div className="flex items-center gap-2 mb-2 border-b-2 border-on-surface pb-2">
        <span className="material-symbols-outlined text-primary text-2xl animate-bounce">military_tech</span>
        <h3 className="font-black text-lg uppercase text-on-surface tracking-wider">Quest Progress!</h3>
      </div>
      
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex flex-col">
          <div className="flex justify-between font-bold text-xs uppercase mb-1">
            <span>Weekend Warrior</span>
            <span>{currentWeekend} / {weekendTarget}</span>
          </div>
          <div className="w-full h-3 border-2 border-on-surface bg-surface-container relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-[2500ms] ease-out" style={{ width: `${(currentWeekend / weekendTarget) * 100}%` }}></div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex justify-between font-bold text-xs uppercase mb-1">
            <span>Milestone {milestoneTarget}</span>
            <span>{animatedRuns} / {milestoneTarget}</span>
          </div>
          <div className="w-full h-3 border-2 border-on-surface bg-surface-container relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-tertiary transition-all duration-[2500ms] ease-out" style={{ width: `${(animatedRuns / milestoneTarget) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationManager = () => {
  const { activeJourney, userProfile, currentUser } = useAppContext();
  const prevStatusRef = useRef(null);
  const prevTasksRef = useRef(userProfile?.stats?.lifetimeTasksCompleted || 0);

  useEffect(() => {
    if (activeJourney && activeJourney.status !== prevStatusRef.current) {
      const status = activeJourney.status;
      if (['Accepted', 'At Gate', 'Walking Back', 'Arrived'].includes(status)) {
        toast(`Journey Update: ${status}`, {
          icon: '✨'
        });
      }
      prevStatusRef.current = status;
    } else if (!activeJourney) {
      prevStatusRef.current = null;
    }
  }, [activeJourney]);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!userProfile?.stats || !currentUser) return;
    const currentTasks = userProfile.stats.lifetimeTasksCompleted || 0;
    
    if (isInitialLoad.current) {
      prevTasksRef.current = currentTasks;
      isInitialLoad.current = false;
      return;
    }
    
    if (currentTasks > prevTasksRef.current) {
       const runs = currentTasks;
       const prevRuns = prevTasksRef.current;
       
       toast.custom((t) => (
         <QuestToastContent runs={runs} prevRuns={prevRuns} visible={t.visible} />
       ), { duration: 6000, position: 'top-center' });
    }
    
    // Always update ref to current so we only catch true increments
    prevTasksRef.current = currentTasks;
  }, [userProfile?.stats?.lifetimeTasksCompleted, currentUser]);

  return (
    <Toaster 
      position="top-center" 
      toastOptions={{
        className: 'z-[9999]',
        style: {
          background: 'var(--surface-container-lowest)',
          color: 'var(--on-surface)',
          borderRadius: '0px',
          border: '4px solid var(--on-surface)',
          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
          fontWeight: '900',
          fontFamily: "'Inter', sans-serif",
          padding: '16px 24px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        },
        success: {
          iconTheme: {
            primary: 'var(--primary)',
            secondary: 'var(--on-primary)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'var(--on-error)',
          },
        },
      }} 
    />
  );
};
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ActiveJourney from './components/ActiveJourney';
import Profile from './components/Profile';
import Account from './components/Account';
import ScrollToTop from './components/ScrollToTop';
import ActiveRunsList from './components/ActiveRunsList';
import MyDeliveries from './components/MyDeliveries';
import Sidebar from './components/Sidebar';
import PostModal from './components/PostModal';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingForm from './components/OnboardingForm';
import TutorialOverlay from './components/Tutorial/TutorialOverlay';
import './App.css';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
    <p className="text-on-surface-variant font-medium animate-pulse">Initializing GITY...</p>
  </div>
);


const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAppContext();
  
  if (loading) return <LoadingSpinner />;
  if (currentUser) return <Navigate to="/dashboard" replace />;
  
  return children;
};

const SharedLayout = () => {
  const { userProfile } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('request');

  const openModal = (type = 'request') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const showTutorial = userProfile && userProfile.tutorialComplete === false;

  // Route wrapper that provides Navigation and handles PostModal
  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex flex-col md:flex-row">
      <Sidebar onOpenPostModal={() => openModal('request')} />
      <div className="flex-1 md:ml-64 min-h-screen">
        <Outlet context={{ openModal }} />
      </div>
      {isModalOpen && <PostModal initialType={modalType} onClose={() => setIsModalOpen(false)} />}
      {showTutorial && <TutorialOverlay />}
    </div>
  );
};

const JourneyRedirector = () => {
  const { activeJourney, currentUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectedJourneyIdRef = useRef(null);

  useEffect(() => {
    if (
      activeJourney &&
      activeJourney.status === 'Accepted' &&
      currentUser &&
      activeJourney.requesterId === currentUser.uid &&
      location.pathname !== '/deliveries' &&
      redirectedJourneyIdRef.current !== activeJourney.id
    ) {
      redirectedJourneyIdRef.current = activeJourney.id;
      toast.success('Your request was accepted! Redirecting...', {
        icon: '🚀',
        style: {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--outline-variant)',
          color: 'var(--primary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-ambient)',
          fontWeight: '600',
          fontFamily: "'Inter', sans-serif",
          padding: '12px 20px'
        }
      });
      navigate('/deliveries');
    }
  }, [activeJourney, currentUser, location.pathname, navigate]);

  return null;
};

const AppRoutes = () => {
  const { currentUser, userProfile, loading } = useAppContext();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginScreen />
          </PublicRoute>
        } 
      />
      <Route 
        path="/onboarding" 
        element={
          currentUser ? <OnboardingForm authUser={currentUser} onComplete={() => window.location.href = '/'} /> : <Navigate to="/login" />
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute user={currentUser} userData={userProfile}>
            <SharedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="economy" element={<Profile />} />
        <Route path="account" element={<Account />} />
        <Route path="active-runs" element={<ActiveRunsList />} />
        <Route path="deliveries" element={<MyDeliveries />} />
        
        {/* We place ActiveJourney full screen inside or outside?
            Stitch showed it as a main screen track. We'll put it here. */}
        <Route path="run/:id" element={<ActiveJourney />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <NotificationManager />
      <BrowserRouter>
        <ScrollToTop />
        <JourneyRedirector />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
