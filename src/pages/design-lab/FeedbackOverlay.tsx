import React, { useState, useEffect, useRef } from 'react';
import { IconMessagePlus, IconTrash, IconClipboardCopy, IconX, IconCheck } from '@tabler/icons-react';

interface Comment {
  id: string;
  selector: string;
  variant: string;
  elementDesc: string;
  text: string;
}

interface FeedbackOverlayProps {
  targetName: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ targetName }) => {
  const [isActive, setIsActive] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [overallDirection, setOverallDirection] = useState('');
  
  // Pending comment dialog state
  const [pendingComment, setPendingComment] = useState<{
    selector: string;
    variant: string;
    elementDesc: string;
    x: number;
    y: number;
  } | null>(null);
  
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const activeOverlayRef = useRef<boolean>(false);

  useEffect(() => {
    activeOverlayRef.current = isActive;
    if (isActive) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isActive]);

  // Click interceptor for selection mode
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!activeOverlayRef.current) return;
      
      // Prevent actual action (like link navigation or toggle)
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      
      // Ignore if clicking on the overlay UI itself
      if (target.closest('.feedback-overlay-ui')) return;
      
      // Calculate selector
      let selector = target.tagName.toLowerCase();
      if (target.id) {
        selector = `#${target.id}`;
      } else if (target.className && typeof target.className === 'string') {
        const classes = target.className.split(/\s+/).filter(c => c && !c.includes(':') && !c.includes('['));
        if (classes.length > 0) {
          selector += `.${classes[0]}`;
        }
      }
      
      // Get variant data
      let variant = 'General';
      let curr: HTMLElement | null = target;
      while (curr) {
        const v = curr.getAttribute('data-variant');
        if (v) {
          variant = `Variant ${v}`;
          break;
        }
        curr = curr.parentElement;
      }
      
      // Element Description
      const innerText = target.innerText?.trim().slice(0, 30) || '';
      const elementDesc = `${target.tagName.toLowerCase()}${innerText ? ` with text "${innerText}"` : ''}`;
      
      setPendingComment({
        selector,
        variant,
        elementDesc,
        x: e.clientX,
        y: e.clientY + window.scrollY
      });
      setIsActive(false); // turn off selection mode
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  const addComment = () => {
    if (!commentText.trim() || !pendingComment) return;
    
    const newComment: Comment = {
      id: crypto.randomUUID(),
      selector: pendingComment.selector,
      variant: pendingComment.variant,
      elementDesc: pendingComment.elementDesc,
      text: commentText.trim()
    };
    
    setComments(prev => [...prev, newComment]);
    setCommentText('');
    setPendingComment(null);
  };

  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const generateMarkdown = (): string => {
    let md = `## Design Lab Feedback\n\n`;
    md += `**Target:** ${targetName}\n`;
    md += `**Comments:** ${comments.length}\n\n`;
    
    // Group comments by variant
    const grouped: { [key: string]: Comment[] } = {};
    comments.forEach(c => {
      if (!grouped[c.variant]) grouped[c.variant] = [];
      grouped[c.variant].push(c);
    });
    
    Object.keys(grouped).forEach(vKey => {
      md += `### ${vKey}\n`;
      grouped[vKey].forEach((c, index) => {
        md += `${index + 1}. **${c.elementDesc}** (\`${c.selector}\`)\n`;
        md += `   "${c.text}"\n\n`;
      });
    });
    
    md += `### Overall Direction\n`;
    md += `${overallDirection || 'No overall direction specified.'}\n`;
    return md;
  };

  const handleCopyToClipboard = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    });
  };

  return (
    <div className="feedback-overlay-ui relative z-[9999]">
      
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white shadow-high cursor-pointer transition-all duration-200 border-none ${
            isActive ? 'bg-amber-500 scale-105' : 'bg-rose-500 hover:bg-rose-600 active:scale-95'
          }`}
        >
          <IconMessagePlus size={16} />
          {isActive ? 'Click on any element...' : 'Add Feedback'}
        </button>
      </div>

      {/* Capture Dialog popup */}
      {pendingComment && (
        <div 
          className="fixed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-high p-4 w-72 flex flex-col gap-3"
          style={{ 
            left: Math.min(pendingComment.x, window.innerWidth - 300), 
            top: Math.min(pendingComment.y - window.scrollY, window.innerHeight - 200),
            zIndex: 10000 
          }}
        >
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{pendingComment.variant}</span>
            <button onClick={() => setPendingComment(null)} className="text-zinc-400 hover:text-zinc-600 bg-transparent border-none cursor-pointer">
              <IconX size={14} />
            </button>
          </div>
          <div>
            <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">{pendingComment.selector}</p>
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1 truncate">{pendingComment.elementDesc}</p>
          </div>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Type comment (e.g., 'Make this cleaner', 'Love this button')"
            className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 rounded-xl resize-none h-16 focus:outline-none focus:border-rose-500"
            autoFocus
          />
          <button 
            onClick={addComment} 
            disabled={!commentText.trim()}
            className="w-full py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
          >
            Save Comment
          </button>
        </div>
      )}

      {/* Review Sidebar / Bottom drawer for added comments */}
      {comments.length > 0 && (
        <div className="fixed top-24 right-6 w-80 max-h-[70vh] bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md rounded-2xl shadow-high flex flex-col p-4 z-[9990] overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5 shrink-0">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Review Comments ({comments.length})</h4>
            <button onClick={() => setComments([])} className="text-[10px] text-zinc-400 hover:text-rose-500 bg-transparent border-none cursor-pointer">Clear All</button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 custom-scrollbar min-h-0">
            {comments.map((c) => (
              <div key={c.id} className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-xl flex flex-col gap-1 relative group">
                <button 
                  onClick={() => deleteComment(c.id)}
                  className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
                >
                  <IconTrash size={12} />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 bg-rose-500/10 text-rose-500 rounded text-[8px] font-black">{c.variant}</span>
                  <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">{c.selector}</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 mt-1 font-medium">"{c.text}"</p>
              </div>
            ))}
          </div>

          {/* Overall Direction */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-col gap-2 shrink-0">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Overall Direction</label>
            <textarea
              value={overallDirection}
              onChange={e => setOverallDirection(e.target.value)}
              placeholder="e.g. Combine Variant A layout with Variant C fonts..."
              className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 rounded-xl resize-none h-14 focus:outline-none focus:border-rose-500"
            />
            <button
              onClick={handleCopyToClipboard}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
            >
              <IconClipboardCopy size={14} /> Submit All Feedback
            </button>
          </div>
        </div>
      )}

      {/* Copy Notification Toast */}
      {submitted && (
        <div className="fixed bottom-20 right-6 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-high flex items-center gap-2.5 z-[10005] border border-zinc-800 animate-fadeIn">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <IconCheck size={12} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold">Feedback Copied to Clipboard!</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Paste it in the terminal window to continue.</p>
          </div>
        </div>
      )}

    </div>
  );
};
