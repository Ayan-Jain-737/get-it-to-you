import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const useOnboarding = (authUser, onComplete) => {
  const navigate = useNavigate();
  const { setUserProfile } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [hostelBlock, setHostelBlock] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [pfpFile, setPfpFile] = useState(null);

  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menBlocks = ['A', 'B', 'C', 'D', 'D Annex', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'M Annex', 'N', 'P', 'Q', 'R', 'T'];
  const womenBlocks = ['A', 'B', 'C', 'D', 'E', 'E Annex', 'F', 'G', 'G Annex', 'H', 'J', 'S', 'RGT'];

  useEffect(() => {
    if (authUser) {
      if (authUser.email) setEmail(authUser.email);
      if (authUser.displayName) {
        const regNoMatch = authUser.displayName.match(/2[1-9][A-Z]{3}\d{4}/i);
        if (regNoMatch) {
          setRegNumber(regNoMatch[0].toUpperCase());
          setFullName(authUser.displayName.replace(regNoMatch[0], '').replace(/[^a-zA-Z\s]/g, '').trim());
        } else {
          setFullName(authUser.displayName);
        }
      }
      if (authUser.dob) setDob(authUser.dob);
    }
  }, [authUser]);

  useEffect(() => {
    if (gender === 'Male') {
      setAvailableBlocks(menBlocks);
    } else if (gender === 'Female') {
      setAvailableBlocks(womenBlocks);
    } else {
      setAvailableBlocks([]);
      setHostelBlock('');
    }
  }, [gender]);

  const handlePfpUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPfpFile(file);
    }
  };

  // --- THE ZERO-BUDGET IMAGE COMPRESSOR ---
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200; // Forces the image to be small enough for Firestore

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert back to a text string (jpeg format, 70% quality)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser || !authUser.uid) return;

    // Scroll-to-missing-field Validation
    const fields = [
      { id: 'fullName', value: fullName },
      { id: 'dob', value: dob },
      { id: 'gender', value: gender },
      { id: 'gradYear', value: gradYear },
      { id: 'hostelBlock', value: hostelBlock },
      { id: 'roomNumber', value: roomNumber },
      { id: 'agreedTerms', value: document.getElementById('agreedTerms')?.checked },
      { id: 'agreedPrivacy', value: document.getElementById('agreedPrivacy')?.checked }
    ];

    for (let field of fields) {
      if (!field.value) {
        const el = document.getElementById(field.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; // Stop submission
      }
    }

    setIsSubmitting(true);

    try {
      let photoBase64 = null;
      if (pfpFile) {
        photoBase64 = await compressImage(pfpFile);
      }

      // Write to Supabase profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authUser.uid,
        full_name: fullName,
        email: email,
        avatar_url: photoBase64,
        dob: dob,
        gender: gender
      });
      if (profileError) throw profileError;

      // Academics
      const { error: acadError } = await supabase.from('user_academics').upsert({
        user_id: authUser.uid,
        registration_no: regNumber,
        graduation_year: gradYear
      }, { onConflict: 'user_id' });
      if (acadError) throw acadError;

      // Locations
      const { error: locError } = await supabase.from('user_locations').upsert({
        user_id: authUser.uid,
        hostel_block: hostelBlock,
        room_number: roomNumber
      }, { onConflict: 'user_id' });
      if (locError) throw locError;

      // Wallets
      const { error: walletError } = await supabase.from('user_wallets').upsert({
        user_id: authUser.uid,
        gc_balance: 100,
        gc_capacity: 300,
        trust_score: 5.0
      }, { onConflict: 'user_id' });
      if (walletError) throw walletError;

      // Stats
      const { error: statsError } = await supabase.from('user_stats').upsert({
        user_id: authUser.uid,
        lifetime_requests: 0,
        lifetime_tasks_completed: 0,
        lifetime_cancelled: 0
      }, { onConflict: 'user_id' });
      if (statsError) throw statsError;

      console.log("Onboarding complete, redirecting...");
      setUserProfile(prev => ({
        ...prev,
        full_name: fullName,
        avatar_url: photoBase64,
        dob: dob,
        gender: gender,
        regNumber: regNumber,
        hostelBlock: hostelBlock,
        roomNumber: roomNumber,
        gcBalance: 100,
        gcCapacity: 300,
        trustScore: 5.0,
        onboardingComplete: true
      }));
      
      // 4. Trigger callback (if any) and navigate
      if (onComplete) onComplete();
      navigate('/');

    } catch (error) {
      console.error("Error sealing dossier:", error);
      alert("System Error: Could not save profile. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fullName, setFullName,
    dob, setDob,
    email,
    gender, setGender,
    hostelBlock, setHostelBlock,
    roomNumber, setRoomNumber,
    gradYear, setGradYear,
    regNumber, setRegNumber,
    pfpFile, handlePfpUpload,
    availableBlocks,
    isSubmitting,
    handleSubmit
  };
};