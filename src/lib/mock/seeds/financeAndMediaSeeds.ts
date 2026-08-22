export function generateFinanceAndMediaSeeds(
  adminId: string,
  iso: (offsetDays?: number, offsetHours?: number) => string,
  now: number,
  dayMs: number
) {
  const mediaLogs = [
    {
      id: 'media-1',
      user_id: adminId,
      type: 'ANIME',
      title: 'Frieren: Beyond Journey’s End',
      status: 'COMPLETED',
      rating: 10,
      episodes: 28,
      notes: 'Masterpiece in pacing, melancholy, character growth, and atmosphere.',
      added_at: iso(20),
    },
    {
      id: 'media-2',
      user_id: adminId,
      type: 'ANIME',
      title: 'Steins;Gate',
      status: 'COMPLETED',
      rating: 10,
      episodes: 24,
      notes: 'Incredible sci-fi narrative with phenomenal character arcs and plot resolution.',
      added_at: iso(25),
    },
    {
      id: 'media-3',
      user_id: adminId,
      type: 'GAME',
      title: 'Elden Ring',
      status: 'COMPLETED',
      rating: 10,
      episodes: 120,
      notes: 'World-class world design, exploration rewards, and combat depth.',
      added_at: iso(30),
    },
    {
      id: 'media-4',
      user_id: adminId,
      type: 'SERIES',
      title: 'Severance (Season 1)',
      status: 'COMPLETED',
      rating: 9,
      episodes: 9,
      notes: 'Remarkable cinematography, sterile aesthetic, and tension-building mystery.',
      added_at: iso(35),
    },
    {
      id: 'media-5',
      user_id: adminId,
      type: 'MOVIE',
      title: 'Oppenheimer',
      status: 'COMPLETED',
      rating: 9,
      episodes: 1,
      notes: 'Electrifying sound design and non-linear biographical pacing.',
      added_at: iso(40),
    },
    {
      id: 'media-6',
      user_id: adminId,
      type: 'ANIME',
      title: 'Chainsaw Man',
      status: 'COMPLETED',
      rating: 8,
      episodes: 12,
      notes: 'Dynamic animation direction and memorable soundtrack.',
      added_at: iso(45),
    },
    {
      id: 'media-7',
      user_id: adminId,
      type: 'GAME',
      title: 'Cyberpunk 2077: Phantom Liberty',
      status: 'COMPLETED',
      rating: 9,
      episodes: 65,
      notes: 'Stunning city design, incredible soundtrack, and emotional story.',
      added_at: iso(50),
    },
  ];

  const stocks = [
    { id: 'stk-1', user_id: adminId, ticker: 'AAPL', entry_price: 182.5, quantity: 15, action: 'BUY', notes: 'Core long term tech holding', date: iso(45) },
    { id: 'stk-2', user_id: adminId, ticker: 'NVDA', entry_price: 118.0, quantity: 25, action: 'BUY', notes: 'AI compute leader', date: iso(35) },
    { id: 'stk-3', user_id: adminId, ticker: 'MSFT', entry_price: 415.0, quantity: 10, action: 'BUY', notes: 'Cloud enterprise moat', date: iso(25) },
    { id: 'stk-4', user_id: adminId, ticker: 'GOOGL', entry_price: 165.0, quantity: 20, action: 'BUY', notes: 'Search + Gemini frontier models', date: iso(15) },
  ];

  const interestRecords = [
    {
      id: 'int-1',
      user_id: adminId,
      type: 'compound',
      principal: 25000,
      rate: 7.2,
      time: 5,
      time_unit: 'years',
      interest: 10392.5,
      total_amount: 35392.5,
      compound_frequency: 'annually',
      label: '5-Year Compound Growth Fund',
      calculated_at: iso(10),
    },
    {
      id: 'int-2',
      user_id: adminId,
      type: 'simple',
      principal: 10000,
      rate: 5.5,
      time: 2,
      time_unit: 'years',
      interest: 1100,
      total_amount: 11100,
      label: 'High Yield Savings Account',
      calculated_at: iso(20),
    },
  ];

  const countdowns = [
    {
      id: 'cd-1',
      user_id: adminId,
      label: 'Personal HQ Production Release',
      target_date: new Date(now + 14 * dayMs).toISOString(),
      emoji: '🚀',
      color: '#6366f1',
      created_at: iso(5),
    },
    {
      id: 'cd-2',
      user_id: adminId,
      label: 'Marathon Race Day',
      target_date: new Date(now + 45 * dayMs).toISOString(),
      emoji: '🏃',
      color: '#10b981',
      created_at: iso(10),
    },
    {
      id: 'cd-3',
      user_id: adminId,
      label: 'Next Quarter OKR Review',
      target_date: new Date(now + 30 * dayMs).toISOString(),
      emoji: '🎯',
      color: '#f59e0b',
      created_at: iso(15),
    },
  ];

  const budgetCategories = [
    { id: 'bcat-1', user_id: adminId, name: 'Housing & Utilities', budget: 1800, color: '#6366f1', icon: '🏠' },
    { id: 'bcat-2', user_id: adminId, name: 'Groceries & Nutrition', budget: 600, color: '#10b981', icon: '🥗' },
    { id: 'bcat-3', user_id: adminId, name: 'Technology & Subscriptions', budget: 250, color: '#06b6d4', icon: '💻' },
    { id: 'bcat-4', user_id: adminId, name: 'Leisure & Entertainment', budget: 350, color: '#ec4899', icon: '🍿' },
    { id: 'bcat-5', user_id: adminId, name: 'Investments & Savings', budget: 1500, color: '#f59e0b', icon: '📈' },
  ];

  const budgetTransactions = [
    { id: 'tx-1', user_id: adminId, category_id: 'bcat-1', amount: 1650, description: 'Monthly Apartment Rent', date: iso(2), type: 'expense', payment_method: 'online' },
    { id: 'tx-2', user_id: adminId, category_id: 'bcat-2', amount: 142.5, description: 'Organic Grocery Market', date: iso(3), type: 'expense', payment_method: 'card' },
    { id: 'tx-3', user_id: adminId, category_id: 'bcat-3', amount: 20, description: 'GitHub Copilot / Cloud subscription', date: iso(5), type: 'expense', payment_method: 'online' },
    { id: 'tx-4', user_id: adminId, category_id: 'bcat-5', amount: 1000, description: 'Index ETF Monthly DCA', date: iso(6), type: 'expense', payment_method: 'online' },
  ];

  const standardCalculations = [
    { id: 'calc-1', user_id: adminId, expression: '1850 * 12 + 6500', result: '28700', calculated_at: iso(2) },
    { id: 'calc-2', user_id: adminId, expression: '(45000 * 0.08) / 12', result: '300', calculated_at: iso(5) },
  ];

  return { mediaLogs, stocks, interestRecords, countdowns, budgetCategories, budgetTransactions, standardCalculations };
}
