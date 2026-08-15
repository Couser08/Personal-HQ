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
  IconShieldLock, IconTrash, IconLock, IconCamera,
  IconChevronRight, IconCheck, IconLoader2, IconPalette, IconVolume, IconBolt
} from '@tabler/icons-react';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { ListRow } from '../../components/ui/ListRow';
import { StatCard } from '../../components/ui/StatCard';

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
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="flex flex-col gap-10 w-full max-w-[800px] mx-auto pb-20 pt-6 px-4 md:px-8"
    >
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-text-primary">Profile</h1>
        <p className="text-sm font-medium text-text-secondary">Manage your account settings, preferences and security.</p>
      </header>

      {/* ── Main Profile Card ── */}
      <Card padding="lg" className="relative isolate overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-gradient-to-bl from-accent-identity/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar Group */}
          <div className="relative shrink-0">
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold bg-surface-alt text-text-secondary overflow-hidden border-4 border-surface"
              style={userAvatar ? { background: `url(${userAvatar}) center/cover` } : {}}
            >
              {!userAvatar && userInitial}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-surface-alt hover:bg-[#e8e8e8] dark:hover:bg-[#333] border-none flex items-center justify-center text-text-primary shadow-float cursor-pointer transition-colors"
              title="Upload Photo"
            >
              {isUpdating ? <IconLoader2 size={20} className="animate-spin" /> : <IconCamera size={20} stroke={1.75} />}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>
          
          {/* User Details */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 w-full pt-1">
            <h2 className="text-[24px] font-semibold text-text-primary mb-2">{userName}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[14px] text-text-secondary mb-5">
              <span className="flex items-center gap-1.5"><IconUser size={16} stroke={1.75} /> {userEmail}</span>
              <span className="flex items-center gap-1.5"><IconCalendarEvent size={16} stroke={1.75} /> Joined {joinDate}</span>
            </div>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="px-5 py-2.5 rounded-full bg-surface-alt text-text-primary text-[14px] font-semibold hover:bg-[#e8e8e8] dark:hover:bg-[#333] transition-colors cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-border-hairline my-8" />

        {/* About & Stats */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">About Me</h3>
            <p className="text-[14px] leading-relaxed text-text-secondary whitespace-pre-wrap">
              {userAbout}
            </p>
          </div>
          <div className="flex gap-4 md:flex-col md:w-32 shrink-0">
            <StatCard icon={<IconNotes size={20} stroke={1.75} />} value={totalNotes} label="Notes" />
            <StatCard icon={<IconLink size={20} stroke={1.75} />} value={totalLinks} label="Links" />
          </div>
        </div>
      </Card>

      {/* ── Grouped Lists ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Account & Security Group */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2">Account & Security</h2>
          <Card padding="none" className="flex flex-col overflow-hidden">
            <ListRow 
              icon={<IconShieldLock size={20} stroke={1.75} />}
              title="Account Email"
              subtitle={userEmail}
            />
            <div className="h-px w-full bg-border-hairline" />
            <ListRow 
              icon={<IconLock size={20} stroke={1.75} />}
              title="Change Password"
              subtitle="Update your security credentials"
              trailing={<IconChevronRight size={20} stroke={1.75} />}
              onClick={() => setIsChangingPassword(true)}
            />
          </Card>
        </section>

        {/* App Preferences Group */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2">App Preferences</h2>
          <Card padding="none" className="flex flex-col overflow-hidden">
            <ListRow 
              icon={<IconBolt size={20} stroke={1.75} />}
              title="Reduce Animations"
              subtitle="Minimize motion for performance"
              trailing={
                <button 
                  onClick={() => updateSettings({ reduceAnimations: !settings.reduceAnimations })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${settings.reduceAnimations ? 'bg-primary' : 'bg-text-tertiary'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform duration-150 ${settings.reduceAnimations ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              }
            />
            <div className="h-px w-full bg-border-hairline" />
            <ListRow 
              icon={<IconPalette size={20} stroke={1.75} />}
              title="Reduce Blur (Aura)"
              subtitle="Disable frosted glass effects"
              trailing={
                <button 
                  onClick={() => updateSettings({ reduceBlur: !settings.reduceBlur })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${settings.reduceBlur ? 'bg-primary' : 'bg-text-tertiary'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform duration-150 ${settings.reduceBlur ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              }
            />
            <div className="h-px w-full bg-border-hairline" />
            <ListRow 
              icon={<IconVolume size={20} stroke={1.75} />}
              title="App Sounds"
              subtitle="Play notification & timer sounds"
              trailing={
                <button 
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${settings.soundEnabled ? 'bg-primary' : 'bg-text-tertiary'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform duration-150 ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              }
            />
          </Card>
        </section>
      </div>

      {/* ── Danger Zone ── */}
      <section className="flex flex-col gap-3 mt-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-accent-danger ml-2">Danger Zone</h2>
        <Card padding="none" className="bg-transparent shadow-none border border-accent-danger/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6">
            <div>
              <p className="text-[16px] font-semibold text-accent-danger">Delete Account</p>
              <p className="text-[14px] text-text-secondary mt-1 max-w-sm leading-relaxed">
                Permanently remove your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button 
              onClick={handleDeleteAccount} 
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-accent-danger text-accent-danger hover:bg-accent-danger hover:text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
            >
              <IconTrash size={18} stroke={1.75} /> Delete Account
            </button>
          </div>
        </Card>
      </section>

      {/* ── Modals ── */}
      <AnimatePresence>
        {isEditingProfile && (
          <Modal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} title="Edit Profile">
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">Display Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-sunken border-none rounded-[var(--radius-input)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-border-focus text-[16px] font-semibold text-text-primary transition-shadow" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">About Me</label>
                <textarea 
                  value={editAbout} 
                  onChange={(e) => setEditAbout(e.target.value)}
                  className="w-full bg-surface-sunken border-none rounded-[var(--radius-input)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-border-focus text-[14px] text-text-primary min-h-[140px] resize-none transition-shadow" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 text-[14px] font-semibold text-text-secondary hover:bg-surface-alt rounded-full transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleUpdateProfile} disabled={isUpdating} className="px-5 py-2.5 text-[14px] font-semibold bg-primary text-text-on-accent rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {isUpdating ? <IconLoader2 size={18} stroke={1.75} className="animate-spin" /> : <IconCheck size={18} stroke={1.75} />}
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
                <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-sunken border-none rounded-[var(--radius-input)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-border-focus text-[16px] font-semibold text-text-primary transition-shadow" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-sunken border-none rounded-[var(--radius-input)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-border-focus text-[16px] font-semibold text-text-primary transition-shadow" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsChangingPassword(false)} className="px-5 py-2.5 text-[14px] font-semibold text-text-secondary hover:bg-surface-alt rounded-full transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleChangePassword} disabled={isUpdating} className="px-5 py-2.5 text-[14px] font-semibold bg-primary text-text-on-accent rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {isUpdating ? <IconLoader2 size={18} stroke={1.75} className="animate-spin" /> : <IconShieldLock size={18} stroke={1.75} />}
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