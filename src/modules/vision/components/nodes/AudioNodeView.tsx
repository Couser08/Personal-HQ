import React from 'react';
import { IconDots, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import type { VisionNode } from '../../../../store/types';

interface AudioNodeViewProps {
  node: VisionNode;
  isPlayingAudio: boolean;
  onToggleAudio: (e: React.MouseEvent) => void;
  onToggleMenu: (e: React.MouseEvent) => void;
}

export const AudioNodeView: React.FC<AudioNodeViewProps> = ({
  node,
  isPlayingAudio,
  onToggleAudio,
  onToggleMenu,
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-4 text-white">
      <img
        src={
          node.imageUrl ||
          'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop'
        }
        alt={node.title}
        className="absolute inset-0 w-full h-full object-cover brightness-[0.65]"
      />

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
          Ambient Lo-Fi
        </span>
        <button
          type="button"
          onClick={onToggleMenu}
          className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center cursor-pointer"
        >
          <IconDots size={14} />
        </button>
      </div>

      {/* Play Button Center */}
      <div className="relative z-10 my-auto flex items-center justify-center">
        <button
          type="button"
          onClick={onToggleAudio}
          className={`w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer ${
            isPlayingAudio ? 'ring-4 ring-white/50 animate-pulse' : ''
          }`}
          title={isPlayingAudio ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
        >
          {isPlayingAudio ? (
            <IconPlayerPause size={24} className="fill-current" />
          ) : (
            <IconPlayerPlay size={24} className="fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Track Title and Duration */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[13px] font-extrabold truncate">{node.title || 'Forest Lo-Fi'}</span>
          <span className="text-[10px] opacity-75">
            {isPlayingAudio ? 'Playing ambient stream' : 'Paused'}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold opacity-90">
          {node.audioDuration || '02:45'}
        </span>
      </div>
    </div>
  );
};
