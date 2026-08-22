import React from 'react';
import {
  IconPhoto,
  IconUpload,
  IconTrash,
  IconDeviceGamepad2,
  IconMovie,
} from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';

interface AdminAssetsTabProps {
  dashPreview: string;
  setDashPreview: (v: string) => void;
  mascotPreview: string;
  setMascotPreview: (v: string) => void;
  bannerPreview: string;
  setBannerPreview: (v: string) => void;
  dashUploading: boolean;
  mascotUploading: boolean;
  bannerUploading: boolean;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>, path: string) => void;
  handleReset: (path: string) => void;
}

export const AdminAssetsTab: React.FC<AdminAssetsTabProps> = ({
  dashPreview,
  setDashPreview,
  mascotPreview,
  setMascotPreview,
  bannerPreview,
  setBannerPreview,
  dashUploading,
  mascotUploading,
  bannerUploading,
  handleUpload,
  handleReset,
}) => {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Section 1: Dashboard Illustration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full border-b border-border-hairline pb-8">
        <Card padding="lg" className="flex flex-col gap-5">
          <div>
            <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
              <IconPhoto className="w-4 h-4 text-primary" /> Dashboard Illustration
            </h3>
            <p className="text-[13px] text-text-secondary mt-1">
              Upload an image file to replace the hero illustration on the dashboard.
            </p>
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
                <span className="text-xs font-bold text-text-secondary animate-pulse">
                  Uploading asset...
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <IconUpload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-text-primary block">
                    Click to select image
                  </span>
                  <span className="text-[10px] text-text-muted mt-1 block">
                    Supports PNG, JPG, WebP, SVG
                  </span>
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
        </Card>

        <Card padding="lg" className="flex flex-col gap-4">
          <h3 className="text-[16px] font-semibold text-text-primary">
            Current Illustration Preview
          </h3>
          <div className="flex-grow bg-surface-alt/30 border border-border-alt/40 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
            {dashPreview ? (
              <img
                src={dashPreview}
                alt="Dashboard Preview"
                className="max-h-48 object-contain filter drop-shadow-lg"
                onError={() => setDashPreview('')}
              />
            ) : (
              <div className="text-center text-text-muted">
                <span className="text-xs font-medium italic">No custom illustration uploaded.</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Section 2: Media Log Review Mascot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full border-b border-border-hairline pb-8">
        <Card padding="lg" className="flex flex-col gap-5">
          <div>
            <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
              <IconDeviceGamepad2 className="w-4 h-4 text-primary" /> Media Review Mascot
            </h3>
            <p className="text-[13px] text-text-secondary mt-1">
              Upload a custom chibi mascot image for the Media Log.
            </p>
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
                <span className="text-xs font-bold text-text-secondary animate-pulse">
                  Uploading mascot...
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <IconUpload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-text-primary block">
                    Click to select image
                  </span>
                  <span className="text-[10px] text-text-muted mt-1 block">
                    Supports PNG, JPG, WebP, SVG
                  </span>
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
        </Card>

        <Card padding="lg" className="flex flex-col gap-4">
          <h3 className="text-[16px] font-semibold text-text-primary">Current Mascot Preview</h3>
          <div className="flex-grow bg-surface-alt/30 border border-border-alt/40 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
            {mascotPreview ? (
              <img
                src={mascotPreview}
                alt="Mascot Preview"
                className="max-h-48 object-contain filter drop-shadow-lg"
                onError={() => setMascotPreview('')}
              />
            ) : (
              <div className="text-center text-text-muted">
                <span className="text-xs font-medium italic">No custom mascot uploaded.</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Section 3: Anime Review Center Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-8">
        <Card padding="lg" className="flex flex-col gap-5">
          <div>
            <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
              <IconMovie className="w-4 h-4 text-primary" /> Anime Review Banner
            </h3>
            <p className="text-[13px] text-text-secondary mt-1">
              Upload a widescreen banner image for the Anime Review header.
            </p>
          </div>

          <label className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-surface-alt/20 hover:bg-surface-alt/40 relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'global/anime_review_banner.png')}
              className="hidden"
              disabled={bannerUploading}
            />
            {bannerUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <span className="text-xs font-bold text-text-secondary animate-pulse">
                  Uploading banner...
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <IconUpload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-text-primary block">
                    Click to select banner
                  </span>
                  <span className="text-[10px] text-text-muted mt-1 block">
                    Supports PNG, JPG, WebP, SVG
                  </span>
                </div>
              </>
            )}
          </label>

          {bannerPreview && (
            <button
              onClick={() => handleReset('global/anime_review_banner.png')}
              className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 w-full mt-2"
            >
              <IconTrash className="w-4 h-4" /> Reset to Default Banner
            </button>
          )}
        </Card>

        <Card padding="lg" className="flex flex-col gap-4">
          <h3 className="text-[16px] font-semibold text-text-primary">Current Banner Preview</h3>
          <div className="flex-grow bg-surface-alt/30 border border-border-alt/40 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Anime Review Banner Preview"
                className="max-w-full max-h-48 object-cover rounded-2xl border border-border/30 shadow-md"
                onError={() => setBannerPreview('')}
              />
            ) : (
              <div className="text-center text-text-muted">
                <span className="text-xs font-medium italic">No custom banner uploaded.</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
