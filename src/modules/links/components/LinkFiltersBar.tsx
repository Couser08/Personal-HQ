import React from 'react';
import {
  IconSearch,
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandPinterest,
  IconLink,
} from '@tabler/icons-react';
import { Badge } from '../../../components/ui/Badge';

interface LinkFiltersBarProps {
  search: string;
  setSearch: (v: string) => void;
  selectedTerm: 'all' | 'short' | 'long';
  setSelectedTerm: (t: 'all' | 'short' | 'long') => void;
  selectedPlatform: 'all' | 'youtube' | 'instagram' | 'pinterest' | 'other';
  setSelectedPlatform: (p: 'all' | 'youtube' | 'instagram' | 'pinterest' | 'other') => void;
  allTags: string[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

export const LinkFiltersBar: React.FC<LinkFiltersBarProps> = ({
  search,
  setSearch,
  selectedTerm,
  setSelectedTerm,
  selectedPlatform,
  setSelectedPlatform,
  allTags,
  selectedTag,
  setSelectedTag,
}) => {
  return (
    <div className="flex flex-col gap-4 bg-surface-alt/40 border border-border/40 p-4.5 rounded-3xl text-left">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search box */}
        <div className="relative flex-1">
          <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            id="search-links"
            name="searchLinks"
            aria-label="Search links"
            type="search"
            placeholder="Search by title, domain, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 transition-all text-xs font-semibold"
          />
        </div>

        {/* Term Type pills */}
        <div className="flex bg-stone-100 dark:bg-stone-900/60 p-1.5 rounded-2xl border border-border/40 text-xs font-bold gap-1 shrink-0">
          {(
            [
              { id: 'all', label: 'All Terms' },
              { id: 'short', label: 'Short Term' },
              { id: 'long', label: 'Long Term' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTerm(t.id)}
              className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedTerm === t.id
                  ? 'bg-surface text-primary shadow-sm border border-border/30 font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase font-black tracking-widest text-text-muted mr-2">
          Platforms:
        </span>
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'youtube', label: 'YouTube', icon: IconBrandYoutube, color: 'text-red-500' },
            {
              id: 'instagram',
              label: 'Instagram',
              icon: IconBrandInstagram,
              color: 'text-pink-500',
            },
            { id: 'pinterest', label: 'Pinterest', icon: IconBrandPinterest, color: 'text-red-600' },
            { id: 'other', label: 'Web/Others', icon: IconLink, color: 'text-zinc-500' },
          ] as { id: string; label: string; icon?: any; color?: string }[]
        ).map((p) => {
          const Icon = p.icon;
          const active = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                  : 'bg-surface hover:bg-surface-hover border border-border/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              {Icon && <Icon size={14} className={p.color} />}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tags badges list */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/20">
          <span className="text-[10px] uppercase font-black tracking-widest text-text-muted mr-2">
            Tags:
          </span>
          <Badge
            variant={selectedTag === null ? 'primary' : 'default'}
            className="cursor-pointer font-bold text-[10px]"
            onClick={() => setSelectedTag(null)}
          >
            All Tags
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'primary' : 'default'}
              className="cursor-pointer font-bold text-[10px]"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
