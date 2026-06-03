import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAppContext } from '../../context/AppContext';


const TUTORIAL_STEPS = [
  // Step 0: Welcome
  { id: 'welcome', target: null, title: 'Welcome to GITY!', text: "A community-driven campus network where students help each other — without spending real money. Let's show you around!", btn: "Let's Go →", route: '/dashboard' },
  // Steps 1-5: Sidebar tour
  { id: 'nav-marketplace', target: 'nav-marketplace', targetMobile: 'nav-marketplace-mobile', title: 'Marketplace', text: "This is the **Marketplace** — the campus feed where you see who needs help and who's offering to run errands.", btn: 'Next →', route: '/dashboard', disableHoleClick: true },
  { id: 'nav-tasks', target: 'nav-tasks', targetMobile: 'nav-tasks-mobile', title: 'My Tasks', text: '**My Tasks** — track your active deliveries and accepted runs here.', btn: 'Next →', route: '/active-runs', disableHoleClick: true },
  { id: 'nav-requests', target: 'nav-requests', targetMobile: 'nav-requests-mobile', title: 'My Requests', text: "**My Requests** — track deliveries you've requested from others.", btn: 'Next →', route: '/deliveries', disableHoleClick: true },
  { id: 'nav-economy', target: 'nav-economy', targetMobile: 'nav-economy-mobile', title: 'Economy', text: '**Economy** — manage your campus credits (GC), claim quest rewards, and monitor your wallet.', btn: 'Next →', route: '/economy', disableHoleClick: true },
  { id: 'nav-profile', target: 'nav-profile', targetMobile: 'nav-profile-mobile', title: 'Profile', text: '**Profile** — view your stats, update your avatar, and manage your account details.', btn: 'Next →', route: '/account', disableHoleClick: true },
  // Step 6: Dummy post
  { id: 'dummy-post', target: 'feed-card-0', title: 'The Feed', text: "This is a post from another student who needs a delivery. Posts like this appear in real-time on the Marketplace.", btn: 'Got it! →', route: '/dashboard', disableHoleClick: true },
  { id: 'post-request', target: 'post-request-btn', title: 'Create a Request', text: "Let's create your first request! Click here to post a delivery need. **(This one's free — 0 GC cost)**", btn: null, waitForClick: 'post-request-btn', route: '/dashboard' },
  { id: 'post-modal-info', target: 'post-modal', title: 'The Post Form', text: "Here is where you configure your delivery!\n\n1. Select a **Pickup** and **Dropoff**.\n2. Add details (like 'Library books').\n3. Hit **Submit**.\n\nI'll stay out of your way while you fill it out!", btn: 'I can Post Now!', route: '/dashboard', tooltipPlacement: 'right', disableHoleClick: true },
  { id: 'post-form-waiting', target: null, invisible: true, route: '/dashboard' },
  // Step 12: Waiting
  { id: 'post-waiting', target: null, title: 'Request Posted!', text: "Your request is live! Let's see if someone picks it up...", btn: null, autoAdvanceMs: 5000, route: '/dashboard' },
  // Step 13: Notification
  { id: 'notification-ping', target: 'notification-bell', title: '🔔 Someone Accepted!', text: "Someone accepted your request! Click the notification to see the details.", btn: null, waitForClick: 'notification-bell', route: '/dashboard' },
  // Steps 14-16: Journey tracker (requester)
  { id: 'journey-map-req', target: 'journey-map', title: 'Live Map', text: "This is the **Live Map** — you can track your runner's real-time location as they walk to the pickup.", btn: 'Next →', route: null },
  { id: 'journey-runner-info', target: 'journey-runner-info', title: 'Runner Info', text: "This card shows your **Runner's** details — their name, reliability score, and hostel block.", btn: 'Next →', route: null },
  { id: 'journey-chat-req', target: 'journey-chat', title: 'Live Chat', text: "Use the **Chat** to coordinate with your runner in real-time.", btn: 'Next →', route: null },
  // Step 17: Simulated delivery + OTP
  { id: 'journey-otp-show', target: 'journey-otp', title: 'Handoff OTP', text: "Your runner has arrived! This is your **4-digit OTP code**. Give this code to the runner so they can confirm the handoff.", btn: null, autoAdvanceMs: 4000, route: null },
  // Step 18: Completion toast
  { id: 'journey-complete-req', target: null, title: '🎉 Delivery Complete!', text: "Your run has been verified. Every completed delivery updates your reputation and quest progress.", btn: 'View History →', route: null },
  // Step 19: History (requester side)
  { id: 'history-req-click', target: 'history-card-0', title: 'Order History', text: "You can keep track of all your previous orders here. **Click this past order** to view its digital receipt.", btn: null, waitForClick: 'history-card-0', route: '/deliveries' },
  // Step 20: Receipt modal
  { id: 'history-req-view', target: 'order-receipt-modal', title: 'Digital Receipt', text: "Every transaction generates a digital receipt for your safety and accountability. **Click the 'X' to close this receipt.**", btn: null, waitForClick: 'receipt-close-btn', route: '/deliveries', tooltipPlacement: 'right' },
  // Step 20: New request popup
  { id: 'new-request-popup', target: null, title: '📢 New Request Available!', text: "Look — someone just posted a new request on the Marketplace! Let's go check it out.", btn: 'Go to Marketplace →', route: '/dashboard' },
  // Step 21: Fake bot post on marketplace
  { id: 'accept-post', target: 'feed-card-0', title: 'Accept a Request', text: "Here it is! This student needs a delivery. Click anywhere on the card to take the job.", btn: null, waitForClick: 'feed-card-0', route: '/dashboard' },
  // Steps 22-24: Journey tracker (runner)
  { id: 'journey-map-run', target: 'journey-map', title: 'Runner View - Live Map', text: "You're now the **Runner**! Track your route on the Live Map as you walk to the pickup.", btn: 'Next →', route: '/active-runs' },
  { id: 'journey-req-info', target: 'journey-requester-info', title: 'Requester Info', text: "Here's the **Requester's** info — their name and where to deliver.", btn: 'Next →', route: '/active-runs' },
  { id: 'journey-chat-run', target: 'journey-chat', title: 'Chat', text: "Message the requester to coordinate pickup details.", btn: 'Next →', route: '/active-runs' },
  // Step 25: Status buttons
  { id: 'journey-status', target: 'journey-status-btns', title: 'Status Updates', text: "As you walk, tap these buttons to update your status. The Requester sees your progress in real-time.", btn: null, waitForClick: 'journey-status-btns', route: '/active-runs' },
  // Step 26: Arrived button
  { id: 'journey-arrived', target: 'journey-status-btns', title: 'Arrived!', text: "You've reached the destination! Tap **Arrived**. Note: in a real run, this button **only unlocks when you're within 10 meters** of the destination — verified by GPS.", btn: null, waitForClick: 'journey-status-btns', route: '/active-runs' },
  // Step 27: OTP input (runner)
  { id: 'journey-otp-input', target: 'journey-otp-input', title: 'Enter OTP', text: "Type the **4-digit OTP** the requester gives you to complete the delivery.", btn: 'Complete Run →', route: '/active-runs' },
  // Step 28: Runner completion + history
  { id: 'journey-complete-run', target: null, title: '🎉 Run Complete!', text: "Your quest progress and digital receipt are updated. Great job, Runner!", btn: 'Continue to Economy →', route: '/economy' },
  // Steps 29-30: Economy
  { id: 'economy-wallet', target: 'wallet-card', title: 'Your Wallet', text: "This is your **Wallet**. It shows your current GC balance and capacity (max 300 GC).", btn: 'Next →', route: '/economy' },
  { id: 'economy-vault', target: 'reserve-vault', title: 'Reserve Vault', text: "The **Reserve Vault** stores any overflow GC that exceeds the 300 limit. Withdraw when you have space.", btn: 'Next →', route: '/economy' },
  // Steps 31-34: Quest board walkthrough
  { id: 'quest-board', target: 'quest-board', title: 'Quest Board', text: "This is the **Quest Board** — complete challenges to earn bonus GC and build your campus reputation.", btn: 'Next →', route: '/economy' },
  { id: 'quest-daily', target: 'quest-tab-daily', title: 'Daily Quests', text: "**Daily Quests** reset every midnight. Complete deliveries to earn rewards each day.", btn: 'Next →', route: '/economy' },
  { id: 'quest-weekly', target: 'quest-tab-weekly', title: 'Weekly Quests', text: "**Weekly Quests** reset every Monday. Bigger challenges, bigger rewards.", btn: null, waitForClick: 'quest-tab-weekly', route: '/economy' },
  { id: 'quest-milestones', target: 'quest-tab-milestones', title: 'Milestones', text: "**Milestones** are permanent achievements. They never reset — and one is waiting for you right now!", btn: null, waitForClick: 'quest-tab-milestones', route: '/economy' },
  // Step 35: Rookie quest spotlight
  { id: 'rookie-quest', target: 'quest-rookie', title: '🎉 Rookie Training Complete!', text: "You've unlocked a special quest! Click **Claim** to collect your **10 GC reward**.", btn: null, waitForClick: 'rookieTraining-claim-btn', route: '/economy' },
  // Step 36: Reward feedback
  { id: 'rookie-claimed', target: 'wallet-card', title: 'Credits Earned!', text: "See how your wallet went from 90 to 100? This is how you earn credits on GITY — by completing runs and quests!", btn: 'Almost Done →', route: '/economy' },
  // Step 37: Profile Edit Button
  { id: 'profile-tour', target: 'profile-edit', title: 'Your Profile', text: "You can click here to edit your **Profile Picture** and **DOB**. (Hostel details are locked until June). Click the button to edit now, or click **Skip** to continue.", btn: null, waitForClick: 'profile-edit', route: '/account' },
  // Step 38: Profile Save/Cancel
  { id: 'profile-editing', target: 'profile-save-cancel', title: 'Editing Profile', text: "Make your changes, then click **Save** or **Cancel**.", btn: 'Skip →', route: '/account' },
  // Step 39: Graduation
  { id: 'graduation', target: null, title: '🚀 Welcome to GITY!', text: "You're now connected to the live campus network. Go help a fellow student — or post a request and let someone help you!", btn: 'Start Using GITY!', route: '/dashboard' },
];

