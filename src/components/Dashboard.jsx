import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { feedData, acceptRequest, deletePost, currentUser } = useAppContext();
  const { openModal } = useOutletContext();

  const handleAccept = async (postId, type) => {
    await acceptRequest(postId, type);
    navigate('/active-runs');
  };

  const handleDelete = async (postId) => {
    if(window.confirm('Are you sure you want to remove this post?')) {
      await deletePost(postId);
    }
  };

  const pickups = feedData.filter(post => post.type === 'request' && post.status === 'open');
  const offers = feedData.filter(post => post.type === 'offer' && post.status === 'open');

  return (
    <main className={styles.mainFeed}>
      {/* Hero Editorial Section */}
      <header className={styles.heroHeader}>
        <h1 className={styles.heroTitle}>
          The Campus <br/><span style={{ color: 'var(--primary)' }}>Micro-Logistics</span> Exchange.
        </h1>
        <p className={styles.heroSubtitle}>
          Broadcast your needs or share your route. A peer-to-peer network built for the speed of campus life.
        </p>
      </header>

      {/* Split-Feed Architecture */}
      <div className={styles.gridManager}>
        {/* Left Column: Demand (Need a Pickup) */}
        <section className={styles.demandColumn}>
          <div className={styles.demandHeader}>
            <div>
              <span className={styles.taglineDemand}>Demand</span>
              <h2 className={styles.columnTitle}>Need a Pickup</h2>
            </div>
            <button className={styles.postRequestBtn} onClick={() => openModal('request')}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
              Post Request
            </button>
          </div>
          
          <div className={styles.feedList}>
            {pickups.length === 0 && <p className={styles.empty}>No current requests.</p>}
            {pickups.map(post => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.cardTop}>
                  <div className={styles.userMeta}>
                    <div className={styles.avatar}>
                      {post.requesterName[0].toUpperCase()}
                    </div>
                    <div className={styles.nameBlock}>
                      <h3>{post.requesterName}</h3>
                      <p className={styles.timeLabel}>Requested recently</p>
                    </div>
                  </div>
                  {post.isUrgent && <span className={styles.urgentBadge}>Urgent</span>}
                </div>

                <div className={styles.routeBlock}>
                  <div className={styles.timeline}>
                    <div className={styles.pointTarget}></div>
                    <div className={styles.pointLine}></div>
                    <div className={styles.pointSolid}></div>
                  </div>
                  <div className={styles.locations}>
                    <div>
                      <p className={styles.locLabel}>From</p>
                      <p className={styles.locText}>{post.location}</p>
                    </div>
                    <div>
                      <p className={styles.locLabel}>To</p>
                      <p className={styles.locText}>{post.destination}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.packageInfo}>
                    <span className="material-symbols-outlined">package_2</span>
                    <span>{post.details || 'Large Box (Textbooks)'}</span>
                  </div>
                  <span className={styles.price}>{post.price === 'Free' ? 'Free' : `₹${post.price}`}</span>
                </div>

                {(!currentUser || post.requesterId !== currentUser.uid) ? (
                  <button 
                    className={styles.acceptBtn}
                    onClick={() => handleAccept(post.id, 'request')}
                  >
                    Accept Delivery
                  </button>
                ) : (
                  <button 
                    className={styles.acceptBtn}
                    style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'red' }}
                    onClick={() => handleDelete(post.id)}
                  >
                    Remove Request
                  </button>
                )}
              </div>
            ))}
            {pickups.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface-container-lowest)', borderRadius: '1.5rem', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5, display: 'block' }}>inbox</span>
                <p style={{ fontWeight: 600 }}>No active requests right now.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Be the first to post a pickup request!</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Supply (Going to Gate) */}
        <section className={styles.supplyColumn}>
          <div style={{ marginBottom: '1rem' }}>
            <span className={styles.taglineSupply}>Supply</span>
            <h2 className={styles.columnTitle}>Going to Gate</h2>
          </div>
          
          <div className={styles.feedList}>
            {offers.length === 0 && <p className={styles.empty}>No current offers.</p>}
            {offers.map(post => (
              <div key={post.id} className={styles.supplyCard}>
                <div className={styles.supplyTop}>
                  <div className={styles.supplyAvatar}>
                    {post.requesterName[0].toUpperCase()}
                  </div>
                  <div className={styles.supplyMeta}>
                    <h4>{post.requesterName}</h4>
                    <p>Ready to move</p>
                  </div>
                </div>
                <div className={styles.supplyRoute}>
                  <span className={`material-symbols-outlined ${styles.routeIcon}`}>route</span>
                  <div className={styles.supplyDest}>
                    <p className={styles.supplyDestLabel}>Destination:</p>
                    <p className={styles.supplyDestText}>{post.destination}</p>
                  </div>
                  {post.price && post.price !== 'Free' && (
                    <div style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--primary)' }}>
                      Will do for: ₹{post.price}
                    </div>
                  )}
                </div>
                {post.details && (
                  <div style={{ padding: '0.875rem 1rem', background: 'var(--surface-container-high)', borderRadius: '0.75rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', border: '1px solid var(--outline-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '2px' }}>info</span>
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Details / Requirements</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--on-surface)', fontWeight: 500, lineHeight: 1.4 }}>{post.details}</p>
                    </div>
                  </div>
                )}
                {(!currentUser || post.requesterId !== currentUser.uid) ? (
                  <button 
                    className={styles.supplyBtn}
                    onClick={() => handleAccept(post.id, 'offer')}
                  >
                    Ask for Pickup
                  </button>
                ) : (
                  <button 
                    className={styles.supplyBtn}
                    style={{ borderColor: 'red', color: 'red' }}
                    onClick={() => handleDelete(post.id)}
                  >
                    Remove Offer
                  </button>
                )}
              </div>
            ))}
            {offers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.3)', borderRadius: '1.5rem', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5, display: 'block' }}>directions_walk</span>
                <p style={{ fontWeight: 600 }}>No active offers right now.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>If you're heading to the gate, let others know!</p>
              </div>
            )}
            <button className={styles.globalSupplyBtn} onClick={() => openModal('offer')}>
              <span className="material-symbols-outlined">local_shipping</span>
              I'm Going to Gate
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
