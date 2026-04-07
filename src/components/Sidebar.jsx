import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ onOpenPostModal }) => {
  const { logout } = useAppContext();

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
              My Runs
            </NavLink>
            <NavLink 
              to="/deliveries"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              My Deliveries
            </NavLink>
            <NavLink 
              to="/profile"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              Profile
            </NavLink>
          </div>

          <div className={styles.navActions}>
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
            <span className={styles.bottomNavLinkText}>My Runs</span>
          </NavLink>
          <NavLink 
            to="/deliveries" 
            className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.activeBottomNavLink : ''}`}
          >
            <span className="material-symbols-outlined">package_2</span>
            <span className={styles.bottomNavLinkText}>My Deliveries</span>
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
