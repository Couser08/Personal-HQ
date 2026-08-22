import React from 'react';
import { IconDots } from '@tabler/icons-react';
import type { VisionNode } from '../../../../store/types';

interface ImageNodeViewProps {
  node: VisionNode;
  onToggleMenu: (e: React.MouseEvent) => void;
}

export const ImageNodeView: React.FC<ImageNodeViewProps> = ({ node, onToggleMenu }) => {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img
        src={
          node.imageUrl ||
          'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop'
        }
        alt={node.title}
        className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute top-2.5 right-2.5 z-20">
        <button
          type="button"
          onClick={onToggleMenu}
          className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md text-text-primary flex items-center justify-center hover:bg-surface transition-colors cursor-pointer shadow-xs"
        >
          <IconDots size={16} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-20">
        <span className="px-3.5 py-1.5 rounded-full bg-surface/95 backdrop-blur-md text-[12px] font-black uppercase tracking-wider text-text-primary border border-border shadow-md">
          {node.title}
        </span>
      </div>
    </div>
  );
};
