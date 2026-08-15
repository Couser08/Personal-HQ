import { create } from 'zustand';
import { type BugReport, type BugReportElementInfo, type BugReportCategory, type BugReportSeverity, type BugReportStatus } from './types';
import { bugReportService } from '../lib/db';
import { useAuthStore } from './useAuthStore';
import { useToastStore } from './useToastStore';
import { safeSetItem, setIDBItem } from '../utils/storage';

function persistBugReports(reportsList: BugReport[]) {
  void setIDBItem('phq_bug_reports_full', reportsList);
  const sanitized = reportsList.map((r) => ({
    ...r,
    screenshotData: r.screenshotData && r.screenshotData.length > 500 ? undefined : r.screenshotData,
  }));
  safeSetItem('phq_bug_reports', JSON.stringify(sanitized));
}

export function formatReportMarkdown(report: BugReport): string {
  const dateStr = new Date(report.createdAt).toLocaleString();
  const el = report.elementInfo;
  
  let md = `### 🐛 [${report.severity.toUpperCase()}] ${report.title}\n\n`;
  md += `- **Status**: \`${report.status}\`\n`;
  md += `- **Category**: \`${report.category}\`\n`;
  md += `- **Module / Route**: \`${report.route}\`\n`;
  md += `- **Reported By**: ${report.userEmail || 'Anonymous'} (${dateStr})\n`;
  md += `- **User Agent**: \`${report.userAgent || 'Unknown'}\`\n\n`;

  md += `#### Description\n${report.description}\n\n`;

  if (el) {
    md += `#### Target Element Details\n`;
    md += `- **Selector**: \`${el.selector}\`\n`;
    md += `- **Tag**: \`<${el.tag}>\`\n`;
    if (el.classes.length > 0) md += `- **Classes**: \`${el.classes.join(', ')}\`\n`;
    md += `- **Bounding Box**: \`x: ${Math.round(el.boundingRect.x)}, y: ${Math.round(el.boundingRect.y)}, w: ${Math.round(el.boundingRect.width)}px, h: ${Math.round(el.boundingRect.height)}px\`\n`;
    md += `- **Viewport**: \`${el.viewport.width}x${el.viewport.height}\` (Scroll: \`${el.viewport.scrollX}, ${el.viewport.scrollY}\`)\n\n`;
  }

  if (report.screenshotData) {
    md += `#### Visual Snapshot\n`;
    md += `![Screenshot](${report.screenshotData})\n\n`;
  }

  md += `---\n\n`;
  return md;
}

export function generateAllReportsMarkdown(reports: BugReport[]): string {
  let md = `# 🛡️ Personal HQ — Application Bug Reports Ledger\n\n`;
  md += `> Automatically synced and maintained by the Visual Bug Reporting System.\n`;
  md += `> Last Updated: ${new Date().toLocaleString()}\n\n`;

  md += `## 📊 Reports Summary Table\n\n`;
  md += `| ID | Time | Severity | Status | Category | Page / Module | Target Element | Title |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  reports.forEach((r, idx) => {
    const time = new Date(r.createdAt).toLocaleDateString('en-CA') + ' ' + new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sel = r.elementInfo?.selector ? `\`${r.elementInfo.selector.slice(0, 30)}${r.elementInfo.selector.length > 30 ? '...' : ''}\`` : '—';
    md += `| #${idx + 1} | ${time} | **${r.severity}** | \`${r.status}\` | ${r.category} | \`${r.route}\` | ${sel} | ${r.title.replace(/\|/g, '-')} |\n`;
  });

  md += `\n\n---\n\n## 📝 Detailed Reports Log\n\n`;

  reports.forEach((r) => {
    md += formatReportMarkdown(r);
  });

  return md;
}

interface BugReportStore {
  isInspecting: boolean;
  isModalOpen: boolean;
  capturedElement: BugReportElementInfo | null;
  capturedScreenshot: string | null;
  reports: BugReport[];
  
  startInspection: () => void;
  cancelInspection: () => void;
  captureAndOpenModal: (elementInfo: BugReportElementInfo, screenshotData: string | null) => void;
  closeModal: () => void;
  
  submitBugReport: (data: {
    title: string;
    description: string;
    category: BugReportCategory;
    severity: BugReportSeverity;
  }) => Promise<BugReport>;
  
