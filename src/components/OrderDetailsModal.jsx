import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OrderDetailsModal = ({ isOpen, onClose, post }) => {
  const { getJourneyHistory } = useAppContext();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-[2rem] w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-outline-variant/30">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20 bg-surface-container-highest">
          <h2 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Order Details
          </h2>
          <button onClick={onClose} className="p-2 bg-surface-container hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-surface-container-lowest flex-1">
          
          {/* Summary Card */}
          <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Item</p>
                <h3 className="font-bold text-on-surface text-lg">{post.item || post.description || post.details || 'Campus Pick-up'}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Reward</p>
                <p className="font-bold text-primary">{post.price && post.price !== 'Free' ? post.price : 'Good Karma'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/20">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">From</p>
                <p className="font-bold text-on-surface text-sm">{post.pickupLocation || post.pickup || post.location || 'Campus Landmark'}</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">To</p>
                <p className="font-bold text-on-surface text-sm">{post.destination || 'Campus'}</p>
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

              {/* Chat History */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">chat</span> Chat Transcript
                </h4>
                <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30 max-h-60 overflow-y-auto space-y-3">
                  {history?.messages && history.messages.length > 0 ? (
                    history.messages.map(msg => (
                      <div key={msg.id} className="text-sm">
                        {msg.type === 'system' ? (
                          <div className="text-center text-[10px] uppercase font-bold text-on-surface-variant my-2 tracking-wide">
                            {msg.text}
                          </div>
                        ) : (
                          <div className={`flex flex-col ${msg.senderId === post.requesterId ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] font-bold text-on-surface-variant mb-0.5">
                              {msg.senderId === post.requesterId ? post.requesterName : (post.acceptedBy || 'Runner')}
                            </span>
                            <div className={`px-3 py-2 rounded-xl max-w-[80%] ${msg.senderId === post.requesterId ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface'}`}>
                              {msg.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-on-surface-variant italic">No messages sent.</p>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
