import { useState } from 'react';
import LinksModule from '../links/LinksModule';
import LinkSaverModule from '../linksaver/LinkSaverModule';
import TagsModule from '../tags/TagsModule';
import CalculatorModule from '../calculator/CalculatorModule';
import CountdownModule from '../countdowns/CountdownModule';
import { IconLink, IconCalculator, IconHourglassEmpty, IconClipboardText, IconTag } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UtilitiesModule() {
  const [currentTab, setCurrentTab] = useState<'links' | 'linksaver' | 'tags' | 'calculator' | 'countdown'>('links');

  const tabs = [
    { id: 'links', label: 'Link Vault', icon: IconLink, component: <LinksModule /> },
    { id: 'linksaver', label: 'Link Saver', icon: IconClipboardText, component: <LinkSaverModule /> },
    { id: 'tags', label: 'Tags Manager', icon: IconTag, component: <TagsModule /> },
    { id: 'calculator', label: 'Interest Calc', icon: IconCalculator, component: <CalculatorModule /> },
    { id: 'countdown', label: 'Countdown', icon: IconHourglassEmpty, component: <CountdownModule /> },
  ] as const;

  const activeTabObj = tabs.find(t => t.id === currentTab) || tabs[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Premium Apple-style Segmented Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Utility Workspace
          </h1>
          <p className="text-text-secondary text-xs mt-1">Access calculator, link vault, temp link saver, and timers in one place.</p>
        </div>

        {/* Segmented Tab Swapper */}
        <div className="flex bg-stone-100 dark:bg-stone-900/60 p-1.5 rounded-2xl border border-border/40 shadow-sm shrink-0 self-start md:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-utility-tab"
                    style={{ willChange: 'transform, opacity' }}
                    className="absolute inset-0 bg-surface rounded-xl border border-border/60 shadow-sm z-0"
                    transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                  />
                )}
                <Icon size={15} className="relative z-10 shrink-0" />
                <span className="relative z-10 white-space-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Module Container with Slide Animation */}
      <div className="relative w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabObj.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="w-full"
          >
            {activeTabObj.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
