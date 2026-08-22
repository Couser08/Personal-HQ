import React from 'react';
import { IconHistory } from '@tabler/icons-react';
import type { StandardCalculation } from '../../../store/types';

interface StandardCalculatorViewProps {
  calcInput: string;
  liveResult: string;
  handleCalcClick: (btn: string) => void;
  standardHistory: StandardCalculation[];
  clearStandardHistory: () => void;
  setCalcInput: (val: string) => void;
}

export const StandardCalculatorView: React.FC<StandardCalculatorViewProps> = ({
  calcInput,
  liveResult,
  handleCalcClick,
  standardHistory,
  clearStandardHistory,
  setCalcInput,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 pt-8 text-left">
      {/* Calculator Container */}
      <div className="bg-[#1C1C1E] dark:bg-[#000000] border border-[#3A3A3C] shadow-2xl rounded-3xl p-6 w-[320px] flex flex-col gap-4 text-white">
        {/* Display Screen */}
        <div className="flex flex-col items-end justify-end h-24 mb-2">
          <span className="text-gray-400 text-lg h-7 font-mono tracking-normal">
            {liveResult ? `= ${liveResult}` : ''}
          </span>
          <span className="text-5xl font-light tracking-normal truncate w-full text-right">
            {calcInput}
          </span>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3 justify-items-center">
          {/* Row 1 */}
          {['AC', '⌫', '%', '÷'].map((btn, i) => (
            <button
              key={btn}
              onClick={() => handleCalcClick(btn === '%' ? '/100' : btn)}
              className={`w-14 h-14 rounded-full text-lg font-bold flex items-center justify-center transition-all ${
                i === 3
                  ? 'bg-[#FF9F0A] text-white hover:bg-[#FFB340] active:bg-[#CC7F08]'
                  : 'bg-[#A5A5A5] text-black hover:bg-[#D4D4D2] active:bg-[#8E8E8E]'
              }`}
            >
              {btn}
            </button>
          ))}

          {/* Row 2 */}
          {['7', '8', '9', '×'].map((btn, i) => (
            <button
              key={btn}
              onClick={() => handleCalcClick(btn)}
              className={`w-14 h-14 rounded-full text-lg font-semibold flex items-center justify-center transition-all ${
                i === 3
                  ? 'bg-[#FF9F0A] text-white hover:bg-[#FFB340] active:bg-[#CC7F08]'
                  : 'bg-[#333333] text-white hover:bg-[#505050] active:bg-[#222222]'
              }`}
            >
              {btn}
            </button>
          ))}

          {/* Row 3 */}
          {['4', '5', '6', '-'].map((btn, i) => (
            <button
              key={btn}
              onClick={() => handleCalcClick(btn)}
              className={`w-14 h-14 rounded-full text-lg font-semibold flex items-center justify-center transition-all ${
                i === 3
                  ? 'bg-[#FF9F0A] text-white hover:bg-[#FFB340] active:bg-[#CC7F08]'
                  : 'bg-[#333333] text-white hover:bg-[#505050] active:bg-[#222222]'
              }`}
            >
              {btn}
            </button>
          ))}

          {/* Row 4 */}
          {['1', '2', '3', '+'].map((btn, i) => (
            <button
              key={btn}
              onClick={() => handleCalcClick(btn)}
              className={`w-14 h-14 rounded-full text-lg font-semibold flex items-center justify-center transition-all ${
                i === 3
                  ? 'bg-[#FF9F0A] text-white hover:bg-[#FFB340] active:bg-[#CC7F08]'
                  : 'bg-[#333333] text-white hover:bg-[#505050] active:bg-[#222222]'
              }`}
            >
              {btn}
            </button>
          ))}

          {/* Row 5 */}
          <div className="grid grid-cols-4 gap-3 col-span-4 w-full">
            <button
              onClick={() => handleCalcClick('0')}
              className="col-span-2 w-[124px] h-14 rounded-full bg-[#333333] text-white hover:bg-[#505050] active:bg-[#222222] text-lg font-semibold flex items-center justify-start pl-6 transition-all"
            >
              0
            </button>
            <button
              onClick={() => handleCalcClick('.')}
              className="w-14 h-14 rounded-full bg-[#333333] text-white hover:bg-[#505050] active:bg-[#222222] text-lg font-semibold flex items-center justify-center transition-all"
            >
              .
            </button>
            <button
              onClick={() => handleCalcClick('=')}
              className="w-14 h-14 rounded-full bg-[#FF9F0A] text-white hover:bg-[#FFB340] active:bg-[#CC7F08] text-lg flex items-center justify-center transition-all font-bold"
            >
              =
            </button>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-[320px] bg-surface border border-border rounded-3xl p-5 shadow-sm flex flex-col gap-3.5 max-h-[460px] overflow-hidden">
        <div className="flex justify-between items-center pb-2 border-b border-border/60">
          <h3 className="font-bold text-xs uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <IconHistory className="w-4 h-4" /> Calculations History
          </h3>
          {standardHistory.length > 0 && (
            <button
              onClick={clearStandardHistory}
              className="text-[10px] text-text-muted hover:text-red-500 font-bold uppercase transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
          {standardHistory.length === 0 ? (
            <div className="text-center py-20 text-xs text-text-muted">No recent calculations</div>
          ) : (
            standardHistory.map((h) => (
              <div
                key={h.id}
                className="p-2.5 bg-surface-alt/40 border border-border/40 hover:border-border rounded-xl flex flex-col items-end gap-1 cursor-pointer transition-colors text-right"
                onClick={() => {
                  setCalcInput(h.expression);
                }}
              >
                <span className="text-[10px] text-text-muted font-mono truncate max-w-full leading-tight">
                  {h.expression}
                </span>
                <span className="text-sm font-bold text-text-primary leading-tight font-mono">
                  {h.result}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
