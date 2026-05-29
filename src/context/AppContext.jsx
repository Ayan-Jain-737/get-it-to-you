import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, query, orderBy, setDoc, getDoc, where, getDocs, deleteField, runTransaction } from 'firebase/firestore';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { VIT_LOCATIONS, getHaversineDistance } from '../constants';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Force true if Firebase is not setup
const DISABLE_FIREBASE = false; 

const MOCK_DATA = [
  { id: '1', type: 'request', requesterId: 'user1', requesterName: 'Karthik S.', location: 'Main Gate', destination: 'Block Q', status: 'open', details: 'Large Pizza Box from Domino\'s. Please handle with care!', createdAt: new Date() },
  { id: '2', type: 'offer', requesterId: 'user2', requesterName: 'Arjun Reddy', location: 'Block L', destination: 'Main Gate', status: 'open', details: 'Leaving in 15 mins. Can pick up any small packages.', createdAt: new Date() }
];

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const [activeJourney, setActiveJourney] = useState(null);
  const [activeJourneyId, setActiveJourneyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  
  const sessionStartTime = useRef(Date.now());
  const initialPostsLoaded = useRef(false);

  // Auth Listener
  useEffect(() => {
    if (DISABLE_FIREBASE) {
      const savedUser = localStorage.getItem('gity_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setUserProfile({ name: 'Student', dorm: 'Main Gate' });
      }
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        sessionStartTime.current = Date.now();
        initialPostsLoaded.current = false;
        try {
          const profileRef = doc(db, 'users', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            let updated = false;
            if (data.gcBalance === undefined) { data.gcBalance = 200; updated = true; }
            if (!data.stats) { data.stats = { lifetimeRequests: 0, lifetimeTasksCompleted: 0, flawlessTasksCount: 0 }; updated = true; }
            if (!data.questState) { data.questState = { lastTaskDate: null }; updated = true; }
            if (!data.claimInbox) { data.claimInbox = []; updated = true; }
            
            const now = new Date();
            const currentDateString = now.toDateString();
            const getWeekStr = (d) => {
              const date = new Date(d.getTime());
              date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
              const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
              const weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
              return `${date.getUTCFullYear()}-W${weekNo}`;
            };
            const currentWeekString = getWeekStr(now);
            
            if (data.questState.lastDailyReset !== currentDateString) {
               delete data.questState.daily;
               delete data.questState.sprinter;
               delete data.questState.rescuer;
               delete data.questState.lastorder;
               data.questState.lastDailyReset = currentDateString;
               updated = true;
            }
            
            if (data.questState.lastWeeklyReset !== currentWeekString) {
               delete data.questState.weekendWarrior;
               delete data.questState.ironStreakCompleted;
               data.questState.lastWeeklyReset = currentWeekString;
               updated = true;
            }
            
            if (updated) {
              await setDoc(profileRef, data, { merge: true });
            }
            setUserProfile(data);
          } else {
            const newProfile = { 
              phone: user.phoneNumber || null, 
              name: user.displayName || 'Student', 
              dorm: 'Main Gate',
              gcBalance: 200,
              stats: { lifetimeRequests: 0, lifetimeTasksCompleted: 0, flawlessTasksCount: 0 },
              questState: { lastTaskDate: null },
              claimInbox: []
            };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Firestore Rules blocking Profile fetch:", err);
          setUserProfile({ name: user.displayName || 'Student', dorm: 'Locked Database', gcBalance: 200, claimInbox: [] });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth && unsubscribeAuth();
  }, []);

  // Listen to 'posts' collection
  useEffect(() => {
    if (DISABLE_FIREBASE) {
      setFeedData(MOCK_DATA);
      return;
    }

    let timeoutId;
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data({ serverTimestamps: 'estimate' })
        }));
        setFeedData(posts);

        if (!initialPostsLoaded.current) {
          initialPostsLoaded.current = true;
        } else {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newPost = change.doc.data({ serverTimestamps: 'estimate' });
              const postTime = newPost.createdAt?.toMillis ? newPost.createdAt.toMillis() : Date.now();
              
              if (currentUser && newPost.requesterId !== currentUser.uid && postTime >= sessionStartTime.current) {
                toast(`New ${newPost.type} available!`, {
                  icon: '📣',
                  style: {
                    background: 'var(--surface-container-highest)',
                    color: 'var(--on-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)'
                  }
                });
              }
            }
          });
        }

        if (timeoutId) clearTimeout(timeoutId);
      }, (error) => {
        console.warn("Firestore not fully configured yet:", error.message);
        if (timeoutId) clearTimeout(timeoutId);
      });

      // Safety fallback: if Firebase hangs, unlock UI after 3s
      timeoutId = setTimeout(() => {
        console.log("Firestore connection timeout triggered");
      }, 3000);

      return () => {
        unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (err) {
      console.warn("Firebase initialization error:", err);
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [currentUser?.uid]);

  // Listen to unread notifications for current user
  useEffect(() => {
    if (!currentUser || DISABLE_FIREBASE) {
      setUnreadNotifications([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUnreadNotifications(notifications);
      }, (error) => {
        console.error("Error listening to notifications:", error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Notifications listener error:", err);
    }
  }, [currentUser]);


  const signInWithGoogle = async () => {
    if (DISABLE_FIREBASE) {
      const mockUser = { uid: 'mock-google-user', email: 'student@vit.edu.in', phoneNumber: null };
      setCurrentUser(mockUser);
      localStorage.setItem('gity_user', JSON.stringify(mockUser));
      return true;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setCurrentUser(result.user);
      return true;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return false;
    }
  };

  const logout = () => {
    if (DISABLE_FIREBASE) {
      setCurrentUser(null);
      localStorage.removeItem('gity_user');
      return;
    }
    signOut(auth);
  };

  const updateProfile = async (profileData) => {
    if (!currentUser) return;
    if (DISABLE_FIREBASE) {
      setUserProfile((prev) => ({ ...prev, ...profileData }));
      return;
    }
    try {
      await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });
      setUserProfile((prev) => ({ ...prev, ...profileData }));
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  // Create post
  const createPost = async (postData) => {
    try {
      if (!currentUser) return;
      if (DISABLE_FIREBASE) {
        setFeedData(prev => [{ ...postData, id: Date.now().toString(), requesterId: currentUser.uid, requesterName: userProfile?.name || 'Student', status: 'open', createdAt: new Date() }, ...prev]);
        return;
      }
      const userRef = doc(db, 'users', currentUser.uid);
      const postRef = doc(collection(db, 'posts'));

      let computedCost = 0;
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User does not exist");
        
        const userData = userSnap.data();
        let newBalance = userData.gcBalance || 0;
        
        const locObj = VIT_LOCATIONS.find(l => l.id === postData.location);
        const destObj = VIT_LOCATIONS.find(l => l.id === postData.destination);
        let dynamicCost = 75;
        let runnerReward = 50;
        
        if (locObj && destObj) {
          const distance = getHaversineDistance(locObj.lat, locObj.lng, destObj.lat, destObj.lng);
          if (distance < 500) {
            dynamicCost = 50;
            runnerReward = 35;
          } else if (distance > 1500) {
            dynamicCost = 100;
            runnerReward = 70;
          }
        }
        
        if (postData.type === 'request') {
          if (newBalance < dynamicCost) {
            throw new Error(`Insufficient GC balance (requires ${dynamicCost} GC)`);
          }
          newBalance -= dynamicCost;
          computedCost = dynamicCost;
          const newStats = { ...userData.stats, lifetimeRequests: (userData.stats?.lifetimeRequests || 0) + 1 };
          transaction.update(userRef, { gcBalance: newBalance, stats: newStats });
        }
        
        transaction.set(postRef, {
          ...postData,
          cost: dynamicCost,
          runnerReward: runnerReward,
          requesterId: currentUser.uid,
          requesterName: userData.name || 'Student',
          status: 'open',
          createdAt: serverTimestamp()
        });
      });
      
      if (postData.type === 'request' && computedCost > 0) {
        setUserProfile(prev => ({
          ...prev,
          gcBalance: prev.gcBalance - computedCost,
          stats: {
            ...prev.stats,
            lifetimeRequests: (prev.stats?.lifetimeRequests || 0) + 1
          }
        }));
      }
      
      return true;
    } catch (err) {
      console.error("Error adding post:", err);
      toast.error(err.message || "Failed to create post.");
      return false;
    }
  };

  const deletePost = async (postId) => {
    try {
      if (DISABLE_FIREBASE) {
        setFeedData(prev => prev.filter(post => post.id !== postId));
        return;
      }
      const postRef = doc(db, 'posts', postId);
      const userRef = doc(db, 'users', currentUser.uid);

      await runTransaction(db, async (transaction) => {
        const postSnap = await transaction.get(postRef);
        if (!postSnap.exists()) return;
        
        const postData = postSnap.data();
        
        // If it was a request and is still open, refund the dynamic cost
        if (postData.type === 'request' && postData.status === 'open' && postData.requesterId === currentUser.uid) {
           const userSnap = await transaction.get(userRef);
           if (userSnap.exists()) {
             let newBalance = userSnap.data().gcBalance || 0;
             const refundAmount = postData.cost || 75;
             newBalance = Math.min(500, newBalance + refundAmount);
             transaction.update(userRef, { gcBalance: newBalance });
           }
        }
        transaction.delete(postRef);
      });
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const createNotification = async (userId, title, message, type, linkTo) => {
    if (!userId || DISABLE_FIREBASE) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        linkTo,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    if (DISABLE_FIREBASE) {
      setUnreadNotifications(prev => prev.filter(n => n.id !== notificationId));
      return;
    }
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const acceptRequest = async (postId, postType) => {
    try {
      if (!currentUser) return;
      
      if (DISABLE_FIREBASE) {
        setActiveJourney({ 
          id: 'mock-journey', 
          status: 'Accepted', 
          postId, 
          postType, 
          runnerId: currentUser.uid, 
          otpCode: null, 
          runnerLocation: { lat: null, lng: null }, 
          cancellationReason: null 
        });
        return;
      }
      
      // Fetch post to get original creator
      const postSnap = await getDoc(doc(db, 'posts', postId));
      if (!postSnap.exists()) return;
      const originalRequesterId = postSnap.data().requesterId;
      
      const runnerId = postType === 'request' ? currentUser.uid : originalRequesterId;
      const requesterId = postType === 'offer' ? currentUser.uid : originalRequesterId;
      
      await updateDoc(doc(db, 'posts', postId), { 
        status: 'accepted',
        acceptedBy: userProfile?.name || 'A Student',
        runnerId,
        requesterId
      });
      const journeyRef = await addDoc(collection(db, 'journeys'), {
        postId,
        status: 'Accepted',
        postType,
        runnerId: postType === 'request' ? currentUser.uid : originalRequesterId,
        requesterId: postType === 'offer' ? currentUser.uid : originalRequesterId,
        otpCode: null,
        runnerLocation: { lat: null, lng: null },
        cancellationReason: null,
        createdAt: serverTimestamp()
      });
      listenToJourney(journeyRef.id);

      await createNotification(
        originalRequesterId,
        'Run Accepted',
        `${userProfile?.name || 'A runner'} has accepted your run.`,
        'journey_update',
        '/deliveries'
      );
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const listenToJourney = (journeyId) => {
    setActiveJourneyId(journeyId);
  };

  useEffect(() => {
    if (!activeJourneyId || DISABLE_FIREBASE) return;
    
    const unsubscribe = onSnapshot(doc(db, 'journeys', activeJourneyId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'Completed' || data.status === 'Cancelled') {
          setActiveJourney(null);
          setActiveJourneyId(null);
        } else {
          setActiveJourney({ id: docSnap.id, ...data });
        }
      } else {
        setActiveJourney(null);
        setActiveJourneyId(null);
      }
    });

    return () => unsubscribe();
  }, [activeJourneyId]);

  const trackJourney = async (postId) => {
    if (DISABLE_FIREBASE) {
      setActiveJourney({ id: 'mock-tracked-journey', status: 'Accepted', postId, runnerId: 'mock-runner-uid', requesterId: currentUser?.uid, otpCode: '8888', runnerLocation: { lat: null, lng: null }, cancellationReason: null });
      return;
    }
    try {
      const q = query(collection(db, 'journeys'), where('postId', '==', postId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        listenToJourney(snap.docs[0].id);
      }
    } catch(e) {
      console.error("Error tracking journey:", e);
    }
  };

  const updateJourneyStatus = async (newStatus) => {
    if (!activeJourney) return;
    if (DISABLE_FIREBASE) {
      setActiveJourney(prev => ({ ...prev, status: newStatus }));
      return;
    }
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'Ready for Pickup') {
        updateData.readyForPickupAt = serverTimestamp();
      }
      await updateDoc(doc(db, 'journeys', activeJourney.id), updateData);
      // Inject system message
      await addDoc(collection(db, 'journeys', activeJourney.id, 'messages'), {
        type: 'system',
        text: `📍 Runner advanced to: ${newStatus}`,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating journey status", err);
    }
  };

  const generateHandoffOTP = async (journeyId) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    if (DISABLE_FIREBASE) {
      setActiveJourney(prev => ({ ...prev, otpCode: otp }));
      return otp;
    }
    try {
      await updateDoc(doc(db, 'journeys', journeyId), { otpCode: otp });
      return otp;
    } catch (err) {
      console.error("Error generating handoff OTP", err);
      throw err;
    }
  };

  const verifyOTPAndComplete = async (journeyId, enteredOTP) => {
    if (DISABLE_FIREBASE) {
      if (activeJourney && activeJourney.otpCode === enteredOTP) {
        setActiveJourney(prev => ({ ...prev, status: 'Completed' }));
        return true;
      }
      throw new Error("Invalid OTP");
    }
    try {
      const journeyRef = doc(db, 'journeys', journeyId);
      let updatedRunnerData = null;
      
      await runTransaction(db, async (transaction) => {
        // --- 1. ALL READS ---
        const journeySnap = await transaction.get(journeyRef);
        if (!journeySnap.exists()) throw new Error("Journey not found");
        
        const journeyData = journeySnap.data();
        if (journeyData.otpCode !== enteredOTP) throw new Error("Invalid OTP");
        if (journeyData.status === 'Completed') return; 
        
        let runnerSnap = null;
        if (journeyData.runnerId) {
          const runnerRef = doc(db, 'users', journeyData.runnerId);
          runnerSnap = await transaction.get(runnerRef);
        }
        
        let postSnap = null;
        let postRef = null;
        if (journeyData.postId) {
          postRef = doc(db, 'posts', journeyData.postId);
          postSnap = await transaction.get(postRef);
        }

        // --- 2. ALL MATH & LOGIC & WRITES ---
        transaction.update(journeyRef, { status: 'Completed' });
        
        let postData = null;
        let runnerReward = 50;
        
        if (postSnap && postSnap.exists()) {
          postData = postSnap.data();
          runnerReward = postData.runnerReward || 50;
          transaction.update(postRef, { status: 'completed' });
        }
        
        // Gamification & Rewards
        if (runnerSnap && runnerSnap.exists()) {
          const runnerRef = doc(db, 'users', journeyData.runnerId);
          const runnerData = runnerSnap.data();
          let newBalance = runnerData.gcBalance || 0;
          let stats = runnerData.stats || { lifetimeTasksCompleted: 0 };
          let claimInbox = runnerData.claimInbox || [];
          let questState = runnerData.questState || {};
          
          newBalance = Math.min(500, newBalance + runnerReward);
          
          stats.lifetimeTasksCompleted = (stats.lifetimeTasksCompleted || 0) + 1;
          const runs = stats.lifetimeTasksCompleted;
          
          const now = new Date();
          const todayDateStr = now.toDateString();
          const nowSeconds = Math.floor(now.getTime() / 1000);
          
          // 1. One-Time Quests
          if (runs === 1 && !questState.icebreaker) {
            questState.icebreaker = true;
          }

          // 2. Behavioral Quests
          if (!questState.sprinter && journeyData.createdAt && (nowSeconds - journeyData.createdAt.seconds) < 15 * 60) {
            questState.sprinter = true;
          }
          
          if (!questState.rescuer && postData && postData.createdAt && journeyData.createdAt && (journeyData.createdAt.seconds - postData.createdAt.seconds) > 25 * 60) {
            questState.rescuer = true;
          }
          
          if (!questState.lastorder && postData && postData.createdAt) {
            const postDate = new Date(postData.createdAt.seconds * 1000);
            if (postDate.getHours() === 18 && postDate.getMinutes() >= 30) {
               questState.lastorder = true;
            }
          }
          
          // Daily Quest
          if (questState.lastTaskDate !== todayDateStr) {
            questState.daily = true;
            questState.lastTaskDate = todayDateStr;
          }
          
          // 3. Loyalty Quests (Iron Streak)
          if (!questState.ironStreakCompleted) {
             const oneWeekAgo = nowSeconds - 7 * 24 * 60 * 60;
             if (questState.streakStartDate && questState.streakStartDate > oneWeekAgo) {
                 questState.currentStreak = (questState.currentStreak || 0) + 1;
             } else {
                 questState.streakStartDate = nowSeconds;
                 questState.currentStreak = 1;
             }
             
             if (questState.currentStreak >= 5) {
                 questState.ironStreakCompleted = true;
             }
          }
          
          // 4. Milestones
          if (runs >= 25 && !questState.milestone25) questState.milestone25 = true;
          if (runs >= 50 && !questState.milestone50) questState.milestone50 = true;
          if (runs >= 75 && !questState.milestone75) questState.milestone75 = true;
          if (runs >= 100 && !questState.milestone100) questState.milestone100 = true;
          
          transaction.update(runnerRef, { gcBalance: newBalance, stats, questState });
          
          if (currentUser && currentUser.uid === journeyData.runnerId) {
            updatedRunnerData = { gcBalance: newBalance, stats, questState };
          }
        }
      });
      
      setActiveJourney(null);
      if (updatedRunnerData) {
        setUserProfile(prev => ({
          ...prev,
          ...updatedRunnerData
        }));
      }
      return true;
    } catch (err) {
      console.error("Error verifying OTP and completing", err);
      throw err;
    }
  };

  const cancelJourney = async (journeyId, reason, originalPostId) => {
    if (DISABLE_FIREBASE) {
      setActiveJourney(null);
      return;
    }
    try {
      const journeyRef = doc(db, 'journeys', journeyId);
      
      await runTransaction(db, async (transaction) => {
        // --- 1. ALL READS ---
        const journeySnap = await transaction.get(journeyRef);
        if (!journeySnap.exists()) return;
        
        const journeyData = journeySnap.data();
        if (journeyData.status === 'Cancelled' || journeyData.status === 'Completed') return;
        
        let postSnap = null;
        let postRef = null;
        let reqSnap = null;
        let requesterRef = null;

        if (originalPostId) {
          postRef = doc(db, 'posts', originalPostId);
          postSnap = await transaction.get(postRef);
          
          if (postSnap.exists()) {
             const postData = postSnap.data();
             if (postData.type === 'request' && journeyData.requesterId) {
               requesterRef = doc(db, 'users', journeyData.requesterId);
               reqSnap = await transaction.get(requesterRef);
             }
          }
        }

        // --- 2. ALL MATH & LOGIC & WRITES ---
        transaction.update(journeyRef, {
          status: 'Cancelled',
          cancellationReason: reason
        });
        
        if (postSnap && postSnap.exists()) {
             if (reqSnap && reqSnap.exists()) {
                 let newBalance = reqSnap.data().gcBalance || 0;
                 const refundAmount = postData.cost || 75;
                 newBalance = Math.min(500, newBalance + refundAmount); // Dynamic Refund
                 transaction.update(requesterRef, { gcBalance: newBalance });
             }
             transaction.update(postRef, { status: 'cancelled' });
        }
      });
      setActiveJourney(null);
    } catch (err) {
      console.error("Error cancelling journey", err);
      throw err;
    }
  };

  const updateRunnerLocation = async (journeyId, lat, lng) => {
    if (DISABLE_FIREBASE) {
      setActiveJourney(prev => ({ ...prev, runnerLocation: { lat, lng } }));
      return;
    }
    try {
      await updateDoc(doc(db, 'journeys', journeyId), {
        runnerLocation: { lat, lng }
      });
    } catch (err) {
      console.error("Error updating runner location", err);
      throw err;
    }
  };

  const completeHandoff = async () => {
    if (!activeJourney) return;
    if (DISABLE_FIREBASE) {
      setActiveJourney(null);
      return;
    }
    try {
      await updateDoc(doc(db, 'journeys', activeJourney.id), { status: 'Completed' });
      if (activeJourney.postId) {
        await updateDoc(doc(db, 'posts', activeJourney.postId), { status: 'completed' });
      }
      setActiveJourney(null);
    } catch (err) {
      console.error("Error completing handoff", err);
    }
  };

  const submitReport = async (reportedUserId, journeyId, reason, details = '') => {
    if (DISABLE_FIREBASE) return;
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: currentUser.uid,
        reportedUserId,
        journeyId,
        reason,
        details,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error submitting report", err);
    }
  };

  const getUserStats = async (userId) => {
    if (DISABLE_FIREBASE) {
      return { tasksCompleted: 8, requestsCompleted: 4, cancelled: 1, pastRuns: [] };
    }
    try {
      const runnerQ = query(collection(db, 'journeys'), where('runnerId', '==', userId));
      const reqQ = query(collection(db, 'journeys'), where('requesterId', '==', userId));
      
      const [runnerSnap, reqSnap] = await Promise.all([getDocs(runnerQ), getDocs(reqQ)]);
      
      let tasksCompleted = 0;
      let requestsCompleted = 0;
      let cancelled = 0;
      let pastRuns = [];
      
      runnerSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Completed') {
          tasksCompleted++;
          pastRuns.push({ id: doc.id, ...data });
        } else if (data.status === 'Cancelled') {
          cancelled++;
        }
      });
      
      reqSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Completed') {
          requestsCompleted++;
          pastRuns.push({ id: doc.id, ...data });
        } else if (data.status === 'Cancelled') {
          cancelled++;
        }
      });
      
      // Sort by descending createdAt
      pastRuns.sort((a, b) => {
        const t1 = a.createdAt?.seconds || 0;
        const t2 = b.createdAt?.seconds || 0;
        return t2 - t1;
      });
      
      return { tasksCompleted, requestsCompleted, cancelled, pastRuns };
    } catch (err) {
      console.error("Error fetching user stats", err);
      return { tasksCompleted: 0, requestsCompleted: 0, cancelled: 0, pastRuns: [] };
    }
  };

  const getJourneyHistory = async (postId) => {
    if (DISABLE_FIREBASE) return null;
    try {
      const q = query(collection(db, 'journeys'), where('postId', '==', postId));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      
      const journeyDoc = snap.docs[0];
      const journeyData = { id: journeyDoc.id, ...journeyDoc.data() };
      
      const msgQ = query(collection(db, 'journeys', journeyDoc.id, 'messages'), orderBy('timestamp', 'asc'));
      const msgSnap = await getDocs(msgQ);
      const messages = msgSnap.docs.map(m => ({ id: m.id, ...m.data() }));
      
      return { journey: journeyData, messages };
    } catch (err) {
      console.error("Error fetching journey history:", err);
      return null;
    }
  };

  const claimQuestFromBoard = async (questId, rewardAmount) => {
    if (!currentUser || DISABLE_FIREBASE) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const parsedReward = parseInt(rewardAmount, 10);
      
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(userRef);
        if (!snap.exists()) return;
        const data = snap.data();
        
        let newBalance = (data.gcBalance || 0) + parsedReward;
        if (newBalance > 500) {
          throw new Error("Wallet limit reached. Spend GC before claiming.");
        }
        
        let questState = data.questState || {};
        questState[questId] = 'claimed';
        
        transaction.update(userRef, { gcBalance: newBalance, questState });
      });
      
      setUserProfile(prev => ({
        ...prev,
        gcBalance: prev.gcBalance + parsedReward,
        questState: { ...prev.questState, [questId]: 'claimed' }
      }));
      
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const value = {
    currentUser,
    userProfile,
    feedData,
    activeJourney,
    loading,
    signInWithGoogle,
    logout,
    updateProfile,
    createPost,
    deletePost,
    acceptRequest,
    updateJourneyStatus,
    completeHandoff,
    trackJourney,
    generateHandoffOTP,
    verifyOTPAndComplete,
    cancelJourney,
    updateRunnerLocation,
    createNotification,
    unreadNotifications,
    markAsRead,
    submitReport,
    getUserStats,
    getJourneyHistory,
    claimQuestFromBoard
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
