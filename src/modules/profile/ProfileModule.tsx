import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { supabase } from '../../lib/supabase';
import {
  IconUser, IconNotes, IconLink, IconBook, IconCalendarEvent,
  IconEdit, IconSettings, IconShieldLock, IconTrash, IconLock, IconCamera,
  IconChevronRight
} from '@tabler/icons-react';
import { Modal } from '../../components/ui/Modal';
import { CustomSelect } from '../../components/ui/CustomSelect';

export default function ProfileModule() {
  const { user } = useAuthStore();
  const { notes, links, subjects, showConfirm } = useAppStore(useShallow(state => ({
    notes: state.notes,
    links: state.links,
    subjects: state.subjects,
    showConfirm: state.showConfirm,
  })));
  const { addToast } = useToastStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile Form States
  const [editName, setEditName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userEmail = user?.email || 'user@example.com';
  const defaultName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
  
  // Metadata from Supabase
  const metadata = user?.user_metadata || {};
  const userName = metadata.display_name || defaultName;
  const userAbout = metadata.about_me || "Software Developer & Lifelong Learner.\nI love building products, learning new things and staying organized.";
  const userAvatar = metadata.avatar_url || null;
  const userInitial = userName.charAt(0).toUpperCase();

  // Simple stats
  const totalNotes = notes.length;
  const totalLinks = links.length;
  const totalSubjects = subjects.length;
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown';

  useEffect(() => {
    if (isEditingProfile) {
      setEditName(userName);
      setEditAbout(userAbout);
    }
  }, [isEditingProfile, userName, userAbout]);

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      addToast('Validation Error', 'Username cannot be empty', 'warning');
      return;
    }
    
    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: editName, about_me: editAbout }
    });
    
    setIsUpdating(false);
    if (error) {
      addToast('Update Failed', error.message, 'error');
    } else {
      addToast('Success', 'Profile updated successfully', 'success');
      setIsEditingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      addToast('Validation Error', 'Password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Validation Error', 'Passwords do not match', 'warning');
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdating(false);

    if (error) {
      addToast('Error', error.message, 'error');
    } else {
      addToast('Success', 'Password changed successfully', 'success');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid File', 'Choose an image file for your avatar.', 'warning');
      return;
    }

    setIsUpdating(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = user.id + '/' + Date.now() + '-' + safeName;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      setIsUpdating(false);
      addToast('Upload Failed', uploadError.message, 'error');
      return;
    }

    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const { error: profileError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl.publicUrl },
    });

    setIsUpdating(false);
    if (profileError) {
      addToast('Profile Update Failed', profileError.message, 'error');
      return;
    }

    addToast('Success', 'Profile photo updated.', 'success');
  };

  const handleDeleteAccount = () => {
    showConfirm('Account Deletion Requires Server Setup', 'Account deletion must run from a secure backend function with Supabase service-role access. This browser app will not fake-delete your account.', () => {
      addToast('Server Function Required', 'Create a Supabase Edge Function for permanent account deletion.', 'warning');
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="flex flex-col gap-8 w-full max-w-3xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 mt-4 px-4 sm:px-0">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">Profile</h1>
      </div>

      {/* ── User ID Card ── */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-md bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 overflow-hidden"
            style={{
              background: userAvatar ? `url(${userAvatar}) center/cover` : '#f43f5e',
              color: '#fff',
            }}
          >
            {!userAvatar && userInitial}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            title="Upload Photo"
          >
            <IconCamera size={16} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>
        
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 w-full pt-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{userName}</h2>
          <p className="text-[14px] text-zinc-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <IconUser size={16} /> {userEmail}
          </p>
          <p className="text-[14px] text-zinc-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <IconCalendarEvent size={16} /> Joined {joinDate}
          </p>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="mt-4 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-[13px] font-medium transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-3 gap-3 px-4 sm:px-0">
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
            <IconNotes size={20} />
          </div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">{totalNotes}</span>
          <span className="text-[12px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">Notes</span>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
           <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
            <IconLink size={20} />
          </div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">{totalLinks}</span>
          <span className="text-[12px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">Links</span>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
           <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-2">
            <IconBook size={20} />
          </div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">{totalSubjects}</span>
          <span className="text-[12px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">Subjects</span>
        </div>
      </div>

      {/* ── About Section ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">About Me</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm p-5">
          <p className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {userAbout}
          </p>
        </div>
      </section>

      {/* ── Account & Security ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">Account & Security</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-zinc-200 dark:divide-zinc-800">
          
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm">
                <IconShieldLock className="w-5 h-5" stroke={1.5} />
              </div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Username</p>
            </div>
            <p className="text-[15px] text-zinc-500">{userName.toLowerCase()}</p>
          </div>

          <button 
            onClick={() => setIsChangingPassword(true)}
            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm">
                <IconLock className="w-5 h-5" stroke={1.5} />
              </div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Change Password</p>
            </div>
            <IconChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </section>

      {/* ── Preferences ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">Preferences</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-zinc-200 dark:divide-zinc-800">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white shadow-sm">
                <IconSettings className="w-5 h-5" stroke={1.5} />
              </div>
              <div>
                <p className="text-base font-medium text-zinc-900 dark:text-white">Language</p>
                <p className="text-[13px] text-zinc-500 mt-0.5">Choose your preferred language</p>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <CustomSelect
                value="english"
                onChange={() => {}}
                options={[
                  { value: 'english', label: 'English' },
                  { value: 'spanish', label: 'Spanish' },
                  { value: 'french', label: 'French' },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
                <IconCalendarEvent className="w-5 h-5" stroke={1.5} />
              </div>
              <div>
                <p className="text-base font-medium text-zinc-900 dark:text-white">Date Format</p>
                <p className="text-[13px] text-zinc-500 mt-0.5">Choose how dates are displayed</p>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <CustomSelect
                value="dd-mmm-yyyy"
                onChange={() => {}}
                options={[
                  { value: 'dd-mmm-yyyy', label: 'DD MMM YYYY' },
                  { value: 'mm-dd-yyyy', label: 'MM/DD/YYYY' },
                  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="flex flex-col gap-2 pt-4">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-rose-500 px-4 sm:px-2">Danger Zone</h2>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4">
            <div>
              <p className="text-base font-medium text-rose-600 dark:text-rose-500">Delete Account</p>
              <p className="text-[13px] text-rose-600/70 dark:text-rose-400/70 mt-0.5 max-w-[300px] leading-snug">
                Once you delete your account, there is no going back. Proceed with absolute caution.
              </p>
            </div>
            <button 
              onClick={handleDeleteAccount} 
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors border border-rose-500/20 shrink-0"
            >
              <IconTrash size={16} /> Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} title="Edit Profile">
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Username</label>
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[14px]" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">About Me</label>
            <textarea 
              value={editAbout} 
              onChange={(e) => setEditAbout(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[14px] min-h-[120px] resize-none" 
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 text-[14px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleUpdateProfile} disabled={isUpdating} className="px-5 py-2.5 text-[14px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isChangingPassword} onClose={() => setIsChangingPassword(false)} title="Change Password">
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[14px]" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[14px]" 
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setIsChangingPassword(false)} className="px-5 py-2.5 text-[14px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleChangePassword} disabled={isUpdating} className="px-5 py-2.5 text-[14px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
}