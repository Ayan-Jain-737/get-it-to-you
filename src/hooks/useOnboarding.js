import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const useOnboarding = (authUser, onComplete) => {
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
        setFullName(authUser.displayName.split(' ')[0]);
        const regNoMatch = authUser.displayName.match(/2[1-9][BM][A-Z]{2}\d{4}/i);
        if (regNoMatch) {
          setRegNumber(regNoMatch[0].toUpperCase());
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

    setIsSubmitting(true);

    try {
      // 0. Enforce Unique Registration Number
      const upperRegNum = regNumber.toUpperCase();
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('privateData.regNumber', '==', upperRegNum));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const isDuplicate = querySnapshot.docs.some(d => d.id !== authUser.uid);
        if (isDuplicate) {
          alert("This Registration Number is already linked to another account.");
          setIsSubmitting(false);
          return;
        }
      }

      let photoBase64 = null;

      // 1. Compress Image to Text String (Bypasses Storage entirely)
      if (pfpFile) {
        photoBase64 = await compressImage(pfpFile);
      }

      // 2. Format the Public Display Name
      const nameParts = fullName.trim().split(' ');
      const publicDisplayName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
        : nameParts[0];

      // 3. Write securely to Firestore using the Base64 string
      const userRef = doc(db, 'users', authUser.uid);
      await setDoc(userRef, {
        publicData: {
          displayName: publicDisplayName,
          zone: hostelBlock,
          gradYear: gradYear,
          photoURL: photoBase64, // Saves the text string instead of a storage link
          reliabilityScore: 100,
          level: 1
        },
        privateData: {
          fullName: fullName,
          dob: dob,
          email: email,
          gender: gender,
          roomNumber: roomNumber,
          regNumber: upperRegNum,
          lastRoomUpdate: new Date().toISOString()
        },
        onboardingComplete: true,
        gcBalance: 90,
        overflowBalance: 0,
        tutorialComplete: false,
        tutorialStep: 0
      }, { merge: true });

      // 4. Trigger callback
      if (onComplete) onComplete();

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