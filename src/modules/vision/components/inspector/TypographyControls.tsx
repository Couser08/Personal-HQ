import React from 'react';
import {
  IconTypography,
  IconItalic,
  IconLetterCaseUpper,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from '@tabler/icons-react';
import { TEXT_COLOR_SWATCHES } from '../../constants/inspectorPresets';

interface TypographyControlsProps {
  fontFamily: string;
  setFontFamily: (f: string) => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  setFontWeight: (w: 'normal' | 'medium' | 'bold' | 'black') => void;
  isItalic: boolean;
  setIsItalic: (i: boolean) => void;
  isUppercase: boolean;
  setIsUppercase: (u: boolean) => void;
  textAlign: 'left' | 'center' | 'right';
  setTextAlign: (a: 'left' | 'center' | 'right') => void;
  letterSpacing: 'tight' | 'normal' | 'wide' | 'widest';
  setLetterSpacing: (l: 'tight' | 'normal' | 'wide' | 'widest') => void;
  textColor: string;
  setTextColor: (c: string) => void;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  fontWeight,
  setFontWeight,
  isItalic,
  setIsItalic,
  isUppercase,
  setIsUppercase,
  textAlign,
  setTextAlign,
  letterSpacing,
  setLetterSpacing,
  textColor,
  setTextColor,
}) => {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-surface-alt/70 border border-border">
      <span className="text-[11px] font-black uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
        <IconTypography size={15} className="text-primary" />
        <span>Typography &amp; Text Styles</span>
      </span>

      {/* Font Family Choices */}
      <div>
        <label className="block text-[10.5px] font-bold text-text-tertiary mb-1.5">Font Family</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'sans', label: 'Sans / Clean', fontClass: 'font-sans' },
            { id: 'serif', label: 'Serif / Editorial', fontClass: 'font-serif' },
            { id: 'mono', label: 'Mono / Code', fontClass: 'font-mono' },
            { id: 'caveat', label: 'Cursive / Signature', fontClass: 'font-caveat text-sm' },
            { id: 'syne', label: 'Display / Syne', fontClass: 'font-syne' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFontFamily(f.id)}
              className={`p-2 rounded-xl text-center text-[11px] font-bold transition-all cursor-pointer border ${f.fontClass} ${
                fontFamily === f.id
                  ? 'bg-text-primary text-text-on-accent border-text-primary shadow-xs'
                  : 'bg-surface hover:bg-surface-alt text-text-secondary border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Font Size */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="text-text-secondary">Font Size</span>
            <span className="text-text-primary font-mono">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="14"
            max="48"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary mb-1">Font Weight</label>
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
            {(['normal', 'medium', 'bold', 'black'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setFontWeight(w)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                  fontWeight === w
                    ? 'bg-text-primary text-text-on-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {w === 'normal' ? 'Reg' : w === 'medium' ? 'Med' : w === 'bold' ? 'Bold' : 'Blk'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Text Alignment & Formatting Toggles */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-[11.5px] font-bold text-text-secondary">Format &amp; Alignment</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsItalic(!isItalic)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isItalic
                ? 'bg-text-primary text-text-on-accent border-text-primary'
                : 'bg-surface text-text-secondary border-border hover:text-text-primary'
            }`}
            title="Italic"
          >
            <IconItalic size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsUppercase(!isUppercase)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isUppercase
                ? 'bg-text-primary text-text-on-accent border-text-primary'
                : 'bg-surface text-text-secondary border-border hover:text-text-primary'
            }`}
            title="Uppercase Transform"
          >
            <IconLetterCaseUpper size={15} />
          </button>

          <div className="flex items-center bg-surface p-0.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setTextAlign('left')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                textAlign === 'left' ? 'bg-text-primary text-text-on-accent' : 'text-text-secondary'
              }`}
            >
              <IconAlignLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('center')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                textAlign === 'center' ? 'bg-text-primary text-text-on-accent' : 'text-text-secondary'
              }`}
            >
              <IconAlignCenter size={15} />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('right')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                textAlign === 'right' ? 'bg-text-primary text-text-on-accent' : 'text-text-secondary'
              }`}
            >
              <IconAlignRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Letter Spacing Tracking */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11.5px] font-bold text-text-secondary">Letter Spacing</span>
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
          {(['tight', 'normal', 'wide', 'widest'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setLetterSpacing(s)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                letterSpacing === s
                  ? 'bg-text-primary text-text-on-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Text Color Swatches */}
      <div>
        <label className="block text-[10.5px] font-bold text-text-tertiary mb-1.5">Text Color</label>
        <div className="flex items-center gap-2 flex-wrap">
          {TEXT_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.name}
              type="button"
              onClick={() => setTextColor(swatch.value)}
              style={{ backgroundColor: swatch.value }}
              className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative shadow-xs border border-border ${
                textColor === swatch.value ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
              }`}
              title={swatch.name}
            />
          ))}
          <input
            type="color"
            value={textColor || '#111111'}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-6 h-6 rounded-full border border-border cursor-pointer bg-transparent"
            title="Custom Text Color Picker"
          />
        </div>
      </div>
    </div>
  );
};
