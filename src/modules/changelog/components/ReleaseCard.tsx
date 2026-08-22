import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import type { Release } from '../data/releases';
import { FeatureRow } from './FeatureRow';

interface ReleaseCardProps {
  release: Release;
  index: number;
  isLatest: boolean;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, index, isLatest }) => {
  const [expanded, setExpanded] = useState(isLatest);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex gap-4 md:gap-6"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0 pt-2">
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isLatest ? 'bg-text-primary' : 'bg-surface-alt border border-border-hairline'
          }`}
        />
        <div className="w-px flex-1 mt-3 bg-border-hairline" />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-12">
        <Card padding="md" className="group transition-shadow">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[16px] font-bold text-text-primary tracking-tight">
                  {release.version}
                </span>
                <span className="text-[13px] font-medium text-text-secondary">
                  {release.codename}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-alt text-text-muted font-medium">
                  {release.type.toUpperCase()}
                </span>
                {isLatest && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-highlight/10 text-accent-highlight">
                    LATEST
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 pt-0.5 text-text-muted">
                <span className="text-[12px]">{release.date}</span>
                {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </div>
            </div>
            <h2 className="text-[18px] font-semibold text-text-primary leading-snug mb-1">
              {release.headline}
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-3xl">
              {release.sub}
            </p>
          </button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mt-4 pt-4 border-t border-border-hairline overflow-hidden"
            >
              <div className="flex flex-col gap-6">
                {release.features.map((f, i) => (
                  <FeatureRow key={f.title} f={f} i={i} />
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};
