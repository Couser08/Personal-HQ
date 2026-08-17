import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  IconChevronRight,
  IconChevronDown,
  IconFilePlus,
  IconFolderPlus,
  IconTrash,
  IconEdit,
  IconCopy,
  IconCheck,
  IconSearch,
  IconX,
  IconFolderOpen,
  IconFolder
} from '@tabler/icons-react';
import { type ProjectNode, type ProjectStructure } from '../../../store/types';
import { FileIcon } from './FileIcon';

interface ProjectTreeExplorerProps {
  project: ProjectStructure;
  selectedNodeId: string | null;
  onSelectNode: (node: ProjectNode | null) => void;
  onAddNode: (node: Partial<ProjectNode>) => void;
  onUpdateNode: (nodeId: string, updates: Partial<ProjectNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onBatchUpdateNodes: (nodes: ProjectNode[]) => void;
}

interface TreeNodeItem extends ProjectNode {
  children: TreeNodeItem[];
  depth: number;
}

export const ProjectTreeExplorer: React.FC<ProjectTreeExplorerProps> = ({
  project,
  selectedNodeId,
  onSelectNode,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onBatchUpdateNodes,
}) => {
  const [search, setSearch] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [creatingParentId, setCreatingParentId] = useState<string | null | 'root'>(null);
  const [creatingType, setCreatingType] = useState<'file' | 'folder'>('file');
  const [newChildName, setNewChildName] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNodeId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNodeId]);

  useEffect(() => {
    if (creatingParentId !== null && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [creatingParentId]);

  // Build hierarchical tree with depth
  const treeItems = useMemo(() => {
    const nodeMap = new Map<string, TreeNodeItem>();
    const roots: TreeNodeItem[] = [];

    // Sort nodes: folders first, then alphabetical
    const sorted = [...project.nodes].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    sorted.forEach((n) => {
      nodeMap.set(n.id, { ...n, children: [], depth: 0 });
    });

    sorted.forEach((n) => {
      const item = nodeMap.get(n.id)!;
      if (n.parentId && nodeMap.has(n.parentId)) {
        const parent = nodeMap.get(n.parentId)!;
        item.depth = parent.depth + 1;
        parent.children.push(item);
      } else {
        item.depth = 0;
        roots.push(item);
      }
    });

    return roots;
  }, [project.nodes]);

  // Filter nodes matching search
  const filteredRoots = useMemo(() => {
    if (!search.trim()) return treeItems;
    const query = search.trim().toLowerCase();

    function filterNode(node: TreeNodeItem): TreeNodeItem | null {
      const isMatch = node.name.toLowerCase().includes(query) || node.path.toLowerCase().includes(query);
      const matchedChildren = node.children
        .map((c) => filterNode(c))
        .filter((c): c is TreeNodeItem => c !== null);

      if (isMatch || matchedChildren.length > 0) {
        return {
          ...node,
          isExpanded: true,
          children: matchedChildren,
        };
      }
      return null;
    }

    return treeItems.map((r) => filterNode(r)).filter((r): r is TreeNodeItem => r !== null);
  }, [treeItems, search]);

  const toggleFolder = (node: ProjectNode, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNode(node.id, { isExpanded: !node.isExpanded });
  };

  const handleStartRename = (node: ProjectNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditingName(node.name);
  };

  const handleSaveRename = (nodeId: string) => {
    if (!editingName.trim()) {
      setEditingNodeId(null);
      return;
    }
    const target = project.nodes.find((n) => n.id === nodeId);
    if (!target) return;

    const parentPath = target.path.includes('/')
      ? target.path.substring(0, target.path.lastIndexOf('/'))
      : '';
    const newPath = parentPath ? `${parentPath}/${editingName.trim()}` : editingName.trim();
    const ext = target.type === 'file' && editingName.includes('.') ? editingName.split('.').pop() : undefined;

    // Also update any child node paths if folder
    if (target.type === 'folder') {
      const oldPrefix = target.path + '/';
      const newPrefix = newPath + '/';
      const updatedNodes = project.nodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, name: editingName.trim(), path: newPath, extension: ext };
        }
        if (n.path.startsWith(oldPrefix)) {
          return { ...n, path: newPrefix + n.path.slice(oldPrefix.length) };
        }
        return n;
      });
      onBatchUpdateNodes(updatedNodes);
    } else {
      onUpdateNode(nodeId, { name: editingName.trim(), path: newPath, extension: ext });
    }

    setEditingNodeId(null);
  };

  const handleStartCreate = (parentId: string | null | 'root', type: 'file' | 'folder', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCreatingParentId(parentId);
    setCreatingType(type);
    setNewChildName('');
    if (parentId && parentId !== 'root') {
      onUpdateNode(parentId, { isExpanded: true });
    }
  };

  const handleSaveCreate = () => {
    const clean = newChildName.trim();
    if (!clean) {
      setCreatingParentId(null);
      return;
    }

    const isRoot = creatingParentId === 'root' || creatingParentId === null;
    const parent = isRoot ? null : project.nodes.find((n) => n.id === creatingParentId);
    const parentPath = parent ? parent.path : '';
    const fullPath = parentPath ? `${parentPath}/${clean}` : clean;
    const ext = creatingType === 'file' && clean.includes('.') ? clean.split('.').pop() : undefined;

    onAddNode({
      name: clean,
      type: creatingType,
      path: fullPath,
      parentId: parent ? parent.id : null,
      extension: ext,
      isExpanded: creatingType === 'folder',
      content: '',
    });

    setCreatingParentId(null);
    setNewChildName('');
  };

  const handleCopyPath = (node: ProjectNode, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(node.path);
    setCopiedPath(node.id);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  const handleToggleAll = (expand: boolean) => {
    const updated = project.nodes.map((n) =>
      n.type === 'folder' ? { ...n, isExpanded: expand } : n
    );
    onBatchUpdateNodes(updated);
  };

  const renderNode = (node: TreeNodeItem) => {
    const isSelected = selectedNodeId === node.id;
    const isEditing = editingNodeId === node.id;
    const isFolder = node.type === 'folder';
    const isExpanded = node.isExpanded ?? true;

    return (
      <div key={node.id} className="relative group/node select-none">
        {/* Node Row */}
        <div
          onClick={() => onSelectNode(node)}
          style={{ paddingLeft: `${node.depth * 14 + 10}px` }}
          className={`relative flex items-center gap-1.5 py-1.5 pr-2 rounded-lg cursor-pointer transition-colors duration-150 text-xs font-mono group-hover/node:bg-zinc-800/60 ${
            isSelected
              ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          {/* Depth Guideline lines */}
          {node.depth > 0 &&
            Array.from({ length: node.depth }).map((_, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 border-l border-zinc-800 pointer-events-none"
                style={{ left: `${idx * 14 + 16}px` }}
              />
            ))}

          {/* Folder Chevron */}
          {isFolder ? (
            <button
              onClick={(e) => toggleFolder(node, e)}
              className="p-0.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
              title={isExpanded ? 'Collapse Folder' : 'Expand Folder'}
            >
              {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-3.5 flex-shrink-0" />
          )}

          {/* Icon */}
          <FileIcon name={node.name} type={node.type} isOpen={isExpanded} size={16} />

          {/* Name or Rename Input */}
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(node.id);
                if (e.key === 'Escape') setEditingNodeId(null);
              }}
              onBlur={() => handleSaveRename(node.id)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 bg-zinc-950 border border-primary text-zinc-100 px-1.5 py-0.5 rounded text-xs outline-hidden focus:ring-1 focus:ring-primary"
            />
          ) : (
            <span className="truncate flex-1 min-w-0 tracking-tight">{node.name}</span>
          )}

          {/* Hover Actions */}
          <div className="opacity-0 group-hover/node:opacity-100 transition-opacity flex items-center gap-0.5 ml-auto flex-shrink-0">
            {isFolder && (
              <>
                <button
                  onClick={(e) => handleStartCreate(node.id, 'file', e)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700/60"
                  title="New File inside this folder"
                >
                  <IconFilePlus size={13} />
                </button>
                <button
                  onClick={(e) => handleStartCreate(node.id, 'folder', e)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700/60"
                  title="New Folder inside this folder"
                >
                  <IconFolderPlus size={13} />
                </button>
              </>
            )}

            <button
              onClick={(e) => handleCopyPath(node, e)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700/60"
              title={copiedPath === node.id ? 'Path Copied!' : 'Copy Path'}
            >
              {copiedPath === node.id ? <IconCheck size={13} className="text-emerald-400" /> : <IconCopy size={13} />}
            </button>

            <button
              onClick={(e) => handleStartRename(node, e)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700/60"
              title="Rename"
            >
              <IconEdit size={13} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
              className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40"
              title="Delete"
            >
              <IconTrash size={13} />
            </button>
          </div>
        </div>

        {/* Inline Create Row for Children */}
        {creatingParentId === node.id && (
          <div
            style={{ paddingLeft: `${(node.depth + 1) * 14 + 10}px` }}
            className="flex items-center gap-1.5 py-1 pr-2 my-0.5 bg-zinc-900/80 border border-zinc-700/70 rounded-lg text-xs font-mono"
          >
            <FileIcon name={newChildName || (creatingType === 'file' ? 'new-file.ts' : 'new-folder')} type={creatingType} isOpen size={16} />
            <input
              ref={createInputRef}
              type="text"
              placeholder={creatingType === 'file' ? 'filename.ext' : 'folder-name'}
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCreate();
                if (e.key === 'Escape') setCreatingParentId(null);
              }}
              onBlur={handleSaveCreate}
              className="flex-1 min-w-0 bg-transparent text-white px-1 py-0.5 outline-hidden placeholder:text-zinc-500"
            />
          </div>
        )}

        {/* Render Nested Children if folder is expanded */}
        {isFolder && isExpanded && node.children.length > 0 && (
          <div className="flex flex-col">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const totalFolders = project.nodes.filter((n) => n.type === 'folder').length;
  const totalFiles = project.nodes.filter((n) => n.type === 'file').length;

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-primary/10 text-primary">
            <IconFolderOpen size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider truncate">
              {project.rootName || project.name}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {totalFolders} folders, {totalFiles} files
            </span>
          </div>
        </div>

        {/* Global Tree Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStartCreate('root', 'file')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="New File at Root"
          >
            <IconFilePlus size={15} />
          </button>
          <button
            onClick={() => handleStartCreate('root', 'folder')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="New Folder at Root"
          >
            <IconFolderPlus size={15} />
          </button>
          <button
            onClick={() => handleToggleAll(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-[11px] font-mono"
            title="Expand All"
          >
            +
          </button>
          <button
            onClick={() => handleToggleAll(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-[11px] font-mono"
            title="Collapse All"
          >
            -
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="px-3 py-2 border-b border-zinc-800/60 bg-zinc-900/20">
        <div className="relative flex items-center">
          <IconSearch size={13} className="absolute left-2.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search files & folders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-7 py-1 text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-mono transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 text-zinc-500 hover:text-zinc-300"
            >
              <IconX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar min-h-[300px]">
        {/* Root Level Inline Create Input */}
        {creatingParentId === 'root' && (
          <div className="flex items-center gap-1.5 py-1 px-2 mb-1 bg-zinc-900 border border-primary/50 rounded-lg text-xs font-mono">
            <FileIcon name={newChildName || (creatingType === 'file' ? 'new-file.ts' : 'new-folder')} type={creatingType} isOpen size={16} />
            <input
              ref={createInputRef}
              type="text"
              placeholder={creatingType === 'file' ? 'filename.ext' : 'folder-name'}
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCreate();
                if (e.key === 'Escape') setCreatingParentId(null);
              }}
              onBlur={handleSaveCreate}
              className="flex-1 min-w-0 bg-transparent text-white px-1 py-0.5 outline-hidden placeholder:text-zinc-500"
            />
          </div>
        )}

        {filteredRoots.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-2">
            <IconFolder size={28} stroke={1.5} className="opacity-40" />
            <p className="text-xs">
              {search ? 'No matching files or folders found.' : 'Tree is currently empty.'}
            </p>
            <button
              onClick={() => handleStartCreate('root', 'file')}
              className="mt-2 text-xs text-primary hover:underline font-mono"
            >
              + Create first file
            </button>
          </div>
        ) : (
          filteredRoots.map((root) => renderNode(root))
        )}
      </div>

      {/* Tree Explorer Footer Status */}
      <div className="px-3 py-1.5 border-t border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>Structure Health: Optimal</span>
        <span>{project.nodes.length} Nodes</span>
      </div>
    </div>
  );
};
