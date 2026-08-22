import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { StandardCalculatorView } from './components/StandardCalculatorView';
import { InterestCalculatorView } from './components/InterestCalculatorView';

export default function CalculatorModule() {
  const {
    interestHistory,
    addInterestRecord,
    deleteInterestRecord,
    standardHistory,
    addStandardRecord,
    clearStandardHistory,
  } = useAppStore(
    useShallow((state) => ({
      interestHistory: state.interestHistory,
      addInterestRecord: state.addInterestRecord,
      deleteInterestRecord: state.deleteInterestRecord,
      standardHistory: state.standardHistory,
      addStandardRecord: state.addStandardRecord,
      clearStandardHistory: state.clearStandardHistory,
    })),
  );
  const addToast = useToastStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'standard' | 'interest'>('standard');
  const [calcInput, setCalcInput] = useState('0');
  const [liveResult, setLiveResult] = useState('');

  useEffect(() => {
    try {
      const cleanExpr = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
      if (/[+\-*/]/.test(cleanExpr) && !/[+\-*/]$/.test(cleanExpr)) {
        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${cleanExpr}`)();
        if (Number.isFinite(res)) {
          setLiveResult(parseFloat(res.toFixed(6)).toString());
        } else {
          setLiveResult('');
        }
      } else {
        setLiveResult('');
      }
    } catch {
      setLiveResult('');
    }
  }, [calcInput]);

  const handleCalcClick = (val: string) => {
    if (val === 'AC') {
      setCalcInput('0');
      setLiveResult('');
    } else if (val === '⌫') {
      setCalcInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '=') {
      try {
        const cleanExpr = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${cleanExpr}`)();
        const formattedRes = Number.isFinite(res)
          ? parseFloat(res.toFixed(6)).toString()
          : 'Error';

        if (formattedRes !== 'Error') {
          addStandardRecord({
            id: crypto.randomUUID(),
            expression: calcInput,
            result: formattedRes,
            createdAt: new Date().toISOString(),
          });
          setCalcInput(formattedRes);
          setLiveResult('');
        }
      } catch {
        // Do nothing on error
      }
    } else {
      setCalcInput((prev) => {
        if (prev === '0' && !['+', '-', '×', '÷', '.'].includes(val)) {
          return val;
        }
        if (
          ['+', '-', '×', '÷', '.'].includes(val) &&
          ['+', '-', '×', '÷', '.'].includes(prev.slice(-1))
        ) {
          return prev.slice(0, -1) + val;
        }
        return prev + val;
      });
    }
  };

  useEffect(() => {
    if (activeTab !== 'standard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable'))
      ) {
        return;
      }

      const key = e.key;
      if (key >= '0' && key <= '9') {
        handleCalcClick(key);
      } else if (key === '.') {
        handleCalcClick('.');
      } else if (key === '+') {
        handleCalcClick('+');
      } else if (key === '-') {
        handleCalcClick('-');
      } else if (key === '*' || key === 'x' || key === 'X') {
        handleCalcClick('×');
      } else if (key === '/') {
        handleCalcClick('÷');
      } else if (key === '%') {
        setCalcInput((prev) => {
          try {
            // eslint-disable-next-line no-new-func
            const res = new Function(`return ${prev.replace(/×/g, '*').replace(/÷/g, '/')}`)();
            return Number.isFinite(res) ? (res / 100).toString() : prev;
          } catch {
            return prev;
          }
        });
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalcClick('=');
      } else if (key === 'Backspace') {
        handleCalcClick('⌫');
      } else if (key === 'Escape') {
        handleCalcClick('AC');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, calcInput]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full gap-6 max-w-4xl mx-auto w-full text-left"
    >
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          All-in-One Calculator{' '}
          <span className="w-2 h-2 rounded-full bg-[#007AFF] inline-block"></span>
        </h2>
        <p className="text-text-secondary text-sm">
          Standard arithmetic and advanced interest calculations
        </p>
      </div>

      <div className="flex bg-surface-alt p-1 rounded-lg w-fit border border-border">
        <button
          onClick={() => setActiveTab('standard')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
            activeTab === 'standard'
              ? 'bg-surface shadow-sm text-[#007AFF]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => setActiveTab('interest')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
            activeTab === 'interest'
              ? 'bg-surface shadow-sm text-[#007AFF]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Interest
        </button>
      </div>

      {activeTab === 'interest' && (
        <InterestCalculatorView
          interestHistory={interestHistory}
          addInterestRecord={addInterestRecord}
          deleteInterestRecord={deleteInterestRecord}
          addToast={addToast}
        />
      )}

      {activeTab === 'standard' && (
        <StandardCalculatorView
          calcInput={calcInput}
          liveResult={liveResult}
          handleCalcClick={handleCalcClick}
          standardHistory={standardHistory}
          clearStandardHistory={clearStandardHistory}
          setCalcInput={setCalcInput}
        />
      )}
    </motion.div>
  );
}
