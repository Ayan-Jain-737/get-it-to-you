import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import NotificationBell from './NotificationBell';
import styles from './Sidebar.module.css';

const Sidebar = ({ onOpenPostModal }) => {
  const { logout, userProfile } = useAppContext();

  return (
    <>
      {/* TopNavBar Shell */}
      <nav className={styles.topNav}>
        <div className={styles.navContainer}>
          <NavLink to="/dashboard" className={styles.brand}>GITY</NavLink>
          
          {/* Desktop Nav */}
          <div className={styles.desktopMenu}>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              Marketplace
            </NavLink>
            <NavLink 
              to="/active-runs"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              My Tasks
            </NavLink>
            <NavLink 
              to="/deliveries"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              My Requests
            </NavLink>
            <NavLink 
              to="/profile"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              Profile
            </NavLink>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '0 auto 0 2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', border: '2px solid #000', borderRadius: '4px', background: '#fff', boxShadow: '3px 3px 0px #000' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Wallet</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' }}>{userProfile?.gcBalance || 0} / 500 GC</span>
                <div style={{ width: '80px', height: '8px', background: '#eee', border: '1px solid #000', borderRadius: '2px' }}>
                   <div style={{ width: `${Math.min(100, ((userProfile?.gcBalance || 0) / 500) * 100)}%`, height: '100%', background: (userProfile?.gcBalance || 0) >= 75 ? 'var(--tertiary)' : 'var(--error)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.navActions}>
            <NotificationBell />
            <button className={styles.iconBtn} onClick={onOpenPostModal} title="Create Post">
             <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button className={styles.iconBtn} onClick={logout} title="Logout">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
        <div className={styles.navDivider}></div>
      </nav>

      {/* BottomNavBar Shell (Mobile) */}
      <div className={styles.bottomNav}>
        <div className={styles.bottomNavTopDivider}></div>
        <div className={styles.bottomNavItems}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.activeBottomNavLink : ''}`}
          >
            <span className="material-symbols-outlined">storefront</span>
            <span className={styles.bottomNavLinkText}>Marketplace</span>
          </NavLink>
          <NavLink 
            to="/active-runs" 
            className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.activeBottomNavLink : ''}`}
          >
            <span className="material-symbols-outlined">local_shipping</span>
            <span className={styles.bottomNavLinkText}>My Tasks</span>
          </NavLink>
          <NavLink 
            to="/deliveries" 
            className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.activeBottomNavLink : ''}`}
          >
            <span className="material-symbols-outlined">package_2</span>
            <span className={styles.bottomNavLinkText}>My Requests</span>
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.activeBottomNavLink : ''}`}
          >
            <span className="material-symbols-outlined">person</span>
            <span className={styles.bottomNavLinkText}>Profile</span>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
