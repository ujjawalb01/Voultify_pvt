import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Camera, Loader2, CheckCircle2, Shield } from 'lucide-react';

export default function Profile() {
  const { user, token, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'security'
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Details State
  const [name, setName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="max-w-xl text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Loading profile...</p>
      </div>
    );
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    if (name && name !== user.name) formData.append('name', name);
    if (selectedFile) formData.append('avatar', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update profile details');

      await refreshUser();
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Account details updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'An error occurred while saving your details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      setLoading(false);
      return;
    }

    if (!oldPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password.' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('oldPassword', oldPassword);
    formData.append('password', newPassword);

    try {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update password');
      }

      await refreshUser();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setMessage({ type: 'success', text: 'Password successfully changed!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Profile Settings</h2>
           <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your account details and personalization.</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-sm font-medium transition-colors border border-red-200 dark:border-red-500/20"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav for Settings */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
            <button 
                onClick={() => { setActiveTab('details'); setIsEditing(false); setMessage({type:'', text:''}); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'details' ? 'bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}
            >
                <User className="h-5 w-5" /> Account Details
            </button>
            <button 
                onClick={() => { setActiveTab('security'); setIsChangingPassword(false); setMessage({type:'', text:''}); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'security' ? 'bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}
            >
                <Shield className="h-5 w-5" /> Privacy & Security
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
            {activeTab === 'details' ? (
              !isEditing ? (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                       <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-6">Account Overview</h3>
                       <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="relative h-24 w-24 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {user.avatarUrl ? (
                                  <img src={`http://localhost:3000${user.avatarUrl}`} alt="Profile" className="h-full w-full object-cover" />
                              ) : (
                                  <User className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
                              )}
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                             <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{user.name}</h4>
                             <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
                          </div>
                          <button 
                              onClick={() => setIsEditing(true)}
                              className="px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white text-sm font-medium transition-colors border border-zinc-200 dark:border-white/5"
                          >
                              Edit Profile
                          </button>
                       </div>
                    </div>
                 </div>
              ) : (
                <form onSubmit={handleSaveDetails} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Avatar Upload Section */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                     <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">Edit Profile Picture</h3>
                     <div className="flex items-center gap-6">
                        <div 
                          className="relative h-24 w-24 rounded-full bg-zinc-100 dark:bg-white/5 border-2 border-dashed border-zinc-300 dark:border-white/10 flex items-center justify-center overflow-hidden group cursor-pointer shrink-0"
                          onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover group-hover:opacity-50 transition-opacity" />
                            ) : (
                                <User className="h-10 w-10 text-zinc-400 dark:text-zinc-600 group-hover:opacity-50 transition-opacity" />
                            )}
                            
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Camera className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                           <div className="text-sm font-medium text-zinc-900 dark:text-white mb-1">Upload a new photo</div>
                           <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Recommended size is 256x256px.</div>
                           <button 
                              type="button" 
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 text-sm font-medium rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-colors border border-zinc-200 dark:border-transparent"
                           >
                               Change Picture
                           </button>
                           <input 
                              type="file" 
                              accept="image/*" 
                              ref={fileInputRef} 
                              className="hidden" 
                              onChange={handleAvatarChange}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-4">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Personal Information</h3>
                      
                      <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                          <input 
                             disabled
                             title="Email cannot be changed"
                             value={user.email} 
                             className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-500 dark:text-zinc-500 opacity-70 outline-none cursor-not-allowed" 
                          />
                      </div>

                      <div className="space-y-1.5 pt-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                          <input 
                             type="text"
                             value={name} 
                             onChange={(e) => setName(e.target.value)}
                             className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition-shadow" 
                             placeholder="Your name"
                          />
                      </div>
                  </div>

                  {/* Details Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                     <button 
                        type="button" 
                        onClick={() => {
                            setIsEditing(false);
                            setName(user.name); // Reset state
                            setAvatarPreview(user.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : null);
                            setSelectedFile(null);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                     >
                         Cancel
                     </button>
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC] text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                         {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                         Save Changes
                     </button>
                  </div>
                </form>
              )
            ) : (
               !isChangingPassword ? (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                           <div>
                              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">Account Password</h3>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your password to secure your account.</p>
                           </div>
                           <button 
                              onClick={() => setIsChangingPassword(true)}
                              className="px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white text-sm font-medium transition-colors border border-zinc-200 dark:border-white/5 whitespace-nowrap"
                           >
                              Change Password
                           </button>
                        </div>
                    </div>
                 </div>
               ) : (
                <form onSubmit={handleSaveSecurity} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-4">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Change Password</h3>
                        
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Current Password</label>
                            <input 
                               type="password"
                               required
                               value={oldPassword} 
                               onChange={(e) => setOldPassword(e.target.value)}
                               className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition-shadow" 
                               placeholder="Enter your current password"
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Password</label>
                            <input 
                               type="password"
                               required
                               value={newPassword} 
                               onChange={(e) => setNewPassword(e.target.value)}
                               className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition-shadow" 
                               placeholder="Enter your new password"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm New Password</label>
                            <input 
                               type="password"
                               required
                               value={confirmPassword} 
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition-shadow" 
                               placeholder="Confirm your new password"
                            />
                        </div>
                    </div>

                    {/* Security Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                       <button 
                          type="button" 
                          onClick={() => {
                              setIsChangingPassword(false);
                              setOldPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                              setMessage({type:'', text:''});
                          }}
                          className="px-6 py-2.5 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                       >
                           Cancel
                       </button>
                       <button 
                          type="submit" 
                          disabled={loading}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC] text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                       >
                           {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                           Update Password
                       </button>
                    </div>
                </form>
               )
            )}
        </div>
      </div>
    </div>
  );
}