export const useTutorial = () => {
  const { currentUser, userProfile, setUserProfile, updateProfile, feedData, deletePost } = useAppContext();
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  // Initialize from Firebase-persisted step
  useEffect(() => {
    if (userProfile && userProfile.tutorialComplete === false) {
      const savedStep = userProfile.tutorialStep || 0;
      setStep(savedStep);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [userProfile?.tutorialComplete, userProfile?.tutorialStep]);

  // Persist step to Firebase on every advance
  const persistStep = useCallback(async (newStep) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { tutorialStep: newStep });
    } catch (err) {
      console.error('Error persisting tutorial step:', err);
    }
  }, [currentUser]);

  const advanceStep = useCallback(() => {
    const next = step + 1;
    if (next >= TUTORIAL_STEPS.length) return;
    
    // Execute side-effects synchronously. We can do this safely because 
    // we are no longer inside a React state functional updater.
    persistStep(next);
    setUserProfile(p => ({ ...p, tutorialStep: next }));
    setStep(next);
  }, [step, persistStep, setUserProfile]);

  // Delete the tutorial post right when the "bot accepts" (step 11 -> 12 transition)
  // This removes the real Firebase document immediately so it never lingers.
  const tutorialPostDeletedRef = useRef(false);
  useEffect(() => {
    if (!isActive || step !== 11 || !currentUser || tutorialPostDeletedRef.current) return;
    tutorialPostDeletedRef.current = true;
    
    const deleteTutorialPost = async () => {
      try {
        // Query Firestore for the 0-cost post created by this user during the tutorial
        const q = query(
          collection(db, 'posts'),
          where('requesterId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const deletePromises = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.cost === 0 || data.cost === undefined) {
            // Use raw deleteDoc to bypass refund logic — 0 GC was never charged
            deletePromises.push(deleteDoc(doc(db, 'posts', docSnap.id)));
          }
        });
        await Promise.all(deletePromises);
        console.log('[Tutorial] Cleaned up tutorial post(s) from Firebase');
      } catch (err) {
        console.warn('[Tutorial] Failed to cleanup tutorial post:', err);
      }
    };
    deleteTutorialPost();
  }, [step, isActive, currentUser]);

  const cleanupTutorialPosts = async () => {
    if (!currentUser || !deletePost) return;
    try {
      // Query Firestore directly to catch any stragglers
      const q = query(collection(db, 'posts'), where('requesterId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const deletePromises = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.cost === 0 || data.cost === undefined) {
          deletePromises.push(deleteDoc(doc(db, 'posts', docSnap.id)));
        }
      });
      await Promise.all(deletePromises);
      // Also clean local state
      if (feedData) {
        const userPosts = feedData.filter(p => p.requesterId === currentUser.uid && (p.cost === 0 || p.cost === undefined));
        for (const p of userPosts) {
          await deletePost(p.id);
        }
      }
    } catch (err) {
      console.warn("Failed to cleanup tutorial posts:", err);
    }
  };

  const skipTutorial = useCallback(async () => {
    if (!currentUser) return;
    try {
      await cleanupTutorialPosts();
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { 
        tutorialComplete: true, 
        tutorialStep: TUTORIAL_STEPS.length,
        'questState.rookieTraining': true // Mark as completable but unclaimed
      });
      setUserProfile(prev => ({
        ...prev,
        tutorialComplete: true,
        tutorialStep: TUTORIAL_STEPS.length,
        questState: { ...prev.questState, rookieTraining: true }
      }));
      setIsActive(false);
    } catch (err) {
      console.error('Error skipping tutorial:', err);
    }
  }, [currentUser, setUserProfile, feedData, deletePost]);

  const completeTutorial = useCallback(async () => {
    if (!currentUser) return;
    try {
      await cleanupTutorialPosts();
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { 
        tutorialComplete: true,
        tutorialStep: TUTORIAL_STEPS.length
      });
      setUserProfile(prev => ({
        ...prev,
        tutorialComplete: true,
        tutorialStep: TUTORIAL_STEPS.length
      }));
      setIsActive(false);
    } catch (err) {
      console.error('Error completing tutorial:', err);
    }
  }, [currentUser, setUserProfile, feedData, deletePost]);

  // Auto-advance for timed steps
  useEffect(() => {
    if (!isActive) return;
    const currentStep = TUTORIAL_STEPS[step];
    if (currentStep?.autoAdvanceMs) {
      timerRef.current = setTimeout(() => {
        advanceStep();
      }, currentStep.autoAdvanceMs);
      return () => clearTimeout(timerRef.current);
    }
  }, [step, isActive, advanceStep]);

  const currentStepData = isActive ? TUTORIAL_STEPS[step] : null;

  return {
    isActive,
    step,
    currentStepData,
    totalSteps: TUTORIAL_STEPS.length,
    advanceStep,
    skipTutorial,
    completeTutorial,
    TUTORIAL_STEPS
  };
};
