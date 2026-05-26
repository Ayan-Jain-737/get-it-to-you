import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import styles from './NotificationBell.module.css';

const NotificationBell = () => {
  const { unreadNotifications, markAsRead } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
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

  return (
    <div className={styles.bellContainer} ref={dropdownRef}>
      <button 
        className={styles.iconBtn} 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h4>Notifications</h4>
          </div>
          <div className={styles.notificationList}>
            {unreadCount === 0 ? (
              <div className={styles.emptyState}>No new notifications</div>
            ) : (
              unreadNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={styles.notificationItem}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={styles.notificationTitle}>{notif.title}</div>
                  <div className={styles.notificationMessage}>{notif.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
