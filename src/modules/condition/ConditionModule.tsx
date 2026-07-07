import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  IconPlus, IconTrash, IconDownload,
  IconArrowRight, IconRefresh
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

const REGEX_EXAMPLES = [
  { label: 'Email Address', regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', desc: 'Validates standard email formatting' },
  { label: 'Strong Password', regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$', desc: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 digit' },
  { label: 'Phone Number', regex: '^\\+?[1-9]\\d{1,14}$', desc: 'E.164 international phone formatting' },
  { label: 'Date (YYYY-MM-DD)', regex: '^\\d{4}-\\d{2}-\\d{2}$', desc: 'Checks ISO date format' },
  { label: 'URL Address', regex: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$', desc: 'Validates standard HTTP/HTTPS links' },
];

export default function ConditionModule() {
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Flowchart Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and size
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Smooth drawing
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;

    // Colors based on page dark/light mode
    const isDark = document.documentElement.classList.contains('dark');
    const bgBoxColor = isDark ? '#1a1a2e' : '#f4f4f6';
    const borderBoxColor = isDark ? '#3b4078' : '#e4e4e8';
    const textMainColor = isDark ? '#ffffff' : '#09090b';
    const textSubColor = isDark ? '#a0aec0' : '#718096';
    
    const startX = canvas.width / 2;
    let currentY = 50;
    const boxWidth = 240;
    const boxHeight = 55;

    // Draw Start Node
    drawNodeBox(ctx, startX, currentY, boxWidth, boxHeight, 'START', 'Test Workbench Input', '#10B981', '#ffffff');
    
    let previousBoxY = currentY;

    rules.forEach((rule, idx) => {
      currentY += 100;
      
      // Draw Connector Arrow from previous box
      drawConnectorArrow(ctx, startX, previousBoxY + boxHeight, startX, currentY, isDark);
      
      // Text label inside connector
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#EF4444';
      ctx.fillText('False / No', startX + 15, currentY - 45);

      const isMatched = evalResult.matchedRuleId === rule.id;
      const cardColor = isMatched ? '#f43f5e' : borderBoxColor;
      const heading = `Rule ${idx + 1}: Check "${rule.variableName}"`;
      const ruleText = `${rule.operator.replace('_', ' ')} "${rule.value}"`;

      drawNodeBox(ctx, startX, currentY, boxWidth, boxHeight, heading, ruleText, cardColor, textMainColor, textSubColor);

      // Draw horizontal branch if matches
      const branchEndX = startX - 250;
      ctx.beginPath();
      ctx.moveTo(startX - boxWidth / 2, currentY + boxHeight / 2);
      ctx.lineTo(branchEndX, currentY + boxHeight / 2);
      ctx.strokeStyle = isMatched ? '#10B981' : (isDark ? '#3b4078' : '#cbd5e1');
      ctx.stroke();

      // Yes Arrowhead
      ctx.beginPath();
      ctx.moveTo(branchEndX + 5, currentY + boxHeight / 2 - 5);
      ctx.lineTo(branchEndX, currentY + boxHeight / 2);
      ctx.lineTo(branchEndX + 5, currentY + boxHeight / 2 + 5);
      ctx.stroke();

      // Branch Label
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText('True / Yes', startX - boxWidth / 2 - 65, currentY + boxHeight / 2 - 8);

      // Draw match outcome box
      drawNodeBox(ctx, branchEndX - 100, currentY, 180, boxHeight, 'MATCHED OUTCOME', rule.outcome, isMatched ? '#10B981' : bgBoxColor, isMatched ? '#ffffff' : textMainColor);

      previousBoxY = currentY;
    });

    // Draw Default Fallback Node
    currentY += 100;
    drawConnectorArrow(ctx, startX, previousBoxY + boxHeight, startX, currentY, isDark);
    
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#EF4444';
    ctx.fillText('False / No', startX + 15, currentY - 45);

    const isDefaultApplied = evalResult.matchedRuleId === null;
    drawNodeBox(ctx, startX, currentY, boxWidth, boxHeight, 'DEFAULT FALLBACK', defaultOutcome, isDefaultApplied ? '#10B981' : bgBoxColor, isDefaultApplied ? '#ffffff' : textMainColor);

  }, [rules, variables, evalResult, defaultOutcome]);

  const drawNodeBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    sub: string,
    borderColor: string,
    titleColor: string,
    subColor = '#888'
  ) => {
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#111118' : '#ffffff';
    ctx.strokeStyle = borderColor;
    
    // Draw Round Rect
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y, w, h, 12);
    ctx.fill();
    ctx.stroke();

    // Texts
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.fillText(title, x, y + 22);

    ctx.font = '500 10px sans-serif';
    ctx.fillStyle = subColor;
    ctx.fillText(sub, x, y + 38);
  };

  const drawConnectorArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, isDark: boolean) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isDark ? '#3b4078' : '#cbd5e1';
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x2 - 5, y2 - 7);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 + 5, y2 - 7);
    ctx.stroke();
  };

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
              <button 
                onClick={addRule}
                className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
              >
                <IconPlus size={14} /> Add Rule
              </button>
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

          {/* Section 4: Regex Templates Library */}
          <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Regex Examples Library</h3>
              <p className="text-xs text-text-muted mt-0.5">Load professional regex validations into rules</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {REGEX_EXAMPLES.map((ex, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-surface-alt/35 border border-border/30 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{ex.label}</span>
                    <button
                      onClick={() => {
                        // Insert regex to the last rule or first regex rule
                        const updatedRules = [...rules];
                        if (updatedRules.length > 0) {
                          const lastRule = updatedRules[updatedRules.length - 1];
                          lastRule.operator = 'regex';
                          lastRule.value = ex.regex;
                          setRules(updatedRules);
                        }
                      }}
                      className="text-[9px] font-black text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded cursor-pointer transition-colors uppercase tracking-wider"
                    >
                      Apply Last Rule
                    </button>
                  </div>
                  <code className="bg-black/10 dark:bg-black/20 p-1.5 rounded font-mono text-[10px] leading-normal text-text-secondary select-all break-all">
                    {ex.regex}
                  </code>
                  <p className="text-[10px] text-text-muted leading-relaxed mt-0.5">{ex.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Decision Flow Diagram */}
          <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Decision Flow Diagram</h3>
                <p className="text-xs text-text-muted mt-0.5">Visual trace path representation of rules</p>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportImage('png')}
                  className="btn btn-secondary btn-sm h-8 py-0 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Export Diagram as PNG"
                >
                  <IconDownload size={12} /> PNG
                </button>
                <button
                  onClick={() => exportImage('jpeg')}
                  className="btn btn-secondary btn-sm h-8 py-0 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Export Diagram as JPG"
                >
                  <IconDownload size={12} /> JPG
                </button>
              </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar flex justify-center py-2">
              <canvas
                ref={canvasRef}
                width={700}
                height={150 + rules.length * 100}
                className="border border-border/40 bg-surface-alt/20 rounded-2xl max-w-full"
              />
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
