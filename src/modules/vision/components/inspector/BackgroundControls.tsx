import React from 'react';
import { IconPalette, IconCheck } from '@tabler/icons-react';
import { CARD_BG_SWATCHES } from '../../constants/inspectorPresets';

interface BackgroundControlsProps {
  bgStyle: 'solid' | 'gradient' | 'glass' | 'pastel';
  setBgStyle: (style: 'solid' | 'gradient' | 'glass' | 'pastel') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  bgStyle,
  setBgStyle,
  accentColor,
  setAccentColor,
}) => {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/70 border border-border">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
          <IconPalette size={15} className="text-primary" />
          <span>Card Background &amp; Accent</span>
        </span>

        {/* Background Mode Selector */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
          {(['solid', 'gradient', 'glass', 'pastel'] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setBgStyle(style)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold capitalize transition-colors cursor-pointer ${
                bgStyle === style
                  ? 'bg-text-primary text-text-on-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        {CARD_BG_SWATCHES.map((swatch) => (
          <button
            key={swatch.name}
            type="button"
            onClick={() => setAccentColor(swatch.value)}
            style={{ backgroundColor: swatch.value }}
            className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative shadow-xs border border-border ${
              accentColor === swatch.value
                ? 'scale-125 ring-2 ring-primary ring-offset-2'
                : 'hover:scale-110'
            }`}
            title={swatch.name}
          >
            {accentColor === swatch.value && (
              <IconCheck
                size={14}
                className="text-text-primary absolute inset-0 m-auto"
                strokeWidth={3}
              />
            )}
          </button>
        ))}

        <input
          type="color"
          value={accentColor}
          onChange={(e) => setAccentColor(e.target.value)}
          className="w-7 h-7 rounded-full border border-border cursor-pointer bg-transparent"
          title="Custom Hex Picker"
        />
      </div>
    </div>
  );
};
