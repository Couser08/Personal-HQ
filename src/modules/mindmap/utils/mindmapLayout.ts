import { type Mindmap, type MindmapNode } from '../../../store/useAppStore';
import { type MindmapColor } from './mindmapUtils';

export const calculateTidyLayout = (mindmap: Mindmap): MindmapNode[] | null => {
  const rootNode = mindmap.nodes.find((n) => n.isRoot);
  if (!rootNode) return null;

  const newNodes = [...mindmap.nodes];
  const rootIndex = newNodes.findIndex((n) => n.id === rootNode.id);
  const rx = 450;
  const ry = 250;
  newNodes[rootIndex] = { ...rootNode, x: rx, y: ry };

  const rootChildren = newNodes.filter((n) => n.parentId === rootNode.id);

  const rightChildren: typeof rootChildren = [];
  const leftChildren: typeof rootChildren = [];

  rootChildren.forEach((child, index) => {
    const side = child.side || (index % 2 === 0 ? 'right' : 'left');
    if (side === 'left') {
      leftChildren.push(child);
    } else {
      rightChildren.push(child);
    }
  });

  const layoutSubTree = (
    parentId: string,
    parentX: number,
    parentY: number,
    direction: 'left' | 'right',
    verticalSpacing: number,
  ) => {
    const children = newNodes.filter((n) => n.parentId === parentId);
    if (children.length === 0) return;

    const totalHeight = (children.length - 1) * verticalSpacing;
    const startY = parentY - totalHeight / 2;

    children.forEach((child, index) => {
      const childX = direction === 'right' ? parentX + 220 : parentX - 220;
      const childY = startY + index * verticalSpacing;

      const childIdx = newNodes.findIndex((n) => n.id === child.id);
      newNodes[childIdx] = { ...child, x: childX, y: childY, side: direction };

      layoutSubTree(child.id, childX, childY, direction, verticalSpacing * 0.85);
    });
  };

  if (rightChildren.length > 0) {
    const rTotalHeight = (rightChildren.length - 1) * 120;
    const rStartY = ry - rTotalHeight / 2;
    rightChildren.forEach((child, idx) => {
      const cx = rx + 240;
      const cy = rStartY + idx * 120;
      const childIdx = newNodes.findIndex((n) => n.id === child.id);
      newNodes[childIdx] = { ...child, x: cx, y: cy, side: 'right' };
      layoutSubTree(child.id, cx, cy, 'right', 90);
    });
  }

  if (leftChildren.length > 0) {
    const lTotalHeight = (leftChildren.length - 1) * 120;
    const lStartY = ry - lTotalHeight / 2;
    leftChildren.forEach((child, idx) => {
      const cx = rx - 240;
      const cy = lStartY + idx * 120;
      const childIdx = newNodes.findIndex((n) => n.id === child.id);
      newNodes[childIdx] = { ...child, x: cx, y: cy, side: 'left' };
      layoutSubTree(child.id, cx, cy, 'left', 90);
    });
  }

  return newNodes;
};

export const getNextAvailableColor = (
  nodes: MindmapNode[],
  parentId: string,
  currentParentColor?: MindmapColor,
): MindmapColor => {
  const COLORS: MindmapColor[] = ['rose', 'amber', 'purple', 'green', 'blue'];
  const siblingColors = nodes.filter((n) => n.parentId === parentId).map((n) => n.color);
  const available = COLORS.filter((c) => c !== currentParentColor && !siblingColors.includes(c));
  if (available.length > 0) return available[0];
  const fallbackColors = COLORS.filter((c) => c !== currentParentColor);
  return fallbackColors[Math.floor(Math.random() * fallbackColors.length)] || 'blue';
};

export const getDescendants = (nodeId: string, nodes: MindmapNode[]): string[] => {
  const childIds = nodes.filter((n) => n.parentId === nodeId).map((n) => n.id);
  let descendants = [...childIds];
  childIds.forEach((id) => {
    descendants = [...descendants, ...getDescendants(id, nodes)];
  });
  return descendants;
};
