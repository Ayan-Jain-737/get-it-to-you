import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, query, orderBy, setDoc, getDoc, where, getDocs, deleteField } from 'firebase/firestore';
import { onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState([]);

  // Auth Listener
  useEffect(() => {
    if (DISABLE_FIREBASE) {
      const savedUser = localStorage.getItem('gity_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setUserProfile({ name: 'Student', dorm: 'Main Gate' });
      }
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profileRef = doc(db, 'users', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data());
          } else {
            const newProfile = { phone: user.phoneNumber || null, name: user.displayName || 'Student', dorm: 'Main Gate' };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Firestore Rules blocking Profile fetch:", err);
          setUserProfile({ name: user.displayName || 'Student', dorm: 'Locked Database' });
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribeAuth && unsubscribeAuth();
  }, []);

  // Listen to 'posts' collection
  useEffect(() => {
    if (DISABLE_FIREBASE) {
      setFeedData(MOCK_DATA);
      setLoading(false);
      return;
    }

    let timeoutId;
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeedData(posts);
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      }, (error) => {
        console.warn("Firestore not fully configured yet:", error.message);
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      });

      // Safety fallback: if Firebase hangs, unlock UI after 3s
      timeoutId = setTimeout(() => {
        console.log("Firestore connection timeout triggered - unlocking UI");
        setLoading(false);
      }, 3000);

      return () => {
        unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (err) {
      console.warn("Firebase initialization error:", err);
      setLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, []);

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

  // Phone Auth Methods
  const setupRecaptcha = (containerId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response) => {
          console.log("Recaptcha solved");
        }
      });
    }
  };

  const sendOtp = async (phoneNumber, containerId) => {
    if (DISABLE_FIREBASE) {
      console.log("Mock OTP sent to " + phoneNumber);
      return true; 
    }
    try {
      setupRecaptcha(containerId);
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (error) {
      console.error("Error sending OTP:", error);
      return false;
    }
  };

  const verifyOtp = async (otpCode) => {
    if (DISABLE_FIREBASE) {
      const mockUser = { uid: 'mock-user', phoneNumber: '+919999999999' };
      setCurrentUser(mockUser);
      localStorage.setItem('gity_user', JSON.stringify(mockUser));
      return true;
    }
    try {
      if (!confirmationResult) return false;
      const result = await confirmationResult.confirm(otpCode);
      setCurrentUser(result.user);
      return true;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return false;
    }
  };

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
    setConfirmationResult(null);
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
      await addDoc(collection(db, 'posts'), {
        ...postData,
        requesterId: currentUser.uid,
        requesterName: userProfile?.name || 'Student',
        status: 'open',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  const deletePost = async (postId) => {
    try {
      if (DISABLE_FIREBASE) {
        setFeedData(prev => prev.filter(post => post.id !== postId));
        return;
      }
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'posts', postId));
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
    if (DISABLE_FIREBASE) return;
    onSnapshot(doc(db, 'journeys', journeyId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'Completed') {
          setActiveJourney(null);
        } else {
          setActiveJourney({ id: docSnap.id, ...data });
        }
      }
    });
  };

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
      await updateDoc(doc(db, 'journeys', activeJourney.id), { status: newStatus });
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
      const journeySnap = await getDoc(journeyRef);
      if (journeySnap.exists()) {
        if (journeySnap.data().otpCode === enteredOTP) {
          await updateDoc(journeyRef, { status: 'Completed' });
          if (journeySnap.data().postId) {
            await updateDoc(doc(db, 'posts', journeySnap.data().postId), { status: 'completed' });
          }
          setActiveJourney(null);
          return true;
        } else {
          throw new Error("Invalid OTP");
        }
      } else {
        throw new Error("Journey not found");
      }
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
      await updateDoc(doc(db, 'journeys', journeyId), {
        status: 'Cancelled',
        cancellationReason: reason
      });
      if (originalPostId) {
        await updateDoc(doc(db, 'posts', originalPostId), {
          status: 'open',
          runnerId: deleteField(),
          acceptedBy: deleteField()
        });
      }
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
      return { completed: 12, cancelled: 1, pastRuns: [{ id: 'mock1', destination: 'SJT', location: 'Gate 1' }] };
    }
    try {
      const q = query(collection(db, 'journeys'), where('runnerId', '==', userId));
      const snap = await getDocs(q);
      let completed = 0;
      let cancelled = 0;
      let pastRuns = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Completed') {
          completed++;
          pastRuns.push({ id: doc.id, ...data });
        } else if (data.status === 'Cancelled') {
          cancelled++;
        }
      });
      return { completed, cancelled, pastRuns };
    } catch (err) {
      console.error("Error fetching user stats", err);
      return { completed: 0, cancelled: 0, pastRuns: [] };
    }
  };

  const value = {
    currentUser,
    userProfile,
    feedData,
    activeJourney,
    loading,
    sendOtp,
    verifyOtp,
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
    getUserStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
