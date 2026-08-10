import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { Input } from '../Input';
import { TextArea } from '../TextArea';
import { Button } from '../Button';
import type { AiClarificationField } from '../../../store/types';

interface DynamicClarificationFormProps {
  fields: AiClarificationField[];
  onSubmit: (answers: Record<string, string | string[]>, summary: string) => void;
  disabled?: boolean;
}

export const DynamicClarificationForm = ({
  fields,
  onSubmit,
  disabled = false,
}: DynamicClarificationFormProps) => {
  const [formData, setFormData] = useState<Record<string, string | string[]>>(() => {
    const initial: Record<string, string | string[]> = {};
    for (const f of fields) {
      if (f.defaultValue !== undefined) initial[f.id] = f.defaultValue;
    }
    return initial;
  });
  const [touched, setTouched] = useState(false);

  const setValue = (id: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const toggleCheckbox = (id: string, option: string) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[id]) ? ([...(prev[id] as string[])]) : [];
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [id]: next };
    });
  };

  const missingRequired = fields.filter((f) => {
    if (f.required === false) return false;
    const val = formData[f.id];
    if (f.type === 'checkbox') return !Array.isArray(val) || val.length === 0;
    return !val || (typeof val === 'string' && !val.trim());
  });

  const handleSubmit = () => {
    setTouched(true);
    if (missingRequired.length > 0) return;

    const summary = fields
      .map((f) => {
        const val = formData[f.id];
        const display = Array.isArray(val)
          ? val.length
            ? val.join(', ')
            : 'None'
          : (val as string)?.trim() || 'Not specified';
        return `${f.label}: ${display}`;
      })
      .join('\n');

    onSubmit(formData, summary);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {fields.map((f) => {
        const showError = touched && missingRequired.some((m) => m.id === f.id);

        return (
          <fieldset key={f.id} className="flex flex-col gap-2 m-0 p-0 border-0">
            <legend className="text-xs font-semibold text-text-primary px-0">
              {f.label}
              {f.required !== false && <span className="text-primary ml-0.5">*</span>}
            </legend>

            {f.type === 'input' && (
              <Input
                type="text"
                placeholder={f.placeholder || 'Type your answer…'}
                value={(formData[f.id] as string) || ''}
                onChange={(e) => setValue(f.id, e.target.value)}
                disabled={disabled}
                className={`text-xs py-2 min-h-[38px] ${showError ? 'border-rose-400' : ''}`}
                aria-invalid={showError}
              />
            )}

            {f.type === 'time' && (
              <Input
                type="time"
                value={(formData[f.id] as string) || ''}
                onChange={(e) => setValue(f.id, e.target.value)}
                disabled={disabled}
                className={`text-xs py-2 min-h-[38px] ${showError ? 'border-rose-400' : ''}`}
                aria-invalid={showError}
              />
            )}

            {f.type === 'textarea' && (
              <TextArea
                placeholder={f.placeholder || 'Add details…'}
                value={(formData[f.id] as string) || ''}
                onChange={(e) => setValue(f.id, e.target.value)}
                disabled={disabled}
                rows={3}
                className={`text-xs min-h-[72px] ${showError ? 'border-rose-400' : ''}`}
                aria-invalid={showError}
              />
            )}

            {f.type === 'radio' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5" role="radiogroup" aria-label={f.label}>
                {(f.options || []).map((opt) => {
                  const selected = formData[f.id] === opt;
                  const inputId = `${f.id}_${opt.replace(/\s+/g, '_')}`;
                  return (
                    <label
                      key={opt}
                      htmlFor={inputId}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-xs ${
                        selected
                          ? 'border-primary/50 bg-primary/5 text-text-primary'
                          : 'border-border bg-surface-alt text-text-secondary hover:border-primary/30'
                      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selected ? 'border-primary' : 'border-border'
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                      <input
                        id={inputId}
                        type="radio"
                        name={f.id}
                        value={opt}
                        checked={selected}
                        onChange={() => setValue(f.id, opt)}
                        disabled={disabled}
                        className="sr-only"
                      />
                      <span className="font-medium">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {f.type === 'checkbox' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5" role="group" aria-label={f.label}>
                {(f.options || []).map((opt) => {
                  const selected = ((formData[f.id] as string[]) || []).includes(opt);
                  const inputId = `${f.id}_${opt.replace(/\s+/g, '_')}`;
                  return (
                    <label
                      key={opt}
                      htmlFor={inputId}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-xs ${
                        selected
                          ? 'border-primary/50 bg-primary/5 text-text-primary'
                          : 'border-border bg-surface-alt text-text-secondary hover:border-primary/30'
                      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          selected ? 'border-primary bg-primary text-white' : 'border-border bg-surface'
                        }`}
                      >
                        {selected && <IconCheck size={11} stroke={2.5} />}
                      </span>
                      <input
                        id={inputId}
                        type="checkbox"
                        value={opt}
                        checked={selected}
                        onChange={() => toggleCheckbox(f.id, opt)}
                        disabled={disabled}
                        className="sr-only"
                      />
                      <span className="font-medium">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {showError && (
              <span className="text-[10px] text-rose-500">This field is required</span>
            )}
          </fieldset>
        );
      })}

      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={disabled}
        onClick={handleSubmit}
        className="w-full justify-center text-xs font-bold"
      >
        Continue
      </Button>
    </div>
  );
};
