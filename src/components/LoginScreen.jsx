import React from 'react';
import { useLoginScreen } from '../hooks/useLoginScreen';
import styles from './LoginScreen.module.css';

const LoginScreen = () => {
  const { error, handleGoogleLogin } = useLoginScreen();

  return (
    <div className={styles.container}>
      <div className={styles.bgBlurPrimary}></div>
      <div className={styles.bgBlurSecondary}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>GITY</h1>
        <p className={styles.subtitle}>Connecting Campus Scholars</p>
      </div>

      <div className={styles.cardsWrapper} style={{ justifyContent: 'center' }}>
        <div className={styles.card} style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div className={styles.iconWrapper}>
            <span className="material-symbols-outlined">login</span>
          </div>
          <h2 className={styles.stepTitle}>Welcome Back</h2>
          <p className={styles.stepDesc}>Sign in with your university Google account to access the GITY scholar network.</p>

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            {error && <p className={styles.error}>{error}</p>}

            <button
              type="button"
              className={styles.socialAuthBtn}
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.trustItem}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified_user</span>
              Secure Auth
            </div>
            <div className={styles.trustItem}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>encrypted</span>
              Data Privacy
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        Built by AYAN JAIN <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></span>
      </footer>
    </div>
  );
};

export default LoginScreen;
