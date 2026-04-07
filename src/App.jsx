import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ActiveJourney from './components/ActiveJourney';
import Profile from './components/Profile';
import ActiveRunsList from './components/ActiveRunsList';
import MyDeliveries from './components/MyDeliveries';
import Sidebar from './components/Sidebar';
import PostModal from './components/PostModal';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAppContext();
  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
