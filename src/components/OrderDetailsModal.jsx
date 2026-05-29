import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OrderDetailsModal = ({ isOpen, onClose, post }) => {
  const { getJourneyHistory, currentUser } = useAppContext();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !post) return;
    
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      const data = await getJourneyHistory(post.id);
      if (isMounted) {
        setHistory(data);
        setLoading(false);
      }
    };
    
    fetchHistory();
    return () => { isMounted = false; };
  }, [isOpen, post, getJourneyHistory]);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#fffdf5] w-full max-w-md max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#000] overflow-hidden border-2 border-black relative" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
        
        {/* Receipt Jagged Edge Top (optional aesthetic) */}
        <div style={{ width: '100%', height: '8px', backgroundImage: 'radial-gradient(circle, #fffdf5 4px, transparent 5px)', backgroundSize: '10px 10px', backgroundPosition: '-5px -5px', position: 'absolute', top: -4, borderTop: '2px dashed #000' }}></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-dashed border-black">
          <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-2">
            *** GITY RECEIPT ***
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-black">
          
          {/* Summary Card */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="uppercase text-sm font-bold tracking-widest border-b border-dashed border-black pb-2 inline-block">Order Details</p>
            </div>
            
            <div className="flex justify-between items-end border-b-2 border-dashed border-black pb-2">
              <div>
                <p className="text-xs uppercase font-bold text-gray-600 mb-1">Item</p>
                <h3 className="font-bold text-lg">{post.item || post.description || post.details || 'Campus Pick-up'}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-gray-600 mb-1">Reward</p>
                <p className="font-bold">{post.price && post.price !== 'Free' ? post.price : 'Good Karma'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 pt-2 border-b-2 border-dashed border-black pb-4">
              <div className="flex-1">
                <p className="text-xs uppercase font-bold text-gray-600 mb-1">From</p>
                <p className="font-bold">{post.pickupLocation || post.pickup || post.location || 'Campus Landmark'}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase font-bold text-gray-600 mb-1">To</p>
                <p className="font-bold">{post.destination || 'Campus'}</p>
              </div>
            </div>
          </div>

          {/* Timestamps & Status */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-tertiary" /> Timeline
                </h4>
                <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant font-medium">Requested</span>
                    <span className="font-bold text-on-surface">
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </span>
                  </div>
                  {history?.journey?.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant font-medium">Accepted</span>
                      <span className="font-bold text-on-surface">
                        {history.journey.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {history?.journey?.readyForPickupAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant font-medium">Ready for Pickup</span>
                      <span className="font-bold text-on-surface">
                        {history.journey.readyForPickupAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-3 border-t border-outline-variant/20">
                    <span className="text-on-surface-variant font-bold">Final Status</span>
                    <span className="font-bold text-tertiary flex items-center gap-1">
                      <CheckCircle size={14} /> Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Economic Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 border-dashed border-black pb-2">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span> GC Transaction
                </h4>
                <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
                  {post.requesterId === currentUser?.uid ? (
                    <div className="flex justify-between items-center text-red-600 font-bold">
                      <span>Requester Escrow</span>
                      <span className="text-xl">-{post.cost || 75} GC</span>
                    </div>
                  ) : history?.journey?.runnerId === currentUser?.uid ? (
                    <div className="flex justify-between items-center text-green-600 font-bold">
                      <span>Runner Reward</span>
                      <span className="text-xl">+{post.runnerReward || 50} GC</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center font-bold">
                      <span>Network Transfer</span>
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat History */}
              <div className="space-y-2 pt-4">
                <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 border-dashed border-black pb-2">
                  <span className="material-symbols-outlined text-xl">chat</span> Transcript
                </h4>
                <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_#000] max-h-40 overflow-y-auto space-y-4">
                  {history?.messages && history.messages.length > 0 ? (
                    history.messages.map(msg => (
                      <div key={msg.id} className="text-sm">
                        {msg.type === 'system' ? (
                          <div className="text-center text-xs uppercase font-bold text-gray-500 my-2 tracking-wide border-b border-dashed border-gray-300 pb-1">
                            {msg.text}
                          </div>
                        ) : (
                          <div className={`flex flex-col ${msg.senderId === post.requesterId ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs font-bold text-gray-600 mb-0.5">
                              {msg.senderId === post.requesterId ? post.requesterName : (post.acceptedBy || 'Runner')}
                            </span>
                            <div className={`px-3 py-2 border-2 border-black ${msg.senderId === post.requesterId ? 'bg-black text-white' : 'bg-white text-black'}`}>
                              {msg.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm italic">No messages sent.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Jagged Bottom Edge */}
          <div className="text-center pt-8 opacity-50">
            - - - END OF RECEIPT - - -
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
