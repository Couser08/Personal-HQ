import { useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  
  return (
    <button
      onClick={() => { 
        navigator.clipboard.writeText(text); 
        setCopied(true); 
        setTimeout(() => setCopied(false), 2000); 
      }}
      className="p-1 rounded text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      title="Copy"
    >
      {copied ? <IconCheck size={13} className="text-emerald-500" /> : <IconCopy size={13} />}
    </button>
  );
};
