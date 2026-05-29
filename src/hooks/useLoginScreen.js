import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const useLoginScreen = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAppContext();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    const success = await signInWithGoogle();
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Google Sign-In failed.');
    }
  };

  return {
    error,
    handleGoogleLogin
  };
};
