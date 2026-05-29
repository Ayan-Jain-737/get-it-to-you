import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const useSidebar = () => {
  const { logout, userProfile } = useAppContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return {
    logout,
    userProfile,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
  };
};
