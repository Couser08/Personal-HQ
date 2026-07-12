import { IconPlus, IconTrash } from '@tabler/icons-react';
import { type Variable } from '../utils/conditionEvaluator';

export function VariablesPanel({
  variables,
  addVariable,
  updateVariable,
  deleteVariable,
}: {
  variables: Variable[];
  addVariable: () => void;
  updateVariable: (index: number, key: keyof Variable, val: string) => void;
  deleteVariable: (index: number) => void;
}) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm text-left">
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
              className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 cursor-pointer mt-5 transition-colors disabled:opacity-40 border-none bg-transparent"
            >
              <IconTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
