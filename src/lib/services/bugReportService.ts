import { supabase } from '../supabase';
import { getIDBItem, setIDBItem } from '../indexedDB';
import type { BugReport, BugReportStatus, BugReportElementInfo } from '../../store/types';

function normalizeBugStatus(status: any): BugReportStatus {
  if (!status) return 'open';
  const s = String(status).trim().toLowerCase();
  if (s === 'open' || s === 'unprocessed') return 'open';
  if (s === 'in progress' || s === 'in_progress' || s === 'in_review') return 'in_review';
  if (s === 'fixed_pending_verification' || s === 'pending_verification') return 'fixed_pending_verification';
  if (s === 'resolved' || s === 'closed' || s === 'verified_done' || s === 'done' || s === 'processed') return 'verified_done';
  if (s === 'reopened' || s === 'reopen') return 'reopened';
  return 'open';
}

function parseClasses(raw: any): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // split by whitespace
    }
    return raw.split(/\s+/).filter(Boolean);
  }
  return [];
}

function mapBugReportFromRow(r: any): BugReport {
  const classes = parseClasses(r.element_classes);
  const dataAttributes = r.element_data_attributes || {};
  const ancestorPath = r.element_ancestor_path || r.element_selector || undefined;
  const boundingRect = r.element_position || { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0 };
  const viewport = r.viewport_size || r.viewport || { width: 0, height: 0, scrollX: 0, scrollY: 0 };

  const elementInfo: BugReportElementInfo | undefined = (r.element_tag || r.element_position || r.element_selector || r.element_ancestor_path) ? {
    tag: r.element_tag || 'element',
    id: dataAttributes['id'] || undefined,
    classes,
    ancestorPath,
    dataAttributes,
    sectionName: r.section_name || undefined,
    pageRoute: r.page_route || r.route || undefined,
    selector: r.element_selector || ancestorPath || r.element_tag || 'element',
    boundingRect,
    viewport,
    innerTextSnippet: undefined,
  } : undefined;

  return {
    id: r.id,
    userId: r.user_id,
    userEmail: r.user_email,
    reporter: r.reporter || r.user_email || 'user',
    title: r.title,
    description: r.description || '',
    category: r.category || 'UI',
    severity: r.severity || 'Medium',
    status: normalizeBugStatus(r.status),
    elementInfo,
    route: r.page_route || r.route || '/dashboard',
    pageRoute: r.page_route || r.route || '/dashboard',
    sectionName: r.section_name || 'General',
    screenshotData: r.screenshot_data || undefined,
    markdownContent: r.markdown_content || undefined,
    userAgent: r.user_agent,
    fixedInFiles: r.fixed_in_files,
    fixNotes: r.fix_notes,
    verificationNotes: r.verification_notes,
    fixedAt: r.fixed_at,
    verifiedAt: r.verified_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

const BUG_SCAN_COLUMNS = 'id, user_id, user_email, reporter, title, description, category, severity, status, element_selector, element_tag, element_classes, element_ancestor_path, element_data_attributes, element_position, viewport, route, page_route, section_name, fixed_in_files, fix_notes, verification_notes, fixed_at, verified_at, created_at, updated_at';

export const bugReportService = {
  async fetchSignatures(userId?: string): Promise<{ id: string; updated_at: string }[]> {
    let query = supabase
      .from('bug_reports')
      .select('id, updated_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r: any) => ({ id: r.id, updated_at: r.updated_at || r.created_at }));
  },

  async fetchByIds(ids: string[]): Promise<BugReport[]> {
    if (!ids || ids.length === 0) return [];
    const { data, error } = await supabase
      .from('bug_reports')
      .select(BUG_SCAN_COLUMNS)
      .in('id', ids);
    if (error) throw error;
    return (data ?? []).map(mapBugReportFromRow);
  },

  async fetchWithDeltaSync(userId?: string, isAdmin?: boolean): Promise<BugReport[]> {
    try {
      // Step 1: Signature query (cheap, returns only id & updated_at)
      const signatures = await this.fetchSignatures(isAdmin ? undefined : userId);
      if (signatures.length === 0) {
        return [];
      }

      // Step 2: Compare against local IndexedDB cache
      const cached = (await getIDBItem<BugReport[]>('phq_bug_reports_full')) || [];
      const cacheMap = new Map<string, BugReport>();
      cached.forEach((item) => cacheMap.set(item.id, item));

      const changedIds: string[] = [];
      signatures.forEach((sig) => {
        const local = cacheMap.get(sig.id);
        if (!local || local.updatedAt !== sig.updated_at) {
          changedIds.push(sig.id);
        }
      });

      // If no signatures changed, return cached data immediately (0 egress!)
      if (changedIds.length === 0) {
        return cached.filter((c) => signatures.some((s) => s.id === c.id));
      }

      // Step 3: Fetch scan data only for new / modified records
      const freshReports = await this.fetchByIds(changedIds);
      freshReports.forEach((report) => {
        cacheMap.set(report.id, report);
      });

      // Keep only active reports matching signatures
      const activeReports = signatures
        .map((sig) => cacheMap.get(sig.id))
        .filter(Boolean) as BugReport[];

      await setIDBItem('phq_bug_reports_full', activeReports);
      return activeReports;
    } catch (e) {
      console.warn('Delta sync fallback to direct scan query:', e);
      return isAdmin ? this.fetchForAdmin() : this.fetchAll(userId);
    }
  },

  async fetchDetail(id: string): Promise<BugReport | null> {
    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapBugReportFromRow(data);
  },

  async fetchForAdmin(limit = 100): Promise<BugReport[]> {
    const { data, error } = await supabase
      .from('bug_reports')
      .select(BUG_SCAN_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapBugReportFromRow);
  },

  async fetchAll(userId?: string, limit = 100): Promise<BugReport[]> {
    let query = supabase
      .from('bug_reports')
      .select(BUG_SCAN_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapBugReportFromRow);
  },

  async create(report: BugReport): Promise<void> {
    const { error } = await supabase.from('bug_reports').insert({
      id: report.id,
      user_id: report.userId || null,
      user_email: report.userEmail || null,
      reporter: report.reporter || report.userEmail || 'user',
      title: report.title,
      description: report.description,
      category: report.category,
      severity: report.severity,
      status: normalizeBugStatus(report.status || 'open'),
      element_selector: report.elementInfo?.selector || report.elementInfo?.ancestorPath || null,
      element_tag: report.elementInfo?.tag || null,
      element_classes: report.elementInfo?.classes ? JSON.stringify(report.elementInfo.classes) : null,
      element_ancestor_path: report.elementInfo?.ancestorPath || null,
      element_data_attributes: report.elementInfo?.dataAttributes || {},
      element_position: report.elementInfo?.boundingRect || {},
      viewport: report.elementInfo?.viewport || {},
      viewport_size: report.elementInfo?.viewport || {},
      route: report.route || report.pageRoute || '/dashboard',
      page_route: report.pageRoute || report.route || '/dashboard',
      section_name: report.sectionName || report.elementInfo?.sectionName || 'General',
      screenshot_data: report.screenshotData || null,
      markdown_content: report.markdownContent || null,
      user_agent: report.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      fixed_in_files: Array.isArray(report.fixedInFiles) ? report.fixedInFiles.join(', ') : (report.fixedInFiles || null),
      fix_notes: report.fixNotes || null,
      verification_notes: report.verificationNotes || null,
      fixed_at: report.fixedAt || null,
      verified_at: report.verifiedAt || null,
      created_at: report.createdAt || new Date().toISOString(),
      updated_at: report.updatedAt || new Date().toISOString()
    });
    if (error) throw error;
  },

  async updateStatus(id: string, status: BugReportStatus, extra?: Partial<BugReport>): Promise<void> {
    const payload: Record<string, any> = {
      status: normalizeBugStatus(status),
      updated_at: new Date().toISOString()
    };
    if (extra?.fixedInFiles) {
      payload.fixed_in_files = Array.isArray(extra.fixedInFiles) ? extra.fixedInFiles.join(', ') : extra.fixedInFiles;
    }
    if (extra?.fixNotes !== undefined) payload.fix_notes = extra.fixNotes;
    if (extra?.verificationNotes !== undefined) payload.verification_notes = extra.verificationNotes;
    if (extra?.fixedAt !== undefined) payload.fixed_at = extra.fixedAt;
    if (extra?.verifiedAt !== undefined) payload.verified_at = extra.verifiedAt;

    const { error } = await supabase.from('bug_reports').update(payload).eq('id', id);
    if (error) throw error;
  },

  async handOffForVerification(id: string, fixedInFiles: string[] | string, fixNotes: string): Promise<void> {
    const { error } = await supabase.from('bug_reports').update({
      status: 'fixed_pending_verification',
      fixed_in_files: Array.isArray(fixedInFiles) ? fixedInFiles.join(', ') : fixedInFiles,
      fix_notes: fixNotes,
      fixed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },

  async verifyBug(id: string, verified: boolean, notes?: string): Promise<void> {
    const { error } = await supabase.from('bug_reports').update({
      status: verified ? 'verified_done' : 'reopened',
      verification_notes: notes || (verified ? 'Verified as fixed' : 'Reopened during verification'),
      verified_at: verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('bug_reports').delete().eq('id', id);
    if (error) throw error;
  }
};
