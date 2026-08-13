import { useState } from 'react';
import {
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconCheck,
  IconHelpCircle,
  IconAdjustmentsHorizontal
} from '@tabler/icons-react';
import { type Rule, type Variable } from '../utils/conditionEvaluator';
import { useAppStore } from '../../../store/useAppStore';

interface RulesPanelProps {
  rules: Rule[];
  variables: Variable[];
  outcomes: string[];
  stopsOnMatch: boolean;
  setStopsOnMatch: (val: boolean) => void;
  addRule: () => void;
  updateRule: (id: string, key: keyof Rule, val: string) => void;
  deleteRule: (id: string) => void;
  reorderRules: (fromIdx: number, toIdx: number) => void;
  addOutcome: (label: string) => void;
  defaultOutcome: string;
  setDefaultOutcome: (val: string) => void;
  setIsRegexTipsOpen: (val: boolean) => void;
}

export function RulesPanel({
  rules,
  variables,
  outcomes,
  stopsOnMatch,
  setStopsOnMatch,
  addRule,
  updateRule,
  deleteRule,
  reorderRules,
  addOutcome,
  defaultOutcome,
  setDefaultOutcome,
  setIsRegexTipsOpen
}: RulesPanelProps) {
  const showConfirm = useAppStore((s) => s.showConfirm);
  const [newOutcomeInput, setNewOutcomeInput] = useState('');
  const [isAddingOutcome, setIsAddingOutcome] = useState(false);

  const handleDeleteRule = (id: string, idx: number) => {
    showConfirm(
      'Delete Rule',
      `Are you sure you want to delete Rule ${idx + 1}?`,
      () => deleteRule(id)
    );
  };

  const handleCreateOutcome = () => {
    const trimmed = newOutcomeInput.trim();
    if (trimmed) {
      addOutcome(trimmed);
      setNewOutcomeInput('');
      setIsAddingOutcome(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-4 shadow-sm text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            2. Conditional Evaluation Rules
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Sequential logic checks evaluate variables and determine outcomes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRegexTipsOpen(true)}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-1.5 rounded-xl"
            title="Open Regular Expression Guide & Tips"
          >
            <IconHelpCircle size={14} /> Regex Guide
          </button>
          <button
            type="button"
            onClick={addRule}
            className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={14} /> Add Rule
          </button>
        </div>
      </div>

      {/* Execution Mode Setting Banner */}
      <div className="bg-surface-alt/70 border border-border/60 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 text-primary rounded-xl">
            <IconAdjustmentsHorizontal size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary block">
              Execution Mode: {stopsOnMatch ? 'Stops at first match (First Match Wins)' : 'Evaluate all rules (Cumulative)'}
            </span>
            <p className="text-[11px] text-text-muted">
              {stopsOnMatch
                ? 'Evaluation halts immediately on the first matching rule.'
                : 'All matching rules will execute and outcomes accumulate.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setStopsOnMatch(!stopsOnMatch)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
            stopsOnMatch
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
        >
          Switch to {stopsOnMatch ? 'Evaluate All Rules' : 'First Match Wins'}
        </button>
      </div>

      {/* Compact Rules Table */}
      <div className="border border-border/60 rounded-2xl overflow-hidden shadow-subtle bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-alt/80 border-b border-border/60 text-[10px] uppercase tracking-wider font-extrabold text-text-muted">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[130px]">IF Variable</th>
                <th className="py-2.5 px-3 min-w-[120px]">Operator</th>
                <th className="py-2.5 px-3 min-w-[140px]">Value</th>
                <th className="py-2.5 px-3 min-w-[180px]">THEN Outcome</th>
                <th className="py-2.5 px-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, idx) => (
                <tr
                  key={rule.id}
                  className="border-b border-border/40 hover:bg-surface-hover/30 transition-colors"
                >
                  {/* Priority Order */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </span>
                  </td>

                  {/* IF Variable */}
                  <td className="py-2 px-3">
                    <select
                      value={rule.variableName}
                      onChange={(e) => updateRule(rule.id, 'variableName', e.target.value)}
                      className="select-field w-full text-xs py-1.5 border-border/50 bg-surface font-mono font-bold"
                    >
                      {variables.map((v) => (
                        <option key={v.name} value={v.name}>
                          ${v.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Operator */}
                  <td className="py-2 px-3">
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, 'operator', e.target.value as any)}
                      className="select-field w-full text-xs py-1.5 border-border/50 bg-surface"
                    >
                      <option value="equals">Equals (==)</option>
                      <option value="not_equals">Not Equals (!=)</option>
                      <option value="greater_than">Greater Than (&gt;)</option>
                      <option value="less_than">Less Than (&lt;)</option>
                      <option value="contains">Contains</option>
                      <option value="regex">Matches Regex</option>
                    </select>
                  </td>

                  {/* Value */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                      className="input-field w-full text-xs font-mono py-1.5 border-border/50"
                      placeholder="Compare value"
                    />
                  </td>

                  {/* THEN Outcome Registry Dropdown */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={rule.outcome}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsAddingOutcome(true);
                          } else {
                            updateRule(rule.id, 'outcome', e.target.value);
                          }
                        }}
                        className="select-field w-full text-xs py-1.5 border-border/50 font-bold text-primary bg-surface"
                      >
                        {outcomes.map((out) => (
                          <option key={out} value={out}>
                            {out}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add Custom Outcome...</option>
                      </select>
                    </div>
                  </td>

                  {/* Reorder & Delete */}
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => reorderRules(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <IconArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderRules(idx, idx + 1)}
                        disabled={idx === rules.length - 1}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <IconArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id, idx)}
                        disabled={rules.length <= 1}
                        className="p-1 text-text-muted hover:text-red-500 disabled:opacity-20 cursor-pointer ml-1"
                        title="Delete Rule"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ELSE Default Outcome */}
        <div className="bg-surface-alt/40 border-t border-border/60 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted shrink-0">
            ELSE Default Outcome
          </span>
          <select
            value={defaultOutcome}
            onChange={(e) => {
              if (e.target.value === '__add_new__') {
                setIsAddingOutcome(true);
              } else {
                setDefaultOutcome(e.target.value);
              }
            }}
            className="select-field flex-1 text-xs py-1.5 border-border/50 bg-surface font-semibold"
          >
            {outcomes.map((out) => (
              <option key={out} value={out}>
                {out}
              </option>
            ))}
            <option value="__add_new__">+ Add Custom Outcome...</option>
          </select>
        </div>
      </div>

      {/* Inline Create Outcome Form */}
      {isAddingOutcome && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center gap-2 animate-in fade-in duration-150">
          <input
            type="text"
            value={newOutcomeInput}
            onChange={(e) => setNewOutcomeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateOutcome()}
            placeholder="Type new outcome name..."
            className="input-field flex-1 text-xs py-1.5 border-primary/30"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateOutcome}
            className="btn btn-primary btn-sm flex items-center gap-1 cursor-pointer text-xs"
          >
            <IconCheck size={14} /> Save Outcome
          </button>
          <button
            type="button"
            onClick={() => setIsAddingOutcome(false)}
            className="btn btn-secondary btn-sm text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
