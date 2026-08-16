import { IconCheck, IconLoader2, IconAlertCircle, IconArrowUpRight } from '@tabler/icons-react';
import type { AgentStepUpdate } from '../../../../src/lib/gemini-agent';

interface AiToolBadgeProps {
  step: AgentStepUpdate;
  onNavigateToModule?: (moduleName: string) => void;
}

export const AiToolBadge = ({ step, onNavigateToModule }: AiToolBadgeProps) => {
  const getModuleForTool = (toolName: string): string => {
    if (toolName.includes('task')) return 'todo';
    if (toolName.includes('habit')) return 'habits';
    if (toolName.includes('note') || toolName.includes('markdown')) return 'notes';
    if (toolName.includes('journal')) return 'journal';
    if (toolName.includes('til')) return 'til';
    if (toolName.includes('snippet')) return 'snippets';
    if (toolName.includes('link')) return 'links';
    return 'todo';
  };

  const isSuccess = step.status === 'success';
  const isRunning = step.status === 'running';
  const isError = step.status === 'error';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
        isRunning
          ? 'bg-primary/5 border-primary/20 text-primary animate-pulse'
          : isSuccess
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
      }`}
    >
      {isRunning && <IconLoader2 size={12} className="animate-spin text-primary shrink-0" />}
      {isSuccess && <IconCheck size={12} className="text-emerald-500 shrink-0" />}
      {isError && <IconAlertCircle size={12} className="text-rose-500 shrink-0" />}

      <span className="font-semibold">{step.label}</span>

      {step.entityId && (
        <span className="font-mono text-[9px] px-1 py-0.2 bg-black/5 dark:bg-white/10 rounded">
          {step.entityId}
        </span>
      )}

      {isSuccess && onNavigateToModule && (
        <button
          type="button"
          onClick={() => onNavigateToModule(getModuleForTool(step.toolName))}
          className="ml-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-0.5 text-[10px] underline"
          title="Open module"
        >
          <span>View</span>
          <IconArrowUpRight size={10} />
        </button>
      )}
    </div>
  );
};
