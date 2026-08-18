import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowRight, IconRefresh, IconX, IconDownload, IconCircleCheck } from '@tabler/icons-react';
import { VariablesPanel } from './components/VariablesPanel';
import { RulesPanel } from './components/RulesPanel';
import { DecisionDiagram } from './components/DecisionDiagram';
import { RegexTipsModal } from './components/RegexTipsModal';
import {
  evaluateConditions,
  type Variable,
  type Rule,
  type EvaluationResult
} from './utils/conditionEvaluator';

export default function ConditionModule() {
  const [isRegexTipsOpen, setIsRegexTipsOpen] = useState(false);

  // Variables State
  const [variables, setVariables] = useState<Variable[]>([
    { name: 'age', type: 'number', testValue: '21' },
    { name: 'email', type: 'string', testValue: 'user@example.com' },
    { name: 'member', type: 'boolean', testValue: 'true' }
  ]);

  // Outcomes Registry
  const [outcomes, setOutcomes] = useState<string[]>([
    'Reject (Underage)',
    'Allow Member Registration',
    'Apply 15% Member Discount',
    'Default (Standard Guest)'
  ]);

  // Execution Mode State
  const [stopsOnMatch, setStopsOnMatch] = useState<boolean>(true);

  // Rules State
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', variableName: 'age', operator: 'less_than', value: '18', outcome: 'Reject (Underage)' },
    { id: '2', variableName: 'email', operator: 'regex', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', outcome: 'Allow Member Registration' },
    { id: '3', variableName: 'member', operator: 'equals', value: 'true', outcome: 'Apply 15% Member Discount' }
  ]);

  const [defaultOutcome, setDefaultOutcome] = useState('Default (Standard Guest)');
  const [evalResult, setEvalResult] = useState<EvaluationResult>({
    outcome: '',
    matchedRuleId: null,
    matchedRuleIds: [],
    trace: []
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const scaleFactor = 2;
  const DIAGRAM_PAD = 40;
  const NODE_H = 52;
  const ROW_GAP = 90;
  const logicalWidth = 640;
  const logicalHeight = DIAGRAM_PAD * 2 + NODE_H + rules.length * ROW_GAP + ROW_GAP + NODE_H;

  // Variable Helpers
  const addVariable = () => {
    const defaultName = `var_${variables.length + 1}`;
    setVariables([...variables, { name: defaultName, type: 'string', testValue: '' }]);
  };

  const deleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, key: keyof Variable, val: string) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [key]: val } as Variable;
    setVariables(updated);
  };

  // Outcome Helpers
  const addOutcome = (label: string) => {
    if (!outcomes.includes(label)) {
      setOutcomes([...outcomes, label]);
    }
  };

  // Rule Helpers
  const addRule = () => {
    const newId = crypto.randomUUID();
    const fallbackOutcome = outcomes[0] || 'Default (Standard Guest)';
    setRules([
      ...rules,
      {
        id: newId,
        variableName: variables[0]?.name || 'age',
        operator: 'equals',
        value: '',
        outcome: fallbackOutcome
      }
    ]);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, key: keyof Rule, val: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  };

  const reorderRules = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= rules.length) return;
    const next = [...rules];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setRules(next);
  };

  // Evaluate logic
  const handleEvaluate = () => {
    const res = evaluateConditions(variables, rules, defaultOutcome, stopsOnMatch);
    setEvalResult(res);
  };

  // Auto evaluate when variables/rules/mode change
  useEffect(() => {
    handleEvaluate();
  }, [variables, rules, defaultOutcome, stopsOnMatch]);

  // Sync preview canvas when preview is open
  useEffect(() => {
    if (!isPreviewOpen || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const mainCanvas = canvasRef.current;
    if (mainCanvas) {
      ctx.drawImage(mainCanvas, 0, 0);
    }
  }, [isPreviewOpen, rules, variables, evalResult, defaultOutcome, stopsOnMatch]);

  // Export Canvas
  const exportImage = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return;

    const isDark = document.documentElement.classList.contains('dark');
    tempCtx.fillStyle = isDark ? '#06060c' : '#f8fafc';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL(`image/${format}`);
    const link = document.createElement('a');
    link.download = `condition-diagram.${format}`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex flex-col gap-6 max-w-7xl w-full mx-auto pb-12"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            Condition Workstation
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
              <IconCircleCheck size={13} />
              Saved
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Build rules, test variable chains, review trace execution logs, and export live flowcharts
          </p>
        </div>
      </div>

      {/* Main Grid Layout: Pinned Variables Rail (left) + Rules Table & Trace (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail: Variables Panel (4 cols) */}
        <div className="lg:col-span-4">
          <VariablesPanel
            variables={variables}
            addVariable={addVariable}
            updateVariable={updateVariable}
            deleteVariable={deleteVariable}
          />
        </div>

        {/* Right Area: Rules & Trace Execution (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <RulesPanel
            rules={rules}
            variables={variables}
            outcomes={outcomes}
            stopsOnMatch={stopsOnMatch}
            setStopsOnMatch={setStopsOnMatch}
            addRule={addRule}
            updateRule={updateRule}
            deleteRule={deleteRule}
            reorderRules={reorderRules}
            addOutcome={addOutcome}
            defaultOutcome={defaultOutcome}
            setDefaultOutcome={setDefaultOutcome}
            setIsRegexTipsOpen={setIsRegexTipsOpen}
          />

          {/* Section 3: Workbench Trace Execution */}
          <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-4 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-text-primary">3. Workbench Trace Execution</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Live execution trace results (Auto-updated on edit)
                </p>
              </div>
              <button
                onClick={handleEvaluate}
                className="btn btn-secondary btn-sm flex items-center gap-1 cursor-pointer text-xs"
              >
                <IconRefresh size={14} /> Re-Run
              </button>
            </div>

            <div className="bg-surface-alt/45 rounded-2xl border border-border/45 p-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                  Winning Outcome
                </span>
                <p className="text-lg font-black text-primary mt-0.5">{evalResult.outcome}</p>
              </div>

              <div className="border-t border-border/40 pt-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                  Execution Log Steps
                </span>
                <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 font-mono text-[11px] custom-scrollbar">
                  {evalResult.trace.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 items-start p-2 rounded-xl border text-xs ${
                        item.type === 'match'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold'
                          : item.type === 'halt'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold'
                          : item.type === 'final'
                          ? 'bg-primary/10 border-primary/30 text-primary font-black'
                          : 'bg-surface/50 border-border/30 text-text-muted'
                      }`}
                    >
                      <IconArrowRight size={12} className="mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Decision Flow Diagram */}
      <div className="mt-2">
        <DecisionDiagram
          canvasRef={canvasRef}
          logicalWidth={logicalWidth}
          logicalHeight={logicalHeight}
          scaleFactor={scaleFactor}
          rules={rules}
          evalResult={evalResult}
          defaultOutcome={defaultOutcome}
          setIsPreviewOpen={setIsPreviewOpen}
          exportImage={exportImage}
        />
      </div>

      {/* Diagram Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative bg-surface border border-border rounded-[28px] shadow-2xl z-10 flex flex-col overflow-y-auto max-h-[85vh]"
              style={{ maxWidth: `${logicalWidth + 48}px`, width: '100%', maxHeight: '85vh' }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/40">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Decision Flow Diagram</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {rules.length} rule{rules.length !== 1 ? 's' : ''} · auto-traced
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportImage('png')}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <IconDownload size={13} /> Export PNG
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="w-8 h-8 rounded-full bg-surface-alt border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <IconX size={15} />
                  </button>
                </div>
              </div>

              <div className="overflow-auto p-6 flex justify-center">
                <canvas
                  ref={previewCanvasRef}
                  width={logicalWidth * scaleFactor}
                  height={logicalHeight * scaleFactor}
                  style={{ width: `${logicalWidth}px`, height: `${logicalHeight}px` }}
                  className="rounded-2xl max-w-full"
                />
              </div>

              <div className="flex items-center gap-5 px-6 pb-5 pt-2 border-t border-border/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#34c759]" />
                  <span className="text-[10px] font-semibold text-text-muted">Match / Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff3b30]" />
                  <span className="text-[10px] font-semibold text-text-muted">No Match / Default</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-px border-t border-dashed border-text-muted/50" />
                  <span className="text-[10px] font-semibold text-text-muted">Skipped path</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RegexTipsModal isOpen={isRegexTipsOpen} onClose={() => setIsRegexTipsOpen(false)} />
    </motion.div>
  );
}
