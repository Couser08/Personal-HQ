import { type ProjectNode } from '../../../store/types';

// Helper: Normalize path string
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/').trim();
}

// Build hierarchical structure for rendering
export function buildTreeHierarchy(nodes: ProjectNode[]): any[] {
  const nodeMap = new Map<string, any>();
  const rootItems: any[] = [];

  // Sort nodes so folders come before files, then alphabetical
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  sortedNodes.forEach((node) => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  sortedNodes.forEach((node) => {
    const item = nodeMap.get(node.id);
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId).children.push(item);
    } else {
      rootItems.push(item);
    }
  });

  return rootItems;
}

// Generate ASCII Tree from nodes
export function generateAsciiTree(rootName: string, nodes: ProjectNode[]): string {
  const rootNode = {
    name: rootName || 'root',
    children: buildTreeHierarchy(nodes),
  };

  const lines: string[] = [rootNode.name + '/'];

  function renderChildren(items: any[], prefix: string = '') {
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const childPrefix = isLast ? '    ' : '│   ';
      const suffix = item.type === 'folder' ? '/' : '';
      lines.push(`${prefix}${connector}${item.name}${suffix}`);

      if (item.children && item.children.length > 0) {
        renderChildren(item.children, prefix + childPrefix);
      }
    });
  }

  renderChildren(rootNode.children);
  return lines.join('\n');
}
