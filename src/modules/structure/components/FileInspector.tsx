import React, { useState, useEffect } from 'react';
import {
  IconFileCode,
  IconCopy,
  IconCheck,
  IconDeviceFloppy,
  IconSparkles,
  IconFilePlus,
  IconFolderPlus,
  IconX
} from '@tabler/icons-react';
import { type ProjectNode } from '../../../store/types';
import { FileIcon } from './FileIcon';
import { Button } from '../../../components/ui/Button';
import { useToastStore } from '../../../store/useToastStore';

interface FileInspectorProps {
  node: ProjectNode | null;
  allNodes: ProjectNode[];
  onClose: () => void;
  onUpdateContent: (nodeId: string, content: string) => void;
  onAddChildNode: (parentId: string, type: 'file' | 'folder') => void;
}

const SNIPPET_TEMPLATES: Record<string, { label: string; code: string }[]> = {
  tsx: [
    {
      label: 'React Component',
      code: `import React from 'react';\n\ninterface Props {\n  title?: string;\n}\n\nexport const Component: React.FC<Props> = ({ title }) => {\n  return (\n    <div className="p-4 rounded-xl border border-zinc-800">\n      <h1>{title || 'Hello'}</h1>\n    </div>\n  );\n};`,
    },
    {
      label: 'React Hook',
      code: `import { useState, useEffect } from 'react';\n\nexport function useToggle(initial = false) {\n  const [value, setValue] = useState(initial);\n  const toggle = () => setValue(v => !v);\n  return [value, toggle] as const;\n}`,
    },
  ],
  ts: [
    {
      label: 'TypeScript Interface',
      code: `export interface User {\n  id: string;\n  email: string;\n  name: string;\n  createdAt: string;\n}`,
    },
    {
      label: 'Async API Service',
      code: `export const apiService = {\n  async get(endpoint: string) {\n    const res = await fetch(endpoint);\n    return res.json();\n  }\n};`,
    },
  ],
  sql: [
    {
      label: 'SQL Table & RLS',
      code: `CREATE TABLE IF NOT EXISTS public.items (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    title TEXT NOT NULL,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n);\n\nALTER TABLE public.items ENABLE ROW LEVEL SECURITY;`,
    },
  ],
  py: [
    {
      label: 'FastAPI Router',
      code: `from fastapi import APIRouter\n\nrouter = APIRouter(prefix="/users", tags=["users"])\n\n@router.get("/")\ndef get_users():\n    return []`,
    },
  ],
  json: [
    {
      label: 'Config JSON',
      code: `{\n  "name": "project",\n  "version": "1.0.0",\n  "settings": {\n    "enabled": true\n  }\n}`,
    },
  ],
  md: [
    {
      label: 'README Spec',
      code: `# Module Specification\n\n## Overview\nProvide module overview and requirements here.\n\n## API Reference\n- GET /api/v1/resource`,
    },
  ],
};

export const FileInspector: React.FC<FileInspectorProps> = ({
  node,
  allNodes,
  onClose,
  onUpdateContent,
  onAddChildNode,
}) => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    if (node) {
      setContent(node.content || '');
      setHasChanges(false);
    }
  }, [node]);

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl">
        <IconFileCode size={36} stroke={1.5} className="opacity-30 mb-2" />
        <p className="text-xs">Select any file or folder to inspect specifications & boilerplates.</p>
      </div>
    );
  }

  const isFolder = node.type === 'folder';
  const childNodes = isFolder ? allNodes.filter((n) => n.parentId === node.id) : [];
  const ext = node.extension?.toLowerCase() || '';
  const availableSnippets = SNIPPET_TEMPLATES[ext] || [];

  const handleSave = () => {
    onUpdateContent(node.id, content);
    setHasChanges(false);
    addToast('File Saved', `Updated ${node.name} boilerplate content.`, 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md font-mono">
      {/* Inspector Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <FileIcon name={node.name} type={node.type} isOpen size={17} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-zinc-100 truncate">{node.name}</span>
            <span className="text-[10px] text-zinc-400 truncate">{node.path}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Close Inspector"
          >
            <IconX size={15} />
          </button>
        </div>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {/* Node Metadata Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block uppercase font-sans font-semibold">Type</span>
            <span className="text-zinc-200 font-bold capitalize">{node.type}</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block uppercase font-sans font-semibold">Extension</span>
            <span className="text-zinc-200 font-bold uppercase">{node.extension || 'Directory'}</span>
          </div>
        </div>

        {isFolder ? (
          /* Folder Children Details */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">
                Folder Contents ({childNodes.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAddChildNode(node.id, 'file')}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1"
                >
                  <IconFilePlus size={13} /> File
                </button>
                <button
                  onClick={() => onAddChildNode(node.id, 'folder')}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1"
                >
                  <IconFolderPlus size={13} /> Folder
                </button>
              </div>
            </div>

            {childNodes.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                This folder is currently empty.
              </div>
            ) : (
              <div className="space-y-1">
                {childNodes.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs"
                  >
                    <FileIcon name={child.name} type={child.type} size={15} />
                    <span className="text-zinc-200 truncate flex-1">{child.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">{child.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* File Content & Boilerplate Editor */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <IconSparkles size={14} className="text-amber-400" />
                Boilerplate Code / Notes
              </span>

              {availableSnippets.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-500">Insert:</span>
                  {availableSnippets.map((snip) => (
                    <button
                      key={snip.label}
                      type="button"
                      onClick={() => {
                        setContent(snip.code);
                        setHasChanges(true);
                      }}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 hover:bg-zinc-700 text-primary border border-zinc-700/60 transition-colors"
                    >
                      {snip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setHasChanges(true);
              }}
              rows={10}
              placeholder="// Write starter code, types, or documentation notes for this file..."
              className="w-full p-2.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleCopy}
                disabled={!content.trim()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-40"
              >
                {copied ? <IconCheck size={13} className="text-emerald-400" /> : <IconCopy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges}
                className="text-xs py-1"
              >
                <IconDeviceFloppy size={14} className="mr-1" />
                Save Boilerplate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
