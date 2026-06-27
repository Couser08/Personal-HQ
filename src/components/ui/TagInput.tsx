import { useState, type KeyboardEvent } from 'react';
import { IconX } from '@tabler/icons-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ tags, onChange, placeholder = "Type and press enter..." }: TagInputProps) => {
  const [input, setInput] = useState('');

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
            className="text-text-muted hover:text-rose-500 transition-colors rounded-sm"
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
  );
};
