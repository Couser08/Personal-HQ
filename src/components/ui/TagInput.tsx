import { useState, type KeyboardEvent } from 'react';
import { IconX } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ tags, onChange, placeholder = "Type and press enter..." }: TagInputProps) => {
  const [input, setInput] = useState('');
  const appTags = useAppStore((state) => state.appTags);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 p-2 bg-surface-alt border border-border-alt rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors min-h-[42px] items-center">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-md text-xs font-medium text-text-primary"
          >
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(index)}
              className="text-text-muted hover:text-rose-500 transition-colors rounded-sm border-none bg-transparent cursor-pointer"
            >
              <IconX className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
      </div>

      {appTags && appTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1 text-left">
          <span className="text-[10px] text-text-muted font-bold block w-full">Quick Tags:</span>
          {appTags.map((tag) => {
            const isSelected = tags.includes(tag.name);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onChange(tags.filter((t) => t !== tag.name));
                  } else {
                    onChange([...tags, tag.name]);
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[9px] font-black cursor-pointer transition-all duration-150 border-none hover:scale-103"
                style={{
                  backgroundColor: isSelected ? `${tag.color}20` : 'var(--bg-surface-alt)',
                  border: `1px solid ${isSelected ? `${tag.color}50` : 'var(--border-border-alt)'}`,
                  color: isSelected ? tag.color : 'var(--text-secondary)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
