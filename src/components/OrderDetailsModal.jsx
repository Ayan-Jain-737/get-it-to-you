import React from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useOrderDetailsModal } from '../hooks/useOrderDetailsModal';
import PublicProfileModal from './PublicProfileModal';

const OrderDetailsModal = ({ isOpen, onClose, post }) => {
  const {
    currentUser,
    history,
    loading,
    profileTargetUid,
    setProfileTargetUid,
    counterpartyName,
    counterpartyUid
  } = useOrderDetailsModal(isOpen, post);

  useScrollLock(isOpen);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-margin-page bg-on-surface/80 backdrop-blur-sm font-body-md animate-in fade-in duration-100">
      {/* Modal Container: Neo-Brutalist Thermal Receipt */}
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Top Zigzag Edge */}
        <div className="absolute -top-3 left-0 w-full h-4 overflow-hidden flex z-20">
          <div className="w-full flex justify-between h-full text-surface-container-lowest fill-current">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 10">
              <polygon points="0,10 5,0 10,10 15,0 20,10 25,0 30,10 35,0 40,10 45,0 50,10 55,0 60,10 65,0 70,10 75,0 80,10 85,0 90,10 95,0 100,10"></polygon>
            </svg>
          </div>
        </div>

        {/* Main Receipt Body */}
        <div className="bg-surface-container-lowest border-l-border-width border-r-border-width border-on-surface shadow-[6px_6px_0px_0px_#141414] flex flex-col p-6 overflow-y-auto no-scrollbar relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-on-surface pb-3 mb-4">
            <h2 className="font-label-mono text-sm font-black uppercase tracking-widest text-on-surface">
              *** GITY RECEIPT ***
            </h2>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-surface-variant border border-on-surface transition-all flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-4 text-on-surface">
            <div className="flex justify-between items-start border-b border-dashed border-on-surface pb-2">
              <div>
                <p className="font-label-mono text-[10px] uppercase font-bold text-on-surface-variant mb-0.5">Item</p>
                <h3 className="font-headline-md text-base font-black truncate max-w-[200px]">{post.item || post.description || post.details || 'Campus Pick-up'}</h3>
              </div>
              <div className="text-right">
                <p className="font-label-mono text-[10px] uppercase font-bold text-on-surface-variant mb-0.5">
                  {post.type === 'request' ? (
                    currentUser && post.requesterId === currentUser.uid ? 'Cost' : 'Reward'
                  ) : (
                    currentUser && post.requesterId === currentUser.uid ? 'Reward' : 'Cost'
                  )}
                </p>
                <p className="font-black text-sm">
                  {post.type === 'request' ? (
                    currentUser && post.requesterId === currentUser.uid ? `75 GC` : `50 GC`
                  ) : (
                    currentUser && post.requesterId === currentUser.uid ? `50 GC` : `75 GC`
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 border-b border-dashed border-on-surface pb-3">
              <div className="flex-1 min-w-0">
                <p className="font-label-mono text-[10px] uppercase font-bold text-on-surface-variant mb-0.5">
                  {post.type === 'offer' ? 'I Am Going To' : 'From'}
                </p>
                <p className="font-bold text-xs truncate">{post.pickupLocation || post.pickup || post.location || 'Campus Landmark'}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label-mono text-[10px] uppercase font-bold text-on-surface-variant mb-0.5">
                  {post.type === 'offer' ? 'I Will Return To' : 'To'}
                </p>
                <p className="font-bold text-xs truncate">{post.destination || 'Campus'}</p>
              </div>
            </div>

            {/* Counterparty wiring logic */}
            {history?.journey && counterpartyUid && (
              <div className="flex justify-between items-center border-b border-dashed border-on-surface pb-3 pt-1">
                <span className="font-label-mono text-[10px] uppercase font-bold text-on-surface-variant">
                  {currentUser.uid === history.journey.runnerId ? 'DELIVERY FOR:' : 'DELIVERY BY:'}
                </span>
                <span 
                  className="font-bold text-xs uppercase underline cursor-pointer hover:text-primary transition-all"
                  onClick={() => setProfileTargetUid(counterpartyUid)}
                >
                  {counterpartyName}
                </span>
              </div>
            )}
          </div>

          {/* Loading or Detailed Logs */}
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="font-label-mono text-[10px] uppercase font-bold text-on-surface border-b border-dashed border-on-surface pb-1 flex items-center gap-1.5">
                  <Clock size={12} /> Timeline Logs
                </h4>
                <div className="bg-surface-container p-3 border border-on-surface text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-bold">Requested</span>
                    <span className="font-bold">
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </span>
                  </div>
                  {history?.journey?.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-bold">Accepted</span>
                      <span className="font-bold">
                        {history.journey.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {history?.journey?.readyForPickupAt && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-bold">Ready</span>
                      <span className="font-bold">
                        {history.journey.readyForPickupAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-on-surface border-dashed pt-1.5 mt-1 font-black">
                    <span>Status</span>
                    <span className="text-secondary flex items-center gap-1">
                      <CheckCircle size={10} /> Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions details */}
              <div className="space-y-2">
                <h4 className="font-label-mono text-[10px] uppercase font-bold text-on-surface border-b border-dashed border-on-surface pb-1">
                  GC Transaction Summary
                </h4>
                <div className="p-3 border-2 border-on-surface bg-surface-container-lowest font-black text-xs">
                  {post.type === 'request' ? (
                    post.requesterId === currentUser?.uid ? (
                      <div className="flex justify-between text-error">
                        <span>Escrow Charge</span>
                        <span>-75 GC</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-secondary">
                        <span>Reward Earned</span>
                        <span>+50 GC</span>
                      </div>
                    )
                  ) : (
                    post.requesterId === currentUser?.uid ? (
                      <div className="flex justify-between text-secondary">
                        <span>Reward Earned</span>
                        <span>+50 GC</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-error">
                        <span>Escrow Charge</span>
                        <span>-75 GC</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Chat Transcripts */}
              <div className="space-y-2">
                <h4 className="font-label-mono text-[10px] uppercase font-bold text-on-surface border-b border-dashed border-on-surface pb-1">
                  Chat Transcript
                </h4>
                <div className="p-3 border-2 border-on-surface bg-surface-container-lowest max-h-36 overflow-y-auto space-y-2 text-xs">
                  {history?.messages && history.messages.length > 0 ? (
                    history.messages.map(msg => (
                      <div key={msg.id}>
                        {msg.type === 'system' ? (
                          <div className="text-center text-[9px] uppercase font-bold text-on-surface-variant py-1 border-b border-on-surface border-dotted">
                            {msg.text}
                          </div>
                        ) : (
                          <div className={`flex flex-col ${msg.senderId === post.requesterId ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] font-black text-on-surface-variant">
                              {msg.senderId === post.requesterId ? post.requesterName : (post.acceptedBy || 'Runner')}
                            </span>
                            <div className={`px-2 py-1 border border-on-surface ${msg.senderId === post.requesterId ? 'bg-surface-container text-on-surface' : 'bg-surface-container-lowest text-on-surface'}`}>
                              {msg.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-[11px] text-on-surface-variant italic">No messages logged.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Barcode & Footer stamp */}
          <div className="mt-6 flex flex-col items-center">
            <div className="flex justify-center h-[32px] gap-[2px] mb-2 opacity-80">
              <div className="w-[1px] h-full bg-on-surface"></div>
              <div className="w-[3px] h-full bg-on-surface"></div>
              <div className="w-[1px] h-full bg-on-surface"></div>
              <div className="w-[2px] h-full bg-on-surface"></div>
              <div className="w-[4px] h-full bg-on-surface"></div>
              <div className="w-[1px] h-full bg-on-surface"></div>
              <div className="w-[3px] h-full bg-on-surface"></div>
              <div className="w-[2px] h-full bg-on-surface"></div>
              <div className="w-[1px] h-full bg-on-surface"></div>
              <div className="w-[4px] h-full bg-on-surface"></div>
              <div className="w-[2px] h-full bg-on-surface"></div>
              <div className="w-[1px] h-full bg-on-surface"></div>
            </div>
            <div className="font-label-mono text-[9px] text-on-surface-variant tracking-wider uppercase">
              - - - END OF GITY TRANSACTION - - -
            </div>
          </div>
        </div>

        {/* Bottom Zigzag Edge */}
        <div className="absolute -bottom-3 left-0 w-full h-4 overflow-hidden flex z-20">
          <div className="w-full flex justify-between h-full text-surface-container-lowest fill-current">
            <svg className="w-full h-full transform rotate-180" preserveAspectRatio="none" viewBox="0 0 100 10">
              <polygon points="0,10 5,0 10,10 15,0 20,10 25,0 30,10 35,0 40,10 45,0 50,10 55,0 60,10 65,0 70,10 75,0 80,10 85,0 90,10 95,0 100,10"></polygon>
            </svg>
          </div>
        </div>
      </div>

      <PublicProfileModal
        isOpen={!!profileTargetUid}
        targetUid={profileTargetUid}
        onClose={() => setProfileTargetUid(null)}
      />
    </div>
  );
};

export default OrderDetailsModal;
