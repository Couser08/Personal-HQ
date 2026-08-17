import { useState, useRef, useEffect } from 'react';
import {
  IconTerminal2,
  IconCornerDownLeft,
  IconTrash,
  IconHelp,
  IconCode,
  IconCopy,
  IconCheck,
  IconDownload
} from '@tabler/icons-react';
import { type ProjectNode, type ProjectStructure } from '../../../store/types';
import { executeCommand, type CommandResult } from '../utils/commandEngine';

interface TerminalLogEntry {
  id: string;
  type: 'command' | 'success' | 'error' | 'info' | 'tree';
  text: string;
  timestamp: string;
}

interface CommandTerminalProps {
  project: ProjectStructure;
  onUpdateNodes: (nodes: ProjectNode[]) => void;
  onRenameProject: (name: string) => void;
  onOpenBatchScript: () => void;
  onOpenDocs: () => void;
  onOpenExport: () => void;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  project,
  onUpdateNodes,
  onRenameProject,
  onOpenBatchScript,
  onOpenDocs,
  onOpenExport,
}) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<TerminalLogEntry[]>([
    {
      id: 'init-1',
      type: 'info',
      text: `Personal HQ Project Architect Engine v2.0 ready.\nActive workspace: "${project.name}" (${project.rootName})\nType "help" or click quick chips below to begin.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRunCommand = (cmdText?: string) => {
    const commandToRun = (cmdText !== undefined ? cmdText : input).trim();
    if (!commandToRun) return;

    // Add to history
    setHistory((prev) => [commandToRun, ...prev.filter((h) => h !== commandToRun)]);
    setHistoryIdx(-1);

    // Append command entry to logs
    const cmdEntry: TerminalLogEntry = {
      id: `log-${Date.now()}-cmd`,
      type: 'command',
      text: commandToRun,
      timestamp: new Date().toLocaleTimeString(),
    };

    const res: CommandResult = executeCommand(
      commandToRun,
      project.rootName || project.name,
      project.nodes
    );

    if (res.message === 'CLEAR_SIGNAL') {
      setLogs([]);
      setInput('');
      return;
    }

    if (res.newProjectName) {
      onRenameProject(res.newProjectName);
    }

    if (res.nodes) {
      onUpdateNodes(res.nodes);
    }

    let responseEntry: TerminalLogEntry;
    if (res.asciiTree) {
      responseEntry = {
        id: `log-${Date.now()}-res`,
        type: 'tree',
        text: res.asciiTree,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (res.success) {
      responseEntry = {
        id: `log-${Date.now()}-res`,
        type: 'success',
        text: res.message,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      responseEntry = {
        id: `log-${Date.now()}-res`,
        type: 'error',
        text: res.message,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    setLogs((prev) => [...prev, cmdEntry, responseEntry]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  const handleCopyLog = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 1500);
  };

  const QUICK_COMMANDS = [
    { label: 'tree', cmd: 'tree' },
    { label: 'stats', cmd: 'stats' },
    { label: '+ folder', cmd: 'mkdir src/components' },
    { label: '+ file', cmd: 'touch src/index.ts' },
    { label: 'help', cmd: 'help' },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950/90 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md font-mono">
      {/* Terminal Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/70 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-zinc-200">
            <IconTerminal2 size={15} className="text-primary" />
            <span>HQ Architecture CLI</span>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenBatchScript}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            title="Paste & Run Multi-line Script / Tree"
          >
            <IconCode size={13} />
            <span className="hidden sm:inline">Batch Script</span>
          </button>
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            title="Export Structure or Download ZIP"
          >
            <IconDownload size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            title="View Command Cheatsheet & Documentation"
          >
            <IconHelp size={13} />
            <span className="hidden sm:inline">Docs</span>
          </button>
          <button
            onClick={() => setLogs([])}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Clear Terminal Log"
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Log Output */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2 text-xs custom-scrollbar min-h-[220px]">
        {logs.map((log) => {
          if (log.type === 'command') {
            return (
              <div key={log.id} className="flex items-start gap-2 text-primary font-semibold">
                <span className="text-zinc-500 select-none">❯</span>
                <span className="text-zinc-100">{log.text}</span>
                <span className="ml-auto text-[10px] text-zinc-600 select-none">{log.timestamp}</span>
              </div>
            );
          }

          if (log.type === 'tree') {
            return (
              <div key={log.id} className="relative group p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-emerald-400 my-1.5">
                <pre className="font-mono text-xs whitespace-pre overflow-x-auto leading-relaxed">{log.text}</pre>
                <button
                  onClick={() => handleCopyLog(log.id, log.text)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy ASCII Tree"
                >
                  {copiedLogId === log.id ? <IconCheck size={13} className="text-emerald-400" /> : <IconCopy size={13} />}
                </button>
              </div>
            );
          }

          if (log.type === 'error') {
            return (
              <div key={log.id} className="flex items-start gap-2 text-rose-400 bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg my-1">
                <span className="font-bold select-none">✖</span>
                <span className="whitespace-pre-wrap">{log.text}</span>
              </div>
            );
          }

          if (log.type === 'success') {
            return (
              <div key={log.id} className="flex items-start gap-2 text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg my-1">
                <span className="font-bold select-none">✔</span>
                <span className="whitespace-pre-wrap">{log.text}</span>
              </div>
            );
          }

          return (
            <div key={log.id} className="text-zinc-400 whitespace-pre-wrap leading-relaxed py-0.5">
              {log.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/40 border-t border-zinc-800/60 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider select-none flex-shrink-0">
          Quick:
        </span>
        {QUICK_COMMANDS.map((qc) => (
          <button
            key={qc.label}
            onClick={() => handleRunCommand(qc.cmd)}
            className="px-2 py-0.5 text-[11px] rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/40 transition-colors flex-shrink-0"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Interactive Command Input Line */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900/90 border-t border-zinc-800">
        <div className="flex items-center gap-1 text-primary text-xs font-bold select-none">
          <span>{project.rootName || 'phq'}</span>
          <span className="text-zinc-500">$</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type command (e.g. mkdir src/hooks or touch src/App.tsx) or 'help'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 text-xs outline-hidden focus:ring-0 font-mono"
        />
        <button
          onClick={() => handleRunCommand()}
          disabled={!input.trim()}
          className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
            input.trim()
              ? 'bg-primary text-white hover:opacity-90 shadow-sm'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          title="Run Command"
        >
          <IconCornerDownLeft size={14} />
        </button>
      </div>
    </div>
  );
};
