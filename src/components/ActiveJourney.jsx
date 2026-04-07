import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const STATUS_STEPS = ['Accepted', 'At Gate', 'Walking Back', 'Arrived'];

const ActiveJourney = () => {
  const { activeJourney, updateJourneyStatus, completeHandoff, currentUser, feedData } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  const isRunner = activeJourney?.runnerId === currentUser?.uid;

  useEffect(() => {
    if (!activeJourney || !activeJourney.id) return;
    
    if (activeJourney.id.startsWith('mock')) {
       setMessages([{ id: 1, sender: 'system', text: 'Connection established between Runner and Requester.' }]);
       return;
    }
    const q = query(collection(db, 'journeys', activeJourney.id, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.senderId === currentUser?.uid ? 'me' : 'other',
          timestamp: data.timestamp
        };
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeJourney?.id, currentUser?.uid]);

  if (!activeJourney) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(activeJourney.status);
  
  // Find the post to get user names
  const postInfo = feedData.find(p => p.id === activeJourney.postId) || {};
  const requesterName = postInfo.requesterName || 'Requester';
  const runnerName = postInfo.acceptedBy || 'Runner';

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeJourney?.id) return;
    
    if (activeJourney.id.startsWith('mock')) {
       setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: newMessage }]);
       setNewMessage('');
       return;
    }
    try {
      await addDoc(collection(db, 'journeys', activeJourney.id, 'messages'), {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleNextStatus = () => {
    if (currentStepIndex < STATUS_STEPS.length - 1) {
      updateJourneyStatus(STATUS_STEPS[currentStepIndex + 1]);
    }
  };

  if (isRunner) {
    // RUNNER VIEW (Shows info ABOUT the Requester)
    return (
      <main className="pt-8 px-6 max-w-2xl mx-auto space-y-8 pb-32 w-full">
        <header className="space-y-2">
          <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block">Active Run</span>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface font-headline">Track Journey</h1>
          <p className="text-on-surface-variant font-medium">Head to {postInfo.location} to pick up the parcel.</p>
        </header>

        <section className="relative h-[200px] w-full rounded-[2rem] overflow-hidden bg-surface-container shadow-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-[6rem] text-primary opacity-20">map</span>
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
            <div className="bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="bg-primary text-on-primary w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">navigation</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary opacity-70">Next Step</p>
                <p className="text-sm font-bold text-on-surface">Go to {postInfo.destination}</p>
              </div>
            </div>
            <div className="bg-primary p-3 rounded-full text-on-primary shadow-xl">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low p-6 rounded-[2rem] space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-primary">route</span> Delivery Progress
          </h2>
          <div className="relative flex justify-between px-2">
            <div className="absolute top-4 left-4 right-4 h-[2px] bg-outline-variant/30 -z-10"></div>
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    <span className={`material-symbols-outlined text-sm ${isCurrent && 'animate-pulse'}`} style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}>
                      {isCompleted ? 'check' : 'location_on'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="col-span-1 bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-[1rem] bg-surface-container-highest flex items-center justify-center text-2xl font-bold text-primary">
              {requesterName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Requester</p>
              <p className="text-lg font-bold text-on-surface font-headline">{requesterName}</p>
            </div>
          </div>

          <div className="col-span-1 bg-surface-container p-6 rounded-[2rem] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Destination</p>
              <p className="text-lg font-bold text-on-surface leading-tight mt-1">{postInfo.destination}</p>
            </div>
          </div>

          <div className="col-span-2 bg-surface-container-low p-6 rounded-[2.5rem] flex items-center gap-6">
            <div className="bg-surface-container-lowest p-4 rounded-3xl">
              <span className="material-symbols-outlined text-3xl text-primary">inventory_2</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Item Description</p>
              <p className="text-xl font-bold text-on-surface font-headline">{postInfo.details || 'Campus Pick-up'}</p>
            </div>
            <div className="bg-[#ffc5aa]/30 px-4 py-2 rounded-2xl text-center">
              <p className="text-[#9b3f00] font-bold text-lg">₹{postInfo.price || '0'}</p>
              <p className="text-[10px] font-bold text-[#9b3f00] uppercase">Earning</p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low p-6 rounded-[2rem]">
          <h2 className="text-xl font-bold font-headline mb-4 text-on-surface">Live Chat</h2>
          <div className="h-40 overflow-y-auto mb-4 space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface'}`}>
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input type="text" className="flex-1 bg-surface-container-lowest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Message requester..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dim transition-colors">
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {currentStepIndex < STATUS_STEPS.length - 1 && (
            <button onClick={handleNextStatus} className="w-full bg-surface-container-highest text-on-surface font-bold py-5 rounded-[1.5rem] flex items-center justify-center gap-3 active:scale-95 transition-all outline-none border border-outline-variant/30 hover:bg-surface-variant">
              <span className="material-symbols-outlined">where_to_vote</span>
              Advance to {STATUS_STEPS[currentStepIndex + 1]}
            </button>
          )}
        </section>

        <footer className="pt-4 pb-8">
          <button 
            onClick={async () => { await completeHandoff(); navigate('/dashboard'); }}
            disabled={activeJourney.status !== 'Arrived'}
            className={`w-full py-6 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all text-lg tracking-tight ${activeJourney.status === 'Arrived' ? 'bg-gradient-to-br from-[#4a40e0] to-[#9795ff] text-white shadow-lg cursor-pointer active:scale-95' : 'bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed'}`}
          >
            {activeJourney.status === 'Arrived' ? 'Complete Delivery Handoff' : 'Waiting to arrive to complete...'}
            <span className="material-symbols-outlined">task_alt</span>
          </button>
          <p className="text-center text-[0.8rem] text-on-surface-variant mt-2">Handoff OTP is: {activeJourney.otp || '4921'}</p>
        </footer>
      </main>
    );
  }

  // REQUESTER VIEW (Shows info ABOUT the Runner)
  return (
    <main className="pt-8 px-6 pb-32 max-w-2xl mx-auto w-full">
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_12px_32px_rgba(50,41,79,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="w-20 h-20 rounded-2xl bg-surface-container-highest flex items-center justify-center text-3xl font-bold text-primary z-10">
            {runnerName[0].toUpperCase()}
          </div>
          <div className="z-10">
            <p className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-1">Your Runner</p>
            <h2 className="text-2xl font-bold text-on-surface font-headline">{runnerName}</h2>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-6 rounded-[1.5rem] mb-8 flex flex-col gap-4">
        <div>
          <p className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-1">Origin</p>
          <div className="flex items-center gap-2">
            <span className="bg-surface-variant px-3 py-1 rounded-full text-label-sm font-bold text-on-surface-variant">{postInfo.location}</span>
          </div>
        </div>
        
        {/* Chat for Requester */}
        <div className="border-t border-outline-variant/20 pt-4 mt-2">
          <h2 className="text-sm font-bold uppercase text-on-surface-variant tracking-wider mb-3">Live Chat</h2>
          <div className="h-32 overflow-y-auto mb-4 space-y-2 bg-surface-container-lowest p-3 rounded-xl">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface'}`}>
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input type="text" className="flex-1 bg-surface-container hover:bg-surface-variant transition-colors rounded-xl px-4 py-3 text-sm focus:outline-none" placeholder="Message runner..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button type="submit" className="bg-[#4a40e0] text-white p-3 rounded-xl">
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>

      <div className="relative px-4 bg-surface-container-lowest py-8 rounded-[2rem]">
        <h3 className="text-xl font-bold mb-8 font-headline text-on-surface">Journey Progress</h3>
        <div className="space-y-12">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;
            return (
              <div key={idx} className="flex gap-6 relative">
                 {idx < STATUS_STEPS.length - 1 && (
                   <div className={`absolute left-4 top-10 w-[2px] h-[calc(100%+12px)] ${isCompleted ? 'bg-primary' : 'bg-outline-variant/30'}`}></div>
                 )}
                 <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-white shadow-md' : 'bg-surface-variant text-on-surface-variant'}`}>
                   {isCompleted && !isCurrent ? (
                     <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                   ) : isCurrent ? (
                     <span className="material-symbols-outlined text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>directions_walk</span>
                   ) : (
                     <span className="material-symbols-outlined text-sm">schedule</span>
                   )}
                 </div>
                 <div className="pt-0.5 opacity-90">
                    <p className="text-lg font-bold text-on-surface font-headline">{step}</p>
                    <p className="text-sm text-on-surface-variant">{isCurrent ? 'Currently in progress...' : isCompleted ? 'Completed' : 'Pending'}</p>
                 </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#4a40e0] to-[#9795ff] text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3 pointer-events-none opacity-80">
          <span className="material-symbols-outlined">key</span>
          OTP: {activeJourney.otp || '4921'}
        </div>
        <p className="text-center text-[10px] text-on-surface-variant mt-4 font-bold uppercase tracking-widest">Share this OTP with the Runner.</p>
      </div>
    </main>
  );
};

export default ActiveJourney;
