import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCalculator, IconTrash, IconHistory, IconDeviceFloppy } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { Badge } from '../../components/ui/Badge';

// Helper component for animating numbers
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = easeOutQuart(progress);
      setDisplayValue(value * easedProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(displayValue)}
    </span>
  );
};

export default function CalculatorModule() {
  const { interestHistory, addInterestRecord, deleteInterestRecord } = useAppStore();
  const addToast = useToastStore(state => state.addToast);

  const [type, setType] = useState<'SI' | 'CI'>('SI');
  const [principal, setPrincipal] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [timeUnit, setTimeUnit] = useState<'years' | 'months'>('years');
  const [compoundFrequency, setCompoundFrequency] = useState<'annually' | 'semi-annually' | 'quarterly' | 'monthly'>('annually');
  
  const [result, setResult] = useState<{ interest: number; totalAmount: number } | null>(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T_val = parseFloat(time);

    if (isNaN(P) || isNaN(R) || isNaN(T_val) || P <= 0 || R <= 0 || T_val <= 0) {
      addToast('Invalid Input', 'Please enter valid positive numbers', 'error');
      return;
    }

    // Convert time to years for standard formula
    const T_years = timeUnit === 'months' ? T_val / 12 : T_val;

    let I = 0;
    let A = 0;

    if (type === 'SI') {
      I = (P * R * T_years) / 100;
      A = P + I;
    } else {
      let n = 1;
      if (compoundFrequency === 'semi-annually') n = 2;
      else if (compoundFrequency === 'quarterly') n = 4;
      else if (compoundFrequency === 'monthly') n = 12;

      A = P * Math.pow(1 + (R / (100 * n)), n * T_years);
      I = A - P;
    }

    setResult({ interest: I, totalAmount: A });
  };

  const handleSave = () => {
    if (!result) return;
    
    const label = prompt('Enter a label for this record:', 'Investment Goal');
    if (!label) return;

    addInterestRecord({
      id: crypto.randomUUID(),
      type,
      principal: parseFloat(principal),
      rate: parseFloat(rate),
      time: parseFloat(time),
      timeUnit,
      compoundFrequency: type === 'CI' ? compoundFrequency : undefined,
      interest: result.interest,
      totalAmount: result.totalAmount,
      label,
      calculatedAt: new Date().toISOString()
    });

    addToast('Success', 'Saved to history', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full gap-6 max-w-4xl mx-auto w-full"
    >
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Interest Calculator <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
        </h2>
        <p className="text-text-secondary text-sm">Calculate simple and compound interest</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Panel */}
        <div className="bg-surface border border-border p-6 rounded-xl flex flex-col gap-5 h-fit">
          <div className="flex bg-surface-alt p-1 rounded-lg">
            <button
              onClick={() => { setType('SI'); setResult(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'SI' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Simple Interest
            </button>
            <button
              onClick={() => { setType('CI'); setResult(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'CI' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Compound Interest
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Principal Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="10000"
                className="w-full bg-surface-alt border border-border-alt rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Interest Rate (%)</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">%</span>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="5.5"
                className="w-full bg-surface-alt border border-border-alt rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-text-secondary">Time</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="5"
                className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-text-secondary">Unit</label>
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value as any)}
                className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          {type === 'CI' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-secondary">Compound Frequency</label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value as any)}
                className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              >
                <option value="annually">Annually</option>
                <option value="semi-annually">Semi-Annually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          <button
            onClick={calculate}
            className="w-full bg-primary hover:bg-primary-muted text-white font-medium py-3 rounded-lg mt-2 transition-colors flex items-center justify-center gap-2"
          >
            <IconCalculator className="w-5 h-5" /> Calculate
          </button>
        </div>

        {/* Results & History Panel */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface border border-border p-6 rounded-xl flex flex-col gap-6"
              >
                <div>
                  <p className="text-sm text-text-secondary mb-1">Total Interest Earned</p>
                  <p className="text-3xl font-bold text-green-500">
                    +<AnimatedNumber value={result.interest} />
                  </p>
                </div>
                <div className="h-px bg-border w-full"></div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Total Amount</p>
                  <p className="text-4xl font-bold">
                    <AnimatedNumber value={result.totalAmount} />
                  </p>
                </div>
                
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 bg-surface-alt hover:bg-surface-hover text-text-primary py-2 rounded-lg transition-colors border border-border mt-2"
                >
                  <IconDeviceFloppy className="w-4 h-4" /> Save to History
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface border border-border p-6 rounded-xl flex flex-col items-center justify-center text-center h-[280px]"
              >
                <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-4">
                  <IconCalculator className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-text-secondary">Enter values and calculate to see results.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold flex items-center gap-2">
              <IconHistory className="w-4 h-4" /> History
            </h3>
            {interestHistory.length === 0 ? (
              <p className="text-sm text-text-muted">No saved calculations.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {interestHistory.map(record => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      key={record.id}
                      className="bg-surface border border-border p-3 rounded-lg flex flex-col gap-2 group hover:border-border transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{record.label}</span>
                        <Badge variant={record.type === 'SI' ? 'info' : 'warning'}>{record.type}</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>P: ₹{record.principal}</span>
                        <span>R: {record.rate}%</span>
                        <span>T: {record.time} {record.timeUnit}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1 pt-2 border-t border-border/50">
                        <div>
                          <p className="text-[10px] text-text-muted">Total Amount</p>
                          <p className="font-semibold text-sm">₹{Math.round(record.totalAmount).toLocaleString('en-IN')}</p>
                        </div>
                        <button 
                          onClick={() => deleteInterestRecord(record.id)}
                          className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
