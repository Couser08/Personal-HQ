import React from 'react';
import {
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandPinterest,
  IconLink,
  IconExternalLink,
  IconInfinity,
  IconClock,
  IconEdit,
} from '@tabler/icons-react';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import type { Link } from '../../../store/types';
import { getYouTubeId } from '../utils/linkHelpers';

interface LinkDetailModalProps {
  link: Link | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEditModal: (link: Link, e?: React.MouseEvent) => void;
  deleteLink: (id: string) => Promise<void>;
  showConfirm: (title: string, msg: string, onConfirm: () => void) => void;
}

export const LinkDetailModal: React.FC<LinkDetailModalProps> = ({
  link,
  isOpen,
  onClose,
  onOpenEditModal,
  deleteLink,
  showConfirm,
}) => {
  if (!link) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={link.title || 'Link Information'}>
      <div className="flex flex-col gap-4 text-left">
        {/* Inline YouTube Player if URL is YouTube */}
        {link.type === 'youtube' && getYouTubeId(link.url) && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-border">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${getYouTubeId(link.url)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex flex-col gap-2 p-4 bg-surface-alt/60 rounded-2xl border border-border/40">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Direct Address
          </span>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-primary hover:underline break-all flex items-center gap-1.5"
          >
            {link.url}
            <IconExternalLink size={14} className="shrink-0" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Retention Type
            </span>
            <div className="mt-1">
              {link.termType === 'long' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                  <IconInfinity size={12} /> Long-Term Vault
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/25">
                  <IconClock size={12} /> Temporary Clip
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Platform Category
            </span>
            <span className="mt-1 text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-1">
              {link.type === 'youtube' && (
                <IconBrandYoutube size={15} className="text-red-500" />
              )}
              {link.type === 'instagram' && (
                <IconBrandInstagram size={15} className="text-pink-500" />
              )}
              {link.type === 'pinterest' && (
                <IconBrandPinterest size={15} className="text-red-600" />
              )}
              {link.type === 'other' && <IconLink size={15} className="text-zinc-400" />}
              {link.type === 'other' ? 'Web Link' : link.type}
            </span>
          </div>
        </div>

        {/* Tags section */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Attached Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(link.tags || []).map((t: string) => (
                <Badge key={t} variant="primary" className="text-[10px] font-bold py-0.5 px-2.5">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer action logs */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-[9px] font-bold text-text-muted">
            Saved on{' '}
            {new Date(link.savedAt || link.createdAt || Date.now()).toLocaleDateString(
              undefined,
              { month: 'long', day: 'numeric', year: 'numeric' },
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                const l = link;
                onClose();
                onOpenEditModal(l, e);
              }}
              className="btn btn-secondary btn-sm flex items-center gap-1"
            >
              <IconEdit size={14} /> Edit details
            </button>
            <button
              onClick={() => {
                const id = link.id;
                onClose();
                showConfirm('Delete Link', 'Delete this bookmark permanently?', () => {
                  void deleteLink(id);
                });
              }}
              className="px-4 py-2 text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none rounded-xl transition-all cursor-pointer"
            >
              Delete Link
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