  updateReportStatus: (id: string, status: BugReportStatus) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  loadAllReports: () => Promise<void>;
  downloadMarkdownFile: () => void;
  copyMarkdownToClipboard: () => Promise<boolean>;
}

export const useBugReportStore = create<BugReportStore>((set, get) => ({
  isInspecting: false,
  isModalOpen: false,
  capturedElement: null,
  capturedScreenshot: null,
  reports: (() => {
    try {
      const raw = localStorage.getItem('phq_bug_reports');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  startInspection: () => {
    set({ isInspecting: true, isModalOpen: false });
  },

  cancelInspection: () => {
    set({ isInspecting: false });
  },

  captureAndOpenModal: (elementInfo, screenshotData) => {
    set({
      isInspecting: false,
      isModalOpen: true,
      capturedElement: elementInfo,
      capturedScreenshot: screenshotData,
    });
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      capturedElement: null,
      capturedScreenshot: null,
    });
  },

  submitBugReport: async ({ title, description, category, severity }) => {
    const user = useAuthStore.getState().user;
    const { capturedElement, capturedScreenshot, reports } = get();

    // Determine current route or module
    let currentRoute = 'dashboard';
    try {
      const activeModule = localStorage.getItem('activeModule');
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('test_layout')) {
        currentRoute = 'test_layout';
      } else if (urlParams.get('design_lab')) {
        currentRoute = 'design_lab';
      } else if (activeModule) {
        currentRoute = activeModule;
      }
    } catch {
      // ignore
    }

    const newReport: BugReport = {
      id: crypto.randomUUID(),
      userId: user?.id,
      userEmail: user?.email || undefined,
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      status: 'Open',
      elementInfo: capturedElement || undefined,
      route: currentRoute,
      screenshotData: capturedScreenshot || undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newReport.markdownContent = formatReportMarkdown(newReport);

    const nextReports = [newReport, ...reports];
    set({ reports: nextReports, isModalOpen: false, capturedElement: null, capturedScreenshot: null });
    persistBugReports(nextReports);

    // Sync to Supabase
    try {
      await bugReportService.create(newReport);
      useToastStore.getState().addToast('Bug Reported', 'Report saved and synced to database.', 'success');
    } catch (err: any) {
      console.error('Failed to sync bug report to Supabase:', err);
      useToastStore.getState().addToast('Saved Locally', 'Bug report saved locally in reports.md.', 'info');
    }

    return newReport;
  },

  updateReportStatus: async (id, status) => {
    const prev = get().reports;
    const next = prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
    set({ reports: next });
    persistBugReports(next);

    try {
      await bugReportService.updateStatus(id, status);
      useToastStore.getState().addToast('Updated', `Bug status set to ${status}.`, 'success');
    } catch (err: any) {
      console.error('Failed to update bug status in db:', err);
    }
  },

  deleteReport: async (id) => {
    const prev = get().reports;
    const next = prev.filter((r) => r.id !== id);
    set({ reports: next });
    persistBugReports(next);

    try {
      await bugReportService.delete(id);
      useToastStore.getState().addToast('Deleted', 'Bug report removed.', 'success');
    } catch (err: any) {
      console.error('Failed to delete bug report from db:', err);
    }
  },

  loadAllReports: async () => {
    const user = useAuthStore.getState().user;
    const isAdmin = user?.email === 'tungariyarahul08@gmail.com';
    try {
      const data = isAdmin
        ? await bugReportService.fetchForAdmin()
        : await bugReportService.fetchAll(user?.id);
      if (data && data.length > 0) {
        set({ reports: data });
        persistBugReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch bug reports:', err);
    }
  },

  downloadMarkdownFile: () => {
    const md = generateAllReportsMarkdown(get().reports);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    useToastStore.getState().addToast('Downloaded', 'Downloaded reports.md successfully.', 'success');
  },

  copyMarkdownToClipboard: async () => {
    const md = generateAllReportsMarkdown(get().reports);
    try {
      await navigator.clipboard.writeText(md);
      useToastStore.getState().addToast('Copied', 'All reports copied to clipboard in Markdown.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to copy reports markdown:', err);
      return false;
    }
  },
}));
