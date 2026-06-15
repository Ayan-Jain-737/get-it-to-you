import React, { useState, useEffect } from 'react';
import { useLoginScreen } from '../hooks/useLoginScreen';

const LoginScreen = () => {
  const { error, handleGoogleLogin } = useLoginScreen();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gity-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gity-theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="bg-transparent min-h-screen text-on-surface flex flex-col justify-between p-margin-page font-body-md selection:bg-primary-container selection:text-on-surface relative overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* HUGE Logo overlapping top of card */}
        <div className="w-[90vw] max-w-[400px] md:max-w-[500px] flex justify-center z-30 -mb-12 md:-mb-20 pointer-events-none drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] -translate-y-6 md:-translate-y-10">
          <img src="/navbar_logo.png" alt="GITY Logo" className="w-full object-contain" />
        </div>

        <div className="w-full max-w-md bg-surface-container-lowest border-border-width border-on-surface shadow-[8px_8px_0px_0px_#141414] p-stack-lg flex flex-col gap-stack-md relative z-20 pt-16 md:pt-20">
          {/* Decorative yellow stripe */}
          <div className="absolute top-0 right-0 -mt-[4px] -mr-[4px] bg-primary-fixed text-on-surface font-label-mono text-label-tag px-4 py-2 border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] z-10 uppercase font-black">
            ACCESS GATEWAY
          </div>

          <div className="pt-6">
            <h2 className="font-headline-xl text-headline-lg-mobile uppercase tracking-tighter leading-none mb-2">Welcome Scholar</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 border-l-border-width border-on-surface pl-stack-sm">
              Connect to the campus gig network. Run tasks, claim rewards, and build your digital reputation.
              <br/><br/>
              <span className="text-error font-bold">Note: Please use your official @vitstudent.ac.in email to sign in.</span>
            </p>
          </div>

          {error && (
            <div className="bg-tertiary-container text-on-tertiary-container border-border-width border-on-surface p-stack-sm font-body-md font-bold mb-4">
              ⚠️ ERROR: {error}
            </div>
          )}

          <form className="w-full" onSubmit={(e) => e.preventDefault()}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-surface font-headline-md text-body-lg py-4 border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider font-bold"
            >
              Sign In with VIT Email
            </button>
          </form>


        </div>
      </main>

      <footer className="w-full border-t-border-width border-on-surface py-stack-sm flex flex-col items-center gap-2 font-label-mono text-label-tag text-on-surface-variant uppercase">
        <div className="flex items-center gap-4">
          <div>BUILT BY AYAN JAIN</div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="border-2 border-on-surface p-1.5 shadow-[2px_2px_0px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-surface-container-lowest transition-all flex items-center justify-center"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-sm">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LoginScreen;
