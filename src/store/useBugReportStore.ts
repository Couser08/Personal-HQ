import { create } from 'zustand';
import { type BugReport, type BugReportElementInfo, type BugReportCategory, type BugReportSeverity, type BugReportStatus } from './types';
import { bugReportService } from '../lib/db';
import { useAuthStore } from './useAuthStore';
import { useToastStore } from './useToastStore';
import { safeSetItem, setIDBItem } from '../utils/storage';
import { queryClient } from '../lib/queryClient';
import { detectSectionAndRoute } from '../components/bug-report/utils/elementFingerprint';

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
  md += `- **Section / Module**: \`${report.sectionName || el?.sectionName || 'General'}\`\n`;
  md += `- **Page Route**: \`${report.pageRoute || report.route}\`\n`;
  md += `- **Reported By**: ${report.reporter || report.userEmail || 'User'} (${dateStr})\n`;
  md += `- **User Agent**: \`${report.userAgent || 'Unknown'}\`\n\n`;

  md += `#### Description\n${report.description}\n\n`;

  if (el) {
    if (el.isGroup && el.groupElements && el.groupElements.length > 0) {
      md += `#### Target Group Details (${el.groupCount || el.groupElements.length} Elements Selected)\n`;
      md += `- **Common Container / Parent**: \`${el.selector}\`\n`;
      if (el.ancestorPath) md += `- **Ancestor Path**: \`${el.ancestorPath}\`\n`;
      md += `- **Bounding Box**: \`x: ${Math.round(el.boundingRect.x)}, y: ${Math.round(el.boundingRect.y)}, w: ${Math.round(el.boundingRect.width)}px, h: ${Math.round(el.boundingRect.height)}px\`\n`;
      md += `- **Viewport**: \`${el.viewport.width}x${el.viewport.height}\` (Scroll: \`${el.viewport.scrollX}, ${el.viewport.scrollY}\`)\n\n`;
      md += `| # | Page / Module | Tag | Selector | Text Snippet |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      el.groupElements.forEach((item, i) => {
        const page = item.pageTitle || item.pageModule || report.route;
        const txt = (item.innerTextSnippet || '—').replace(/\|/g, '-').slice(0, 40);
        md += `| ${i + 1} | \`${page}\` | \`<${item.tag}>\` | \`${item.ancestorPath || item.selector}\` | ${txt} |\n`;
      });
      md += `\n`;
    } else {
      md += `#### Target Element Fingerprint\n`;
      if (el.ancestorPath) md += `- **Ancestor Path**: \`${el.ancestorPath}\`\n`;
      md += `- **CSS Selector**: \`${el.selector}\`\n`;
      md += `- **Tag**: \`<${el.tag}>\`\n`;
      if (el.classes && el.classes.length > 0) md += `- **Classes**: \`${el.classes.join(', ')}\`\n`;
      if (el.dataAttributes && Object.keys(el.dataAttributes).length > 0) {
        md += `- **Data Attributes**: \`${JSON.stringify(el.dataAttributes)}\`\n`;
      }
      md += `- **Bounding Box**: \`x: ${Math.round(el.boundingRect.x)}, y: ${Math.round(el.boundingRect.y)}, w: ${Math.round(el.boundingRect.width)}px, h: ${Math.round(el.boundingRect.height)}px\`\n`;
      md += `- **Viewport**: \`${el.viewport.width}x${el.viewport.height}\` (Scroll: \`${el.viewport.scrollX}, ${el.viewport.scrollY}\`)\n\n`;
    }
  }

  if (report.screenshotData) {
    md += `#### Visual Snapshot\n`;
    md += `![Screenshot](${report.screenshotData})\n\n`;
  }

  if (report.fixedInFiles || report.fixNotes) {
    md += `#### 🛠️ Fix Verification Data\n`;
    if (report.fixedInFiles) md += `- **Files Changed**: \`${Array.isArray(report.fixedInFiles) ? report.fixedInFiles.join(', ') : report.fixedInFiles}\`\n`;
    if (report.fixNotes) md += `- **Fix Notes**: ${report.fixNotes}\n`;
    if (report.fixedAt) md += `- **Fixed At**: ${new Date(report.fixedAt).toLocaleString()}\n`;
    if (report.verificationNotes) md += `- **Verification Notes**: ${report.verificationNotes}\n`;
    if (report.verifiedAt) md += `- **Verified At**: ${new Date(report.verifiedAt).toLocaleString()}\n`;
    md += `\n`;
  }

  md += `---\n\n`;
  return md;
}

