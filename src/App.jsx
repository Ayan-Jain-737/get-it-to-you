import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster, toast } from 'react-hot-toast';

const NotificationManager = () => {
  const { activeJourney } = useAppContext();
  const prevStatusRef = useRef(null);

  useEffect(() => {
    if (activeJourney && activeJourney.status !== prevStatusRef.current) {
      const status = activeJourney.status;
      if (['Accepted', 'At Gate', 'Walking Back', 'Arrived'].includes(status)) {
        toast(`Journey Update: ${status}`, {
          icon: '✨',
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
      }
      prevStatusRef.current = status;
    } else if (!activeJourney) {
      prevStatusRef.current = null;
    }
  }, [activeJourney]);

  return <Toaster position="top-center" />;
};
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ActiveJourney from './components/ActiveJourney';
import Profile from './components/Profile';
import ActiveRunsList from './components/ActiveRunsList';
import MyDeliveries from './components/MyDeliveries';
import Sidebar from './components/Sidebar';
import PostModal from './components/PostModal';
import './App.css';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
    <p className="text-on-surface-variant font-medium animate-pulse">Initializing GITY...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAppContext();
  
  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAppContext();
  
  if (loading) return <LoadingSpinner />;
  if (currentUser) return <Navigate to="/dashboard" replace />;
  
  return children;
};

export function useModal() {
  return useOutletContext();
}

const SharedLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('request');

  const openModal = (type = 'request') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Route wrapper that provides Navigation and handles PostModal
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar onOpenPostModal={() => openModal('request')} />
      <div>
        <Outlet context={{ openModal }} />
      </div>
      {isModalOpen && <PostModal initialType={modalType} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

const JourneyRedirector = () => {
  const { activeJourney, currentUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      activeJourney &&
      activeJourney.status === 'Accepted' &&
      currentUser &&
      activeJourney.requesterId === currentUser.uid &&
      location.pathname !== '/deliveries'
    ) {
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
        path="/" 
        element={
          <ProtectedRoute>
            <SharedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
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
        <JourneyRedirector />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
