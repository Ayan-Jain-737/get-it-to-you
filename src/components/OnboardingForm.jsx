import React, { useRef, useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useOnboarding } from '../hooks/useOnboarding';

const OnboardingForm = ({ authUser, onComplete }) => {
  const {
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
    handleSubmit
  } = useOnboarding(authUser, onComplete);

  const fileInputRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBlocks = availableBlocks.filter(block => 
    (block + " Block").toLowerCase().includes(hostelBlock.toLowerCase())
  );

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChangeEmail = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-margin-page font-body-md text-on-surface flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl bg-surface-container-lowest border-[3px] border-on-surface shadow-[8px_8px_0px_0px_#000000] p-stack-lg">
        <div className="mb-stack-xl border-b-[3px] border-on-surface pb-stack-sm">
          <h1 className="font-headline-xl text-headline-xl font-black uppercase tracking-tighter">ACCOUNT CREATION</h1>
          <p className="font-label-mono text-label-tag uppercase font-bold text-on-surface-variant">Initialize Your Identity Profile</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-lg">
          
          {/* PFP UPLOAD ZONE */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="font-headline-md text-headline-md font-black uppercase">Profile Signature</label>
              <span className="font-label-mono text-[10px] bg-secondary-container px-2 py-0.5 border border-on-surface font-bold">🎁 Quest: Upload Photo for +50 GC</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div 
                onClick={triggerFileUpload}
                className="w-40 h-40 border-[3px] border-dashed border-on-surface bg-surface-variant flex flex-col items-center justify-center cursor-pointer hover:bg-primary-container transition-colors shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000000]"
              >
                {pfpFile ? (
                  <div className="text-center font-bold font-label-mono p-2 truncate w-full">
                    <span className="material-symbols-outlined text-4xl block mb-2">check_circle</span>
                    {pfpFile.name}
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center">
                    <span className="material-symbols-outlined text-5xl mb-2">add_photo_alternate</span>
                    <span className="font-label-mono font-bold uppercase text-[10px]">Upload Photo</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 flex-1">
                 <p className="font-body-md text-sm font-bold">You can upload a photo to stand out and complete the onboarding quest, or simply skip to use your default initial as your avatar.</p>
                 {!pfpFile && (
                   <div className="flex items-center gap-2 mt-2">
                     <div className="w-10 h-10 border-2 border-on-surface bg-secondary-container flex items-center justify-center font-headline-md font-bold text-on-surface uppercase shadow-[2px_2px_0px_0px_#000000]">
                       {fullName ? fullName[0].toUpperCase() : '?'}
                     </div>
                     <span className="font-label-mono text-xs font-bold text-on-surface-variant">Default Initial</span>
                   </div>
                 )}
                 {pfpFile && (
                   <button 
                     type="button" 
                     onClick={() => setPfpFile(null)} 
                     className="px-3 py-1 bg-error text-on-error font-bold font-label-mono uppercase text-[10px] border-2 border-on-surface shadow-[2px_2px_0px_0px_#000000] self-start mt-2"
                   >
                     Remove Photo
                   </button>
                 )}
              </div>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handlePfpUpload}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            {/* FULL NAME */}
            <div className="flex flex-col gap-1">
              <label className="font-label-mono font-bold uppercase">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter legal name"
                required
                className="p-3 border-[3px] border-on-surface bg-surface-container-lowest font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:bg-primary-container transition-colors"
              />
            </div>

            {/* EMAIL (Read Only) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end">
                <label className="font-label-mono font-bold uppercase">Institutional Email</label>
                <button type="button" onClick={handleChangeEmail} className="font-label-mono text-[10px] text-primary underline font-bold uppercase hover:text-on-surface transition-colors">Change Email</button>
              </div>
              <input 
                type="email" 
                value={email}
                readOnly
                placeholder="Email locked"
                className="p-3 border-[3px] border-on-surface bg-surface-container-highest text-on-surface-variant font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] cursor-not-allowed outline-none"
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col gap-1">
              <label className="font-label-mono font-bold uppercase">Date of Birth</label>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="p-3 border-[3px] border-on-surface bg-surface-container-lowest font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:bg-primary-container transition-colors"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            {/* GENDER */}
            <div className="flex flex-col gap-1">
              <label className="font-label-mono font-bold uppercase">Gender / Hostel Type</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="p-3 border-[3px] border-on-surface bg-surface-container-lowest font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:bg-primary-container transition-colors cursor-pointer"
              >
                <option value="" disabled>Select Classification</option>
                <option value="Male">Male (Men's Hostel)</option>
                <option value="Female">Female (Ladies' Hostel - LH)</option>
              </select>
            </div>

            {/* REGISTRATION NUMBER */}
            <div className="flex flex-col gap-1">
              <label className="font-label-mono font-bold uppercase">Registration Number</label>
              <input 
                type="text" 
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 21BCE0000"
                required
                className="p-3 border-[3px] border-on-surface bg-surface-container-lowest font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:bg-primary-container transition-colors uppercase"
              />
            </div>

            {/* GRADUATION YEAR */}
            <div className="flex flex-col gap-1">
              <label className="font-label-mono font-bold uppercase">Graduation Year</label>
              <input 
                type="number" 
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="e.g. 2025"
                min="2020" max="2030"
                required
                className="p-3 border-[3px] border-on-surface bg-surface-container-lowest font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:bg-primary-container transition-colors"
              />
            </div>
          </div>

          {/* ACCOMMODATION SECTOR */}
          <div className="border-[3px] border-on-surface p-stack-md bg-surface-variant relative mt-stack-md">
            <div className="absolute -top-4 left-4 bg-on-surface text-surface-container-lowest px-2 py-1 font-label-mono font-black uppercase text-xs">
              Sector Coordinates
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md mt-2">
              {/* HOSTEL BLOCK */}
              <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
                <label className="font-label-mono font-bold uppercase">Hostel Block</label>
                <div 
                  className={`border-[3px] border-on-surface bg-surface-container-lowest font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] focus-within:bg-primary-container transition-colors ${!gender ? 'bg-surface-container-highest opacity-50 pointer-events-none' : ''}`}
                >
                  <input 
                    type="text"
                    value={hostelBlock}
                    onChange={(e) => {
                      setHostelBlock(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder={!gender ? 'Select Gender First' : 'Type to search blocks'}
                    disabled={!gender}
                    required
                    className="w-full p-3 bg-transparent focus:outline-none"
                  />
                </div>
                
                {isDropdownOpen && gender && (
                  <div className="absolute top-[100%] left-0 w-full mt-2 bg-surface-container-lowest border-[3px] border-on-surface shadow-[4px_4px_0px_0px_#000000] max-h-48 overflow-y-auto z-50">
                    {filteredBlocks.length > 0 ? (
                      filteredBlocks.map((block) => (
                        <div
                          key={block}
                          className="p-3 font-body-md font-bold uppercase cursor-pointer hover:bg-primary-container border-b-[1px] border-on-surface/20 last:border-0"
                          onClick={() => {
                            setHostelBlock(`${block} Block`);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {block} Block
                        </div>
                      ))
                    ) : (
                      <div className="p-3 font-body-md font-bold uppercase text-on-surface-variant">
                        No match found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ROOM NUMBER */}
              <div className="flex flex-col gap-1">
                <label className="font-label-mono font-bold uppercase">Room Number</label>
                <input 
                  type="text" 
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 404"
                  required
                  className="p-3 border-[3px] border-on-surface bg-surface-container-lowest font-body-lg font-bold shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:bg-primary-container transition-colors"
                />
              </div>
            </div>
            
            {/* SECURITY WARNING */}
            <div className="mt-stack-md bg-tertiary-container border-[3px] border-on-surface p-stack-sm flex items-start gap-3 shadow-[4px_4px_0px_0px_#000000]">
              <span className="material-symbols-outlined text-on-tertiary-container text-3xl shrink-0 mt-0.5">warning</span>
              <p className="font-body-md font-bold uppercase text-on-tertiary-container leading-tight">
                ATTENTION: Room details are locked for security. You may only update this once per academic year.
              </p>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-stack-md bg-primary text-on-primary py-4 border-[3px] border-on-surface font-headline-xl text-headline-sm uppercase tracking-widest font-black shadow-[8px_8px_0px_0px_#000000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
          >
            SEAL MY INFORMATION
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
