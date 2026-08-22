import { type Mindmap, type MindmapNode, type MindmapLink } from '../../../store/useAppStore';

export const exportMindmapJson = (mindmap: Mindmap) => {
  const dataStr = JSON.stringify(mindmap, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${mindmap.title.replace(/\s+/g, '_')}_backup.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportMindmapSvg = (
  mindmap: Mindmap,
  visibleNodes: MindmapNode[],
  visibleLinks: MindmapLink[],
) => {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" style="background:#f8fafc;">`;

  visibleLinks.forEach((link) => {
    const sourceNode = mindmap.nodes.find((n) => n.id === link.source);
    const targetNode = mindmap.nodes.find((n) => n.id === link.target);
    if (!sourceNode || !targetNode) return;

    let pathData = '';
    const side = targetNode.side || 'right';

    if (side === 'left') {
      const xStart = sourceNode.isRoot ? sourceNode.x : sourceNode.x;
      const yStart = sourceNode.isRoot ? sourceNode.y + 32 : sourceNode.y + 22;
      const xEnd = targetNode.x + 160;
      const yEnd = targetNode.y + 22;
      const controlX1 = xStart - (xStart - xEnd) / 2;
      const controlX2 = xStart - (xStart - xEnd) / 2;
      pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
    } else if (side === 'right') {
      const xStart = sourceNode.isRoot ? sourceNode.x + 180 : sourceNode.x + 160;
      const yStart = sourceNode.isRoot ? sourceNode.y + 32 : sourceNode.y + 22;
      const xEnd = targetNode.x;
      const yEnd = targetNode.y + 22;
      const controlX1 = xStart + (xEnd - xStart) / 2;
      const controlX2 = xStart + (xEnd - xStart) / 2;
      pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
    } else {
      const xStart = sourceNode.isRoot ? sourceNode.x + 90 : sourceNode.x + 80;
      const yStart = sourceNode.isRoot ? sourceNode.y + 64 : sourceNode.y + 44;
      const xEnd = targetNode.x + 80;
      const yEnd = targetNode.y;
      const controlY1 = yStart + (yEnd - yStart) / 2;
      const controlY2 = yStart + (yEnd - yStart) / 2;
      pathData = `M ${xStart} ${yStart} C ${xStart} ${controlY1}, ${xEnd} ${controlY2}, ${xEnd} ${yEnd}`;
    }

    let strokeColor = '#cbd5e1';
    if (sourceNode.color && sourceNode.color !== 'gray') {
      strokeColor =
        sourceNode.color === 'rose'
          ? '#fda4af'
          : sourceNode.color === 'amber'
          ? '#fcd34d'
          : sourceNode.color === 'purple'
          ? '#d8b4fe'
          : sourceNode.color === 'green'
          ? '#6ee7b7'
          : '#93c5fd';
    }

    svgContent += `<path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />`;
  });

  visibleNodes.forEach((node) => {
    const width = node.isRoot ? 180 : 160;
    const height = node.isRoot ? 64 : 44;
    const fillColor =
      node.isRoot
        ? '#ffffff'
        : node.color === 'rose'
        ? '#fff1f2'
        : node.color === 'amber'
        ? '#fef3c7'
        : node.color === 'purple'
        ? '#faf5ff'
        : node.color === 'green'
        ? '#ecfdf5'
        : '#eff6ff';
    const strokeColor =
      node.isRoot
        ? '#cbd5e1'
        : node.color === 'rose'
        ? '#fda4af'
        : node.color === 'amber'
        ? '#fde047'
        : node.color === 'purple'
        ? '#e9d5ff'
        : node.color === 'green'
        ? '#a7f3d0'
        : '#bfdbfe';
    const textColor =
      node.isRoot
        ? '#1e293b'
        : node.color === 'rose'
        ? '#e11d48'
        : node.color === 'amber'
        ? '#d97706'
        : node.color === 'purple'
        ? '#9333ea'
        : node.color === 'green'
        ? '#059669'
        : '#2563eb';

    svgContent += `<g transform="translate(${node.x}, ${node.y})">
      <rect width="${width}" height="${height}" rx="12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" />
      <text x="${width / 2}" y="${height / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">${node.text}</text>
    </g>`;
  });

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${mindmap.title}.svg`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
