import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { VIT_LOCATIONS, getHaversineDistance } from '../constants';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const DISABLE_FIREBASE = false;

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
  const activeChannelRef = useRef(null);

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
      if (user) {
        const email = user.email;
        const isAllowed = email.endsWith('@vitstudent.ac.in') || email === 'ayanjain737@gmail.com' || email === 'trumpsaab@gmail.com';
        if (!isAllowed) {
          await auth.signOut();
          return;
        }
      }
      
      setLoading(true);
      setCurrentUser(user);
      if (user) {
        sessionStartTime.current = Date.now();
        initialPostsLoaded.current = false;
        try {
          const { data, error } = await supabase.from('profiles').select('*, user_academics(*), user_locations(*), user_wallets(*), user_stats(*)').eq('id', user.uid).single();
          
          let profileData = null;
          if (!data && error?.code === 'PGRST116') {
             // Create base profile
             const newProfile = {
                id: user.uid,
                full_name: user.displayName || 'Student',
                email: user.email,
                phone: user.phoneNumber || null
             };
             const { data: inserted, error: insErr } = await supabase.from('profiles').insert(newProfile).select().single();
             if (insErr) throw insErr;
             profileData = inserted;
          } else if (data) {
             profileData = data;
          }

          if (profileData) {
            console.log("Fetched User Data:", profileData);

            const extractRow = (rel) => Array.isArray(rel) ? rel[0] : rel;
            const userStatsRow = extractRow(profileData.user_stats) || {};
            const userWalletsRow = extractRow(profileData.user_wallets) || {};
            const userLocationsRow = extractRow(profileData.user_locations) || {};
            const userAcademicsRow = extractRow(profileData.user_academics) || {};

            let newStats = { 
               lifetimeRequests: userStatsRow.lifetime_requests || 0, 
               lifetimeTasksCompleted: userStatsRow.lifetime_tasks_completed || 0, 
               lifetimeCancelled: userStatsRow.lifetime_cancelled || 0 
            };
            
            // Quest state is now locally managed as it is not in the schema
            let newQuestState = JSON.parse(localStorage.getItem('gity_quest_state_' + user.uid) || '{"tutorialComplete": false, "tutorialStep": 0}');
            
            setUserProfile({
              ...profileData,
              name: profileData.full_name || 'Student',
              avatar: profileData.avatar_url || null,
              regNumber: userAcademicsRow.registration_no || null,
              gradYear: userAcademicsRow.graduation_year || null,
              hostelBlock: userLocationsRow.hostel_block || null,
              roomNumber: userLocationsRow.room_number || null,
              gcBalance: userWalletsRow.gc_balance || 0,
              gcCapacity: userWalletsRow.gc_capacity || 300,
              trustScore: userWalletsRow.trust_score || 5.0,
              overflowBalance: 0,
              stats: newStats,
              questState: newQuestState,
              tutorialComplete: newQuestState.tutorialComplete !== false,
              tutorialStep: newQuestState.tutorialStep || 0,
              onboardingComplete: !!profileData.dob
            });
          }
        } catch (err) {
          console.error("Supabase blocking Profile fetch:", err);
          setUserProfile({ name: user.displayName || 'Student', dorm: 'Locked Database', gcBalance: 90, claimInbox: [] });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth && unsubscribeAuth();
  }, []);

  // Listen to tasks feed
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('status', 'open').order('created_at', { ascending: false });
      if (!error && data) {
         setFeedData(data.map(d => ({
            id: d.id, type: d.category, status: d.status,
            requesterId: d.requester_id, location: d.pickup_location,
            destination: d.dropoff_location, details: d.description,
            cost: d.reward_credits, runnerReward: d.reward_credits, // Simplify for demo
            createdAt: new Date(d.created_at)
         })));
      }
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    if (DISABLE_FIREBASE) return;
    fetchTasks();
    const sub = supabase.channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: 'status=eq.open' }, (payload) => {
         fetchTasks();
         if (payload.eventType === 'INSERT') {
            const newPost = payload.new;
            if (currentUser && newPost.requester_id !== currentUser.uid) {
               toast(`New task available!`, { icon: '🔔' });
            }
         }
      }).subscribe();
    return () => supabase.removeChannel(sub);
  }, [currentUser?.uid]);

  // Notifications
  const fetchNotifs = async () => {
    if(!currentUser) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', currentUser.uid).eq('is_read', false).order('created_at', { ascending: false });
    if (data) setUnreadNotifications(data.map(d => ({ id: d.id, ...d, createdAt: new Date(d.created_at) })));
  };
  useEffect(() => {
    if (!currentUser || DISABLE_FIREBASE) { setUnreadNotifications([]); return; }
    fetchNotifs();
    const sub = supabase.channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.uid}` }, () => {
         fetchNotifs();
      }).subscribe();
    return () => supabase.removeChannel(sub);
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
      provider.setCustomParameters({ hd: 'vitstudent.ac.in' });
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      const isAllowed = email.endsWith('@vitstudent.ac.in') || email === 'ayanjain737@gmail.com' || email === 'trumpsaab@gmail.com';
      if (!isAllowed) {
        await auth.signOut();
        throw new Error("Please login with your VIT Email only.");
      }
      return true;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        toast.error("Login cancelled. Please try again.");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
      throw error;
    }
  };

  const logout = () => {
    if (DISABLE_FIREBASE) { setCurrentUser(null); localStorage.removeItem('gity_user'); return; }
    signOut(auth);
  };

  const updateProfile = async (profileData) => {
    if (!currentUser) return;
    try {
      await supabase.from('profiles').update(profileData).eq('id', currentUser.uid);
      setUserProfile((prev) => ({ ...prev, ...profileData }));
    } catch (err) { console.error("Error updating profile", err); }
  };

  const restartTutorial = async () => {
    if (!currentUser) return;
    try {
      const qs = { ...userProfile.questState, tutorialComplete: false, tutorialStep: 0 };
      localStorage.setItem('gity_quest_state_' + currentUser.uid, JSON.stringify(qs));
      window.location.href = '/dashboard';
    } catch (err) {}
  };

  const createPost = async (postData) => {
    try {
      if (!currentUser) return;
      let dynamicCost = 75;
      if (postData.type === 'request') {
        if (userProfile.gcBalance < dynamicCost) throw new Error(`Insufficient GC balance`);
        // Escrow deduction on create
        await supabase.from('user_wallets').update({ gc_balance: userProfile.gcBalance - dynamicCost }).eq('user_id', currentUser.uid);
        setUserProfile(p => ({ ...p, gcBalance: p.gcBalance - dynamicCost }));
      }
      
      const newTask = {
         requester_id: currentUser.uid,
         title: postData.details,
         description: postData.details,
         category: postData.type,
         pickup_location: postData.location,
         dropoff_location: postData.destination,
         reward_credits: dynamicCost,
         status: 'open'
      };
      const { error } = await supabase.from('tasks').insert(newTask);
      if (error) throw error;
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to create post.");
      return false;
    }
  };

  const deletePost = async (postId) => {
    try {
      const { data } = await supabase.from('tasks').select('*').eq('id', postId).single();
      if (data && data.category === 'request' && data.requester_id === currentUser.uid) {
         // Refund
         const refund = data.reward_credits || 50;
         await supabase.from('user_wallets').update({ gc_balance: userProfile.gcBalance + refund }).eq('user_id', currentUser.uid);
         setUserProfile(p => ({ ...p, gcBalance: p.gcBalance + refund }));
      }
      await supabase.from('tasks').delete().eq('id', postId);
    } catch (err) {}
  };

  const createNotification = async (userId, title, message, type, linkTo) => {
    if (!userId) return;
    await supabase.from('notifications').insert({ user_id: userId, title, message, type, link_to: linkTo });
  };

  const markAsRead = async (notificationId) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  };

  const acceptRequest = async (postId, postType) => {
    try {
      if (!currentUser) return;
      const { data: post } = await supabase.from('tasks').select('*').eq('id', postId).single();
      if (!post || post.status !== 'open') throw new Error("Task no longer open");

      let runnerId = postType === 'request' ? currentUser.uid : post.requester_id;
      let reqId = postType === 'offer' ? currentUser.uid : post.requester_id;

      if (postType === 'offer') {
         if (userProfile.gcBalance < post.reward_credits) throw new Error("Insufficient GC");
         await supabase.from('user_wallets').update({ gc_balance: userProfile.gcBalance - post.reward_credits }).eq('user_id', currentUser.uid);
         setUserProfile(p => ({ ...p, gcBalance: p.gcBalance - post.reward_credits }));
      }
      
      const { error } = await supabase.from('tasks').update({ status: 'Accepted', runner_id: runnerId, requester_id: reqId }).eq('id', postId);
      if (error) throw error;
      
      listenToJourney(postId);
      
      const notifUser = postType === 'offer' ? post.requester_id : post.requester_id;
      if (notifUser !== currentUser.uid) {
         await createNotification(notifUser, 'Run Accepted', 'Your run has been accepted.', 'journey_update', '/deliveries');
      }
    } catch (err) {
      toast.error(err.message || "Error accepting request");
    }
  };

  const listenToJourney = (journeyId) => {
    setActiveJourneyId(journeyId);
  };

  useEffect(() => {
    if (!activeJourneyId) return;
    
    const fetchActive = async () => {
      const { data } = await supabase.from('tasks').select('*').eq('id', activeJourneyId).single();
      if (data && data.status !== 'Completed' && data.status !== 'Cancelled') {
         setActiveJourney({
            id: data.id, postId: data.id, status: data.status,
            requesterId: data.requester_id, runnerId: data.runner_id,
            otpCode: data.otp_code,
            runnerLocation: { lat: data.pickup_lat, lng: data.pickup_lng }, // reusing fields
            category: data.category
         });
      } else {
         setActiveJourney(null);
         setActiveJourneyId(null);
      }
    };
    fetchActive();
    
    if (activeChannelRef.current) supabase.removeChannel(activeChannelRef.current);
    activeChannelRef.current = supabase.channel(`task_${activeJourneyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `id=eq.${activeJourneyId}` }, () => {
         fetchActive();
      }).subscribe();
      
    return () => {
      if (activeChannelRef.current) supabase.removeChannel(activeChannelRef.current);
    };
  }, [activeJourneyId]);

  const trackJourney = async (postId) => {
    listenToJourney(postId);
  };

  const updateJourneyStatus = async (newStatus) => {
    if (!activeJourney) return;
    await supabase.from('tasks').update({ status: newStatus }).eq('id', activeJourney.id);
    await supabase.from('messages').insert({ task_id: activeJourney.id, sender_id: currentUser.uid, message: `📍 Runner advanced to: ${newStatus}` });
  };

  const generateHandoffOTP = async (journeyId) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await supabase.from('tasks').update({ otp_code: otp }).eq('id', journeyId);
    return otp;
  };

  const verifyOTPAndComplete = async (journeyId, enteredOTP) => {
    try {
      const { data: task } = await supabase.from('tasks').select('*').eq('id', journeyId).single();
      if (!task) throw new Error("Task not found");
      if (task.otp_code !== enteredOTP) throw new Error("Invalid OTP");
      
      // Atomic Escrow Transfer via RPC
      const { error } = await supabase.rpc('escrow_transfer', { p_task_id: journeyId });
      if (error) throw error;
      
      // Update local state for runner if applicable
      if (task.runner_id === currentUser.uid) {
         setUserProfile(p => ({ ...p, gcBalance: p.gcBalance + (task.reward_credits || 0) }));
      }
      
      setActiveJourney(null);
      return true;
    } catch (err) {
      throw err;
    }
  };

  const cancelJourney = async (journeyId, reason, originalPostId) => {
    try {
      await supabase.from('tasks').update({ status: 'Cancelled' }).eq('id', journeyId);
      setActiveJourney(null);
    } catch (err) { throw err; }
  };

  const updateRunnerLocation = async (journeyId, lat, lng) => {
    await supabase.from('tasks').update({ pickup_lat: lat, pickup_lng: lng }).eq('id', journeyId);
  };

  const completeHandoff = async () => {
    if (!activeJourney) return;
    await supabase.from('tasks').update({ status: 'Completed' }).eq('id', activeJourney.id);
    setActiveJourney(null);
  };

  const submitReport = async (reportedUserId, journeyId, reason, details = '') => {
    await supabase.from('reports').insert({ reporter_id: currentUser.uid, reported_user_id: reportedUserId, task_id: journeyId, reason, details });
  };

  const getUserStats = async (userId) => {
    const { data } = await supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle();
    if (data) {
       return { tasksCompleted: data.lifetime_tasks_completed || 0, requestsCompleted: data.lifetime_requests || 0, cancelled: data.lifetime_cancelled || 0, pastRuns: [] };
    }
    return { tasksCompleted: 0, requestsCompleted: 0, cancelled: 0, pastRuns: [] };
  };

  const getJourneyHistory = async (postId) => {
    const { data: journey } = await supabase.from('tasks').select('*').eq('id', postId).single();
    const { data: msgs } = await supabase.from('messages').select('*').eq('task_id', postId).order('created_at', { ascending: true });
    return { journey: journey ? { ...journey, postId: journey.id } : null, messages: msgs || [] };
  };

  const claimQuestFromBoard = async (questId, rewardAmount) => {
    // simplified
  };
  const withdrawFromOverflow = async (amount) => {
    // simplified
  };

  const fetchPublicProfile = async (targetUid) => {
    const { data } = await supabase.from('profiles').select('*, user_stats(*)').eq('id', targetUid).single();
    if (!data) return null;
    const statsRow = Array.isArray(data.user_stats) ? data.user_stats[0] : data.user_stats || {};
    return {
      name: data.full_name,
      avatar: data.avatar_url,
      stats: {
        lifetimeRequests: statsRow.lifetime_requests || 0,
        lifetimeTasksCompleted: statsRow.lifetime_tasks_completed || 0,
      },
      questState: {}
    };
  };

  let effectiveFeedData = feedData;
  let effectiveActiveJourney = activeJourney;
  let effectiveUserProfile = userProfile;

  if (userProfile && userProfile.tutorialComplete === false) {
    const step = userProfile.tutorialStep || 0;
    if (step >= 36) {
      effectiveUserProfile = {
        ...userProfile,
        questState: {
          ...userProfile.questState,
          rookieTraining: userProfile.questState?.rookieTraining || true
        }
      };
    }

    const mockPost1 = {
      id: 'mock-post-1', type: 'request', status: 'open',
      creatorId: 'mock-user-1', requesterName: 'Alex M.',
      location: 'Library', destination: 'SJT', details: 'Need a charger',
      runnerReward: 15, createdAt: new Date()
    };
    const mockPost2 = {
      id: 'mock-post-2', type: 'request', status: 'open',
      creatorId: 'mock-user-2', requesterName: 'Sam T.',
      location: 'Food Court', destination: 'Main Gate', details: 'Grab my lunch box',
      runnerReward: 25, createdAt: new Date()
    };
    const mockHistoryReq = {
      id: 'mock-history-1', type: 'request', status: 'completed',
      creatorId: currentUser?.uid, requesterId: currentUser?.uid, requesterName: userProfile.name,
      runnerId: 'mock-runner-2', runnerName: 'Chris P.',
      location: 'SJT', destination: 'Main Gate', details: 'Library books',
      runnerReward: 20, createdAt: new Date(Date.now() - 86400000)
    };
    const mockHistoryRun = {
      id: 'mock-history-2', type: 'request', status: 'completed',
      creatorId: 'mock-user-3', requesterId: 'mock-user-3', requesterName: 'Priya K.',
      runnerId: currentUser?.uid, runnerName: userProfile.name,
      location: 'TT', destination: 'Food Court', details: 'Printouts',
      runnerReward: 30, createdAt: new Date(Date.now() - 40000000)
    };

    if (step >= 6 && step <= 19) {
      effectiveFeedData = [mockPost1, mockHistoryReq, mockHistoryRun, ...feedData];
    } else if (step >= 20 && step <= 27) {
      effectiveFeedData = [mockPost2, mockHistoryReq, mockHistoryRun, ...feedData];
    }

    if (step >= 12 && step <= 16) {
      effectiveActiveJourney = {
        id: 'mock-journey-1', status: step >= 15 ? 'Arrived' : 'Accepted',
        requesterId: currentUser?.uid, runnerId: 'mock-runner',
        requesterName: userProfile.name, runnerName: 'Alex M.',
        postRef: { id: 'mock-post-1' },
        otpCode: '1234',
        runnerLocation: { lat: 12.9716, lng: 79.1591 },
        category: 'request'
      };
    } else if (step >= 21 && step <= 27) {
      effectiveActiveJourney = {
        id: 'mock-journey-2', status: step >= 26 ? 'Arrived' : (step >= 25 ? 'Walking Back' : 'Accepted'),
        requesterId: 'mock-user-2', runnerId: currentUser?.uid,
        requesterName: 'Sam T.', runnerName: userProfile.name,
        postRef: { id: 'mock-post-2' },
        otpCode: '5678',
        runnerLocation: { lat: 12.9716, lng: 79.1591 },
        category: 'request'
      };
    }
  }

  const mockNotification = {
    id: 'mock-notif-1', title: 'Order Accepted!', message: 'Alex M. is on the way',
    type: 'journey_update', journeyId: 'mock-journey-1', read: false, createdAt: new Date()
  };

  const effectiveUnreadNotifications = (userProfile?.tutorialComplete === false && (userProfile?.tutorialStep || 0) === 11)
    ? [mockNotification]
    : unreadNotifications;

  const value = {
    currentUser, userProfile: effectiveUserProfile, setUserProfile,
    feedData: effectiveFeedData, activeJourney: effectiveActiveJourney,
    loading, signInWithGoogle, logout, updateProfile, createPost, deletePost,
    acceptRequest, updateJourneyStatus, completeHandoff, trackJourney,
    generateHandoffOTP, verifyOTPAndComplete, cancelJourney, updateRunnerLocation,
    createNotification, unreadNotifications: effectiveUnreadNotifications,
    markAsRead, submitReport, getUserStats, getJourneyHistory,
    restartTutorial, claimQuestFromBoard, withdrawFromOverflow, fetchPublicProfile
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
