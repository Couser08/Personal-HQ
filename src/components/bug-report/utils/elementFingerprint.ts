/**
 * Utility functions for capturing rich element fingerprints, ancestor paths,
 * data-attributes, and auto-detecting route/section info for bug reports.
 */

import { type BugReportElementInfo } from '../../../store/types';

// Map of internal module IDs to human-readable section names
const MODULE_SECTION_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  journal: 'Journal',
  habits: 'Habit Tracker',
  books: 'Library / Books',
  pomodoro: 'Pomodoro Timer',
  links: 'Link Vault',
  todo: 'Tasks & Projects',
  vision: 'Vision Board',
  admin: 'Admin Control Center',
  settings: 'Settings',
  media: 'Media Tracker',
  budget: 'Budget & Finance',
  exams: 'Study & Exams',
  changelog: 'Changelog',
  test_layout: 'Layout Test Surface',
  design_lab: 'Design Lab',
};

/**
 * Safely extracts all classes from an element into an array using classList.
 * Handles SVGAnimatedString and standard HTML elements.
 */
export function getElementClasses(el: HTMLElement | Element): string[] {
  if (!el) return [];
  try {
    if (el.classList && el.classList.length > 0) {
      return Array.from(el.classList).filter(Boolean);
    }
    if (typeof el.className === 'string') {
      return el.className.split(/\s+/).filter(Boolean);
    }
  } catch {
    // Fallback if classList is inaccessible
  }
  return [];
}

/**
 * Extracts all data-* attributes from an element and key identifying parent data attributes.
 */
export function getDataAttributes(el: HTMLElement | Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!el) return attrs;

  try {
    // Direct element data-* attributes
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (attr.name.startsWith('data-')) {
        attrs[attr.name] = attr.value;
      }
    }

    // Check closest component/target parent if missing
    if (!attrs['data-component']) {
      const compParent = el.closest('[data-component]') as HTMLElement | null;
      if (compParent?.getAttribute('data-component')) {
        attrs['data-component'] = compParent.getAttribute('data-component')!;
      }
    }

    if (!attrs['data-bug-target']) {
      const targetParent = el.closest('[data-bug-target]') as HTMLElement | null;
      if (targetParent?.getAttribute('data-bug-target')) {
        attrs['data-bug-target'] = targetParent.getAttribute('data-bug-target')!;
      }
    }
  } catch {
    // Ignore DOM extraction errors
  }

  return attrs;
}

/**
 * Formats a single DOM node into a clear, readable token for the ancestor path.
 * e.g. "JournalModule", "EntryCard", ".card-header", "button[data-bug-target='save-btn']"
 */
function formatNodeToken(node: HTMLElement | Element): string {
  const tag = node.tagName.toLowerCase();
  const comp = node.getAttribute('data-component');
  if (comp) return comp;

  const bugTarget = node.getAttribute('data-bug-target');
  if (bugTarget) {
    return `${tag}[data-bug-target="${bugTarget}"]`;
  }

  if (node.id && !node.id.startsWith('bug-report')) {
    return `#${node.id}`;
  }

  const classes = getElementClasses(node);
  // Pick meaningful non-utility semantic class if available
  const semanticClass = classes.find((c) =>
    !c.startsWith('bg-') &&
    !c.startsWith('text-') &&
    !c.startsWith('p-') &&
    !c.startsWith('px-') &&
    !c.startsWith('py-') &&
    !c.startsWith('m-') &&
    !c.startsWith('flex') &&
    !c.startsWith('grid') &&
    !c.startsWith('w-') &&
    !c.startsWith('h-') &&
    !c.startsWith('border') &&
    !c.startsWith('rounded') &&
    !c.startsWith('shadow') &&
    !c.startsWith('transition') &&
    !c.includes(':') &&
    !c.includes('[') &&
    !c.includes('/')
  );

  if (semanticClass) {
    return `${tag}.${semanticClass}`;
  }

  if (classes.length > 0) {
    const firstClean = classes.find((c) => !c.includes(':') && !c.includes('[') && !c.includes('/'));
    if (firstClean) return `${tag}.${firstClean}`;
  }

  return tag;
}

/**
 * Walks up from the clicked element to the nearest identifiable ancestor / module root,
 * building an unambiguous nesting chain like:
 * `JournalPage > EntryCard > .card-header > button.icon-btn`
 */
