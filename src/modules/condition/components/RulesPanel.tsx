import { IconPlus, IconTrash } from '@tabler/icons-react';
import { type Rule, type Variable } from '../utils/conditionEvaluator';

export function RulesPanel({
  rules,
  variables,
  addRule,
  updateRule,
  deleteRule,
  defaultOutcome,
  setDefaultOutcome,
  setIsRegexTipsOpen,
}: {
  rules: Rule[];
  variables: Variable[];
  addRule: () => void;
  updateRule: (id: string, key: keyof Rule, val: string) => void;
  deleteRule: (id: string) => void;
  defaultOutcome: string;
  setDefaultOutcome: (val: string) => void;
  setIsRegexTipsOpen: (val: boolean) => void;
}) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm text-left">
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
                className="p-1 text-text-muted hover:text-red-500 cursor-pointer transition-colors border-none bg-transparent"
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
  );
}
