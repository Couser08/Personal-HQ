import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconTrendingUp, IconFilter } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export default function StocksModule() {
  const { stocks, addStock, deleteStock , showConfirm} = useAppStore();
  
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [ticker, setTicker] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [action, setAction] = useState<'BUY' | 'SELL' | 'WATCHLIST'>('BUY');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenModal = () => {
    setTicker('');
    setEntryPrice('');
    setQuantity('');
    setAction('BUY');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!ticker.trim()) return;

    addStock({
      id: crypto.randomUUID(),
      ticker: ticker.toUpperCase().trim(),
      entryPrice: parseFloat(entryPrice) || 0,
      quantity: parseFloat(quantity) || 0,
      action,
      notes,
      date: new Date(date).toISOString()
    });
    
    setIsModalOpen(false);
  };

  const filteredStocks = useMemo(() => {
    let filtered = stocks;
    if (filterAction) {
      filtered = filtered.filter(s => s.action === filterAction);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stocks, filterAction]);

  // Calculations
  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalPnl = 0;
    let watchlistCount = 0;

    // To calculate P&L, we would ideally need current price. 
    // The prompt says: "Total P&L (calculated from BUY vs SELL entries of same ticker)"
    // Meaning realized PnL = SELL value - (BUY avg price * SELL qty)
    // Let's implement a simple realized P&L calculation:
    
    const tickerStats: Record<string, { qty: number, totalCost: number }> = {};
    
    // Sort chronological for accurate average cost tracking
    const chronological = [...stocks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    chronological.forEach(s => {
      if (s.action === 'WATCHLIST') {
        watchlistCount++;
      } else if (s.action === 'BUY') {
        totalInvested += (s.entryPrice * s.quantity);
        if (!tickerStats[s.ticker]) tickerStats[s.ticker] = { qty: 0, totalCost: 0 };
        tickerStats[s.ticker].qty += s.quantity;
        tickerStats[s.ticker].totalCost += (s.entryPrice * s.quantity);
      } else if (s.action === 'SELL') {
        const stats = tickerStats[s.ticker] || { qty: 0, totalCost: 0 };
        const avgCost = stats.qty > 0 ? stats.totalCost / stats.qty : 0;
        
        // P&L = (Sell Price - Avg Cost) * Qty
        const pnl = (s.entryPrice - avgCost) * s.quantity;
        totalPnl += pnl;

        if (stats.qty > 0) {
          stats.qty -= s.quantity;
          stats.totalCost -= (avgCost * s.quantity);
        }
      }
    });

    return { totalInvested, totalPnl, watchlistCount };
  }, [stocks]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full gap-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Stock Journal <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </h2>
          <p className="text-text-secondary text-sm">Track your trades and investments</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-primary hover:bg-primary-muted text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-5 rounded-xl">
          <p className="text-sm text-text-secondary mb-1">Total Invested</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <p className="text-sm text-text-secondary mb-1">Total P&L (Realized)</p>
          <p className={`text-2xl font-bold ${stats.totalPnl > 0 ? 'text-green-500' : stats.totalPnl < 0 ? 'text-rose-500' : ''}`}>
            {stats.totalPnl > 0 ? '+' : ''}{formatCurrency(stats.totalPnl)}
          </p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <p className="text-sm text-text-secondary mb-1">Watchlist</p>
          <p className="text-2xl font-bold">{stats.watchlistCount} <span className="text-sm font-normal text-text-muted">Stocks</span></p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconFilter className="w-4 h-4 text-text-muted" />
        <Badge variant={filterAction === null ? 'primary' : 'default'} onClick={() => setFilterAction(null)}>All</Badge>
        <Badge variant={filterAction === 'BUY' ? 'success' : 'default'} onClick={() => setFilterAction('BUY')}>Buy</Badge>
        <Badge variant={filterAction === 'SELL' ? 'danger' : 'default'} onClick={() => setFilterAction('SELL')}>Sell</Badge>
        <Badge variant={filterAction === 'WATCHLIST' ? 'warning' : 'default'} onClick={() => setFilterAction('WATCHLIST')}>Watchlist</Badge>
      </div>

      {stocks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 mb-6 rounded-full bg-surface-alt flex items-center justify-center">
            <IconTrendingUp className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-medium mb-2">No stock entries yet</h3>
          <p className="text-text-secondary max-w-md mb-6">Log your trades, track investments, and manage your watchlist.</p>
          <button
            onClick={handleOpenModal}
            className="text-primary hover:underline font-medium"
          >
            Add your first trade
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Ticker</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Action</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Qty</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Price</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Total Value</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Notes</th>
                <th className="px-4 py-3 font-medium text-text-secondary"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredStocks.map((stock) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={stock.id} 
                    className="border-b border-border/50 hover:bg-surface-alt transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-text-muted">
                      {new Date(stock.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-semibold">{stock.ticker}</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        stock.action === 'BUY' ? 'success' : 
                        stock.action === 'SELL' ? 'danger' : 'warning'
                      }>
                        {stock.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{stock.quantity > 0 ? stock.quantity : '-'}</td>
                    <td className="px-4 py-3">{stock.entryPrice > 0 ? formatCurrency(stock.entryPrice) : '-'}</td>
                    <td className="px-4 py-3">{stock.quantity > 0 && stock.entryPrice > 0 ? formatCurrency(stock.quantity * stock.entryPrice) : '-'}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-text-muted" title={stock.notes}>
                      {stock.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => {
                          showConfirm('Confirm Delete', 'Delete this entry?', () => { deleteStock(stock.id); });
                        }}
                        className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Trade / Entry"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-text-secondary">Action</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setAction('BUY')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${action === 'BUY' ? 'bg-green-500/10 text-green-400 border-green-500/50' : 'bg-surface-alt border-border-alt text-text-muted hover:border-text-muted'}`}
              >
                Buy
              </button>
              <button 
                onClick={() => setAction('SELL')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${action === 'SELL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/50' : 'bg-surface-alt border-border-alt text-text-muted hover:border-text-muted'}`}
              >
                Sell
              </button>
              <button 
                onClick={() => setAction('WATCHLIST')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${action === 'WATCHLIST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/50' : 'bg-surface-alt border-border-alt text-text-muted hover:border-text-muted'}`}
              >
                Watchlist
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Ticker</label>
            <input
              type="text"
              placeholder="e.g. AAPL, RELIANCE"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm uppercase"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>

          {action !== 'WATCHLIST' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-secondary">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-secondary">Price</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-text-secondary">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Long term hold, earnings play..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 md:col-span-2 mt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-muted text-white rounded-lg transition-colors"
            >
              Save Entry
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
