import { useState } from 'react';

export const DynamicClarificationForm = ({ fields, onSubmit }: { fields: any[]; onSubmit: (ans: string) => void }) => {
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  
  const handleFieldChange = (id: string, value: string, isCheckbox = false) => {
    setFormData(prev => {
      if (isCheckbox) {
        const current = (prev[id] as string[]) || [];
        return { ...prev, [id]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleSubmit = () => {
    const lines = fields.map(f => {
      const val = formData[f.id];
      return `${f.label}: ${Array.isArray(val) ? val.join(', ') : val || 'Not specified'}`;
    });
    onSubmit(lines.join('\n'));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {fields.map((f: any) => (
        <div key={f.id} className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-primary">{f.label}</span>
          {f.type === 'input' && (
            <input 
              type="text" 
              placeholder={f.placeholder || 'Type here...'} 
              className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary" 
              value={(formData[f.id] as string) || ''} 
              onChange={e => handleFieldChange(f.id, e.target.value)} 
            />
          )}
          {f.type === 'radio' && (
            <div className="flex flex-wrap gap-2 mt-0.5">
              {f.options?.map((opt: string) => (
                <button 
                  key={opt} 
                  onClick={() => handleFieldChange(f.id, opt)} 
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${formData[f.id] === opt ? 'bg-primary text-white border-primary' : 'bg-surface-alt text-text-secondary border-border hover:border-primary/50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {f.type === 'checkbox' && (
            <div className="flex flex-wrap gap-2 mt-0.5">
              {f.options?.map((opt: string) => {
                const checked = ((formData[f.id] as string[]) || []).includes(opt);
                return (
                  <button 
                    key={opt} 
                    onClick={() => handleFieldChange(f.id, opt, true)} 
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${checked ? 'bg-primary text-white border-primary' : 'bg-surface-alt text-text-secondary border-border hover:border-primary/50'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <button onClick={handleSubmit} className="mt-1 py-2 w-full rounded-lg bg-primary text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer">
        Submit Answers
      </button>
    </div>
  );
};
