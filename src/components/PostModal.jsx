import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import styles from './PostModal.module.css';

import { VIT_LOCATIONS } from '../constants';

const groupedLocations = VIT_LOCATIONS.reduce((acc, loc) => {
  if (!acc[loc.category]) acc[loc.category] = [];
  acc[loc.category].push(loc);
  return acc;
}, {});

const PostModal = ({ onClose, initialType = 'request' }) => {
  const { createPost, userProfile } = useAppContext();
  const [postType, setPostType] = useState(initialType); // 'request' | 'offer'
  const [location, setLocation] = useState(VIT_LOCATIONS[0].id);
  const [destination, setDestination] = useState(VIT_LOCATIONS[5].id); // Default to SJT
  const [details, setDetails] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createPost({
      type: postType,
      location,
      destination,
      details,
      price: '75 GC',
      isUrgent
    });
    if (success) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create a Post</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${postType === 'request' ? styles.active : ''}`}
              onClick={() => setPostType('request')}
            >
              Need a Pickup
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${postType === 'offer' ? styles.active : ''}`}
              onClick={() => setPostType('offer')}
            >
              Ready for Pickup
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label style={{ fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Pickup From</label>
            <select 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '2px solid #000', borderRadius: '4px', boxShadow: '4px 4px 0px #000', outline: 'none', background: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: '#000' }}
            >
              {Object.entries(groupedLocations).map(([category, locs]) => (
                <optgroup key={category} label={category} style={{ fontWeight: 'bold', background: '#f4f4f0' }}>
                  {locs.map(loc => (
                    <option key={loc.id} value={loc.id} style={{ fontWeight: 'normal', background: '#fff' }}>{loc.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label style={{ fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Drop-off At</label>
            <select 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '2px solid #000', borderRadius: '4px', boxShadow: '4px 4px 0px #000', outline: 'none', background: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: '#000' }}
            >
              {Object.entries(groupedLocations).map(([category, locs]) => (
                <optgroup key={category} label={category} style={{ fontWeight: 'bold', background: '#f4f4f0' }}>
                  {locs.map(loc => (
                    <option key={loc.id} value={loc.id} style={{ fontWeight: 'normal', background: '#fff' }}>{loc.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {postType === 'request' && (
            <div className={styles.inputGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={isUrgent} 
                  onChange={(e) => setIsUrgent(e.target.checked)} 
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                />
                Mark as URGENT
              </label>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Specific Details</label>
            <textarea
              rows="3"
              placeholder={postType === 'request' ? "e.g. Swiggy order arriving in 10 mins..." : "e.g. Can carry small packages, meeting near main entrance..."}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{ resize: 'none' }}
              required
            />
          </div>

          <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
            <div style={{ background: '#fff', border: '2px solid #000', boxShadow: '4px 4px 0px #000', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              <span style={{ fontSize: '1.1rem', color: '#000' }}>Cost: 75 GC (Deducted immediately)</span>
            </div>
          </div>

          {postType === 'request' && (userProfile?.gcBalance < 75) && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 600, textAlign: 'center', backgroundColor: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '1.1rem', marginRight: '4px' }}>error</span>
              Insufficient funds (75 GC required). You have {userProfile?.gcBalance || 0} GC.
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={postType === 'request' && (userProfile?.gcBalance < 75)} style={{ width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: '1rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', border: 'none', cursor: (postType === 'request' && userProfile?.gcBalance < 75) ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s', opacity: (postType === 'request' && userProfile?.gcBalance < 75) ? 0.5 : 1 }} onMouseEnter={e => { if (!(postType === 'request' && userProfile?.gcBalance < 75)) e.target.style.opacity = '0.9'; }} onMouseLeave={e => { if (!(postType === 'request' && userProfile?.gcBalance < 75)) e.target.style.opacity = '1'; }}>
            {postType === 'request' ? 'Post Request (75 GC)' : 'Post Availability'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
