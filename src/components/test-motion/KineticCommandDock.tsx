import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useActivePreset } from './useMotionTestStore';
import { 
  IconNotes, 
  IconChecklist, 
  IconCalendar, 
  IconTarget, 
  IconBookmarks, 
  IconDeviceTv, 
  IconBrain,
  IconPlus
} from '@tabler/icons-react';
import { useToastStore } from '../../store/useToastStore';

interface DockItem {
  id: string;
  title: string;
  icon: any;
  color: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'todo', title: 'Task Matrix', icon: IconChecklist, color: '#3B82F6' },
  { id: 'notes', title: 'Markdown Doc', icon: IconNotes, color: '#10B981' },
  { id: 'calendar', title: 'Schedule', icon: IconCalendar, color: '#F59E0B' },
  { id: 'vision', title: 'Vision Board', icon: IconTarget, color: '#8B5CF6' },
  { id: 'links', title: 'Link Vault', icon: IconBookmarks, color: '#EC4899' },
  { id: 'media', title: 'Media Vault', icon: IconDeviceTv, color: '#06B6D4' },
  { id: 'ai', title: 'AI Assistant', icon: IconBrain, color: '#FF7A45' },
];

export function KineticCommandDock() {
  const preset = useActivePreset();
  const addToast = useToastStore((s) => s.addToast);
  const dockRef = useRef<HTMLDivElement>(null);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string>('todo');

  const handleTriggerAction = (item: DockItem) => {
    setActiveItemId(item.id);
    addToast('Quick Action', `Triggered ${item.title}`, 'info');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          3. Kinetic Magnetic Action Dock
        </h3>
        <span className="text-[10px] font-mono text-text-muted">
          {preset.enableParallax ? 'Magnetic Magnification' : preset.mode === 'performance' ? 'Direct Scale (GPU)' : 'Static Dock'}
        </span>
      </div>

      <div className="w-full bg-surface border border-border rounded-3xl p-6 shadow-float flex flex-col items-center justify-center gap-6">
        <p className="text-xs text-text-secondary text-center max-w-md">
          Hover over dock icons to test spring curvature and velocity response across different motion presets.
        </p>

        {/* Magnetic Dock Container */}
        <div
          ref={dockRef}
          onMouseLeave={() => setHoveredIdx(null)}
          className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-colors select-none ${
            preset.enableBlur
              ? 'bg-surface-alt/70 backdrop-blur-xl border-border shadow-md'
              : 'bg-surface-alt border-border'
          }`}
        >
          {DOCK_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeItemId === item.id;

            // Calculate magnetic scale based on distance to hovered item
            let scale = 1;
            if (preset.enableParallax && hoveredIdx !== null) {
              const distance = Math.abs(hoveredIdx - idx);
              if (distance === 0) scale = 1.35;
              else if (distance === 1) scale = 1.18;
              else if (distance === 2) scale = 1.06;
            } else if (preset.mode === 'performance' && hoveredIdx === idx) {
              scale = 1.2;
            }

            return (
              <motion.button
                key={item.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={() => handleTriggerAction(item)}
                animate={{
                  scale: preset.reducedMotion ? 1 : scale,
                  y: preset.enableParallax && hoveredIdx === idx ? -6 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: preset.springStiffness,
                  damping: preset.springDamping,
                }}
                style={{ willChange: 'transform' }}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-surface text-primary shadow-sm border border-border'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'
                }`}
                title={item.title}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform"
                  style={{ color: item.color }}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>

                {/* Active Indicator Dot */}
                {isSelected && (
                  <motion.div
                    layoutId="activeDockDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}

          <div className="w-px h-6 bg-border mx-1" />

          {/* New Item Action Button */}
          <button
            onClick={() => addToast('Quick Create', 'Opened item creation modal', 'info')}
            className="w-10 h-10 rounded-xl bg-primary text-text-on-accent flex items-center justify-center cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-sm shrink-0"
            title="Create Anything"
          >
            <IconPlus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Selected Dock Item Preview Bar */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-alt border border-border text-xs font-semibold text-text-secondary">
          <span>Active Command:</span>
          <span className="text-text-primary font-bold">
            {DOCK_ITEMS.find((d) => d.id === activeItemId)?.title}
          </span>
        </div>
      </div>
    </div>
  );
}
