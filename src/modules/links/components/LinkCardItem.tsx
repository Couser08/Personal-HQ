import React from 'react';
import { motion } from 'framer-motion';
import {
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandPinterest,
  IconLink,
  IconInfinity,
  IconClock,
  IconCheck,
  IconCopy,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { Badge } from '../../../components/ui/Badge';
import type { Link } from '../../../store/types';
import { getYouTubeId, getDomain } from '../utils/linkHelpers';

interface LinkCardItemProps {
  link: Link;
  copiedId: string | null;
  onSelect: (link: Link) => void;
  onCopy: (id: string, url: string, e: React.MouseEvent) => void;
  onEdit: (link: Link, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const LinkCardItem: React.FC<LinkCardItemProps> = ({
  link,
  copiedId,
  onSelect,
  onCopy,
  onEdit,
  onDelete,
}) => {
  const ytId = link.type === 'youtube' ? getYouTubeId(link.url) : null;
  const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const domain = getDomain(link.url);
  const isLongTerm = link.termType === 'long';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect(link)}
      className={`bg-surface/30 dark:bg-zinc-950/40 backdrop-blur-md border border-border/30 hover:border-border dark:border-zinc-900/60 dark:hover:border-zinc-800 p-5 rounded-[28px] flex flex-col gap-4 group transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 cursor-pointer relative overflow-hidden text-left ${
        link.type === 'youtube'
          ? 'hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.12)] hover:border-red-500/30'
          : link.type === 'instagram'
          ? 'hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.12)] hover:border-pink-500/30'
          : link.type === 'pinterest'
          ? 'hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.12)] hover:border-red-600/30'
          : 'hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.12)] hover:border-primary/20'
      }`}
    >
      {/* Platform visual or Thumbnail */}
      <div className="relative w-full h-34 rounded-[22px] overflow-hidden bg-stone-100 dark:bg-zinc-900/40 flex items-center justify-center shrink-0 border border-border/30 dark:border-zinc-900/40 shadow-inner">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt="Video Preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : link.type === 'instagram' ? (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
            <IconBrandInstagram className="w-10 h-10 stroke-[1.25] group-hover:scale-110 transition-transform duration-300" />
          </div>
        ) : link.type === 'pinterest' ? (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white">
            <IconBrandPinterest className="w-10 h-10 stroke-[1.25] group-hover:scale-110 transition-transform duration-300" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-850 to-zinc-950 flex items-center justify-center text-white">
            <IconLink className="w-10 h-10 stroke-[1.25] text-zinc-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Platform Brand Badge on visual */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white flex items-center gap-1.5 border border-white/10 shadow-sm z-10">
          {link.type === 'youtube' && <IconBrandYoutube size={12} className="text-red-500" />}
          {link.type === 'instagram' && <IconBrandInstagram size={12} className="text-pink-500" />}
          {link.type === 'pinterest' && <IconBrandPinterest size={12} className="text-red-600" />}
          {link.type === 'other' && <IconLink size={12} className="text-zinc-400" />}
          <span>{link.type === 'other' ? 'Web' : link.type}</span>
        </div>

        {/* Term type Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          {isLongTerm ? (
            <span className="flex items-center gap-1.5 px-3 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-full bg-emerald-500/90 text-white border border-emerald-400/20 shadow-md">
              <IconInfinity size={10} strokeWidth={3} /> Long Term
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-full bg-amber-500/95 text-stone-950 border border-amber-400/20 shadow-md">
              <IconClock size={10} strokeWidth={3} /> Temp
            </span>
          )}
        </div>
      </div>

      {/* Title & Domain info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-left">
        <h3
          className="font-extrabold text-[14px] leading-snug text-text-primary group-hover:text-primary transition-colors line-clamp-2"
          title={link.title}
        >
          {link.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold">
          <span className="truncate">{domain}</span>
          {link.savedAt && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-border/80" />
              <span>
                {new Date(link.savedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tags and actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30 dark:border-zinc-900 mt-auto">
        {/* Tags slice */}
        <div className="flex flex-wrap gap-1 max-w-[55%] overflow-hidden">
          {link.tags && link.tags.length > 0 ? (
            link.tags.slice(0, 2).map((t: string) => (
              <Badge
                key={t}
                className="text-[9px] py-0.5 px-2 bg-primary/5 text-primary border-none rounded-md font-semibold"
              >
                {t}
              </Badge>
            ))
          ) : (
            <span className="text-[9px] text-text-muted italic font-medium">No tags</span>
          )}
          {link.tags && link.tags.length > 2 && (
            <Badge className="text-[9px] py-0.5 px-2 bg-surface-alt text-text-muted border-none rounded-md font-semibold">
              +{link.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Actions on card */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => onCopy(link.id, link.url, e)}
            className="w-7.5 h-7.5 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent active:scale-90"
            title="Copy URL"
          >
            {copiedId === link.id ? (
              <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <IconCopy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={(e) => onEdit(link, e)}
            className="w-7.5 h-7.5 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent active:scale-90"
            title="Edit details"
          >
            <IconEdit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => onDelete(link.id, e)}
            className="w-7.5 h-7.5 rounded-xl flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent active:scale-90"
            title="Delete"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
