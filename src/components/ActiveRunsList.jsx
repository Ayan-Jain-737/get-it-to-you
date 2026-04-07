import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PackageX } from 'lucide-react';
import ActiveJourney from './ActiveJourney';

const ActiveRunsList = () => {
  const { activeJourney, currentUser } = useAppContext();

  // If there's an active run and user is the runner, show the details directly
  if (activeJourney && activeJourney.runnerId === currentUser?.uid) {
    return <ActiveJourney />;
  }

  // Empty state
  return (
    <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
      <PackageX size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Active Deliveries</h2>
      <p>Accept a pickup or join a run from your Dashboard to start tracking!</p>
    </div>
  );
};

export default ActiveRunsList;
