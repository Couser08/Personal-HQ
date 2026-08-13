import { IconPlus, IconTrash, IconVariable } from '@tabler/icons-react';
import { type Variable } from '../utils/conditionEvaluator';
import { useAppStore } from '../../../store/useAppStore';

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
  const showConfirm = useAppStore((s) => s.showConfirm);

  const handleDelete = (index: number, name: string) => {
    showConfirm(
      'Delete Variable',
      `Are you sure you want to delete variable "${name}"? Rules referencing it will fail.`,
      () => deleteVariable(index)
    );
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-4 shadow-sm text-left sticky top-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 text-primary rounded-xl">
            <IconVariable size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">1. Variable Workbench</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Input variables & test values</p>
          </div>
        </div>
        <button
          onClick={addVariable}
          className="btn btn-secondary btn-sm flex items-center gap-1 cursor-pointer text-xs"
        >
          <IconPlus size={14} /> Add Var
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {variables.map((variable, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2.5 bg-surface-alt/50 border border-border/50 rounded-2xl p-3.5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-md">
                ${variable.name || `var_${idx + 1}`}
              </span>
              <button
                onClick={() => handleDelete(idx, variable.name)}
                disabled={variables.length <= 1}
                className="p-1 text-text-muted hover:text-red-500 rounded-lg cursor-pointer transition-colors disabled:opacity-30 border-none bg-transparent"
                title="Delete Variable"
              >
                <IconTrash size={13} />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">Name</label>
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => updateVariable(idx, 'name', e.target.value)}
                  className="input-field w-full text-xs font-mono py-1 mt-0.5 border-border/60"
                  placeholder="name"
                />
              </div>
              <div className="col-span-5">
                <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">Type</label>
                <select
                  value={variable.type}
                  onChange={(e) => updateVariable(idx, 'type', e.target.value as any)}
                  className="select-field w-full text-xs py-1 mt-0.5 border-border/60 bg-surface"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-text-muted">Test Value</label>
              <input
                type="text"
                value={variable.testValue}
                onChange={(e) => updateVariable(idx, 'testValue', e.target.value)}
                className="input-field w-full text-xs font-mono py-1 mt-0.5 border-border/60 bg-surface"
                placeholder="Value to evaluate"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
