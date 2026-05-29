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
      <nav className="hidden md:flex flex-col h-full w-64 fixed left-0 top-0 p-stack-md bg-surface-container-lowest border-r-border-width border-on-surface shadow-[4px_0px_0px_0px_#000000] z-50">
        <div className="mb-stack-lg">
          <NavLink to="/dashboard" className="font-headline-lg text-headline-lg font-black text-on-surface italic tracking-tighter">
            GITY
          </NavLink>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-stack-sm mb-stack-md p-stack-sm border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] bg-surface-container-highest">
          <div className="w-12 h-12 border-border-width border-on-surface bg-primary-container overflow-hidden flex-shrink-0">
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover mix-blend-luminosity" 
              src={userProfile?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAt0I1vk-sBxfBJdaUo4X51s6ZLeV-mP_Mcak0war2-3gRdOV2Dozr4MfX5hHYwMU3_LtqNkrMYVR7dkhXenn_ISo3WFRZbOVPMVCt4bMe1cGXqbiF830ZCZgk9xPYGHRMrmpTYUlLbVvxLgHW_2EoikTf090wo11KtK__n15pk_JqN_lnqCwP7hsmeY6j2A1JtWKG-duIs7azPsOlmPGVl4RzMxCHgNJ3Yy9KOyC-3dzwUr5sR4pSY-KHjRKwdINwKaGH40rB1LQQ"} 
            />
          </div>
          <div className="min-w-0">
            <div className="font-body-lg text-body-lg font-bold leading-tight truncate">{userProfile?.name || 'Student'}</div>
            <div className="font-label-tag text-label-tag text-on-surface-variant truncate">Trust Score: {reliabilityScore}%</div>
          </div>
        </div>

        {/* Wallet Capacity Indicator */}
        <div className="mb-stack-lg flex flex-col p-2 border-2 border-on-surface bg-surface-container-lowest shadow-[3px_3px_0px_#000000]">
          <span className="text-[10px] font-black uppercase tracking-wider text-on-surface">Wallet Capacity</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold font-mono text-on-surface">{userProfile?.gcBalance || 0}/500 GC</span>
            <div className="flex-1 h-3 bg-surface-container border border-on-surface relative overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, ((userProfile?.gcBalance || 0) / 500) * 100)}%` }} 
                className={`h-full transition-all duration-300 ${(userProfile?.gcBalance || 0) >= 75 ? 'bg-tertiary' : 'bg-error'}`}
              ></div>
            </div>
          </div>
        </div>

        {/* Desktop Menu links */}
        <div className="flex-1 flex flex-col gap-stack-sm">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#000000] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#000000] ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-black">dashboard</span>
            <span>Marketplace</span>
          </NavLink>
          <NavLink 
            to="/active-runs" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#000000] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#000000] ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-bold">local_shipping</span>
            <span>My Tasks</span>
          </NavLink>
          <NavLink 
            to="/deliveries" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#000000] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#000000] ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-bold">package_2</span>
            <span>My Requests</span>
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `flex items-center gap-stack-sm p-stack-sm border-border-width border-on-surface font-bold shadow-[4px_4px_0px_0px_#000000] mb-2 font-body-lg text-body-lg transition-all hover:translate-x-[2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#000000] ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface'}`}
          >
            <span className="material-symbols-outlined font-bold">person</span>
            <span>Profile</span>
          </NavLink>

          <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className="flex items-center gap-stack-sm p-stack-sm text-on-surface hover:bg-surface-variant mb-2 font-body-lg text-body-lg active:translate-x-0 active:shadow-none transition-all hover:translate-x-1 border-border-width border-transparent hover:border-on-surface text-left"
          >
            <span className="material-symbols-outlined font-bold">logout</span>
            <span>Logout</span>
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex justify-center">
            <NotificationBell />
          </div>
          <button 
            onClick={onOpenPostModal} 
            className="w-full p-stack-sm bg-primary-container border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] font-headline-md text-headline-md font-bold active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-primary-fixed-dim uppercase"
          >
            Post a New Gig
          </button>
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
            onClick={onOpenPostModal} 
            className="border-2 border-on-surface p-2 shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-primary-container bg-surface-container-lowest transition-all flex items-center justify-center"
            title="Post a New Gig"
          >
            <span className="material-symbols-outlined text-primary">add_circle</span>
          </button>
          <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className="border-2 border-on-surface p-2 shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-primary-container bg-surface-container-lowest transition-all flex items-center justify-center"
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
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#000000]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">Gigs</span>
        </NavLink>
        <NavLink 
          to="/active-runs" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#000000]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">assignment_turned_in</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">My Tasks</span>
        </NavLink>
        <NavLink 
          to="/deliveries" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#000000]' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">package_2</span>
          <span className="font-label-mono text-[10px] font-bold mt-1">Requests</span>
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl w-16 active:scale-95 transition-transform ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_#000000]' : 'text-on-surface-variant'}`}
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
