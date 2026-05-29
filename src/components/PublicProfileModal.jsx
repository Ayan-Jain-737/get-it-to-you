import React from 'react';
import { X, Award, Star } from 'lucide-react';
import { usePublicProfileModal } from '../hooks/usePublicProfileModal';

const PublicProfileModal = ({ isOpen, onClose, targetUid }) => {
  const { profileData, loading } = usePublicProfileModal(isOpen, targetUid);

  if (!isOpen) return null;

  const renderBadges = (questState) => {
    const claimedQuests = Object.keys(questState || {}).filter(k => questState[k] === 'claimed');
    if (claimedQuests.length === 0) {
      return <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>No public badges yet.</p>;
    }
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {claimedQuests.map(questId => (
          <div key={questId} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', boxShadow: '2px 2px 0px #000', border: '1px solid #000' }}>
            <Award size={14} />
            <span style={{ textTransform: 'uppercase' }}>{questId.replace(/-/g, ' ')}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '400px', border: '4px solid #000', boxShadow: '8px 8px 0px #000', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ borderBottom: '4px solid #000', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Player Card</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={24} color="#000" strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #ccc', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : !profileData ? (
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Profile not found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Section 1: Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, border: '3px solid #000', boxShadow: '3px 3px 0px #000', borderRadius: '8px' }}>
                  {(profileData.name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px 0' }}>{profileData.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 700, backgroundColor: '#e0f7fa', color: '#006064', padding: '4px 8px', borderRadius: '16px', border: '2px solid #000' }}>
                    <Star size={14} fill="#006064" /> Reliability: {profileData.reliabilityScore}%
                  </div>
                </div>
              </div>

              {/* Section 2: Stats */}
              <div style={{ border: '3px solid #000', padding: '16px', boxShadow: '4px 4px 0px #000', display: 'flex', gap: '16px', backgroundColor: '#fff9c4' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, marginBottom: '4px' }}>Completed Runs</p>
                  <p style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                    {(profileData.stats?.tasksCompleted || 0) + (profileData.stats?.requestsCompleted || 0)}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, marginBottom: '4px' }}>Requested</p>
                  <p style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{profileData.stats?.requestsCompleted || 0}</p>
                </div>
              </div>

              {/* Section 3: Trophy Room */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} /> Trophy Room
                </h4>
                {renderBadges(profileData.questState)}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PublicProfileModal;
