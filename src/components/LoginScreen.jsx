import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import styles from './LoginScreen.module.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, signInWithGoogle } = useAppContext();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneExt, setPhoneExt] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError('');
    setIsSending(true);

    const fullPhone = `${phoneExt}${phoneNumber}`;
    // Container ID "recaptcha-container" must match DOM and context setup
    const success = await sendOtp(fullPhone, 'recaptcha-container');

    setIsSending(false);
    if (success) {
      setStep('otp');
    } else {
      setError('Failed to send OTP. Make sure Phone Auth is enabled in Firebase and the phone number is correct/whitelisted.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setError('');
    const success = await verifyOtp(otp);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const success = await signInWithGoogle();
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Google Sign-In failed.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgBlurPrimary}></div>
      <div className={styles.bgBlurSecondary}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>GITY</h1>
        <p className={styles.subtitle}>Connecting Campus Scholars</p>
      </div>

      <div className={styles.cardsWrapper}>
        {/* Step 1: Identity */}
        <div className={`${styles.card} ${step === 'otp' ? styles.cardInactive : ''}`}>
          <div className={styles.iconWrapper}>
            <span className="material-symbols-outlined">call</span>
          </div>
          <h2 className={styles.stepTitle}>Step 1: Identity</h2>
          <p className={styles.stepDesc}>Please use your phone number to access the GITY scholar network.</p>

          <form className={styles.form} onSubmit={handleSendOtp}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Phone Number</label>
              <div className={styles.phoneInputWrapper}>
                <input
                  type="text"
                  value={phoneExt}
                  onChange={(e) => setPhoneExt(e.target.value)}
                  className={styles.phoneExtInput}
                  disabled={step === 'otp'}
                  required
                />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  className={styles.phoneMainInput}
                  disabled={step === 'otp'}
                  required
                />
              </div>
            </div>
            {step === 'phone' && error && <p className={styles.error}>{error}</p>}

            <div id="recaptcha-container"></div>

            <button type="submit" className={styles.btnPrimary} disabled={isSending || step === 'otp'}>
              {isSending ? 'Sending OTP...' : 'Get Secure OTP'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <button
              type="button"
              className={styles.socialAuthBtn}
              onClick={handleGoogleLogin}
              disabled={step === 'otp'}
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

        <div className={styles.arrowConnector}>
          <span className="material-symbols-outlined">double_arrow</span>
        </div>

        {/* Step 2: Verification */}
        <div className={`${styles.card} ${step === 'phone' ? styles.cardInactive : ''}`}>
          <div className={styles.iconWrapper}>
            <span className="material-symbols-outlined">key</span>
          </div>
          <h2 className={styles.stepTitle}>Step 2: Verification</h2>
          <p className={styles.stepDesc}>Enter the 6-digit code sent to your phone to finalize the secure connection.</p>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <div className={styles.otpInputWrapper}>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="------"
                  className={styles.otpInput}
                  style={{ width: '100%' }}
                  disabled={step === 'phone'}
                  required
                />
              </div>
            </div>
            {step === 'otp' && error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.btnPrimary} disabled={step === 'phone'}>
              Verify & Sign In
              <span className="material-symbols-outlined">login</span>
            </button>
          </form>

          <button
            type="button"
            className={styles.resendBtn}
            onClick={() => setStep('phone')}
            disabled={step === 'phone'}
          >
            Didn't receive code? Modify Phone
          </button>
        </div>
      </div>

      <footer className={styles.footer}>
        Built by Ayan Jain, Anweshika Mehta & Divyansh Patel <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></span>
      </footer>
    </div>
  );
};

export default LoginScreen;
