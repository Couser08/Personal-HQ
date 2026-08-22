import React from 'react';
import { type Mindmap, type MindmapLink } from '../../../../store/useAppStore';
import { COLOR_PRESETS } from '../../utils/mindmapUtils';

interface MindmapSvgLayerProps {
  visibleLinks: MindmapLink[];
  mindmap: Mindmap;
  getNodeCenters: Record<string, { x: number; y: number }>;
}

export const MindmapSvgLayer: React.FC<MindmapSvgLayerProps> = ({
  visibleLinks,
  mindmap,
  getNodeCenters,
}) => {
  return (
    <svg
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {visibleLinks.map((link, idx) => {
        const sourceNode = mindmap.nodes.find((n) => n.id === link.source);
        const targetNode = mindmap.nodes.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode) return null;

        const start = getNodeCenters[link.source];
        const end = getNodeCenters[link.target];
        if (!start || !end) return null;

        let pathData = '';
        const side = targetNode.side || 'right';

        if (side === 'left') {
          const xStart = sourceNode.x;
          const yStart = sourceNode.y + 22;
          const xEnd = targetNode.x + 160;
          const yEnd = targetNode.y + 22;
          const controlX1 = xStart - (xStart - xEnd) / 2;
          const controlX2 = xStart - (xStart - xEnd) / 2;
          pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
        } else if (side === 'right') {
          const xStart = sourceNode.x + 160;
          const yStart = sourceNode.y + 22;
          const xEnd = targetNode.x;
          const yEnd = targetNode.y + 22;
          const controlX1 = xStart + (xEnd - xStart) / 2;
          const controlX2 = xStart + (xEnd - xStart) / 2;
          pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
        } else {
          const xStart = sourceNode.x + 80;
          const yStart = sourceNode.y + 44;
          const xEnd = targetNode.x + 80;
          const yEnd = targetNode.y;
          const controlY1 = yStart + (yEnd - yStart) / 2;
          const controlY2 = yStart + (yEnd - yStart) / 2;
          pathData = `M ${xStart} ${yStart} C ${xStart} ${controlY1}, ${xEnd} ${controlY2}, ${xEnd} ${yEnd}`;
        }

        const colorPreset = COLOR_PRESETS.find((c) => c.id === sourceNode.color);
        let strokeColor = 'rgba(148, 163, 184, 0.25)';
        if (colorPreset && colorPreset.id !== 'gray') {
          strokeColor =
            colorPreset.id === 'rose'
              ? 'rgba(244, 63, 94, 0.3)'
              : colorPreset.id === 'amber'
              ? 'rgba(245, 158, 11, 0.3)'
              : colorPreset.id === 'purple'
              ? 'rgba(168, 85, 247, 0.3)'
              : colorPreset.id === 'green'
              ? 'rgba(16, 185, 129, 0.3)'
              : 'rgba(59, 130, 246, 0.3)';
        }

        const edgeStyle = mindmap.edgeStyle || 'solid';
        const strokeDasharray = edgeStyle === 'dashed' ? '6, 6' : edgeStyle === 'dotted' ? '2, 5' : 'none';

        return (
          <path
            key={idx}
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
};
