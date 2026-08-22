import React from 'react';

export const CountdownPreview: React.FC<{ template: string }> = ({ template }) => {
  const isDarkTemplate = template === 'dark';
  const wrapperBg = isDarkTemplate
    ? 'bg-[#111] border-[#333] text-white'
    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
  const borderL = template === 'vertical' ? 'border-l-4 border-l-blue-500' : '';

  return (
    <div
      className={`p-4 rounded-2xl border ${wrapperBg} ${borderL} flex flex-col gap-3 w-full max-w-[240px] shadow-sm select-none transition-all`}
    >
      {template !== 'split' && template !== 'compact' && (
        <div className="flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <div className="text-left">
            <h4 className="text-sm font-semibold tracking-tight leading-tight">Graduation</h4>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">12 Oct 2026</span>
          </div>
        </div>
      )}

      {(() => {
        switch (template) {
          case 'minimal':
            return (
              <div className="flex items-baseline gap-1 text-sm font-mono font-bold mt-1 text-left">
                <span>27</span>
                <span className="text-[10px] text-zinc-500 mr-1">d</span>
                <span>08</span>
                <span className="text-[10px] text-zinc-500 mr-1">h</span>
                <span>45</span>
                <span className="text-[10px] text-zinc-500 mr-1">m</span>
                <span>12</span>
                <span className="text-[10px] text-zinc-500">s</span>
              </div>
            );
          case 'gradient':
            return (
              <div className="flex gap-1 mt-1 justify-start">
                {[
                  { v: '27', l: 'D' },
                  { v: '08', l: 'H' },
                  { v: '45', l: 'M' },
                  { v: '12', l: 'S' },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg p-1 min-w-[32px] text-center shadow-sm"
                  >
                    <span className="text-xs font-bold font-mono">{x.v}</span>
                    <span className="text-[7px] font-bold opacity-80">{x.l}</span>
                  </div>
                ))}
              </div>
            );
          case 'circle':
            return (
              <div className="flex gap-1.5 justify-start mt-1">
                {['D', 'H', 'M', 'S'].map((x) => (
                  <div
                    key={x}
                    className="relative w-8 h-8 rounded-full border-2 border-blue-500/20 flex items-center justify-center"
                  >
                    <span className="text-[9px] font-bold text-blue-500">{x}</span>
                  </div>
                ))}
              </div>
            );
          case 'event':
            return (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mt-1 text-center">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
                  Big Event
                </span>
                <span className="text-sm font-black font-mono mt-1 block">27 Days Left</span>
              </div>
            );
          case 'sale':
            return (
              <div className="bg-red-500 text-white rounded-lg p-2 mt-1 text-center font-bold relative overflow-hidden">
                <div className="text-[7px] uppercase tracking-widest bg-black/20 px-1 py-0.5 rounded w-max mx-auto mb-1">
                  FLASH SALE
                </div>
                <span className="text-xs font-mono">27d : 08h : 45m</span>
              </div>
            );
          case 'compact':
            return (
              <div className="flex items-center justify-between mt-1 w-full text-left">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm shrink-0">🎓</span>
                  <span className="text-sm font-medium truncate max-w-[80px]">Graduation</span>
                </div>
                <span className="text-xs font-mono font-medium text-blue-500 shrink-0 ml-2">
                  27d 08h
                </span>
              </div>
            );
          case 'flip':
            return (
              <div className="flex gap-1 justify-start mt-1">
                {['27', '08', '45', '12'].map((v, i) => (
                  <div
                    key={i}
                    className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-md px-1.5 py-1 text-xs font-bold font-mono text-center shadow-md relative min-w-[28px]"
                  >
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
                    {v}
                  </div>
                ))}
              </div>
            );
          case 'progress':
            return (
              <div className="flex flex-col gap-1.5 mt-1 text-left">
                <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                  <span>27 Days Left</span>
                  <span>70%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[70%]" />
                </div>
              </div>
            );
          case 'vertical':
            return (
              <div className="flex flex-col gap-1 pl-2 mt-1 text-left">
                <span className="text-xs font-bold font-mono text-blue-500">27 Days Left</span>
                <span className="text-[9px] text-zinc-500">College graduation ceremony</span>
              </div>
            );
          case 'split':
            return (
              <div className="flex flex-col gap-1 mt-1 text-left">
                <div className="text-xs font-black uppercase">Graduation</div>
                <div className="flex items-baseline gap-1 text-sm font-mono font-bold text-blue-500">
                  <span>27</span>
                  <span className="text-[8px] text-zinc-500">d</span>
                  <span>08</span>
                  <span className="text-[8px] text-zinc-500">h</span>
                  <span>45</span>
                  <span className="text-[8px] text-zinc-500">m</span>
                </div>
              </div>
            );
          default:
            return (
              <div className="flex flex-col gap-2 mt-1 text-left">
                <div className="flex gap-1">
                  {[
                    { v: '27', l: 'days' },
                    { v: '08', l: 'hrs' },
                    { v: '45', l: 'mins' },
                  ].map((x) => (
                    <div
                      key={x.l}
                      className="flex-1 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg p-1 text-center"
                    >
                      <span className="text-xs font-bold font-mono block tracking-tight">{x.v}</span>
                      <span className="text-[8px] text-zinc-500 uppercase font-bold">{x.l}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[70%]" />
                </div>
              </div>
            );
        }
      })()}
    </div>
  );
};
