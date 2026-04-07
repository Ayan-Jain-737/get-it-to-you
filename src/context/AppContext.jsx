import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, query, orderBy, setDoc, getDoc, where, getDocs } from 'firebase/firestore';
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

  const acceptRequest = async (postId, postType) => {
    try {
      if (!currentUser) return;
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      
      if (DISABLE_FIREBASE) {
        setActiveJourney({ id: 'mock-journey', status: 'Accepted', postId, postType, runnerId: currentUser.uid, otp: randomOtp });
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
        otp: randomOtp,
        createdAt: serverTimestamp()
      });
      listenToJourney(journeyRef.id);
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
      setActiveJourney({ id: 'mock-tracked-journey', status: 'Accepted', postId, runnerId: 'mock-runner-uid', requesterId: currentUser?.uid, otp: '8888' });
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
    } catch (err) {
      console.error("Error updating journey status", err);
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
    trackJourney
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
