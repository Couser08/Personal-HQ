import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { supabase } from '../../lib/supabase';
import { compressAndConvertToWebP } from '../../utils/imageOptimizer';
import type { Vision, Habit } from '../../store/types';
import {
  IconTarget, IconPlus, IconX, IconPhoto, 
  IconTrash, IconCalendar, IconChevronLeft,
  IconLoader2
} from '@tabler/icons-react';
import { Modal } from '../../components/ui/Modal';
import { CustomSelect } from '../../components/ui/CustomSelect';

const DEFAULT_CATEGORIES = ['Career', 'Health', 'Finance', 'Travel', 'Growth', 'Relationships', 'Other'];

export default function VisionModule() {
  const visions = useAppStore(s => s.visions);
  const habits = useAppStore(s => s.habits);
  const { addVision, updateVision, deleteVision, showConfirm } = useAppStore();
  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.addToast);

  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVision, setSelectedVision] = useState<Vision | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Derived state
  const categories = useMemo(() => {
    const cats = new Set(DEFAULT_CATEGORIES);
    visions.forEach(v => cats.add(v.category));
    return ['All', ...Array.from(cats)];
  }, [visions]);

  const filteredVisions = useMemo(() => {
    return visions.filter(v => {
      const isCompleted = v.status === 'Achieved';
      if (activeTab === 'Active' && isCompleted) return false;
      if (activeTab === 'Completed' && !isCompleted) return false;
      if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
      return true;
    });
  }, [visions, activeTab, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          
          <AnimatePresence mode="wait">
            {!selectedVision ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 pb-20"
              >
                {/* Header & Filters */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <IconTarget size={32} className="text-primary" />
                        Vision Board
                      </h1>
                      <p className="text-sm text-text-secondary mt-1">
                        Map your aspirations. Keep them visual.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="bg-primary hover:opacity-90 text-text-on-accent px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95 w-full sm:w-auto justify-center cursor-pointer"
                    >
                      <IconPlus size={18} /> Add Vision
                    </button>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 p-2 rounded-2xl border border-border backdrop-blur-md">
                    
                    {/* Categories Pill Row */}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${
                            selectedCategory === cat 
                              ? 'bg-text-primary text-background' 
                              : 'bg-transparent text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Active/Completed Toggle */}
                    <div className="flex items-center bg-background rounded-xl p-1 shrink-0 border border-border">
                      <button
                        onClick={() => setActiveTab('Active')}
                        className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${activeTab === 'Active' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setActiveTab('Completed')}
                        className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${activeTab === 'Completed' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                {filteredVisions.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-surface/30">
                    <IconTarget className="mx-auto text-text-secondary/50 mb-3" size={48} />
                    <h3 className="text-xl font-bold text-text-primary mb-1">No Visions Found</h3>
                    <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
                      {activeTab === 'Completed' 
                        ? "You haven't achieved any visions yet. Keep pushing!" 
                        : "Your vision board is a blank canvas. Start dreaming."}
                    </p>
                    <button 
                      onClick={() => setIsCreateOpen(true)} 
                      className="bg-primary/10 text-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary/20 transition-colors"
                    >
                      Plant a Seed
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVisions.map(vision => (
                      <VisionCard key={vision.id} vision={vision} onClick={() => setSelectedVision(vision)} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <VisionDetail 
                key="detail"
                vision={selectedVision} 
                habits={habits}
                onBack={() => setSelectedVision(null)}
                onUpdate={(updates) => {
                  updateVision(selectedVision.id, updates);
                  setSelectedVision(prev => prev ? { ...prev, ...updates } : null);
                }}
                onDelete={() => {
                  showConfirm('Delete Vision', 'Are you sure you want to delete this vision?', () => {
                    deleteVision(selectedVision.id);
                    setSelectedVision(null);
                  });
                }}
              />
            )}
          </AnimatePresence>

        </div>
      </div>

      <CreateVisionModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSave={async (v) => {
          await addVision(v);
          setIsCreateOpen(false);
          addToast('Created', 'Vision added to your board.', 'success');
        }}
        userId={user?.id}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vision Card Component
// ─────────────────────────────────────────────────────────────────────────────
function VisionCard({ vision, onClick }: { vision: Vision; onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl overflow-hidden cursor-pointer shadow-subtle hover:shadow-lg transition-all group flex flex-col h-[320px]"
    >
      {/* Image Area */}
      <div className="h-44 w-full bg-surface-alt relative overflow-hidden shrink-0">
        {vision.imageUrl ? (
          <img src={vision.imageUrl} alt={vision.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-surface flex items-center justify-center">
            <IconPhoto size={40} className="text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary shadow-sm">
          {vision.category}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-surface/50">
        <div>
          <h3 className="font-bold text-text-primary text-lg leading-tight line-clamp-2">{vision.title}</h3>
          {vision.targetDate && (
            <p className="text-xs font-semibold text-text-secondary mt-2 flex items-center gap-1.5">
              <IconCalendar size={14} /> {new Date(vision.targetDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Progress Bar & Status (As requested in spec) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-text-secondary">{vision.progress}% · {vision.status}</span>
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${vision.progress}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vision Detail View Component
// ─────────────────────────────────────────────────────────────────────────────
function VisionDetail({ vision, habits, onBack, onUpdate, onDelete }: { 
  vision: Vision, 
  habits: Habit[],
  onBack: () => void, 
  onUpdate: (u: Partial<Vision>) => void,
  onDelete: () => void 
}) {
  const [isLinking, setIsLinking] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);

  // Find linked habits
  const linkedHabits = habits.filter(h => vision.linkedHabitIds.includes(h.id));
  const unlinkedHabits = habits.filter(h => !vision.linkedHabitIds.includes(h.id));

  // Professional progress calculation logic
  // If there are linked habits, we can suggest a progress roll-up
  const computedProgress = useMemo(() => {
    if (linkedHabits.length === 0) return vision.progress; // fallback to manual
    
    // Example formula: average of (streak / frequencyCount * 4) capped at 100
    // This is a proxy for "habit health". 
    let totalScore = 0;
    linkedHabits.forEach(h => {
      const weeklyTarget = h.frequencyCount;
      const score = Math.min(((h.streak || 0) / (weeklyTarget * 4)) * 100, 100); // 4 weeks of perfect streaks = 100%
      totalScore += score;
    });
    return Math.round(totalScore / linkedHabits.length);
  }, [linkedHabits, vision.progress]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Navbar */}
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 border-b border-border mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-bold transition-colors px-2 py-1 rounded-lg hover:bg-surface">
          <IconChevronLeft size={18} /> Board
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onUpdate({ status: vision.status === 'Achieved' ? 'In Progress' : 'Achieved' })} className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors ${vision.status === 'Achieved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-surface hover:bg-surface-hover border-border'}`}>
            {vision.status === 'Achieved' ? 'Achieved 🎉' : 'Mark Achieved'}
          </button>
          <button onClick={onDelete} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
            <IconTrash size={18} />
          </button>
        </div>
      </div>

      {/* Visual Identity / Header */}
      <div className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm relative isolate">
        <div className="h-64 md:h-80 w-full relative">
          {vision.imageUrl ? (
            <>
              <img src={vision.imageUrl} alt={vision.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-surface to-background flex items-center justify-center">
              <IconPhoto size={64} className="text-primary/20" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 w-full p-8">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm mb-4 inline-block">
              {vision.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg leading-tight">
              {vision.title}
            </h1>
            {vision.targetDate && (
              <p className="text-white/80 font-medium text-sm drop-shadow">
                Target: {new Date(vision.targetDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Why & Description */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-surface p-6 rounded-[24px] border border-border">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Why This Matters</h3>
            {vision.whyText ? (
              <p className="text-text-primary text-[15px] leading-relaxed whitespace-pre-wrap">{vision.whyText}</p>
            ) : (
              <p className="text-text-tertiary text-[15px] italic">No deeper reason defined yet.</p>
            )}
          </section>

          {/* Linked Habits (The Action Bridge) */}
          <section className="bg-surface p-6 rounded-[24px] border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Linked Habits</h3>
              <button onClick={() => setIsLinking(!isLinking)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                <IconPlus size={14} /> Link Habit
              </button>
            </div>

            {isLinking && (
              <div className="mb-6 p-4 bg-background border border-border rounded-xl">
                <p className="text-xs font-bold text-text-secondary mb-3">Select an existing habit to link to this vision:</p>
                {unlinkedHabits.length === 0 ? (
                  <p className="text-xs text-text-tertiary">No unlinked habits available.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {unlinkedHabits.map(h => (
                      <button
                        key={h.id}
                        onClick={() => {
                          onUpdate({ linkedHabitIds: [...vision.linkedHabitIds, h.id] });
                          setIsLinking(false);
                        }}
                        className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[13px] font-medium hover:border-primary transition-colors"
                      >
                        {h.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {linkedHabits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary font-medium">Visions stay dreams without action.</p>
                <p className="text-xs text-text-tertiary mt-1">Link daily or weekly habits to automatically track progress.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {linkedHabits.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                    <div>
                      <p className="font-bold text-[14px] text-text-primary">{h.name}</p>
                      <p className="text-[11px] font-medium text-primary mt-0.5">{h.streak} Day Streak (Best: {h.bestStreak})</p>
                    </div>
                    <button 
                      onClick={() => onUpdate({ linkedHabitIds: vision.linkedHabitIds.filter(id => id !== h.id) })}
                      className="p-1.5 text-text-tertiary hover:text-rose-500 rounded-md transition-colors"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Progress & Status */}
        <div className="space-y-6">
          
          <section className="bg-surface p-6 rounded-[24px] border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Progress Tracker</h3>
              {linkedHabits.length > 0 && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">Auto</span>
              )}
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-5xl font-black text-text-primary tracking-tighter mb-2">
                {linkedHabits.length > 0 ? computedProgress : vision.progress}<span className="text-2xl text-text-tertiary">%</span>
              </div>
              <p className="text-[13px] font-bold text-text-secondary">{vision.status}</p>
            </div>

            {/* Manual Progress Slider if no habits linked, OR override mode */}
            {linkedHabits.length === 0 || isEditingProgress ? (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                  <span>0%</span>
                  <span>100%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={vision.progress}
                  onChange={(e) => onUpdate({ progress: parseInt(e.target.value, 10), status: parseInt(e.target.value, 10) === 100 ? 'Achieved' : 'In Progress' })}
                  className="w-full h-2 bg-background rounded-full appearance-none cursor-pointer accent-primary"
                />
                {linkedHabits.length > 0 && (
                  <button onClick={() => setIsEditingProgress(false)} className="text-[10px] text-text-tertiary mt-2 w-full text-center hover:underline">
                    Revert to Auto-computation
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-border flex justify-center">
                 <button onClick={() => setIsEditingProgress(true)} className="text-[11px] font-bold text-text-secondary hover:text-text-primary transition-colors bg-background px-4 py-1.5 rounded-full border border-border">
                   Manual Override
                 </button>
              </div>
            )}
          </section>

          <section className="bg-surface p-6 rounded-[24px] border border-border">
             <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Status</h3>
             <select
               value={vision.status}
               onChange={(e) => onUpdate({ status: e.target.value as Vision['status'] })}
               className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] font-bold text-text-primary focus:outline-none focus:border-primary"
             >
               <option value="Not Started">Not Started</option>
               <option value="In Progress">In Progress</option>
               <option value="Paused">Paused</option>
               <option value="Achieved">Achieved</option>
             </select>
          </section>
        </div>

      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single-Screen Quick Create Modal (Not a Wizard)
// ─────────────────────────────────────────────────────────────────────────────
function CreateVisionModal({ isOpen, onClose, onSave, userId }: { isOpen: boolean, onClose: () => void, onSave: (v: Vision) => void, userId?: string }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCat, setCustomCat] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [whyText, setWhyText] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Invalid File', 'Must be an image.', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      addToast('Error', 'Vision title is required.', 'error');
      return;
    }

    const finalCategory = category === 'Other' && customCat.trim() ? customCat.trim() : category;

    setIsUploading(true);
    let publicUrl = undefined;

    if (imageFile && userId) {
      try {
        const optimizedFile = await compressAndConvertToWebP(imageFile, 1200, 0.85);
        const fileName = `${userId}/${Date.now()}-vision.webp`;
        
        const { error: uploadError } = await supabase.storage
          .from('visions')
          .upload(fileName, optimizedFile, { upsert: true, contentType: 'image/webp' });
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('visions').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      } catch (err: any) {
        console.error('Image upload failed', err);
        addToast('Upload Error', 'Failed to upload image. Vision created without image.', 'warning');
      }
    }

    const newVision: Vision = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category: finalCategory,
      targetDate: targetDate || undefined,
      whyText: whyText.trim() || undefined,
      imageUrl: publicUrl,
      status: 'Not Started',
      progress: 0,
      linkedHabitIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await onSave(newVision);
    } catch (err: any) {
      console.error('Failed to create vision:', err);
      addToast('Error', 'Failed to save vision: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsUploading(false);
    }
    // reset
    setTitle(''); setCategory(DEFAULT_CATEGORIES[0]); setCustomCat('');
    setTargetDate(''); setWhyText(''); setImageFile(null); setImagePreview(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plant a New Vision" maxWidthClassName="max-w-xl">
      <div className="flex flex-col gap-5 pt-2">
        
        <div>
          <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">What do you want?</label>
          <input 
            autoFocus
            type="text" 
            placeholder="e.g. Become a Full Stack Developer"
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-[15px] font-bold" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Category</label>
            <CustomSelect
              options={DEFAULT_CATEGORIES.map(c => ({ value: c, label: c }))}
              value={category}
              onChange={setCategory}
            />
            {category === 'Other' && (
              <input 
                type="text" placeholder="Custom category..." value={customCat} onChange={(e) => setCustomCat(e.target.value)}
                className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            )}
          </div>
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Target Date <span className="font-normal text-text-tertiary">(Optional)</span></label>
            <input 
              type="month" 
              value={targetDate} 
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-[14px] font-bold" 
            />
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-background">
          {imagePreview ? (
            <div className="relative h-40 group">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur">
                <IconTrash size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 flex flex-col items-center justify-center gap-1 text-text-tertiary hover:bg-surface transition-colors cursor-pointer">
               <IconPhoto size={24} />
               <span className="text-xs font-bold">Add Cover Image (Optional)</span>
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>

        <div>
          <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Why this matters <span className="font-normal text-text-tertiary">(Optional)</span></label>
          <textarea 
            placeholder="Connect with the deeper reason behind this vision..."
            value={whyText} 
            onChange={(e) => setWhyText(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-[14px] min-h-[80px] resize-none" 
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button onClick={onClose} className="px-5 py-2.5 text-[14px] font-bold text-text-secondary hover:bg-surface rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isUploading}
            className="px-6 py-2.5 text-[14px] font-bold bg-primary text-text-on-accent rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isUploading ? <IconLoader2 size={16} className="animate-spin" /> : <IconTarget size={16} />}
            {isUploading ? 'Planting...' : 'Create Vision'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
