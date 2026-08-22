/**
 * ChangelogModule — A dedicated, navigable changelog page.
 *
 * Accessible via the sidebar ("What's New" / changelog link).
 * Displays all releases in a vertical timeline.
 *
 * Design: Minimal-Premium. Soft canvas, floating cards, disciplined accents.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconRocket,
  IconStar,
  IconSparkles,
} from '@tabler/icons-react';
import { StatCard } from '../../components/ui/StatCard';
import { RELEASES } from './data/releases';
import { ReleaseCard } from './components/ReleaseCard';

type TabFilter = 'all' | 'new' | 'updates' | 'fixes';

export default function ChangelogModule() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredReleases = RELEASES.map((r) => {
    let filteredFeatures = r.features;
    if (activeTab === 'new') {
      filteredFeatures = r.features.filter((f) => f.badge === 'New');
    } else if (activeTab === 'updates') {
      filteredFeatures = r.features.filter(
        (f) => !f.badge || f.badge === 'Upgraded' || f.badge === 'Improved',
      );
    } else if (activeTab === 'fixes') {
      filteredFeatures = r.features.filter((f) => f.badge === 'Fixed');
    }
    return { ...r, features: filteredFeatures };
  }).filter((r) => r.features.length > 0);

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      {/* Flat Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg border border-border bg-surface flex items-center justify-center">
            <IconRocket size={24} className="text-text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Changelog</h1>
            <p className="text-sm text-text-secondary mt-1">Personal HQ · Release History</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { value: RELEASES.length, label: 'Releases', Icon: IconStar },
            {
              value: RELEASES.filter((r) => r.type === 'major').length,
              label: 'Major Updates',
              Icon: IconRocket,
            },
            {
              value: RELEASES.reduce((a, r) => a + r.features.length, 0),
              label: 'Features Shipped',
              Icon: IconSparkles,
            },
          ].map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={<s.Icon size={18} />} />
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-border-hairline pb-4 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: 'All Changes' },
          { id: 'new', label: 'New Features' },
          { id: 'updates', label: 'Updates & Improvements' },
          { id: 'fixes', label: 'Bug Fixes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabFilter)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-text-primary text-surface'
                : 'bg-surface-alt text-text-secondary hover:bg-surface-alt/70 hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flat Timeline */}
      <div>
        {filteredReleases.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            No changes found for this category.
          </div>
        ) : (
          filteredReleases.map((r, i) => (
            <ReleaseCard
              key={r.version}
              release={r}
              index={i}
              isLatest={i === 0 && activeTab === 'all'}
            />
          ))
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="text-center py-12 text-sm text-text-muted border-t border-border mt-8"
      >
        Personal HQ · Minimal Edition
      </motion.div>
    </div>
  );
}
