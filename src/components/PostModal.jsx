import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import styles from './PostModal.module.css';

const LOCATIONS = [
  "Main Gate",
  "Food Court",
  "SJT",
  "TT",
  "Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", 
  "Block H", "Block J", "Block K", "Block L", "Block M", "Block N", "Block P", 
  "Block Q", "Block R", "Block S", "Block T",
  "Emerald Hall", "Sapphire Court", "Ruby Terrace"
];

const PostModal = ({ onClose, initialType = 'request' }) => {
  const { createPost } = useAppContext();
  const [postType, setPostType] = useState(initialType); // 'request' | 'offer'
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [destination, setDestination] = useState(LOCATIONS[4]);
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({
      type: postType,
      location,
      destination,
      details,
      price: price || 'Free',
      isUrgent
    });
    onClose();
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
              Going to Gate
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label>Pickup Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Destination</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)}>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
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
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>{postType === 'request' ? 'Ready to Pay (₹)' : 'Will do it for (₹)'}</label>
            <input
              type="text"
              placeholder="e.g. 50, Free, Coffee..."
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '0.75rem', border: 'none', color: 'var(--on-surface)', fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: '1rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity = '0.9'} onMouseLeave={e => e.target.style.opacity = '1'}>
            {postType === 'request' ? 'Post Request' : 'Post Availability'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
