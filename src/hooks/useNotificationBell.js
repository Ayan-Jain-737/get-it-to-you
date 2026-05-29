import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const useNotificationBell = () => {
  const { unreadNotifications, markAsRead } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    setIsOpen(false);
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
  };

  const unreadCount = unreadNotifications?.length || 0;

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    unreadNotifications,
    unreadCount,
    handleNotificationClick
  };
};
