import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { supabase } from '../../lib/supabase';
import {
  IconUser, IconNotes, IconLink, IconBook, IconCalendarEvent,
  IconEdit, IconSettings, IconShieldLock, IconTrash, IconLock, IconCamera
} from '@tabler/icons-react';
import { Modal } from '../../components/ui/Modal';
import { CustomSelect } from '../../components/ui/CustomSelect';

const cardStyle = {
  background: 'var(--bg-surface)',
  borderRadius: 16,
  border: '1px solid var(--border-border)',
  padding: 24,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16
};


export default function ProfileModule() {
  const { user } = useAuthStore();
  const { notes, links, subjects, showConfirm } = useAppStore();
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
      // useAuthStore might need to refresh session, but onAuthStateChange should catch it.
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
      className="flex flex-col h-full gap-6 pb-20"
      style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Profile <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
        </h2>
        <p className="text-text-secondary text-sm">Manage your account and preferences</p>
      </div>

      {/* Top Banner (User Info + Stats) */}
      <div style={{ ...cardStyle, flexDirection: 'row', flexWrap: 'wrap', gap: 32, padding: 32 }}>
        {/* Left: User Avatar & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: '1 1 300px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: userAvatar ? `url(${userAvatar}) center/cover` : 'var(--border-border)',
              backgroundColor: !userAvatar ? '#f43f5e' : undefined,
              color: '#fff', fontSize: 36, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(244,63,94,0.25)'
            }}>
              {!userAvatar && userInitial}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg-surface)', border: '1px solid var(--border-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
              title="Upload Photo"
            >
              <IconCamera size={14} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{userName}</h3>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Stay organized, stay productive.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--text-muted)', fontSize: 12 }}>
              <IconUser size={14} /> {userEmail}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
              <IconCalendarEvent size={14} /> Joined on {joinDate}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: '1 1 300px', justifyContent: 'space-around', position: 'relative' }}>
          <div style={{ position: 'absolute', left: -16, top: 0, bottom: 0, width: 1, background: 'var(--border-border)' }} className="hidden md:block" />
          <button 
            onClick={() => setIsEditingProfile(true)}
            style={{ position: 'absolute', top: -16, right: -16, border: '1px solid var(--border-border)', background: 'var(--bg-background)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <IconEdit size={14} /> Edit Profile
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconNotes size={20} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalNotes}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Notes</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconLink size={20} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalLinks}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Links Saved</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconBook size={20} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totalSubjects}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Subjects</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* About Me */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUser size={16} />
              </div>
              About Me
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {userAbout}
            </p>
            <button 
              onClick={() => setIsEditingProfile(true)}
              style={{ alignSelf: 'flex-start', border: '1px solid var(--border-border)', background: 'var(--bg-background)', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <IconEdit size={14} /> Edit About
            </button>
          </div>

          {/* Account Information */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconShieldLock size={16} />
              </div>
              Account Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Username</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{userName.toLowerCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Email</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{userEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Member Since</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{joinDate}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsChangingPassword(true)}
              style={{ alignSelf: 'flex-start', marginTop: 8, border: '1px solid var(--border-border)', background: 'var(--bg-background)', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <IconLock size={14} /> Change Password
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Preferences */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconSettings size={16} />
              </div>
              Preferences
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Language</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Choose your preferred language</div>
                </div>
                <div style={{ width: 160 }}>
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
              <div style={{ height: 1, background: 'var(--border-border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Date Format</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Choose how dates are displayed</div>
                </div>
                <div style={{ width: 160 }}>
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
          </div>

          {/* Danger Zone */}
          <div style={{ ...cardStyle, padding: 20, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.02)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f43f5e' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconTrash size={16} />
              </div>
              Danger Zone
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Once you delete your account, there is no going back.
              </div>
              <button onClick={handleDeleteAccount} style={{ border: '1px solid #f43f5e', background: 'transparent', color: '#f43f5e', padding: '6px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconTrash size={14} /> Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} title="Edit Profile">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Username</label>
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">About Me</label>
            <textarea 
              value={editAbout} 
              onChange={(e) => setEditAbout(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm min-h-[100px]" 
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-sm font-medium hover:bg-surface-hover rounded-lg transition-colors">Cancel</button>
            <button onClick={handleUpdateProfile} disabled={isUpdating} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-muted transition-colors disabled:opacity-50">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isChangingPassword} onClose={() => setIsChangingPassword(false)} title="Change Password">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsChangingPassword(false)} className="px-4 py-2 text-sm font-medium hover:bg-surface-hover rounded-lg transition-colors">Cancel</button>
            <button onClick={handleChangePassword} disabled={isUpdating} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-muted transition-colors disabled:opacity-50">
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
}
