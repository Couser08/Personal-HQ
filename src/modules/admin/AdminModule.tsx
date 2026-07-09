import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { IconUpload, IconPhoto, IconTrash, IconLock, IconShieldCheck, IconDeviceGamepad2 } from '@tabler/icons-react';
import { useToastStore } from '../../store/useToastStore';

export default function AdminModule() {
  const { user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const [dashPreview, setDashPreview] = useState<string>('');
  const [mascotPreview, setMascotPreview] = useState<string>('');
  const [dashUploading, setDashUploading] = useState(false);
  const [mascotUploading, setMascotUploading] = useState(false);

  const isAdmin = user?.email === 'tungariyarahul08@gmail.com';

  const loadAssets = () => {
    const dashUrl = supabase.storage.from('avatars').getPublicUrl('global/dashboard_illustration.png').data.publicUrl;
    const mascotUrl = supabase.storage.from('avatars').getPublicUrl('global/media_chibi_mascot.png').data.publicUrl;
    setDashPreview(`${dashUrl}?t=${Date.now()}`);
    setMascotPreview(`${mascotUrl}?t=${Date.now()}`);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAssets();
    }
  }, [isAdmin]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid File', 'Please select an image file.', 'warning');
      return;
    }

    const isDash = path === 'global/dashboard_illustration.png';
    if (isDash) setDashUploading(true);
    else setMascotUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          cacheControl: '0', // no caching for instant update
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      addToast('Upload Success', `${isDash ? 'Dashboard illustration' : 'Chibi mascot'} updated successfully.`, 'success');
      loadAssets();
      // Dispatch events to let modules know they need to refresh
      window.dispatchEvent(new CustomEvent(isDash ? 'dashboard-illustration-updated' : 'media-mascot-updated'));
    } catch (err: any) {
      addToast('Upload Failed', err.message || 'An error occurred during upload.', 'error');
    } finally {
      if (isDash) setDashUploading(false);
      else setMascotUploading(false);
    }
  };

  const handleReset = async (path: string) => {
    const isDash = path === 'global/dashboard_illustration.png';
    try {
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([path]);

      if (deleteError) {
        throw deleteError;
      }

      addToast('Reset Success', `${isDash ? 'Dashboard illustration' : 'Chibi mascot'} reset to default.`, 'success');
      loadAssets();
      window.dispatchEvent(new CustomEvent(isDash ? 'dashboard-illustration-updated' : 'media-mascot-updated'));
    } catch (err: any) {
      addToast('Reset Failed', err.message || 'An error occurred during reset.', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center bg-surface border border-border rounded-3xl max-w-lg mx-auto mt-16 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/10">
          <IconLock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Access Denied</h2>
        <p className="text-sm text-text-secondary max-w-sm">This section is restricted to administrators. Only authorized personnel can access these controls.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-24 px-4 md:px-8 text-left antialiased">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15">
            <IconShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">Admin Control Center</h1>
            <p className="text-xs text-text-secondary">Manage global application assets and settings security</p>
          </div>
        </div>
      </div>

      {/* Grid of Manageable Assets */}
      <div className="flex flex-col gap-8 w-full">
        
        {/* Section 1: Dashboard Illustration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full border-b border-border pb-8">
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <IconPhoto className="w-4 h-4 text-primary" /> Dashboard Illustration
              </h3>
              <p className="text-xs text-text-secondary mt-1">Upload an image file (preferably transparent background) to replace the main hero illustration on the dashboard.</p>
            </div>

            <label className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-surface-alt/20 hover:bg-surface-alt/40 relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleUpload(e, 'global/dashboard_illustration.png')} 
                className="hidden" 
                disabled={dashUploading} 
              />
              {dashUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <span className="text-xs font-bold text-text-secondary animate-pulse">Uploading asset...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <IconUpload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-text-primary block">Click to select image</span>
                    <span className="text-[10px] text-text-muted mt-1 block">Supports PNG, JPG, WebP, SVG</span>
                  </div>
                </>
              )}
            </label>

            {dashPreview && (
              <button
                onClick={() => handleReset('global/dashboard_illustration.png')}
                className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 w-full mt-2"
              >
                <IconTrash className="w-4 h-4" /> Reset to Default Illustration
              </button>
            )}
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary">Current Illustration Preview</h3>
            <div className="flex-grow bg-surface-alt/30 border border-border/40 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
              {dashPreview ? (
                <img 
                  src={dashPreview} 
                  alt="Dashboard Preview" 
                  className="max-h-48 object-contain filter drop-shadow-lg"
                  onError={() => setDashPreview('')}
                />
              ) : (
                <div className="text-center text-text-muted">
                  <span className="text-xs font-medium italic">No custom illustration uploaded. Render fallback `/study_illustration.png`.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Media Log Review Mascot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-8">
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <IconDeviceGamepad2 className="w-4 h-4 text-primary" /> Media Review Mascot
              </h3>
              <p className="text-xs text-text-secondary mt-1">Upload a custom chibi mascot image to display next to the Review & Notes text area inside the Media Log.</p>
            </div>

            <label className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-surface-alt/20 hover:bg-surface-alt/40 relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleUpload(e, 'global/media_chibi_mascot.png')} 
                className="hidden" 
                disabled={mascotUploading} 
              />
              {mascotUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <span className="text-xs font-bold text-text-secondary animate-pulse">Uploading mascot...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <IconUpload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-text-primary block">Click to select mascot</span>
                    <span className="text-[10px] text-text-muted mt-1 block">Supports PNG, JPG, WebP, SVG</span>
                  </div>
                </>
              )}
            </label>

            {mascotPreview && (
              <button
                onClick={() => handleReset('global/media_chibi_mascot.png')}
                className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 w-full mt-2"
              >
                <IconTrash className="w-4 h-4" /> Reset to Default Mascot
              </button>
            )}
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary">Current Mascot Preview</h3>
            <div className="flex-grow bg-surface-alt/30 border border-border/40 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
              {mascotPreview ? (
                <img 
                  src={mascotPreview} 
                  alt="Mascot Preview" 
                  className="max-h-48 object-contain filter drop-shadow-lg"
                  onError={() => setMascotPreview('')}
                />
              ) : (
                <div className="text-center text-text-muted">
                  <span className="text-xs font-medium italic">No custom mascot uploaded. Render fallback `/anime_chibi_mascot_1783275415079.png`.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
