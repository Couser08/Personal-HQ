import { type ProjectNode } from '../../../store/types';
import { normalizePath } from './treeHierarchy';
import { executeCommand } from './commandEngine';

// Ensure parent folders exist and return updated nodes + parentId
export function ensureParentFolders(
  targetPath: string,
  nodes: ProjectNode[],
): { updatedNodes: ProjectNode[]; parentId: string | null } {
  const segments = normalizePath(targetPath).split('/').filter(Boolean);
  if (segments.length <= 1) {
    return { updatedNodes: nodes, parentId: null };
  }

  const folderSegments = segments.slice(0, -1);
  let currentNodes = [...nodes];
  let currentParentId: string | null = null;
  let accumulatedPath = '';

  for (const seg of folderSegments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${seg}` : seg;
    let existingFolder = currentNodes.find(
      (n) => n.type === 'folder' && normalizePath(n.path) === accumulatedPath,
    );

    if (!existingFolder) {
      const newFolderId = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      existingFolder = {
        id: newFolderId,
        name: seg,
        type: 'folder',
        path: accumulatedPath,
        parentId: currentParentId,
        isExpanded: true,
        createdAt: new Date().toISOString(),
      };
      currentNodes.push(existingFolder);
    }
    currentParentId = existingFolder.id;
  }

  return { updatedNodes: currentNodes, parentId: currentParentId };
}

// Parse indented tree DSL or command script
export function parseTreeOrScript(input: string, currentNodes: ProjectNode[] = []): ProjectNode[] {
  const lines = input
    .split('\n')
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'));
  if (lines.length === 0) return currentNodes;

  const isCommandScript = lines.some((l) => {
    const cmd = l.trim().split(' ')[0].toLowerCase();
    return [
      'mkdir',
      'touch',
      'file',
      'folder',
      'rm',
      'delete',
      'mv',
      'move',
      'rename',
    ].includes(cmd);
  });

  if (isCommandScript) {
    let workingNodes = [...currentNodes];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;
      const res = executeCommand(trimmed, 'temp-project', workingNodes);
      if (res.nodes) {
        workingNodes = res.nodes;
      }
    }
    return workingNodes;
  }

  // Parse indented text structure
  const resultNodes: ProjectNode[] = [];
  const stack: { id: string; name: string; path: string; indent: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const indentMatch = rawLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const text = rawLine.trim();

    if (
      !text ||
      text === '.' ||
      text.startsWith('│') ||
      text.startsWith('├') ||
      text.startsWith('└')
    ) {
      const cleaned = text.replace(/^[│├└─\s\t]+/, '').trim();
      if (!cleaned) continue;
    }

    const cleanText = text.replace(/^[│├└─\s\t]+/, '').trim();
    const isFolder = cleanText.endsWith('/') || !cleanText.includes('.');
    const cleanName = cleanText.replace(/\/+$/, '').trim();

    if (!cleanName) continue;

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack.length > 0 ? stack[stack.length - 1] : null;
    const currentPath = parent ? `${parent.path}/${cleanName}` : cleanName;
    const ext = !isFolder && cleanName.includes('.') ? cleanName.split('.').pop() : undefined;
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${i}`;

    const newNode: ProjectNode = {
      id: nodeId,
      name: cleanName,
      type: isFolder ? 'folder' : 'file',
      path: currentPath,
      parentId: parent ? parent.id : null,
      extension: ext,
      isExpanded: true,
      createdAt: new Date().toISOString(),
    };

    resultNodes.push(newNode);

    if (isFolder) {
      stack.push({
        id: nodeId,
        name: cleanName,
        path: currentPath,
        indent: indent,
      });
    }
  }

  return resultNodes;
}
