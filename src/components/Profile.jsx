import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from './Profile.module.css';

const Profile = () => {
  const { userProfile, updateProfile } = useAppContext();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [dorm, setDorm] = useState(userProfile?.dorm || "Main Gate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ name, dorm });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.box}>
        <header className={styles.header}>
          <div className={styles.brandIcon}>
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <h1>GITY</h1>
            <p>Student Profile Details</p>
          </div>
        </header>

        <section className={styles.card}>
          <h2>Setup & Preferences</h2>
          <form onSubmit={handleSave}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Location / Dorm</label>
              <select value={dorm} onChange={(e) => setDorm(e.target.value)}>
                <option disabled value="">Select Dorm Block</option>
                <optgroup label="Common">
                  <option value="Main Gate">Main Gate</option>
                  <option value="Food Court">Food Court</option>
                  <option value="SJT">SJT</option>
                  <option value="TT">TT</option>
                </optgroup>
                <optgroup label="Dorm Blocks">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T'].map(block => (
                    <option key={`Block ${block}`} value={`Block ${block}`}>Block {block}</option>
                  ))}
                </optgroup>
                <optgroup label="Ladies' Hostels">
                  <option value="Emerald Hall">Emerald Hall</option>
                  <option value="Sapphire Court">Sapphire Court</option>
                  <option value="Ruby Terrace">Ruby Terrace</option>
                </optgroup>
              </select>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Finish Setup'}
            </button>
            
            {saved && <span className={styles.successMsg}>Changes saved successfully!</span>}
          </form>
        </section>
      </div>
    </main>
  );
};

export default Profile;
