import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const useLoginScreen = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAppContext();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const success = await signInWithGoogle();
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    }
  };

  return {
    error,
    handleGoogleLogin
  };
};
