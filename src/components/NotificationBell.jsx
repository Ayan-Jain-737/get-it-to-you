import React from 'react';
import { useNotificationBell } from '../hooks/useNotificationBell';

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
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative border-2 border-on-surface p-2 shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-primary-container bg-surface-container-lowest transition-all flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <span className="material-symbols-outlined text-primary">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary font-label-tag text-[10px] px-1.5 py-0.5 border border-on-surface shadow-[1px_1px_0px_0px_#000000] z-20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 md:right-auto md:left-full mt-2 md:mt-0 md:bottom-0 md:ml-4 w-80 bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] z-[100] max-h-96 overflow-y-auto">
          <div className="p-stack-sm bg-primary-container border-b-border-width border-on-surface font-headline-md text-body-lg font-black uppercase">
            Notifications
          </div>
          <div className="flex flex-col">
            {unreadCount === 0 ? (
              <div className="p-stack-md text-center font-body-md text-on-surface-variant">No new notifications</div>
            ) : (
              unreadNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="p-stack-sm border-b-2 border-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="font-body-md font-bold leading-tight text-on-surface">{notif.title}</div>
                  <div className="font-label-mono text-label-tag text-on-surface-variant mt-1">{notif.message}</div>
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
