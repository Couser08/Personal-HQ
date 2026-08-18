import React from 'react';
import { 
  IconSearch, IconRefresh, IconDownload, IconClipboardCopy,
  IconLayoutGrid, IconLayoutList, IconLayoutKanban, IconFolders,
  IconX, IconFilter, IconArrowsSort, IconChecks
} from '@tabler/icons-react';

export type AdminViewMode = 'grid' | 'list' | 'kanban' | 'modules';

interface BugReportToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  routeFilter: string;
  onRouteChange: (val: string) => void;
  hasScreenshotFilter: string;
  onHasScreenshotChange: (val: string) => void;
  sortBy: 'newest' | 'oldest' | 'severity' | 'status';
  onSortChange: (val: 'newest' | 'oldest' | 'severity' | 'status') => void;
  viewMode: AdminViewMode;
  onViewModeChange: (val: AdminViewMode) => void;
  availableRoutes: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onDownloadMarkdown: () => void;
  onCopyMarkdown: () => void;
  filteredCount: number;
  totalCount: number;
  onBatchResolveFiltered?: () => void;
}

export const BugReportToolbar: React.FC<BugReportToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  severityFilter,
  onSeverityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  routeFilter,
  onRouteChange,
  hasScreenshotFilter,
  onHasScreenshotChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  availableRoutes,
  isRefreshing,
  onRefresh,
  onDownloadMarkdown,
  onCopyMarkdown,
  filteredCount,
  totalCount,
  onBatchResolveFiltered,
}) => {
  const hasActiveFilters = 
    statusFilter !== 'All' || 
    severityFilter !== 'All' || 
    categoryFilter !== 'All' || 
    routeFilter !== 'All' || 
    hasScreenshotFilter !== 'All' || 
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusFilterChange('All');
    onSeverityFilterChange('All');
    onCategoryFilterChange('All');
    onRouteChange('All');
    onHasScreenshotChange('All');
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-3xl bg-surface/90 border border-border/70 shadow-xs backdrop-blur-md">
      
      {/* ── TOP ROW: SEARCH & ACTION BUTTONS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search bug title, description, selector, route, reporter..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-surface-alt/70 border border-border/70 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded cursor-pointer"
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* View Switcher & Core Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          
          {/* View Mode Toggle: Grid / List / Kanban / Modules */}
          <div className="flex items-center bg-surface-alt/70 p-1 rounded-2xl border border-border/70">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewMode === 'grid'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Visual Cards Grid View"
            >
              <IconLayoutGrid size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewMode === 'list'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Dense Audit List View"
            >
              <IconLayoutList size={15} />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={`p-1.5 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewMode === 'kanban'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Kanban Pipeline Triage"
            >
              <IconLayoutKanban size={15} />
              <span className="hidden sm:inline">Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('modules')}
              className={`p-1.5 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewMode === 'modules'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Organized by App Subsystem / Module"
            >
              <IconFolders size={15} />
              <span className="hidden sm:inline">Modules</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-2xl bg-surface hover:bg-surface-alt border border-border/70 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Refresh Bug Reports"
          >
            <IconRefresh size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Export to Markdown */}
          <button
            type="button"
            onClick={onDownloadMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary hover:opacity-90 text-text-on-accent text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            title="Download full bug ledger in Markdown format"
          >
            <IconDownload size={14} />
            <span className="hidden xl:inline">reports.md</span>
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={onCopyMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-surface hover:bg-surface-alt border border-border/70 text-text-primary text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Copy entire ledger to clipboard"
          >
            <IconClipboardCopy size={14} />
            <span className="hidden xl:inline">Copy MD</span>
          </button>
        </div>
      </div>

      {/* ── BOTTOM ROW: FACETED FILTER DROPDOWNS & SORT ── */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap pt-2 border-t border-border/40 text-xs">
        
        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-text-muted font-bold text-[11px] uppercase mr-1">
            <IconFilter size={13} />
            <span>Filters:</span>
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-surface-alt/70 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="open">🟡 Open</option>
            <option value="in_review">🔵 In Review</option>
            <option value="fixed_pending_verification">🟣 Fixed · Verify QA</option>
            <option value="verified_done">🟢 Verified & Done</option>
            <option value="reopened">🔴 Reopened</option>
          </select>

          {/* Severity Select */}
          <select
            value={severityFilter}
            onChange={(e) => onSeverityFilterChange(e.target.value)}
            className="bg-surface-alt/70 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="Critical">🔴 Critical</option>
            <option value="High">🟠 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>

          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="bg-surface-alt/70 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="UI Glitch">🎨 UI Glitch</option>
            <option value="Performance">⚡ Performance</option>
            <option value="Data Sync">🔄 Data Sync</option>
            <option value="Crash / Error">💥 Crash / Error</option>
            <option value="Other">📌 Other</option>
          </select>

          {/* Route / Module Select */}
          <select
            value={routeFilter}
            onChange={(e) => onRouteChange(e.target.value)}
            className="bg-surface-alt/70 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer max-w-[150px] truncate"
          >
            <option value="All">All Modules ({availableRoutes.length})</option>
            {availableRoutes.map((r) => (
              <option key={r} value={r}>
                /{r}
              </option>
            ))}
          </select>

          {/* Screenshot Filter */}
          <select
            value={hasScreenshotFilter}
            onChange={(e) => onHasScreenshotChange(e.target.value)}
            className="bg-surface-alt/70 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Captures</option>
            <option value="with_screenshot">📷 With Snapshot</option>
            <option value="no_screenshot">📄 Text / DOM Only</option>
          </select>

          {/* Clear Filters Pill */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
            >
              <IconX size={12} /> Clear Filters
            </button>
          )}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-text-muted">
            Showing <strong className="text-text-primary">{filteredCount}</strong> of {totalCount}
          </span>

          <div className="flex items-center gap-1 bg-surface-alt/70 border border-border/70 rounded-xl px-2 py-1 text-xs font-bold text-text-primary">
            <IconArrowsSort size={13} className="text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent border-none text-xs font-bold text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">Highest Severity</option>
              <option value="status">By Status</option>
            </select>
          </div>

          {/* Batch Resolve button */}
          {onBatchResolveFiltered && filteredCount > 0 && (
            <button
              type="button"
              onClick={onBatchResolveFiltered}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
              title="Mark all currently filtered reports as Verified & Done"
            >
              <IconChecks size={13} />
              <span>Verify Filtered</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
