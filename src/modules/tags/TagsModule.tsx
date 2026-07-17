import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconTag, IconCheck, IconEdit } from '@tabler/icons-react';

interface ColorOption {
  name: string;
  value: string;
}

const PRESET_COLORS: ColorOption[] = [
  { name: 'Lavender', value: '#c084fc' }, // purple-400
  { name: 'Rose', value: '#f43f5e' }, // rose-500
  { name: 'Sage Green', value: '#4ade80' }, // green-400
  { name: 'Ocean Blue', value: '#3b82f6' }, // blue-500
  { name: 'Coral', value: '#f97316' }, // orange-500
  { name: 'Honey Amber', value: '#f59e0b' }, // amber-500
  { name: 'Teal Mint', value: '#14b8a6' }, // teal-500
  { name: 'Sunset Pink', value: '#ec4899' }, // pink-500
  { name: 'Charcoal', value: '#71717a' }, // zinc-500
];

export default function TagsModule() {
  const { appTags, addAppTag, deleteAppTag, updateAppTag } = useAppStore(
    useShallow((state) => ({
      appTags: state.appTags,
      addAppTag: state.addAppTag,
      deleteAppTag: state.deleteAppTag,
      updateAppTag: state.updateAppTag,
    }))
  );

  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tagName.trim();
    if (!cleanName) return;

    // Check if tag name already exists (case-insensitive) for another tag
    const isDuplicate = appTags.some(
      (t) => t.name.toLowerCase() === cleanName.toLowerCase() && t.id !== editingTagId
    );
    if (isDuplicate) {
      alert('A tag with this name already exists!');
      return;
    }

    try {
      if (editingTagId) {
        await updateAppTag(editingTagId, { name: cleanName, color: selectedColor });
        setEditingTagId(null);
      } else {
        const newTag = {
          id: crypto.randomUUID(),
          name: cleanName,
          color: selectedColor,
          createdAt: new Date().toISOString(),
        };
        await addAppTag(newTag);
      }
      setTagName('');
    } catch (err) {
      console.error('Failed to save tag', err);
    }
  };

  const handleStartEdit = (tag: any) => {
    setEditingTagId(tag.id);
    setTagName(tag.name);
    setSelectedColor(tag.color);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setTagName('');
    setSelectedColor(PRESET_COLORS[0].value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left select-none pb-12">
      {/* ── Left/Top: Create or Edit Tag Card ── */}
      <div className="bg-surface border border-border/70 rounded-3xl p-5 shadow-sm h-fit">
        <h3 className="text-sm font-black uppercase tracking-wider text-text-muted mb-4">
          {editingTagId ? 'Edit Tag' : 'Create New Tag'}
        </h3>
        
        <form onSubmit={handleSaveTag} className="flex flex-col gap-5">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary">Tag Name</label>
            <input
              type="text"
              placeholder="e.g. Work, Urgent, Coding"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              maxLength={25}
              className="input-field w-full font-sans text-xs bg-surface-alt border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary/50 text-text-primary placeholder:text-text-muted transition-colors"
            />
          </div>

          {/* Color Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-secondary">Pick Chip Color</label>
            <div className="grid grid-cols-5 gap-2.5 bg-surface-alt/40 p-2.5 rounded-2xl border border-border/30">
              {PRESET_COLORS.map((c) => {
                const isSelected = selectedColor === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className="w-7 h-7 rounded-full cursor-pointer border-none flex items-center justify-center relative transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="active-tag-color"
                        style={{ willChange: 'transform, opacity' }}
                        className="absolute inset-0 rounded-full border-2 border-white dark:border-background flex items-center justify-center"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      >
                        <IconCheck size={12} className="text-white dark:text-background stroke-[3]" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/40">
            {editingTagId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-alt border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!tagName.trim()}
              className="flex-1 btn btn-primary btn-md flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-40 disabled:pointer-events-none text-xs font-bold"
            >
              {editingTagId ? <IconCheck size={15} /> : <IconPlus size={15} />}
              {editingTagId ? 'Update Tag' : 'Add Tag'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Right/Bottom: Tags List ── */}
      <div className="md:col-span-2 bg-surface border border-border/70 rounded-3xl p-5 shadow-sm min-h-[250px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-text-muted flex items-center gap-2">
            <IconTag className="w-4 h-4 text-primary" /> Active Tags ({appTags.length})
          </h3>
        </div>

        {appTags.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted italic border border-dashed border-border/50 rounded-2xl bg-surface-alt/10 w-full">
            No custom tags created yet. Create one on the left to use anywhere in the app!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 max-h-[400px] overflow-y-auto no-scrollbar">
            <AnimatePresence>
              {appTags.map((tag) => (
                <motion.div
                  key={tag.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border shadow-sm group hover:shadow-md transition-all duration-200"
                  style={{ backgroundColor: `${tag.color}12`, borderColor: `${tag.color}40`, willChange: 'transform, opacity' }}
                >
                  {/* Color Dot indicator */}
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span
                    className="text-xs font-black"
                    style={{ color: tag.color }}
                  >
                    {tag.name}
                  </span>

                  {/* Actions (visible on hover) */}
                  <div className="flex items-center gap-1 ml-1 pl-1 border-l border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(tag)}
                      className="p-1 rounded-lg text-text-secondary hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                      title="Edit Tag"
                    >
                      <IconEdit size={11} />
                    </button>
                    <button
                      onClick={() => deleteAppTag(tag.id)}
                      className="p-1 rounded-lg text-text-secondary hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
                      title="Delete Tag"
                    >
                      <IconTrash size={11} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Informational Hint */}
        <div className="mt-8 pt-4 border-t border-border/30 text-left">
          <p className="text-[10px] text-text-muted leading-relaxed">
            💡 **Integration tip**: These custom tags are instantly synchronized with your global account and will show up as clickable "Quick Tags" suggestions under the tag input boxes in the **Link Vault**, **Todo module**, **Journal**, and other areas to tag items.
          </p>
        </div>
      </div>
    </div>
  );
}
