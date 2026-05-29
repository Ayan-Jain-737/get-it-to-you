import React from 'react';
import { useNotificationBell } from '../hooks/useNotificationBell';
import styles from './NotificationBell.module.css';

const NotificationBell = () => {
  const {
    isOpen,
    setIsOpen,
    dropdownRef,
    unreadNotifications,
    unreadCount,
    handleNotificationClick
  } = useNotificationBell();

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
