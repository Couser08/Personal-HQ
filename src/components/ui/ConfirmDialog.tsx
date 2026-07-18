import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from './Modal';

export const ConfirmDialog = () => {
  const { confirmDialog, closeConfirm } = useAppStore(useShallow(state => ({
    confirmDialog: state.confirmDialog,
    closeConfirm: state.closeConfirm
  })));

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  return (
    <Modal
      isOpen={confirmDialog.isOpen}
      onClose={closeConfirm}
      // Apple alerts are extremely clean, title is passed inside for precise layout control
      title=""
    >
      <div className="flex flex-col items-center text-center px-2 py-1 select-none">
        {/* Typography: Bold, tight heading, and clean tracking */}
        <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
          {confirmDialog.title || "Are you sure?"}
        </h3>
        
        {/* Description text with SF style scale */}
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal max-w-[240px]">
          {confirmDialog.message}
        </p>

        {/* Action Layout: Sleek inline separators mimicking standard iOS/macOS system buttons */}
        <div className="w-full grid grid-cols-2 gap-3 mt-6 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
          <button
            onClick={closeConfirm}
            className="w-full py-2.5 rounded-xl text-[15px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all duration-150 ease-out"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 rounded-xl text-[15px] font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all duration-150 ease-out shadow-sm shadow-red-500/10"
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};