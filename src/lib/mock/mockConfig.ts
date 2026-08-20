// ─── Mock Client Configuration & Telemetry ────────────────────────────────────

export interface MockConfigState {
  enabled: boolean;
  minLatencyMs: number;
  maxLatencyMs: number;
  forceErrorRate: number; // 0.0 to 1.0
  activeUserId: string;
  activeUserEmail: string;
}

const STORAGE_KEY_ENABLED = 'phq_mock_mode_enabled';
const STORAGE_KEY_LATENCY_MIN = 'phq_mock_latency_min';
const STORAGE_KEY_LATENCY_MAX = 'phq_mock_latency_max';
const STORAGE_KEY_ERROR_RATE = 'phq_mock_error_rate';
const STORAGE_KEY_USER_EMAIL = 'phq_mock_user_email';

// In-memory state variables initialized with smart defaults
let inMemoryEnabled: boolean | null = null;
let inMemoryLatencyMin = 100;
let inMemoryLatencyMax = 350;
let inMemoryErrorRate = 0;
let inMemoryUserEmail = 'tungariyarahul08@gmail.com';

export function isLocalhost(): boolean {
  if (typeof window === 'undefined' || !window.location) return true;
  const { hostname } = window.location;
  if (!hostname || hostname === '') return true; // test runner environment
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  );
}

export function isMockEnabled(): boolean {
  if (inMemoryEnabled !== null) {
    return inMemoryEnabled;
  }

  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
    if (stored !== null) {
      return stored === 'true';
    }
  }

  const envVal = import.meta.env?.VITE_USE_MOCK_DATA;
  if (envVal !== undefined) {
    return envVal === 'true';
  }

  return isLocalhost() && Boolean(import.meta.env?.DEV);
}

export function setMockEnabled(enabled: boolean): void {
  inMemoryEnabled = enabled;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('phq-mock-config-changed', { detail: { enabled } }));
  }
}

export function getLatencyRange(): { min: number; max: number } {
  if (typeof localStorage !== 'undefined') {
    const min = parseInt(localStorage.getItem(STORAGE_KEY_LATENCY_MIN) || '', 10);
    const max = parseInt(localStorage.getItem(STORAGE_KEY_LATENCY_MAX) || '', 10);
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  }
  return { min: inMemoryLatencyMin, max: inMemoryLatencyMax };
}

export function setLatencyRange(min: number, max: number): void {
  inMemoryLatencyMin = min;
  inMemoryLatencyMax = max;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LATENCY_MIN, String(min));
    localStorage.setItem(STORAGE_KEY_LATENCY_MAX, String(max));
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('phq-mock-config-changed'));
  }
}

export function getForceErrorRate(): number {
  if (typeof localStorage !== 'undefined') {
    const val = parseFloat(localStorage.getItem(STORAGE_KEY_ERROR_RATE) || '');
    if (!isNaN(val)) return val;
  }
  return inMemoryErrorRate;
}

export function setForceErrorRate(rate: number): void {
  const clamped = Math.max(0, Math.min(1, rate));
  inMemoryErrorRate = clamped;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ERROR_RATE, String(clamped));
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('phq-mock-config-changed'));
  }
}

export function getMockUser(): { id: string; email: string; name: string } {
  let email = inMemoryUserEmail;
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_USER_EMAIL);
    if (stored) email = stored;
  }
  const isAdmin = email === 'tungariyarahul08@gmail.com';
  return {
    id: isAdmin ? 'usr_admin_mock_001' : 'usr_test_mock_002',
    email,
    name: isAdmin ? 'Rahul (Admin)' : 'Dev Tester',
  };
}

export function setMockUser(email: string): void {
  inMemoryUserEmail = email;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_USER_EMAIL, email);
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('phq-mock-user-changed', { detail: { email } }));
  }
}

export async function simulateLatency(): Promise<void> {
  const { min, max } = getLatencyRange();
  if (min <= 0 && max <= 0) return;
  const duration = min + Math.random() * Math.max(0, max - min);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function maybeSimulateError(): { data: null; error: { message: string; code: string } } | null {
  const rate = getForceErrorRate();
  if (rate > 0 && Math.random() < rate) {
    return {
      data: null,
      error: {
        message: 'Simulated Network Error (Dev Mock)',
        code: 'SIMULATED_NETWORK_ERROR',
      },
    };
  }
  return null;
}
