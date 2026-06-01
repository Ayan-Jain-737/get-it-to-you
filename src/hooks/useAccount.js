import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

export const useAccount = () => {
  const { userProfile, currentUser, setUserProfile } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  
  // State for the edit form
  const [editDob, setEditDob] = useState('');
  const [editBlock, setEditBlock] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const isJune = new Date().getMonth() === 5; // 0-indexed, 5 is June

  const menBlocks = ['A', 'B', 'C', 'D', 'D Annex', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'M Annex', 'N', 'P', 'Q', 'R', 'T'];
  const womenBlocks = ['A', 'B', 'C', 'D', 'E', 'E Annex', 'F', 'G', 'G Annex', 'H', 'J', 'S', 'RGT'];
  
  const gender = userProfile?.gender || userProfile?.privateData?.gender;
  const availableBlocks = gender === 'Female' ? womenBlocks : menBlocks;

  const filteredBlocks = availableBlocks.filter(block => 
    (block + " Block").toLowerCase().includes(editBlock.toLowerCase())
  );

  useEffect(() => {
    if (isEditing && userProfile) {
      setEditDob(userProfile.privateData?.dob || '');
      setEditBlock(userProfile.hostelBlock || '');
      setEditRoom(userProfile.privateData?.roomNumber || '');
    }
  }, [isEditing, userProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePfpClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simple compression
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            'publicData.photoURL': base64
          });
          setUserProfile(prev => ({ ...prev, avatar: base64 }));
          toast.success("Profile photo updated!");
        } catch (error) {
          toast.error("Failed to update photo");
        } finally {
          setIsUploading(false);
        }
      };
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const finalBlock = editBlock.trim() ? editBlock.trim() : (userProfile?.hostelBlock || '');
    const finalRoom = editRoom.trim() ? editRoom : (userProfile?.privateData?.roomNumber || '');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updates = {};
      updates['privateData.dob'] = editDob;
      
      if (isJune) {
        updates['publicData.zone'] = finalBlock;
        updates['privateData.roomNumber'] = finalRoom;
      }
      
      await updateDoc(userRef, updates);
      
      setUserProfile(prev => ({
        ...prev,
        hostelBlock: isJune ? finalBlock : prev.hostelBlock,
        privateData: {
          ...prev.privateData,
          dob: editDob,
          roomNumber: isJune ? finalRoom : prev.privateData?.roomNumber
        }
      }));
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return {
    userProfile,
    currentUser,
    isEditing,
    setIsEditing,
    editDob,
    setEditDob,
    editBlock,
    setEditBlock,
    editRoom,
    setEditRoom,
    isUploading,
    fileInputRef,
    isJune,
    gender,
    availableBlocks,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    filteredBlocks,
    handlePfpClick,
    handleFileChange,
    handleSave
  };
};
