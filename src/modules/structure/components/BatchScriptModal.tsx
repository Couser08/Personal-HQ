import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { IconPlayerPlay, IconInfoCircle } from '@tabler/icons-react';
import { type ProjectNode } from '../../../store/types';
import { parseTreeOrScript } from '../utils/commandEngine';

interface BatchScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNodes: ProjectNode[];
  onApplyNodes: (nodes: ProjectNode[]) => void;
}

const SAMPLE_SCRIPTS = [
  {
    name: 'Indented Tree Syntax',
    code: `src/
  components/
    Navbar.tsx
    Sidebar.tsx
    ui/
      Button.tsx
      Card.tsx
      Modal.tsx
  hooks/
    useTheme.ts
    useAuth.ts
  store/
    useAppStore.ts
  services/
    api.ts
  App.tsx
  main.tsx
public/
  favicon.ico
package.json
tsconfig.json
README.md`,
  },
  {
    name: 'App Command DSL Batch',
    code: `mkdir src/components/ui
mkdir src/hooks
mkdir src/utils
touch src/components/ui/Button.tsx
touch src/components/ui/Modal.tsx
touch src/hooks/useUser.ts
touch src/utils/formatters.ts
touch src/App.tsx "export default function App() {}"
touch package.json
touch README.md "# New Project"`,
  },
];

export const BatchScriptModal: React.FC<BatchScriptModalProps> = ({
  isOpen,
  onClose,
  currentNodes,
  onApplyNodes,
}) => {
  const [script, setScript] = useState(SAMPLE_SCRIPTS[0].code);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');

  const handleApply = () => {
    if (!script.trim()) return;
    const baseNodes = mode === 'append' ? currentNodes : [];
    const generated = parseTreeOrScript(script, baseNodes);
    onApplyNodes(generated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batch Script & Tree DSL Runner" maxWidthClassName="max-w-2xl">
      <div className="flex flex-col gap-4 text-zinc-200">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
          <IconInfoCircle size={18} className="flex-shrink-0" />
          <span>
            You can paste an <strong>indented folder/file tree</strong> (2 spaces per level) or a list of <strong>HQ commands</strong> (<code>mkdir</code>, <code>touch</code>, <code>rm</code>).
          </span>
        </div>

        {/* Preset Sample Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Examples:</span>
          {SAMPLE_SCRIPTS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => setScript(sample.code)}
              className="px-2.5 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>

        {/* Editor Textarea */}
        <div className="relative flex flex-col">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={12}
            className="w-full p-3 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar leading-relaxed"
            placeholder="Paste your folder tree or command list here..."
          />
        </div>

        {/* Mode Selector & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="scriptMode"
                value="replace"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="text-primary focus:ring-primary"
              />
              <span>Replace entire structure</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer ml-3">
              <input
                type="radio"
                name="scriptMode"
                value="append"
                checked={mode === 'append'}
                onChange={() => setMode('append')}
                className="text-primary focus:ring-primary"
              />
              <span>Merge with existing</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              <IconPlayerPlay size={14} className="mr-1.5" />
              Compile & Apply
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
