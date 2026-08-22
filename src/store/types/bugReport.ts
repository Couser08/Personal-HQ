export type BugReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type BugReportStatus =
  | 'open'
  | 'in_review'
  | 'fixed_pending_verification'
  | 'verified_done'
  | 'reopened'
  // Backward compatibility legacy values
  | 'Open'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';
export type BugReportCategory = 'UI Glitch' | 'Performance' | 'Data Sync' | 'Crash / Error' | 'Other';

export interface BugReportElementItem {
  tag: string;
  id?: string;
  classes: string[];
  ancestorPath?: string;
  dataAttributes?: Record<string, string>;
  selector: string;
  innerTextSnippet?: string;
  pageModule?: string;
  pageTitle?: string;
  screenshotSnippet?: string;
  boundingRect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
  };
}

export interface BugReportElementInfo {
  tag: string;
  id?: string;
  classes: string[];
  ancestorPath?: string;
  dataAttributes?: Record<string, string>;
  sectionName?: string;
  pageRoute?: string;
  selector: string;
  xpath?: string;
  boundingRect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
  };
  viewport: {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
    devicePixelRatio?: number;
  };
  innerTextSnippet?: string;
  isGroup?: boolean;
  groupCount?: number;
  groupElements?: BugReportElementItem[];
}

export interface BugReport {
  id: string;
  userId?: string;
  userEmail?: string;
  reporter?: string;
  title: string;
  description: string;
  category: BugReportCategory;
  severity: BugReportSeverity;
  status: BugReportStatus;
  elementInfo?: BugReportElementInfo;
  route: string;
  pageRoute?: string;
  sectionName?: string;
  screenshotData?: string;
  markdownContent?: string;
  userAgent?: string;
  fixedInFiles?: string[] | string;
  fixNotes?: string;
  verificationNotes?: string;
  fixedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}
