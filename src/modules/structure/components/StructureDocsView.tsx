import React, { useState } from 'react';
import {
  IconBook2,
  IconTerminal2,
  IconCode,
  IconCopy,
  IconCheck,
  IconArrowLeft,
  IconLayersLinked,
  IconFileCode,
  IconFileZip
} from '@tabler/icons-react';
import { COMMAND_DOCS } from '../utils/commandEngine';
import { FileIcon } from './FileIcon';

interface StructureDocsViewProps {
  onBack: () => void;
}

export const StructureDocsView: React.FC<StructureDocsViewProps> = ({ onBack }) => {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(id);
    setTimeout(() => setCopiedExample(null), 1500);
  };

  const categories = ['Structure', 'Project', 'Inspection', 'Utility'] as const;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 text-zinc-200 animate-fadeIn">
      <div className="w-full max-w-full lg:max-w-4xl flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
              title="Return to Workspace"
            >
              <IconArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-2">
                <IconTerminal2 className="text-primary" size={24} />
                Project Architect Command Documentation
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Complete guide to the unique application command DSL, tree syntax, and VS Code explorer.
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            Back to Architect
          </button>
        </div>

        {/* Quick Summary Cards (max-w-2xl styled) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-2">
              <IconTerminal2 size={18} />
            </div>
            <h2 className="text-sm font-bold text-zinc-100">Unique App CLI</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Custom in-app commands tailored for tree creation without shell quirks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-2">
              <IconCode size={18} />
            </div>
            <h2 className="text-sm font-bold text-zinc-100">Indented Tree DSL</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Paste standard 2-space indented structures and compile directly into graphs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-2">
              <IconFileZip size={18} />
            </div>
            <h2 className="text-sm font-bold text-zinc-100">Direct ZIP Export</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Download real folder archives with all boilerplate files and templates.
            </p>
          </div>
        </div>

        {/* Command Reference Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <IconBook2 size={18} className="text-primary" />
              Command Language Specification
            </h2>
            <span className="text-xs text-zinc-500 font-mono">{COMMAND_DOCS.length} Commands Available</span>
          </div>

          <div className="space-y-6">
            {categories.map((cat) => {
              const catDocs = COMMAND_DOCS.filter((d) => d.category === cat);
              if (catDocs.length === 0) return null;

              return (
                <div key={cat} className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    {cat} Commands
                  </span>

                  <div className="grid grid-cols-1 gap-2.5">
                    {catDocs.map((doc) => (
                      <div
                        key={doc.command}
                        className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-primary font-mono text-xs font-bold">
                              {doc.command}
                            </span>
                            <span className="font-mono text-xs text-zinc-300">
                              {doc.syntax}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {doc.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                          <code className="text-[11px] font-mono bg-zinc-950 px-2.5 py-1 rounded-lg text-emerald-400 border border-zinc-800/80 max-w-[260px] truncate">
                            {doc.example}
                          </code>
                          <button
                            onClick={() => handleCopy(doc.example, doc.command)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Copy Example"
                          >
                            {copiedExample === doc.command ? (
                              <IconCheck size={14} className="text-emerald-400" />
                            ) : (
                              <IconCopy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indented Tree DSL Guide */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <IconLayersLinked size={18} className="text-emerald-400" />
            Indented Tree DSL Syntax
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            You can write or paste standard folder hierarchy structures using 2 spaces or 4 spaces indentation. Folder lines ending in <code>/</code> are automatically created as folders, and file names with extensions are mapped to their respective VS Code icon themes.
          </p>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-300 overflow-x-auto">
            <pre>{`my-application/
  src/
    components/
      ui/
        Button.tsx
        Card.tsx
    hooks/
      useAuth.ts
    App.tsx
    main.tsx
  public/
    favicon.svg
  package.json
  tsconfig.json
  README.md`}</pre>
          </div>
        </div>

        {/* VS Code Icon Showcase */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <IconFileCode size={18} className="text-blue-400" />
            VS Code Icon & Badge Catalog
          </h2>
          <p className="text-xs text-zinc-400">
            Every file extension and recognized directory name receives custom color styling and badges matching VS Code.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
            {[
              { name: 'App.tsx', type: 'file' },
              { name: 'index.ts', type: 'file' },
              { name: 'styles.css', type: 'file' },
              { name: 'schema.sql', type: 'file' },
              { name: 'main.py', type: 'file' },
              { name: 'lib.rs', type: 'file' },
              { name: 'package.json', type: 'file' },
              { name: '.env.local', type: 'file' },
              { name: 'Dockerfile', type: 'file' },
              { name: 'README.md', type: 'file' },
              { name: 'src', type: 'folder' },
              { name: 'components', type: 'folder' },
              { name: 'hooks', type: 'folder' },
              { name: 'api', type: 'folder' },
              { name: 'public', type: 'folder' },
              { name: 'tests', type: 'folder' },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs font-mono"
              >
                <FileIcon name={item.name} type={item.type as any} isOpen size={16} />
                <span className="truncate text-zinc-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
