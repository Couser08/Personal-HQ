import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconTrash, IconDownload,
  IconArrowRight, IconRefresh, IconX, IconSparkles, IconEye
} from '@tabler/icons-react';

interface Variable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  testValue: string;
}

interface Rule {
  id: string;
  variableName: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: string;
  outcome: string;
}

export default function ConditionModule() {
  const [isRegexTipsOpen, setIsRegexTipsOpen] = useState(false);

  // Variables State
  const [variables, setVariables] = useState<Variable[]>([
    { name: 'age', type: 'number', testValue: '21' },
    { name: 'email', type: 'string', testValue: 'user@example.com' },
    { name: 'member', type: 'boolean', testValue: 'true' }
  ]);

  // Rules State
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', variableName: 'age', operator: 'less_than', value: '18', outcome: 'Reject (Underage)' },
    { id: '2', variableName: 'email', operator: 'regex', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', outcome: 'Allow Member Registration' },
    { id: '3', variableName: 'member', operator: 'equals', value: 'true', outcome: 'Apply 15% Member Discount' }
  ]);

  const [defaultOutcome, setDefaultOutcome] = useState('Default (Standard Guest)');
  const [evalResult, setEvalResult] = useState<{ outcome: string; matchedRuleId: string | null; trace: string[] }>({
    outcome: '',
    matchedRuleId: null,
    trace: []
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const scaleFactor = 2;
  // Layout constants for the diagram
  const DIAGRAM_PAD = 40;
  const NODE_W = 200;
  const NODE_H = 52;
  const ROW_GAP = 90;
  const OUTCOME_W = 180;
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

  // Rule Helpers
  const addRule = () => {
    const newId = crypto.randomUUID();
    setRules([...rules, { id: newId, variableName: variables[0]?.name || 'age', operator: 'equals', value: '', outcome: 'Outcome Value' }]);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, key: keyof Rule, val: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, [key]: val } : r));
  };

  // Evaluate logic
  const evaluateConditions = () => {
    const trace: string[] = [];
    let finalOutcome = defaultOutcome;
    let matchedId: string | null = null;

    for (const rule of rules) {
      const variable = variables.find(v => v.name === rule.variableName);
      if (!variable) {
        trace.push(`Rule "${rule.variableName} ${rule.operator}": Variable not defined.`);
        continue;
      }

      const testValStr = variable.testValue;
      let isMatch = false;

      // Operator Logic
      try {
        if (rule.operator === 'equals') {
          isMatch = String(testValStr) === String(rule.value);
        } else if (rule.operator === 'not_equals') {
          isMatch = String(testValStr) !== String(rule.value);
        } else if (rule.operator === 'greater_than') {
          isMatch = Number(testValStr) > Number(rule.value);
        } else if (rule.operator === 'less_than') {
          isMatch = Number(testValStr) < Number(rule.value);
        } else if (rule.operator === 'contains') {
          isMatch = String(testValStr).includes(String(rule.value));
        } else if (rule.operator === 'regex') {
          const re = new RegExp(rule.value);
          isMatch = re.test(String(testValStr));
        }
      } catch (err) {
        trace.push(`Rule index failed evaluation: ${(err as Error).message}`);
      }

      if (isMatch) {
        trace.push(`Rule verified MATCH: Variable "${rule.variableName}" (${testValStr}) ${rule.operator.replace('_', ' ')} "${rule.value}" matches.`);
        finalOutcome = rule.outcome;
        matchedId = rule.id;
        break; // Match first rule
      } else {
        trace.push(`Rule skipped: Variable "${rule.variableName}" (${testValStr}) ${rule.operator.replace('_', ' ')} "${rule.value}" did NOT match.`);
      }
    }

    if (!matchedId) {
      trace.push(`No rules matched. Applying Default Outcome: "${defaultOutcome}".`);
    }

    setEvalResult({ outcome: finalOutcome, matchedRuleId: matchedId, trace });
  };

  // Auto evaluate when variables/rules change
  useEffect(() => {
    evaluateConditions();
  }, [variables, rules, defaultOutcome]);

  // ──────────────────────────────────────────────────────
  // Diagram Drawing — Apple-minimal style
  // ──────────────────────────────────────────────────────
  const drawDiagram = (ctx: CanvasRenderingContext2D, scale: number) => {
    const isDark = document.documentElement.classList.contains('dark');

    const W = logicalWidth;
    const H = logicalHeight;

    // Theme colours
    const surfaceColor = isDark ? '#1c1c28' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const textPrimary = isDark ? '#f0f0f5' : '#1d1d1f';
    const textMuted   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
    const arrowColor  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
    const trueColor   = '#34c759';  // Apple green
    const falseColor  = '#ff3b30';  // Apple red

    // Reset canvas
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ── Helpers ──────────────────────────────────────────
    const truncate = (ctx2: CanvasRenderingContext2D, text: string, maxW: number): string => {
      if (ctx2.measureText(text).width <= maxW) return text;
      let t = text;
      while (t.length > 0 && ctx2.measureText(t + '…').width > maxW) {
        t = t.slice(0, -1);
      }
      return t + '…';
    };

    /** Draw a pill-shaped capsule node (rounded rect) */
    const drawNode = (
      x: number, y: number, w: number, h: number,
      label: string, sub: string,
      accent: string, isActive: boolean
    ) => {
      const r = 14;
      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      // Fill
      ctx.fillStyle = isActive ? accent + '18' : surfaceColor;
      ctx.strokeStyle = isActive ? accent : borderColor;
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y, w, h, r);
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.stroke();

      // Accent left bar
      if (isActive) {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y + 8, 3, h - 16, 2);
        ctx.fill();
      }

      // Label (top text)
      ctx.font = `600 10px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
      ctx.fillStyle = isActive ? accent : textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxW = w - 28;
      ctx.fillText(truncate(ctx, label.toUpperCase(), maxW), x, y + h * 0.3);

      // Sub text (bottom text)
      ctx.font = `500 11px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.fillStyle = isActive ? textPrimary : textPrimary;
      ctx.fillText(truncate(ctx, sub, maxW), x, y + h * 0.68);
    };

    /** Draw vertical arrow from bottom of one box to top of next — with gap */
    const drawVArrow = (fromX: number, fromY: number, toY: number, color: string, labelText: string) => {
      const GAP = 6; // gap from box border
      const sy = fromY + GAP;
      const ey = toY - GAP;
      const mx = (sy + ey) / 2;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(fromX, sy);
      ctx.lineTo(fromX, ey);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead (pointing down)
      const AH = 6;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(fromX, ey + AH);
      ctx.lineTo(fromX - 4, ey);
      ctx.lineTo(fromX + 4, ey);
      ctx.closePath();
      ctx.fill();

      // Floating label badge mid-arrow
      const labelX = fromX + 12;
      const labelY = mx;
      ctx.font = `600 8.5px -apple-system, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, labelX, labelY);
    };

    /** Draw horizontal arrow from node to outcome */
    const drawHArrow = (fromX: number, midY: number, toX: number, color: string, active: boolean) => {
      const GAP = 6;
      const sx = fromX - NODE_W / 2 - GAP;
      const ex = toX + OUTCOME_W / 2 + GAP;

      ctx.strokeStyle = active ? color : arrowColor;
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.setLineDash(active ? [] : [3, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, midY);
      ctx.lineTo(ex + 8, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead pointing left (toward outcome)
      const AH = 6;
      ctx.fillStyle = active ? color : arrowColor;
      ctx.beginPath();
      ctx.moveTo(ex, midY);
      ctx.lineTo(ex + AH, midY - 4);
      ctx.lineTo(ex + AH, midY + 4);
      ctx.closePath();
      ctx.fill();
    };

    // ── Layout ───────────────────────────────────────────
    const mainX = W * 0.62;  // center X for main decision chain
    const outcomeX = W * 0.2; // center X for outcome boxes

    // START node
    let cy = DIAGRAM_PAD;
    drawNode(mainX, cy, NODE_W, NODE_H, 'Input', 'Test Workbench', trueColor, false);

    let prevBottomY = cy + NODE_H;

    rules.forEach((rule, idx) => {
      const nextNodeY = cy + NODE_H + (idx + 1) * ROW_GAP;

      // Vertical arrow: prev → this rule node
      drawVArrow(mainX, prevBottomY, nextNodeY, arrowColor, 'No match');

      // Build label: just var + operator + short value (NOT the full regex)
      const isMatched = evalResult.matchedRuleId === rule.id;
      const opLabel = rule.operator.replace('_', ' ');
      const valDisplay = rule.operator === 'regex'
        ? 'regex pattern'
        : rule.value.length > 12 ? rule.value.slice(0, 12) + '…' : rule.value;
      const nodeLabel = `Rule ${idx + 1}: ${rule.variableName}`;
      const nodeSub   = `${opLabel} "${valDisplay}"`;

      drawNode(mainX, nextNodeY, NODE_W, NODE_H, nodeLabel, nodeSub, trueColor, isMatched);

      // Horizontal arrow to outcome
      const midY = nextNodeY + NODE_H / 2;
      drawHArrow(mainX, midY, outcomeX, trueColor, isMatched);

      // Outcome node label
      const outcomeActive = isMatched;
      const outcomeLabel = 'Outcome';
      const outcomeSub   = rule.outcome;
      drawNode(outcomeX, nextNodeY, OUTCOME_W, NODE_H, outcomeLabel, outcomeSub, trueColor, outcomeActive);

      // "Match" label on the branch
      ctx.font = `600 8.5px -apple-system, sans-serif`;
      ctx.fillStyle = isMatched ? trueColor : arrowColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Match', (mainX - NODE_W / 2 + outcomeX + OUTCOME_W / 2) / 2, midY - 9);

      prevBottomY = nextNodeY + NODE_H;
    });

    // Default fallback node
    const defaultY = cy + NODE_H + (rules.length + 1) * ROW_GAP - ROW_GAP / 2 + ROW_GAP / 2 - 10;
    drawVArrow(mainX, prevBottomY, defaultY, falseColor, 'No match');
    const isDefaultApplied = evalResult.matchedRuleId === null;
    drawNode(mainX, defaultY, NODE_W, NODE_H, 'Default', defaultOutcome, falseColor, isDefaultApplied);
  };

  // Sync canvas draws
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) drawDiagram(ctx, scaleFactor);
  }, [rules, variables, evalResult, defaultOutcome]);

  // Sync preview canvas when preview is open
  useEffect(() => {
    if (!isPreviewOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) drawDiagram(ctx, scaleFactor);
  }, [isPreviewOpen, rules, variables, evalResult, defaultOutcome]);

  // Export Canvas
  const exportImage = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Draw background color first so jpeg doesn't get black background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
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
      className="flex flex-col gap-6 max-w-7xl w-full mx-auto"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Condition Workstation <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          </h1>
          <p className="text-sm text-text-secondary">Build rules, run variables through conditional evaluations, and export custom flowcharts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Variables & Rule Settings (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Section 1: Variable Workbench */}
          <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary">1. Variable Workbench</h3>
                <p className="text-xs text-text-muted mt-0.5">Define variable properties and dynamic test values</p>
              </div>
              <button 
                onClick={addVariable}
                className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
              >
                <IconPlus size={14} /> Add Var
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {variables.map((variable, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-3 bg-surface-alt/40 border border-border/40 rounded-2xl p-3 w-full">
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">Var Name</label>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => updateVariable(idx, 'name', e.target.value)}
                      className="input-field w-full text-xs font-mono py-1.5 mt-1 border-border/50"
                      placeholder="e.g. status"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">Type</label>
                    <select
                      value={variable.type}
                      onChange={(e) => updateVariable(idx, 'type', e.target.value as any)}
                      className="select-field w-full text-xs py-1.5 mt-1 border-border/50 bg-surface"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">Test Value</label>
                    <input
                      type="text"
                      value={variable.testValue}
                      onChange={(e) => updateVariable(idx, 'testValue', e.target.value)}
                      className="input-field w-full text-xs font-mono py-1.5 mt-1 border-border/50"
                      placeholder="e.g. 21"
                    />
                  </div>
                  <button
                    onClick={() => deleteVariable(idx)}
                    disabled={variables.length <= 1}
                    className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 cursor-pointer mt-5 transition-colors disabled:opacity-40"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Conditional Evaluation Rules */}
          <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary">2. Conditional Evaluation Rules</h3>
                <p className="text-xs text-text-muted mt-0.5">Design sequential logic checks that terminate on matching outcomes</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsRegexTipsOpen(true)}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                  title="Open Regular Expression Guide & Tips"
                >
                  Regex Tips
                </button>
                <button 
                  onClick={addRule}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <IconPlus size={14} /> Add Rule
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {rules.map((rule, idx) => (
                <div key={rule.id} className="flex flex-col gap-3 bg-surface-alt/40 border border-border/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Rule {idx + 1}
                    </span>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      disabled={rules.length <= 1}
                      className="p-1 text-text-muted hover:text-red-500 cursor-pointer transition-colors"
                      title="Delete Rule"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* IF Var */}
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">IF Variable</label>
                      <select
                        value={rule.variableName}
                        onChange={(e) => updateRule(rule.id, 'variableName', e.target.value)}
                        className="select-field w-full text-xs py-1.5 mt-1 border-border/50 bg-surface font-mono"
                      >
                        {variables.map(v => (
                          <option key={v.name} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">Operator</label>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, 'operator', e.target.value as any)}
                        className="select-field w-full text-xs py-1.5 mt-1 border-border/50 bg-surface"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="contains">Contains</option>
                        <option value="regex">Matches Regex</option>
                      </select>
                    </div>

                    {/* Comparison Value */}
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">Value</label>
                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                        className="input-field w-full text-xs font-mono py-1.5 mt-1 border-border/50"
                        placeholder="Compare value"
                      />
                    </div>

                    {/* THEN Outcome */}
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">THEN Outcome</label>
                      <input
                        type="text"
                        value={rule.outcome}
                        onChange={(e) => updateRule(rule.id, 'outcome', e.target.value)}
                        className="input-field w-full text-xs py-1.5 mt-1 border-border/50 font-semibold text-primary"
                        placeholder="Result value"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Fallback default outcome */}
              <div className="flex items-center gap-3 bg-surface-alt/40 border border-border/40 rounded-2xl p-4">
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">ELSE Default Outcome</label>
                  <input
                    type="text"
                    value={defaultOutcome}
                    onChange={(e) => setDefaultOutcome(e.target.value)}
                    className="input-field w-full text-xs py-1.5 mt-1 border-border/50"
                    placeholder="Fallback outcome"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Flow Diagrams & Workbench Execution (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Section 3: Workbench Trace Execution */}
          <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div>
                <h3 className="text-sm font-bold text-text-primary">3. Workbench Trace Execution</h3>
                <p className="text-xs text-text-muted mt-0.5">Real-time compilation results of your workbench</p>
              </div>
              <button 
                onClick={evaluateConditions}
                className="btn btn-secondary btn-sm flex items-center gap-1 cursor-pointer"
              >
                <IconRefresh size={14} /> Run
              </button>
            </div>

            <div className="bg-surface-alt/45 rounded-2xl border border-border/45 p-4 flex flex-col gap-3 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Evaluated Outcome</span>
                <p className="text-lg font-black text-primary mt-0.5">{evalResult.outcome}</p>
              </div>

              <div className="border-t border-border/40 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Trace execution logs</span>
                <div className="mt-2 flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1 font-mono text-[10px] text-text-secondary custom-scrollbar">
                  {evalResult.trace.map((t, idx) => (
                    <div key={idx} className="flex gap-2 items-start py-0.5">
                      <IconArrowRight size={10} className="text-primary mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Section 4: Decision Flow Diagram — full-width below grid */}
      <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-4 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Decision Flow Diagram</h3>
            <p className="text-xs text-text-muted mt-0.5">Auto-generated visual trace of your rules</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="btn btn-primary btn-sm h-8 py-0 px-3 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
              title="Open fullscreen preview"
            >
              <IconEye size={12} /> Preview
            </button>
            <button
              onClick={() => exportImage('png')}
              className="btn btn-secondary btn-sm h-8 py-0 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title="Export as PNG"
            >
              <IconDownload size={12} /> PNG
            </button>
            <button
              onClick={() => exportImage('jpeg')}
              className="btn btn-secondary btn-sm h-8 py-0 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title="Export as JPG"
            >
              <IconDownload size={12} /> JPG
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto flex justify-center py-1">
          <canvas
            ref={canvasRef}
            width={logicalWidth * scaleFactor}
            height={logicalHeight * scaleFactor}
            style={{ width: `${logicalWidth}px`, height: `${logicalHeight}px` }}
            className="rounded-2xl max-w-full"
          />
        </div>
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
              className="relative bg-surface border border-border rounded-[28px] shadow-2xl z-10 flex flex-col overflow-hidden"
              style={{ maxWidth: `${logicalWidth + 48}px`, width: '100%' }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/40">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Decision Flow Diagram</h2>
                  <p className="text-xs text-text-muted mt-0.5">{rules.length} rule{rules.length !== 1 ? 's' : ''} · auto-traced</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportImage('png')}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
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

              {/* Canvas area */}
              <div className="overflow-auto p-6 flex justify-center">
                <canvas
                  ref={previewCanvasRef}
                  width={logicalWidth * scaleFactor}
                  height={logicalHeight * scaleFactor}
                  style={{ width: `${logicalWidth}px`, height: `${logicalHeight}px` }}
                  className="rounded-2xl max-w-full"
                />
              </div>

              {/* Legend */}
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

      {/* Regex Cheat Sheet Modal */}
      <AnimatePresence>
        {isRegexTipsOpen && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegexTipsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.9 }}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[28px] p-6 shadow-2xl w-full max-w-[480px] pointer-events-auto text-left flex flex-col max-h-[85vh] relative overflow-hidden z-10"
            >
              {/* Decorative glow bloom */}
              <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-16 -left-16 bg-primary/10 blur-3xl" />

              <button
                onClick={() => setIsRegexTipsOpen(false)}
                aria-label="Close"
                className="absolute z-20 flex items-center justify-center w-8 h-8 transition-all duration-200 border rounded-full cursor-pointer top-4 right-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 active:scale-90 border-stone-200/20 dark:border-stone-700/30"
              >
                <IconX size={15} className="stroke-[2.5]" />
              </button>

              <div className="z-10 flex-1 w-full pr-1 mt-2 space-y-5 overflow-y-auto scrollbar-none">
                <div className="flex flex-col items-start w-full gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <IconSparkles className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary tracking-tight leading-tight">
                      Regular Expression Guide
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                      Cheat sheet for building powerful condition checking rules.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 flex flex-col gap-3.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Common Operators</h3>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                      <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">^</code>
                      <div className="ml-3">
                        <p className="text-xs font-bold text-text-primary">Start Anchor</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Asserts that matches must start at the beginning of the text string. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">^abc</code> matches "abc" but not "xyzabc".</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                      <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">$</code>
                      <div className="ml-3">
                        <p className="text-xs font-bold text-text-primary">End Anchor</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Asserts that matches must end at the absolute end of the text string. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">abc$</code> matches "xyzabc" but not "abcxyz".</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                      <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">[ ]</code>
                      <div className="ml-3">
                        <p className="text-xs font-bold text-text-primary">Character Set</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Matches any single character inside the brackets. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">[abc]</code> matches "a", "b", or "c". Range <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">[0-9]</code> matches digits.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                      <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">( )</code>
                      <div className="ml-3">
                        <p className="text-xs font-bold text-text-primary">Capture Group</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Groups multiple characters together to evaluate as a single unit or apply quantifiers. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">(abc)+</code> matches "abc", "abcabc", etc.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                      <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">* , + , ?</code>
                      <div className="ml-3">
                        <p className="text-xs font-bold text-text-primary">Quantifiers</p>
                        <p className="text-[11px] text-text-secondary mt-0.5"><code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">*</code> matches 0 or more times, <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">+</code> matches 1 or more times, and <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">?</code> makes the preceding character optional.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-muted mb-2">Why use Regex in Rules?</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Standard equals/contains checks match static strings. Regex lets you validate complex structural patterns dynamically (e.g., verifying email layouts, validating formatting, extracting numbers, or making rules match-agnostic).
                  </p>
                </div>
              </div>

              <div className="z-10 w-full pt-3 mt-4 border-t border-border/40">
                <button
                  onClick={() => setIsRegexTipsOpen(false)}
                  className="w-full py-3 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 rounded-2xl text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all cursor-pointer text-center"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
