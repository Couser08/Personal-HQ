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
            className="btn btn-secondary btn-md"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-danger btn-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};
