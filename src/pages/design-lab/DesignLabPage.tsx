import React, { useState } from 'react';
import { VariantA } from './variants/VariantA';
import { VariantB } from './variants/VariantB';
import { VariantC } from './variants/VariantC';
import { VariantD } from './variants/VariantD';
import { VariantE } from './variants/VariantE';
import { FeedbackOverlay } from './FeedbackOverlay';
import { IconLayoutGrid, IconLayout, IconInfoCircle } from '@tabler/icons-react';

export const DesignLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [viewMode, setViewMode] = useState<'tabs' | 'grid'>('tabs');

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col p-6 lg:p-10 font-sans antialiased text-left selection:bg-rose-500/30 overflow-y-auto">
      
      {/* ─── Lab Header ─── */}
      <header className="max-w-6xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-zinc-800/80 pb-6 mb-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Design Variations Lab
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Library Dashboard Redesign</h1>
          <p className="text-xs text-zinc-400">Review 5 distinct visual axes, leave interactive comments, and select a direction.</p>
        </div>

        {/* View Mode toggler */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('tabs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none transition-all ${
                viewMode === 'tabs' ? 'bg-rose-500/10 text-rose-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <IconLayout size={14} /> Tabs Review
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none transition-all ${
                viewMode === 'grid' ? 'bg-rose-500/10 text-rose-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <IconLayoutGrid size={14} /> Compare Grid
            </button>
          </div>
        </div>
      </header>

      {/* ─── Design Brief Summary Banner ─── */}
      <section className="max-w-6xl mx-auto w-full mb-8 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start">
        <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
          <IconInfoCircle size={20} />
        </div>
        <div className="flex-1 flex flex-col gap-1 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Redesign Brief & Requirements</h4>
          <p className="text-zinc-400 leading-relaxed mt-1">
            **Target:** `LibraryDashboard.tsx` — **User Intent:** Save and review books they read.  
            **Design Adjectives:** *Minimal & Premium* — **Density:** *Comfortable* (balanced spacing).  
            **Mandatory elements:** Keep search filters, favorites indicators, pages count, progress bar, and "Add Book" modal.
          </p>
        </div>
      </section>

      {/* ─── Tabs Review Layout ─── */}
      {viewMode === 'tabs' ? (
        <main className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-3">
            {[
              { id: 'A', label: 'Axis A: Hierarchy Focus', desc: 'Stripe Clean' },
              { id: 'B', label: 'Axis B: Layout Model', desc: 'Split Pane' },
              { id: 'C', label: 'Axis C: Density Focus', desc: 'Compact list' },
              { id: 'D', label: 'Axis D: In-Place Edits', desc: 'Accordion disclosure' },
              { id: 'E', label: 'Axis E: Aura Glass', desc: 'Premium Material' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border flex flex-col text-left ${
                  activeTab === tab.id
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[9px] font-medium opacity-60 mt-0.5">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Render Active Variant */}
          <div className="w-full mt-4">
            {activeTab === 'A' && <div data-variant="A"><VariantA /></div>}
            {activeTab === 'B' && <div data-variant="B"><VariantB /></div>}
            {activeTab === 'C' && <div data-variant="C"><VariantC /></div>}
            {activeTab === 'D' && <div data-variant="D"><VariantD /></div>}
            {activeTab === 'E' && <div data-variant="E"><VariantE /></div>}
          </div>
        </main>
      ) : (
        /* ─── Grid Comparison Layout ─── */
        <main className="max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div data-variant="A" className="flex flex-col h-full"><VariantA /></div>
          <div data-variant="B" className="flex flex-col h-full"><VariantB /></div>
          <div data-variant="C" className="flex flex-col h-full"><VariantC /></div>
          <div data-variant="D" className="flex flex-col h-full"><VariantD /></div>
          <div data-variant="E" className="flex flex-col h-full col-span-1 xl:col-span-2"><VariantE /></div>
        </main>
      )}

      {/* Floating Interactive Commenter Widget */}
      <FeedbackOverlay targetName="LibraryDashboard" />

    </div>
  );
};

export default DesignLabPage;