export function generateFixCommandText(reports: BugReport[]): string {
  const unresolved = reports.filter((r) => r.status !== 'verified_done');
  const now = new Date().toISOString();
  
  let cmd = `### Antigravity Task Block: Fix Pending Bugs\n`;
  cmd += `**Generated At**: ${now}\n`;
  cmd += `**Pending Issues Count**: ${unresolved.length} / ${reports.length} total\n\n`;
  
  if (unresolved.length === 0) {
    cmd += `> No pending bug reports found! All reported bugs are verified and completed.\n`;
    return cmd;
  }
  
  cmd += `#### Pending Items to Fix:\n`;
  unresolved.forEach((bug, idx) => {
    cmd += `\n--- Issue #${idx + 1}: ${bug.title} ---\n`;
    cmd += `- **ID**: \`${bug.id}\`\n`;
    cmd += `- **Severity**: \`${bug.severity}\` | **Status**: \`${bug.status}\`\n`;
    cmd += `- **Route**: \`${bug.pageRoute || bug.route || '/dashboard'}\`\n`;
    cmd += `- **Section**: \`${bug.sectionName || 'General'}\`\n`;
    if (bug.elementInfo?.selector) {
      cmd += `- **Element Selector**: \`${bug.elementInfo.selector}\`\n`;
    }
    cmd += `- **Description**: ${bug.description || 'No description provided'}\n`;
    if (bug.fixedInFiles) {
      cmd += `- **Target Files / Previous Attempts**: \`${Array.isArray(bug.fixedInFiles) ? bug.fixedInFiles.join(', ') : bug.fixedInFiles}\`\n`;
    }
  });
  
  cmd += `\n\n#### Instructions for Antigravity:\n`;
  cmd += `1. Fix the above bugs in their respective components/modules.\n`;
  cmd += `2. Mark each resolved bug as \`verified_done\` in state/Supabase (do not hard-delete).\n`;
  cmd += `3. Preserve minimal network egress and 7-minute query caching.\n`;
  
  return cmd;
}

