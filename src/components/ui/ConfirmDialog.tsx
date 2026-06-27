import { useAppStore } from '../../store/useAppStore';
import { Modal } from './Modal';

export const ConfirmDialog = () => {
  const { confirmDialog, closeConfirm } = useAppStore();

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  return (
    <Modal
      isOpen={confirmDialog.isOpen}
      onClose={closeConfirm}
      title={confirmDialog.title}
    >
      <div className="flex flex-col gap-4">
        <p className="text-text-secondary">{confirmDialog.message}</p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={closeConfirm}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};
