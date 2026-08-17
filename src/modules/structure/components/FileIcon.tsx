import React from 'react';
import { getFileIconInfo, getFolderIconInfo } from '../utils/iconMap';

interface FileIconProps {
  name: string;
  type: 'file' | 'folder';
  isOpen?: boolean;
  size?: number;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  name,
  type,
  isOpen = false,
  size = 18,
  className = '',
}) => {
  if (type === 'folder') {
    const { Icon, color, BadgeIcon } = getFolderIconInfo(name, isOpen);
    return (
      <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
        <Icon size={size} style={{ color }} stroke={1.75} />
        {BadgeIcon && (
          <div
            className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-zinc-950/80 border border-zinc-700/60 shadow-xs flex items-center justify-center"
            style={{ transform: 'scale(0.65)' }}
          >
            <BadgeIcon size={12} style={{ color }} stroke={2} />
          </div>
        )}
      </div>
    );
  }

  const { icon: Icon, color, badge } = getFileIconInfo(name);

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <Icon size={size} style={{ color }} stroke={1.75} />
      {badge && (
        <span
          className="absolute -top-1 -right-1.5 text-[8px] font-bold px-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 pointer-events-none scale-75 uppercase"
        >
          {badge}
        </span>
      )}
    </div>
  );
};
