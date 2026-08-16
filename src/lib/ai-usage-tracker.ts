/**
 * AI Usage Tracker & Active Rate Limiter
 * Tracks API calls, estimated tokens, and enforces a sliding-window rate limit (15 RPM free tier)
 * and daily quota (1,500 RPD) with multi-tab synchronization.
 */

export interface AiUsageStats {
  requestsToday: number;
  totalRequests: number;
  promptTokensToday: number;
  completionTokensToday: number;
  totalTokens: number;
  lastRequestTime: number | null;
  lastResetDate: string; // YYYY-MM-DD
}

export interface RateLimitStatus {
  allowed: boolean;
  requestsInLastMinute: number;
  maxRpm: number;
  cooldownSeconds: number;
  dailyRequests: number;
  dailyLimit: number;
  isDailyQuotaExceeded: boolean;
  isRateLimited: boolean;
  warningMessage?: string;
}

const STORAGE_KEY = 'phq_ai_usage_stats';
const SLIDING_WINDOW_KEY = 'phq_ai_recent_calls';

// Gemini 2.5 Flash Free Tier Defaults
export const FREE_TIER_MAX_RPM = 15;
export const RPM_SAFETY_THRESHOLD = 12; // Pre-flight warning threshold
export const FREE_TIER_MAX_RPD = 1500;

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function loadStoredStats(): AiUsageStats {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: AiUsageStats = JSON.parse(raw);
      if (parsed.lastResetDate !== today) {
        // Reset daily counters on a new day
        return {
          ...parsed,
          requestsToday: 0,
          promptTokensToday: 0,
          completionTokensToday: 0,
          lastResetDate: today,
        };
      }
      return parsed;
    }
  } catch (e) {
    console.warn('[AI Usage Tracker] Failed to load stats from localStorage:', e);
  }

  return {
    requestsToday: 0,
    totalRequests: 0,
    promptTokensToday: 0,
    completionTokensToday: 0,
    totalTokens: 0,
    lastRequestTime: null,
    lastResetDate: today,
  };
}

function saveStats(stats: AiUsageStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('[AI Usage Tracker] Failed to save stats:', e);
  }
}

function getRecentTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(SLIDING_WINDOW_KEY);
    if (raw) {
      const now = Date.now();
      const list: number[] = JSON.parse(raw);
      // Retain only timestamps from the last 60 seconds
      return list.filter((ts) => now - ts < 60000);
    }
  } catch (e) {
    console.warn('[AI Usage Tracker] Failed to load sliding window timestamps:', e);
  }
  return [];
}

function saveRecentTimestamps(timestamps: number[]): void {
  try {
    localStorage.setItem(SLIDING_WINDOW_KEY, JSON.stringify(timestamps));
  } catch (e) {
    console.warn('[AI Usage Tracker] Failed to save recent timestamps:', e);
  }
}

type UsageListener = (stats: AiUsageStats, rateStatus: RateLimitStatus) => void;
const listeners = new Set<UsageListener>();

// Broadcast changes to active listeners
function notifyListeners() {
  const stats = loadStoredStats();
  const rateStatus = checkRateLimit();
  listeners.forEach((listener) => {
    try {
      listener(stats, rateStatus);
    } catch (err) {
      console.error('[AI Usage Tracker] Error in listener:', err);
    }
  });
}

// Multi-Tab Sync: Listen to storage changes across browser tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === SLIDING_WINDOW_KEY) {
      notifyListeners();
    }
  });
}

/**
 * Pre-flight rate limit check.
 */
export function checkRateLimit(customMaxRpm = FREE_TIER_MAX_RPM, customDailyLimit = FREE_TIER_MAX_RPD): RateLimitStatus {
  const stats = loadStoredStats();
  const recent = getRecentTimestamps();
  const requestsInLastMinute = recent.length;
  const isDailyQuotaExceeded = stats.requestsToday >= customDailyLimit;
  const isRateLimited = requestsInLastMinute >= customMaxRpm;

  let cooldownSeconds = 0;
  if (requestsInLastMinute > 0 && isRateLimited) {
    const oldestInWindow = recent[0];
    const elapsed = Date.now() - oldestInWindow;
    cooldownSeconds = Math.max(1, Math.ceil((60000 - elapsed) / 1000));
  }

  let warningMessage: string | undefined;
  if (isDailyQuotaExceeded) {
    warningMessage = `Daily quota reached (${stats.requestsToday}/${customDailyLimit} requests). Resets at midnight.`;
  } else if (isRateLimited) {
    warningMessage = `Rate limit reached (${requestsInLastMinute}/${customMaxRpm} RPM). Please wait ${cooldownSeconds}s.`;
  } else if (requestsInLastMinute >= RPM_SAFETY_THRESHOLD) {
    warningMessage = `High activity (${requestsInLastMinute}/${customMaxRpm} RPM). Approaching rate limit.`;
  }

  return {
    allowed: !isDailyQuotaExceeded && !isRateLimited,
    requestsInLastMinute,
    maxRpm: customMaxRpm,
    cooldownSeconds,
    dailyRequests: stats.requestsToday,
    dailyLimit: customDailyLimit,
    isDailyQuotaExceeded,
    isRateLimited,
    warningMessage,
  };
}

/**
 * Record a completed API request and its token usage.
 */
export function recordAiRequest(promptTokens = 0, completionTokens = 0): { stats: AiUsageStats; rateStatus: RateLimitStatus } {
  const now = Date.now();
  const today = getTodayString();
  const stats = loadStoredStats();

  if (stats.lastResetDate !== today) {
    stats.requestsToday = 0;
    stats.promptTokensToday = 0;
    stats.completionTokensToday = 0;
    stats.lastResetDate = today;
  }

  stats.requestsToday += 1;
  stats.totalRequests += 1;
  stats.promptTokensToday += promptTokens;
  stats.completionTokensToday += completionTokens;
  stats.totalTokens += promptTokens + completionTokens;
  stats.lastRequestTime = now;

  saveStats(stats);

  // Update sliding window
  const recent = getRecentTimestamps();
  recent.push(now);
  saveRecentTimestamps(recent);

  const rateStatus = checkRateLimit();
  notifyListeners();

  return { stats, rateStatus };
}

/**
 * Subscribe to AI usage and rate limit status updates.
 */
export function subscribeAiUsage(listener: UsageListener): () => void {
  listeners.add(listener);
  // Initial callback
  listener(loadStoredStats(), checkRateLimit());
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get current stats snapshot.
 */
export function getAiUsageSnapshot(): { stats: AiUsageStats; rateStatus: RateLimitStatus } {
  return {
    stats: loadStoredStats(),
    rateStatus: checkRateLimit(),
  };
}

/**
 * Reset local statistics (for developer debugging).
 */
export function resetAiUsageStats(): void {
  const today = getTodayString();
  const resetStats: AiUsageStats = {
    requestsToday: 0,
    totalRequests: 0,
    promptTokensToday: 0,
    completionTokensToday: 0,
    totalTokens: 0,
    lastRequestTime: null,
    lastResetDate: today,
  };
  saveStats(resetStats);
  saveRecentTimestamps([]);
  notifyListeners();
}
