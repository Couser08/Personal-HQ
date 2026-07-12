import { motion } from 'framer-motion';
import { IconLayoutGrid, IconTrash } from '@tabler/icons-react';
import { ProgressBar } from '../../../components/ui/ProgressBar';

export function SubjectCard({
  subject,
  showConfirm,
  deleteSubject,
  setSelectedSubjectId,
  setSubjectTab,
  handleContinueLearning,
}: {
  subject: any;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  deleteSubject: (id: string) => Promise<void>;
  setSelectedSubjectId: (id: string | null) => void;
  setSubjectTab: (tab: any) => void;
  handleContinueLearning: (subject: any) => void;
}) {
  return (
    <motion.div
      layout
      onClick={() => {
        setSelectedSubjectId(subject.id);
        setSubjectTab('overview');
      }}
      className="bg-surface border border-border rounded-[22px] overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="p-5 flex flex-col gap-4 text-left">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <IconLayoutGrid className="w-4 h-4" />
              </span>
              {subject.semester && (
                <span className="text-[11px] text-text-muted bg-surface-alt px-2.5 py-1 rounded-full border border-border-alt font-bold">
                  {subject.semester}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg line-clamp-1 text-text-primary">{subject.name}</h3>
            <p className="text-sm text-text-secondary">
              {subject.completed}/{subject.total} topics completed
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              showConfirm('Confirm Delete', 'Delete this subject and all its topics?', () => {
                deleteSubject(subject.id);
              });
            }}
            className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-surface-alt border border-border-alt p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-text-muted font-bold">Progress</span>
            <span className="font-semibold text-primary">{subject.progress}%</span>
          </div>
          <ProgressBar progress={subject.progress} />
          <div className="flex items-center justify-between text-xs text-text-muted font-bold">
            <span>{subject.pending} pending</span>
            <span>{subject.total} total</span>
          </div>
        </div>

        {/* Actions inside Card */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleContinueLearning(subject);
            }}
            disabled={subject.pending === 0}
            className="btn btn-primary btn-sm flex-1 disabled:opacity-40"
          >
            Continue
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSubjectId(subject.id);
              setSubjectTab('topics');
            }}
            className="btn btn-secondary btn-sm"
          >
            View Outline
          </button>
        </div>
      </div>
    </motion.div>
  );
}
