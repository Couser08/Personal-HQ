import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { supabase } from '../../lib/supabase';
import { compressAndConvertToWebP } from '../../utils/imageOptimizer';
import {
  IconUser, IconNotes, IconLink, IconCalendarEvent,
  IconSettings, IconShieldLock, IconTrash, IconLock, IconCamera,
  IconChevronRight, IconCheck, IconX, IconLoader2, IconPalette, IconVolume, IconBolt
} from '@tabler/icons-react';
import { Modal } from '../../components/ui/Modal';
import { CustomSelect } from '../../components/ui/CustomSelect';

export default function ProfileModule() {
  const { user } = useAuthStore();
  const { notes, links, showConfirm, settings, updateSettings } = useAppStore(useShallow(state => ({
    notes: state.notes,
    links: state.links,
    showConfirm: state.showConfirm,
    settings: state.settings,
    updateSettings: state.updateSettings
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
    let optimizedFile: Blob | File = file;
    let extension = 'webp';
    try {
      optimizedFile = await compressAndConvertToWebP(file, 300, 0.85);
    } catch (e) {
      console.warn('[ProfileModule] Client-side image compression failed:', e);
      extension = file.name.split('.').pop() || 'png';
    }

    const dotIndex = file.name.lastIndexOf('.');
    const rawSafeName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
    const safeName = rawSafeName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = user.id + '/' + Date.now() + '-' + safeName + '.' + extension;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, optimizedFile, { 
        cacheControl: '31536000', 
        upsert: true,
        contentType: extension === 'webp' ? 'image/webp' : file.type
      });

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
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="flex flex-col gap-10 w-full max-w-[800px] mx-auto pb-20 pt-6 px-4 md:px-8"
    >
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-[-0.02em] text-zinc-900 dark:text-white">Profile</h1>
        <p className="text-zinc-500 text-sm font-medium tracking-wide">Manage your account settings, preferences and security.</p>
      </header>

      {/* ── Premium Identity Card (Aura Glass) ── */}
      <section className="bg-surface/60 backdrop-blur-2xl border border-border/60 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-8 relative isolate">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar Group */}
          <div className="relative group shrink-0">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-xl bg-zinc-100 dark:bg-zinc-800 border-[3px] border-white dark:border-zinc-700/80 overflow-hidden relative"
              style={{
                background: userAvatar ? `url(${userAvatar}) center/cover` : 'var(--color-primary)',
                color: '#fff',
              }}
            >
              {!userAvatar && userInitial}
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              title="Upload Photo"
            >
              {isUpdating ? <IconLoader2 size={18} className="animate-spin" /> : <IconCamera size={18} />}
            </motion.button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>
          
          {/* User Details */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 w-full pt-1">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">{userName}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[14px] font-medium text-zinc-500 mb-5">
              <span className="flex items-center gap-1.5"><IconUser size={16} className="text-zinc-400" /> {userEmail}</span>
              <span className="flex items-center gap-1.5"><IconCalendarEvent size={16} className="text-zinc-400" /> Joined {joinDate}</span>
            </div>
            <motion.button 
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsEditingProfile(true)}
              className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </motion.button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-border/50 my-8" />

        {/* About & Stats */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">About Me</h3>
            <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {userAbout}
            </p>
          </div>
          <div className="flex gap-4 md:flex-col md:w-32 shrink-0">
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalNotes}</span>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Notes</span>
            </div>
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalLinks}</span>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Links</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grouped Lists: Apple Style ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Account & Security Group */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Account & Security</h2>
          <div className="bg-surface/80 backdrop-blur-md border border-border/60 rounded-[24px] overflow-hidden shadow-sm flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <IconShieldLock className="w-5 h-5" stroke={2} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-white">Account Email</p>
                  <p className="text-[13px] text-zinc-500 font-medium mt-0.5">{userEmail}</p>
                </div>
              </div>
            </div>

            <motion.button 
              whileTap={{ backgroundColor: 'var(--bg-surface-hover)' }}
              onClick={() => setIsChangingPassword(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                  <IconLock className="w-5 h-5" stroke={2} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-white">Change Password</p>
                  <p className="text-[13px] text-zinc-500 font-medium mt-0.5">Update your security credentials</p>
                </div>
              </div>
              <IconChevronRight className="w-5 h-5 text-zinc-400" />
            </motion.button>
          </div>
        </section>

        {/* App Preferences Group */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 ml-4">App Preferences</h2>
          <div className="bg-surface/80 backdrop-blur-md border border-border/60 rounded-[24px] overflow-hidden shadow-sm flex flex-col">
            
            {/* Reduce Animations */}
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <IconBolt className="w-5 h-5" stroke={2} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-white">Reduce Animations</p>
                  <p className="text-[13px] text-zinc-500 font-medium mt-0.5">Minimize motion for performance</p>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ reduceAnimations: !settings.reduceAnimations })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.reduceAnimations ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.reduceAnimations ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Reduce Blur */}
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <IconPalette className="w-5 h-5" stroke={2} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-white">Reduce Blur (Aura)</p>
                  <p className="text-[13px] text-zinc-500 font-medium mt-0.5">Disable frosted glass effects</p>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ reduceBlur: !settings.reduceBlur })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.reduceBlur ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.reduceBlur ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Sound Enabled */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <IconVolume className="w-5 h-5" stroke={2} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-white">App Sounds</p>
                  <p className="text-[13px] text-zinc-500 font-medium mt-0.5">Play notification & timer sounds</p>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.soundEnabled ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

          </div>
        </section>
      </div>

      {/* ── Danger Zone ── */}
      <section className="flex flex-col gap-3 mt-4">
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-rose-500 ml-4">Danger Zone</h2>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-[24px] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6">
            <div>
              <p className="text-[15px] font-bold text-rose-600 dark:text-rose-500">Delete Account</p>
              <p className="text-[13px] text-rose-600/70 dark:text-rose-400/70 font-medium mt-1 max-w-sm leading-relaxed">
                Permanently remove your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.97 }}
              onClick={handleDeleteAccount} 
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              <IconTrash size={18} /> Delete Account
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Modals ── */}
      <AnimatePresence>
        {isEditingProfile && (
          <Modal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} title="Edit Profile">
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px] font-medium transition-shadow" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-wider text-zinc-500">About Me</label>
                <textarea 
                  value={editAbout} 
                  onChange={(e) => setEditAbout(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px] font-medium min-h-[140px] resize-none transition-shadow" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsEditingProfile(false)} className="px-6 py-3 text-[14px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleUpdateProfile} disabled={isUpdating} className="px-6 py-3 text-[14px] font-bold bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-md flex items-center gap-2">
                  {isUpdating ? <IconLoader2 size={16} className="animate-spin" /> : <IconCheck size={16} />}
                  {isUpdating ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {isChangingPassword && (
          <Modal isOpen={isChangingPassword} onClose={() => setIsChangingPassword(false)} title="Change Password">
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-wider text-zinc-500">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px] font-medium transition-shadow" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-wider text-zinc-500">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px] font-medium transition-shadow" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsChangingPassword(false)} className="px-6 py-3 text-[14px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleChangePassword} disabled={isUpdating} className="px-6 py-3 text-[14px] font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md flex items-center gap-2">
                  {isUpdating ? <IconLoader2 size={16} className="animate-spin" /> : <IconShieldLock size={16} />}
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}