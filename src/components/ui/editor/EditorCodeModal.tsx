import React from 'react';
import { Modal } from '../Modal';
import { CustomSelect } from '../CustomSelect';
import { LANG_OPTIONS, detectLanguage } from './editorUtils';

export interface CodeModalState {
  open: boolean;
  elementId: string | null;
  code: string;
  lang: string;
}

interface EditorCodeModalProps {
  codeModal: CodeModalState;
  setCodeModal: React.Dispatch<React.SetStateAction<CodeModalState>>;
  handleSaveCode: () => void;
}

export const EditorCodeModal: React.FC<EditorCodeModalProps> = ({
  codeModal,
  setCodeModal,
  handleSaveCode,
}) => {
  return (
    <Modal
      isOpen={codeModal.open}
      onClose={() => setCodeModal((prev) => ({ ...prev, open: false }))}
      title={codeModal.elementId ? 'Edit Code Block' : 'Insert Code Block'}
    >
      <div className="flex flex-col gap-4 text-left">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Language
          </label>
          <CustomSelect
            value={codeModal.lang}
            onChange={(val) => setCodeModal((prev) => ({ ...prev, lang: val }))}
            options={LANG_OPTIONS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Code
          </label>
          <textarea
            value={codeModal.code}
            onChange={(e) => {
              const val = e.target.value;
              setCodeModal((prev) => {
                let nextLang = prev.lang;
                if (!prev.elementId && (prev.lang === 'javascript' || prev.lang === 'other')) {
                  const detected = detectLanguage(val);
                  if (detected !== 'other') {
                    nextLang = detected;
                  }
                }
                return { ...prev, code: val, lang: nextLang };
              });
            }}
            placeholder="// Paste or write your code here..."
            spellCheck={false}
            className="w-full bg-[#1e1e1e] text-[#d4d4d4] border border-border-alt rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-mono min-h-45"
          />
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
          <button
            onClick={() => setCodeModal((prev) => ({ ...prev, open: false }))}
            className="btn btn-secondary btn-md"
          >
            Cancel
          </button>
          <button onClick={handleSaveCode} className="btn btn-primary btn-md">
            {codeModal.elementId ? 'Save Changes' : 'Insert'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
