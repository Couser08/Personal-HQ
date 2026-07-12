export const FILTERS = ['all', 'active', 'completed'] as const;
export type StudyFilter = typeof FILTERS[number];

export const formatMinutes = (m: number = 0) => {
  if (m < 60) return `${m}m`;
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export const cleanHtmlText = (html: string) => {
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};
