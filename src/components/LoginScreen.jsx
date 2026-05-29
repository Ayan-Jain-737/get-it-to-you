import React from 'react';
import { useLoginScreen } from '../hooks/useLoginScreen';

const LoginScreen = () => {
  const { error, handleGoogleLogin } = useLoginScreen();

  return (
    <div className="bg-surface-container-low min-h-screen text-on-surface flex flex-col justify-between p-margin-page font-body-md selection:bg-primary-container selection:text-on-surface">
      <header className="w-full flex justify-between items-center py-stack-sm border-b-border-width border-on-surface">
        <div className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-black italic uppercase tracking-tighter">GITY</div>
        <div className="font-label-mono text-label-mono text-on-surface-variant uppercase bg-primary-container px-2 border-2 border-on-surface py-1">v2.0.0-brutal</div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-surface-container-lowest border-border-width border-on-surface shadow-[8px_8px_0px_0px_#000000] p-stack-lg flex flex-col gap-stack-md relative">
          {/* Decorative yellow stripe */}
          <div className="absolute top-0 right-0 -mt-[4px] -mr-[4px] bg-primary-fixed text-on-surface font-label-mono text-label-tag px-4 py-2 border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] z-10 uppercase font-black">
            ACCESS GATEWAY
          </div>

          <div className="pt-6">
            <h2 className="font-headline-xl text-headline-lg-mobile uppercase tracking-tighter leading-none mb-2">Welcome Scholar</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 border-l-border-width border-on-surface pl-stack-sm">
              Connect to the campus gig network. Run tasks, claim rewards, and build your digital reputation.
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
              className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-surface font-headline-md text-body-lg py-4 border-border-width border-on-surface shadow-[4px_4px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider font-bold"
            >
              Sign In with Google
            </button>
          </form>

          <div className="grid grid-cols-2 gap-stack-sm mt-4 pt-4 border-t-2 border-on-surface border-dashed">
            <div className="flex items-center gap-2 font-label-mono text-label-tag text-on-surface">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              SECURE AUTH
            </div>
            <div className="flex items-center gap-2 font-label-mono text-label-tag text-on-surface">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
              DATA PRIVACY
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t-border-width border-on-surface py-stack-sm flex flex-col md:flex-row justify-between items-center gap-2 font-label-mono text-label-tag text-on-surface-variant uppercase">
        <div>© 2026 GITY NETWORK. ALL RIGHTS RESERVED.</div>
        <div>BUILT BY AYAN JAIN</div>
      </footer>
    </div>
  );
};

export default LoginScreen;
