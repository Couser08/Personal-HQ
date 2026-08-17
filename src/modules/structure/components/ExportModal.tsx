import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  IconDownload,
  IconCopy,
  IconCheck,
  IconTerminal2,
  IconFileText,
  IconCode,
  IconFileZip,
  IconBrandPowershell
} from '@tabler/icons-react';
import { type ProjectStructure } from '../../../store/types';
import {
  exportAsAsciiTree,
  exportAsMarkdown,
  exportAsBashScript,
  exportAsPowerShellScript,
  exportAsJson,
  downloadProjectZip
} from '../utils/treeExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectStructure;
}

type ExportTab = 'zip' | 'bash' | 'powershell' | 'tree' | 'markdown' | 'json';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('zip');
  const [copied, setCopied] = useState(false);

  const getExportText = () => {
    switch (activeTab) {
      case 'bash':
        return exportAsBashScript(project);
      case 'powershell':
        return exportAsPowerShellScript(project);
      case 'tree':
        return exportAsAsciiTree(project);
      case 'markdown':
        return exportAsMarkdown(project);
      case 'json':
        return exportAsJson(project);
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const text = getExportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadZip = () => {
    downloadProjectZip(project);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Project Structure" maxWidthClassName="max-w-2xl">
      <div className="flex flex-col gap-4 text-zinc-200">
        {/* Export Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('zip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              activeTab === 'zip' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <IconFileZip size={15} />
            <span>Download ZIP</span>
          </button>
          <button
            onClick={() => setActiveTab('bash')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              activeTab === 'bash' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <IconTerminal2 size={15} />
            <span>Bash Script</span>
          </button>
          <button
            onClick={() => setActiveTab('powershell')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              activeTab === 'powershell' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <IconBrandPowershell size={15} />
            <span>PowerShell</span>
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              activeTab === 'tree' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <IconCode size={15} />
            <span>ASCII Tree</span>
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              activeTab === 'markdown' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <IconFileText size={15} />
            <span>Markdown</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              activeTab === 'json' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <IconCode size={15} />
            <span>JSON</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'zip' ? (
          <div className="flex flex-col items-center justify-center p-8 gap-4 bg-zinc-950 border border-zinc-800/80 rounded-xl text-center">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
              <IconFileZip size={44} stroke={1.5} />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="text-sm font-bold text-zinc-100">
                Download Direct ZIP Archive
              </h3>
              <p className="text-xs text-zinc-400">
                Generates a clean <code className="text-primary font-mono">{project.rootName}.zip</code> file containing the entire folder hierarchy and boilerplate files ready to open in VS Code.
              </p>
            </div>
            <Button variant="primary" onClick={handleDownloadZip} className="mt-2 px-6">
              <IconDownload size={16} className="mr-2" />
              Download .ZIP Archive
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <pre className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto max-h-[300px] leading-relaxed custom-scrollbar whitespace-pre">
                {getExportText()}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {activeTab === 'bash' && 'Linux / macOS / Git Bash compatible'}
                {activeTab === 'powershell' && 'Windows PowerShell 5.1+ / Core compatible'}
                {activeTab === 'tree' && 'Ideal for README.md project structures'}
                {activeTab === 'markdown' && 'Complete architectural documentation'}
                {activeTab === 'json' && 'Machine-readable schema'}
              </span>

              <Button variant="primary" onClick={handleCopy} className="text-xs">
                {copied ? <IconCheck size={14} className="mr-1.5 text-emerald-400" /> : <IconCopy size={14} className="mr-1.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
