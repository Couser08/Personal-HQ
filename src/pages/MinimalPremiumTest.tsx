import {
  IconUser,
  IconSettings,
  IconShieldLock,
  IconBell,
  IconChevronRight,
  IconCheck,
  IconDots,
  IconCircleCheck,
  IconBook2,
  IconMicrophone,
  IconPaperclip,
  IconFlame,
  IconWallet,
  IconCalendarEvent,
  IconBug
} from '@tabler/icons-react';

import { Card } from '../components/ui/Card';
import { ListRow } from '../components/ui/ListRow';
import { StatCard } from '../components/ui/StatCard';
import { useBugReportStore } from '../store/useBugReportStore';

const MinimalPremiumTest = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary p-4 sm:p-8 font-sans minimal-premium antialiased pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Design System Test</h1>
            <p className="text-text-secondary">Minimal-Premium Layout (Soft Canvas + Floating Cards)</p>
          </div>
          <button
            onClick={() => useBugReportStore.getState().startInspection()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer w-fit"
          >
            <IconBug size={18} /> Test Bug Reporter (Ctrl+Shift+B)
          </button>
        </header>

        {/* 1. Buttons Test */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">1. Buttons & Tokens</h2>
          <div className="p-8 bg-surface rounded-[24px] shadow-float border border-transparent">
            <div className="flex flex-wrap gap-4 items-center">
              <button className="bg-primary text-surface px-5 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                Primary Action
              </button>
              <button className="bg-surface-alt text-text-primary px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#e8e8e8] transition-colors dark:hover:bg-[#333] cursor-pointer">
                Secondary Action
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary ml-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A45]"></span> Highlight
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span> Success
              </div>
            </div>
          </div>
        </section>

        {/* Primitives Test */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Primitives: Card, ListRow, StatCard</h2>
          <Card padding="md" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Focus Time" value="12h 45m" icon={<IconFlame size={20} />} trend={{ value: "+2.5h", isPositive: true }} />
              <StatCard label="Current Streak" value="5 days" icon={<IconCalendarEvent size={20} />} />
              <StatCard label="Savings Goal" value="$1,250" icon={<IconWallet size={20} />} trend={{ value: "-$50", isPositive: false }} />
            </div>

            <div className="h-px w-full bg-border-hairline"></div>

            <div className="flex flex-col">
              <ListRow 
                icon={<IconUser />}
                title="Account Settings"
                subtitle="Manage your personal information and security"
                trailing={<IconChevronRight className="text-text-muted" />}
                onClick={() => {}}
              />
              <div className="h-px w-full bg-border-hairline my-2" />
              <ListRow 
                icon={<IconBell />}
                title="Notifications"
                subtitle="Customize alerts and emails"
                trailing={<div className="bg-accent-success text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><IconCheck size={12} stroke={3} /> On</div>}
              />
            </div>
          </Card>
        </section>

        {/* 2. Settings / Menu List Layout (img 1 pattern) */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">2. Settings Layout (Menu List)</h2>
          <div className="p-6 bg-surface rounded-[24px] shadow-float border border-transparent">
            
            <div className="flex flex-col gap-1">
              {/* Active Row */}
              <div className="flex items-center justify-between p-4 rounded-[14px] bg-surface-alt cursor-pointer">
                <div className="flex items-center gap-4">
                  <IconUser size={20} className="text-text-primary" stroke={1.75} />
                  <div>
                    <div className="text-[17px] font-semibold text-text-primary">Profile</div>
                    <div className="text-[14px] text-text-secondary">Manage your public information</div>
                  </div>
                </div>
                <IconChevronRight size={20} className="text-text-secondary" />
              </div>

              {/* Inactive Rows */}
              <div className="flex items-center justify-between p-4 rounded-[14px] hover:bg-surface-alt cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <IconSettings size={20} className="text-text-primary" stroke={1.75} />
                  <div>
                    <div className="text-[17px] font-semibold text-text-primary">Preferences</div>
                    <div className="text-[14px] text-text-secondary">Theme, timezone, and language</div>
                  </div>
                </div>
                <IconChevronRight size={20} className="text-text-secondary" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-[14px] hover:bg-surface-alt cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <IconBell size={20} className="text-text-primary" stroke={1.75} />
                  <div>
                    <div className="text-[17px] font-semibold text-text-primary">Notifications</div>
                    <div className="text-[14px] text-text-secondary">Email and push alerts</div>
                  </div>
                </div>
                <div className="bg-[#22C55E] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <IconCheck size={12} stroke={3} /> On
                </div>
              </div>
            </div>

            {/* Hairline Divider for visual demotion */}
            <div className="h-px w-full bg-border-hairline my-6"></div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between p-4 rounded-[14px] hover:bg-surface-alt cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <IconShieldLock size={20} className="text-text-primary" stroke={1.75} />
                  <div className="text-[17px] font-semibold text-text-primary">Security</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. Compose Input (img 2 pattern) */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">3. Compose Input (Borderless)</h2>
          <div className="p-6 bg-surface rounded-[24px] shadow-float border border-transparent">
            <input 
              type="text" 
              placeholder="What are you working on?" 
              className="w-full bg-transparent border-none outline-none text-[17px] font-semibold text-text-primary placeholder:text-text-muted mb-4"
            />
            <div className="h-px w-full bg-border-hairline mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="p-2.5 text-text-muted hover:text-text-primary hover:bg-surface-alt rounded-full transition-colors cursor-pointer">
                  <IconMicrophone size={20} stroke={1.75} />
                </button>
                <button className="p-2.5 text-text-muted hover:text-text-primary hover:bg-surface-alt rounded-full transition-colors cursor-pointer">
                  <IconPaperclip size={20} stroke={1.75} />
                </button>
              </div>
              <button className="bg-primary text-surface px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                Publish
              </button>
            </div>
          </div>
        </section>

        {/* 5. Dashboard Card (img 3 pattern) */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">4. Dashboard / Planner Card</h2>
          <div className="p-6 bg-surface rounded-[24px] shadow-float border border-transparent">
            {/* Week Strip */}
            <div className="flex justify-between items-center mb-8 px-2">
              {[
                { day: 'Mon', num: '12', active: false, dot: false },
                { day: 'Tue', num: '13', active: false, dot: true },
                { day: 'Wed', num: '14', active: true, dot: false }, // Today
                { day: 'Thu', num: '15', active: false, dot: true },
                { day: 'Fri', num: '16', active: false, dot: false },
                { day: 'Sat', num: '17', active: false, dot: false },
                { day: 'Sun', num: '18', active: false, dot: false },
              ].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <span className={`text-[11px] font-bold uppercase transition-colors ${d.active ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{d.day}</span>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full text-[15px] font-semibold transition-all ${d.active ? 'bg-accent-highlight text-white shadow-md' : 'text-text-primary group-hover:bg-surface-alt'}`}>
                    {d.num}
                  </div>
                  {d.dot && !d.active && <div className="w-1.5 h-1.5 rounded-full bg-text-secondary"></div>}
                  {d.dot && d.active && <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>}
                  {!d.dot && <div className="w-1.5 h-1.5 bg-transparent"></div>}
                </div>
              ))}
            </div>

            {/* List Rows */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-3 hover:bg-surface-alt rounded-[14px] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-surface-alt flex items-center justify-center text-text-secondary dark:bg-[#2A2A2A]">
                    <IconCircleCheck size={22} stroke={1.75} />
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-text-primary">Review PRs</div>
                    <div className="text-[13px] text-text-secondary mt-0.5">09:00 AM • Work</div>
                  </div>
                </div>
                <button className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2">
                  <IconDots size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-surface-alt rounded-[14px] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FF7A45]/10 text-accent-highlight flex items-center justify-center">
                    <IconBook2 size={22} stroke={1.75} />
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-text-primary">Read "The Design of Everyday Things"</div>
                    <div className="text-[13px] text-text-secondary mt-0.5">08:00 PM • Personal</div>
                  </div>
                </div>
                <button className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2">
                  <IconDots size={20} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 6. Static Markdown Page */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">5. Static Markdown Content</h2>
          <div className="p-8 md:p-12 bg-surface rounded-[24px] shadow-float border border-transparent">
            <article className="prose prose-zinc max-w-none dark:prose-invert">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">The Philosophy of Less</h1>
              <p className="text-text-secondary text-sm">Published on August 15, 2026</p>
              
              <p className="text-text-primary leading-relaxed mt-6">
                Design is not just what it looks like and feels like. Design is how it works. A minimalist approach to UI is fundamentally about respect for the user's time and cognitive load.
              </p>

              <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">Core Principles</h2>
              <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                <li><strong className="text-text-primary">Clarity over cleverness:</strong> If a user has to guess what an icon does, it's failed.</li>
                <li><strong className="text-text-primary">Intentional friction:</strong> Make destructive actions hard, and creative actions frictionless.</li>
                <li><strong className="text-text-primary">Whitespace is a structural element:</strong> Not an empty void, but the mortar that holds the bricks together.</li>
              </ul>

              <blockquote className="border-l-2 border-text-secondary pl-4 my-6 italic text-text-secondary">
                "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."
              </blockquote>
            </article>
          </div>
        </section>
        
        {/* Floating Bottom Nav (img 3 pattern) */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-surface shadow-float border border-border-hairline rounded-full p-2 flex items-center gap-2">
             <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-alt text-text-primary font-bold text-sm">
                <IconBook2 size={20} stroke={2} />
             </button>
             <button className="h-12 px-5 flex items-center justify-center rounded-full bg-primary text-surface font-bold text-sm">
                <IconCheck size={18} stroke={2} className="mr-2" />
                Tracker
             </button>
             <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-alt text-text-primary hover:bg-[#e8e8e8] transition-colors">
                <IconUser size={20} stroke={2} />
             </button>
             <div className="w-px h-6 bg-border-hairline mx-1"></div>
             <button className="w-12 h-12 flex items-center justify-center rounded-full bg-text-primary text-surface hover:opacity-90 transition-opacity">
                <IconCheck size={20} stroke={3} style={{ transform: 'rotate(45deg)' }} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MinimalPremiumTest;
