import React from 'react';
import { useAccount } from '../hooks/useAccount';
import SearchableDropdown from './SearchableDropdown';

const Account = () => {
  const {
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
  } = useAccount();

  if (!userProfile) return null;

  return (
    <div className="bg-surface-container min-h-screen text-on-surface p-margin-page pb-24 md:pb-margin-page overflow-y-auto">
      <header className="mb-8 border-b-4 border-on-surface pb-4">
        <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-black uppercase tracking-tighter text-on-surface">Your Profile</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 border-l-border-width border-on-surface pl-stack-sm">
          Review your credentials and edit your details.
        </p>
      </header>

      <div className="bg-surface-container-lowest border-4 border-on-surface shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6 max-w-3xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Column: Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-40 h-40 border-4 border-on-surface bg-surface-container flex items-center justify-center relative overflow-hidden group">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-on-surface-variant">person</span>
              )}
              
              <div 
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handlePfpClick}
              >
                <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                <span className="text-white font-bold uppercase text-xs mt-1">Change</span>
              </div>
              
              {isUploading && (
                <div className="absolute inset-0 bg-surface-container-lowest flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              data-tutorial="profile-edit"
              className="w-full bg-secondary-container text-on-secondary-container border-2 border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase py-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Full Name</label>
                  <div className="font-bold text-lg">{userProfile?.name || userProfile?.privateData?.fullName}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Registration No.</label>
                  <div className="font-label-mono font-bold text-lg bg-surface-container inline-block px-2 border-2 border-on-surface">
                    {userProfile?.privateData?.regNumber || 'N/A'}
                  </div>
                </div>
                <div className="w-full min-w-0">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Email</label>
                  <div 
                    className="font-bold truncate"
                    title={userProfile?.privateData?.email || currentUser?.email}
                  >
                    {userProfile?.privateData?.email || currentUser?.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Date of Birth</label>
                  <div className="font-bold">{userProfile?.privateData?.dob || 'Not set'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Hostel Block</label>
                  <div className="font-bold">{userProfile?.hostelBlock || 'Not set'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Room Number</label>
                  <div className="font-bold">{userProfile?.privateData?.roomNumber || 'Not set'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Gender</label>
                  <div className="font-bold">{gender || 'Not set'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Graduation Year</label>
                  <div className="font-bold">{userProfile?.gradYear || 'Not set'}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="bg-primary-container text-on-primary-container p-3 border-2 border-on-surface font-bold text-sm mb-2">
                  <span className="material-symbols-outlined align-middle mr-2">info</span>
                  You can edit your DOB anytime. Block and Room Number can only be updated when the hostels change (June).
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-xs uppercase tracking-wider">Date of Birth</label>
                  <input 
                    type="date" 
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="p-2 border-2 border-on-surface bg-surface-container-lowest font-bold focus:outline-none focus:bg-surface-container transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1 relative">
                  <label className="font-bold text-xs uppercase tracking-wider">Hostel Block</label>
                  <SearchableDropdown
                    options={availableBlocks.map(b => ({ value: `${b} Block`, label: `${b} Block` }))}
                    value={editBlock}
                    onChange={setEditBlock}
                    placeholder={userProfile?.hostelBlock || "Type to search blocks"}
                    disabled={!isJune}
                  />
                </div>

                <div className="flex flex-col gap-1 relative">
                  <label className="font-bold text-xs uppercase tracking-wider">Room Number</label>
                  <input 
                    type="text" 
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    disabled={!isJune}
                    placeholder={userProfile?.privateData?.roomNumber || "e.g. 104"}
                    className="p-2 border-2 border-on-surface bg-surface-container-lowest font-bold focus:outline-none transition-colors disabled:bg-surface-container disabled:cursor-not-allowed"
                  />
                </div>

                <button 
                  type="submit"
                  data-tutorial="profile-save-cancel"
                  className="mt-4 bg-primary text-on-primary border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase py-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