export function getAncestorPath(el: HTMLElement | Element, maxDepth = 6): string {
  if (!el) return '';
  const segments: string[] = [];
  let curr: HTMLElement | Element | null = el;
  let depth = 0;

  while (curr && curr !== document.body && curr !== document.documentElement && depth < maxDepth) {
    const isIgnored = curr.id?.includes('bug-report-inspector-ui') || curr.id?.includes('headlessui');
    if (!isIgnored) {
      const token = formatNodeToken(curr);
      segments.unshift(token);

      // Stop walking up if we hit a major named component or specific root ID
      if (curr.getAttribute('data-component') || (curr.id && !curr.id.startsWith(':'))) {
        break;
      }
    }

    curr = curr.parentElement;
    depth++;
  }

  // Deduplicate adjacent identical tokens if any
  const cleaned: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    if (i === 0 || segments[i] !== segments[i - 1]) {
      cleaned.push(segments[i]);
    }
  }

  return cleaned.join(' > ');
}

/**
 * Automatically detects the active page route and section/module name from the DOM & router state.
 */
export function detectSectionAndRoute(el?: HTMLElement | Element | null): {
  sectionName: string;
  pageRoute: string;
} {
  let sectionId = 'dashboard';
  let pageRoute = '/dashboard';

  try {
    // 1. Check if el or its ancestors specify data-component or data-section
    if (el) {
      const compEl = el.closest('[data-component]') as HTMLElement | null;
      if (compEl) {
        const compVal = compEl.getAttribute('data-component') || '';
        const foundKey = Object.keys(MODULE_SECTION_MAP).find((key) =>
          compVal.toLowerCase().includes(key)
        );
        if (foundKey) {
          sectionId = foundKey;
        } else if (compVal) {
          return { sectionName: compVal, pageRoute: `/${compVal.toLowerCase()}` };
        }
      }

      const secEl = el.closest('[data-section]') as HTMLElement | null;
      if (secEl) {
        const secVal = secEl.getAttribute('data-section') || '';
        if (secVal) {
          return { sectionName: secVal, pageRoute: `/${secVal.toLowerCase()}` };
        }
      }
    }

    // 2. Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test_layout')) {
      sectionId = 'test_layout';
      pageRoute = '/test_layout';
    } else if (urlParams.get('design_lab')) {
      sectionId = 'design_lab';
      pageRoute = '/design_lab';
    } else {
      // 3. Check activeModule in localStorage
      const storedModule = localStorage.getItem('activeModule');
      if (storedModule && MODULE_SECTION_MAP[storedModule]) {
        sectionId = storedModule;
        pageRoute = `/${storedModule}`;
      } else if (window.location.pathname && window.location.pathname !== '/') {
        pageRoute = window.location.pathname;
        const cleaned = window.location.pathname.replace(/^\//, '').toLowerCase();
        if (MODULE_SECTION_MAP[cleaned]) {
          sectionId = cleaned;
        }
      }
    }
  } catch {
    // Fallback gracefully
  }

  const sectionName = MODULE_SECTION_MAP[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  return { sectionName, pageRoute };
}

/**
 * Builds a complete element fingerprint object for a clicked element.
 */
export function getElementFingerprint(targetEl: HTMLElement): BugReportElementInfo {
  const rect = targetEl.getBoundingClientRect();
  const classes = getElementClasses(targetEl);
  const dataAttributes = getDataAttributes(targetEl);
  const ancestorPath = getAncestorPath(targetEl);
  const { sectionName, pageRoute } = detectSectionAndRoute(targetEl);

  return {
    tag: targetEl.tagName.toLowerCase(),
    id: targetEl.id || undefined,
    classes,
    ancestorPath,
    dataAttributes,
    sectionName,
    pageRoute,
    selector: ancestorPath || targetEl.tagName.toLowerCase(),
    boundingRect: {
      x: Math.round(rect.left + window.scrollX),
      y: Math.round(rect.top + window.scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: Math.round(window.scrollX),
      scrollY: Math.round(window.scrollY),
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    },
    innerTextSnippet: (targetEl.innerText || '').trim().slice(0, 120),
    isGroup: false,
  };
}
