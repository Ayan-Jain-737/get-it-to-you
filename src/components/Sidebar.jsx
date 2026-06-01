import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../hooks/useSidebar';
import NotificationBell from './NotificationBell';
import ConfirmModal from './ConfirmModal';

const Sidebar = ({ onOpenPostModal }) => {
  const { logout, userProfile, isLogoutModalOpen, setIsLogoutModalOpen, reliabilityScore } = useSidebar();

  return (
    <>
      {/* SideNavBar (Web Only) */}
      <nav className="hidden md:flex flex-col h-full w-64 fixed left-0 top-0 p-stack-md bg-surface-container-lowest border-r-border-width border-on-surface shadow-[4px_0px_0px_0px_#141414] z-50">
        <div className="mb-stack-lg">
          <NavLink to="/dashboard" className="font-headline-lg text-headline-lg font-black text-on-surface italic tracking-tighter">
            GITY
          </NavLink>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-stack-sm mb-stack-md p-stack-sm border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] bg-surface-container-highest">
          <div className="w-12 h-12 border-border-width border-on-surface bg-primary-container overflow-hidden flex-shrink-0">
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
              src={userProfile?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAt0I1vk-sBxfBJdaUo4X51s6ZLeV-mP_Mcak0war2-3gRdOV2Dozr4MfX5hHYwMU3_LtqNkrMYVR7dkhXenn_ISo3WFRZbOVPMVCt4bMe1cGXqbiF830ZCZgk9xPYGHRMrmpTYUlLbVvxLgHW_2EoikTf090wo11KtK__n15pk_JqN_lnqCwP7hsmeY6j2A1JtWKG-duIs7azPsOlmPGVl4RzMxCHgNJ3Yy9KOyC-3dzwUr5sR4pSY-KHjRKwdINwKaGH40rB1LQQ"} 
            />
          </div>
          <div className="min-w-0">
            <div className="font-body-lg text-body-lg font-bold leading-tight truncate">{userProfile?.name || 'Student'}</div>
            <div className="font-label-tag text-label-tag text-on-surface-variant truncate">Trust Score: {reliabilityScore}%</div>
          </div>
        </div>

        {/* Wallet Capacity Indicator */}
        <div className="mb-stack-lg flex flex-col p-2 border-2 border-on-surface bg-surface-container-lowest shadow-[3px_3px_0px_#141414]">
          <span className="text-[10px] font-black uppercase tracking-wider text-on-surface">Wallet Capacity</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold font-mono text-on-surface">{userProfile?.gcBalance || 0}/300 GC</span>
            <div className="flex-1 h-3 bg-surface-container border border-on-surface relative overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, ((userProfile?.gcBalance || 0) / 300) * 100)}%` }} 
                className="h-full transition-all duration-300 bg-secondary-container"
              ></div>
            </div>
          </div>
        </div>

        {/* Desktop Menu links */}
        <div className="flex-1 flex flex-col gap-stack-sm">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#141414] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#141414] ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-black">dashboard</span>
            <span>Marketplace</span>
          </NavLink>
          <NavLink 
            to="/active-runs" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#141414] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#141414] ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-bold">local_shipping</span>
            <span>My Tasks</span>
          </NavLink>
          <NavLink 
            to="/deliveries" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#141414] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#141414] ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-bold">package_2</span>
            <span>My Requests</span>
          </NavLink>
          <NavLink 
            to="/economy" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#141414] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#141414] relative ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-black">account_balance_wallet</span>
            <span>Economy</span>
            {(() => {
              const claimableQuests = ['daily', 'sprinter', 'rescuer', 'lastorder', 'weekendWarrior', 'ironStreakCompleted', 'icebreaker', 'trustFall', 'ambassador', 'milestone25', 'milestone50', 'milestone75', 'milestone100'];
              const hasClaimable = claimableQuests.some(q => userProfile?.questState?.[q] === true) || (!!userProfile?.avatar && userProfile?.questState?.photogenic !== 'claimed');
              return hasClaimable && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-error rounded-full animate-pulse border-2 border-on-surface"></span>
              );
            })()}
          </NavLink>
          
          <NavLink 
            to="/account" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#141414] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#141414] relative ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-black">person</span>
            <span>Profile</span>
          </NavLink>

          <NotificationBell isDesktopMenu={true} />
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex justify-center">
            <button 
              onClick={() => setIsLogoutModalOpen(true)} 
              className="border-2 border-on-surface p-2 shadow-[2px_2px_0px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-primary-container bg-surface-container-lowest transition-all flex items-center justify-center"
              title="Logout"
            >
              <span className="material-symbols-outlined font-bold text-error">logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* TopAppBar (Mobile Only) */}
      <header className="md:hidden w-full top-0 sticky z-50 flex justify-between items-center px-margin-page py-stack-sm bg-surface-container-lowest border-b-border-width border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <NavLink to="/dashboard" className="font-headline-md text-headline-md font-black italic text-on-surface uppercase">
          GITY
        </NavLink>
        <div className="flex gap-3 items-center">
          <NotificationBell />
          <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className="border-2 border-on-surface p-2 shadow-[2px_2px_0px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-primary-container bg-surface-container-lowest transition-all flex items-center justify-center"
            title="Logout"
          >
            <span className="material-symbols-outlined text-primary">logout</span>
          </button>
        </div>
      </header>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-surface-container-lowest border-t-border-width border-on-surface z-50">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#141414]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">Gigs</span>
        </NavLink>
        <NavLink 
          to="/active-runs" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#141414]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">assignment_turned_in</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">My Tasks</span>
        </NavLink>
        <NavLink 
          to="/deliveries" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#141414]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">package_2</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">Requests</span>
        </NavLink>
        <NavLink 
          to="/economy" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform relative ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#141414]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">Economy</span>
          {(() => {
            const claimableQuests = ['daily', 'sprinter', 'rescuer', 'lastorder', 'weekendWarrior', 'ironStreakCompleted', 'icebreaker', 'trustFall', 'ambassador', 'milestone25', 'milestone50', 'milestone75', 'milestone100'];
            const hasClaimable = claimableQuests.some(q => userProfile?.questState?.[q] === true) || (!!userProfile?.avatar && userProfile?.questState?.photogenic !== 'claimed');
            return hasClaimable && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full animate-pulse border border-on-surface"></span>
            );
          })()}
        </NavLink>

        <NavLink 
          to="/account" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform relative ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#141414]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">Profile</span>
        </NavLink>
      </nav>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Logging Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        isDestructive={true}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