export function generateAllReportsMarkdown(reports: BugReport[]): string {
  let md = `# 🛡️ Personal HQ — Application Bug Reports Ledger\n\n`;
  md += `> Automatically synced and maintained by the Visual Bug Reporting System.\n`;
  md += `> Last Updated: ${new Date().toLocaleString()}\n\n`;

  md += `## 📊 Reports Summary Table\n\n`;
  md += `| ID | Time | Severity | Status | Section / Module | Target Element | Title |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  reports.forEach((r, idx) => {
    const time = new Date(r.createdAt).toLocaleDateString('en-CA') + ' ' + new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetPath = r.elementInfo?.ancestorPath || r.elementInfo?.selector || '—';
    const sel = `\`${targetPath.slice(0, 35)}${targetPath.length > 35 ? '...' : ''}\``;
    const sec = r.sectionName || r.elementInfo?.sectionName || r.route;
    md += `| #${idx + 1} | ${time} | **${r.severity}** | \`${r.status}\` | \`${sec}\` | ${sel} | ${r.title.replace(/\|/g, '-')} |\n`;
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
  
  updateReportStatus: (id: string, status: BugReportStatus, extra?: Partial<BugReport>) => Promise<void>;
  handOffForVerification: (id: string, fixedInFiles: string[] | string, fixNotes: string) => Promise<void>;
  verifyReport: (id: string, verified: boolean, notes?: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  loadAllReports: () => Promise<void>;
  downloadMarkdownFile: () => void;
  copyMarkdownToClipboard: () => Promise<boolean>;
  copyFixCommandToClipboard: () => Promise<boolean>;
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

    // Auto-detect section and route
    const { sectionName, pageRoute } = detectSectionAndRoute(null);
    const resolvedSection = capturedElement?.sectionName || sectionName;
    const resolvedRoute = capturedElement?.pageRoute || pageRoute;

    const newReport: BugReport = {
      id: crypto.randomUUID(),
      userId: user?.id,
      userEmail: user?.email || undefined,
      reporter: user?.email || (user?.id ? 'user' : 'self'),
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      status: 'open',
      elementInfo: capturedElement || undefined,
      route: resolvedRoute,
      pageRoute: resolvedRoute,
      sectionName: resolvedSection,
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugReports'] });
      useToastStore.getState().addToast('Bug Reported', 'Report saved with full element fingerprint.', 'success');
    } catch (err: any) {
      console.error('Failed to sync bug report to Supabase:', err);
      useToastStore.getState().addToast('Saved Locally', 'Bug report saved locally in reports.md.', 'info');
    }

    return newReport;
  },

  updateReportStatus: async (id, status, extra) => {
    const prev = get().reports;
    const next = prev.map((r) =>
      r.id === id ? { ...r, ...extra, status, updatedAt: new Date().toISOString() } : r
    );
    set({ reports: next });
    persistBugReports(next);

    try {
      await bugReportService.updateStatus(id, status, extra);
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugReports'] });
      useToastStore.getState().addToast('Updated', `Bug status set to ${status}.`, 'success');
    } catch (err: any) {
      console.error('Failed to update bug status in db:', err);
    }
  },

  handOffForVerification: async (id, fixedInFiles, fixNotes) => {
    const prev = get().reports;
    const next = prev.map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'fixed_pending_verification' as BugReportStatus,
            fixedInFiles,
            fixNotes,
            fixedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : r
    );
    set({ reports: next });
    persistBugReports(next);

    try {
      await bugReportService.handOffForVerification(id, fixedInFiles, fixNotes);
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugReports'] });
      useToastStore.getState().addToast('Handed Off', 'Bug marked as fixed pending verification.', 'success');
    } catch (err: any) {
      console.error('Failed to hand off bug for verification:', err);
    }
  },

  verifyReport: async (id, verified, notes) => {
    const newStatus: BugReportStatus = verified ? 'verified_done' : 'reopened';
    const prev = get().reports;
    const next = prev.map((r) =>
      r.id === id
        ? {
            ...r,
            status: newStatus,
            verificationNotes: notes || (verified ? 'Verified as fixed' : 'Reopened during review'),
            verifiedAt: verified ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        : r
    );
    set({ reports: next });
    persistBugReports(next);

    try {
      await bugReportService.verifyBug(id, verified, notes);
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugReports'] });
      if (verified) {
        useToastStore.getState().addToast('Verified Done', 'Bug verified and archived for release!', 'success');
      } else {
        useToastStore.getState().addToast('Bug Reopened', 'Bug returned to open queue with verification note.', 'warning');
      }
    } catch (err: any) {
      console.error('Failed to verify bug in db:', err);
    }
  },

  deleteReport: async (id) => {
    const prev = get().reports;
    const next = prev.filter((r) => r.id !== id);
    set({ reports: next });
    persistBugReports(next);

    try {
      await bugReportService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugReports'] });
      useToastStore.getState().addToast('Deleted', 'Bug report removed.', 'success');
    } catch (err: any) {
      console.error('Failed to delete bug report from db:', err);
    }
  },

  loadAllReports: async () => {
    const user = useAuthStore.getState().user;
    const isAdmin = user?.email === 'tungariyarahul08@gmail.com';
    try {
      const data = await bugReportService.fetchWithDeltaSync(user?.id, isAdmin);
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

  copyFixCommandToClipboard: async () => {
    const cmd = generateFixCommandText(get().reports);
    try {
      await navigator.clipboard.writeText(cmd);
      useToastStore.getState().addToast('Copied Fix Command', 'Antigravity bug fix command copied to clipboard!', 'success');
      return true;
    } catch (err) {
      console.error('Failed to copy fix command:', err);
      return false;
    }
  },
}));
