import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { 
  IconUpload, IconPhoto, IconTrash, IconLock, 
  IconShieldCheck, IconDeviceGamepad2, IconMovie,
  IconBug
} from '@tabler/icons-react';
import { useToastStore } from '../../store/useToastStore';
import { useBugReportStore } from '../../store/useBugReportStore';
import { compressAndConvertToWebP } from '../../utils/imageOptimizer';
import { Card } from '../../components/ui/Card';
import { type BugReport, type BugReportSeverity } from '../../store/types';
import { useBugReportsQuery } from '../../hooks/queries/useAdminBugReportsQuery';
import { BugReportCard } from './components/BugReportCard';
import { BugReportListItem } from './components/BugReportListItem';
import { BugReportKanban } from './components/BugReportKanban';
import { BugReportModuleMap } from './components/BugReportModuleMap';
import { BugReportStats } from './components/BugReportStats';
import { BugReportToolbar, type AdminViewMode } from './components/BugReportToolbar';
import { BugReportDetailModal } from './components/BugReportDetailModal';
import { isBugResolved } from './utils/bugReportHelpers';

export default function AdminModule() {
  const { user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const { 
    reports, 
    updateReportStatus, 
    deleteReport, 
    downloadMarkdownFile, 
    copyMarkdownToClipboard,
    copyFixCommandToClipboard
  } = useBugReportStore();

  const [activeTab, setActiveTab] = useState<'assets' | 'bugs'>('bugs');
  const [dashPreview, setDashPreview] = useState<string>('');
  const [mascotPreview, setMascotPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [dashUploading, setDashUploading] = useState(false);
  const [mascotUploading, setMascotUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Bug reports filter & view state
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [routeFilter, setRouteFilter] = useState<string>('All');
  const [hasScreenshotFilter, setHasScreenshotFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity' | 'status'>('newest');
  const [viewMode, setViewMode] = useState<AdminViewMode>('grid');

  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdmin = user?.email === 'tungariyarahul08@gmail.com';

  const { data: queryReports, refetch: refetchReports } = useBugReportsQuery(isAdmin, user?.id);
  const activeReports = queryReports ?? reports;

  const loadAssets = (bustCache = false) => {
    const dashUrl = supabase.storage.from('avatars').getPublicUrl('global/dashboard_illustration.png').data.publicUrl;
    const mascotUrl = supabase.storage.from('avatars').getPublicUrl('global/media_chibi_mascot.png').data.publicUrl;
    const bannerUrl = supabase.storage.from('avatars').getPublicUrl('global/anime_review_banner.png').data.publicUrl;
    
    const query = bustCache ? `?t=${Date.now()}` : '';
    setDashPreview(`${dashUrl}${query}`);
    setMascotPreview(`${mascotUrl}${query}`);
    setBannerPreview(`${bannerUrl}${query}`);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAssets(false);
    }
  }, [isAdmin]);

  const handleRefreshReports = async () => {
    setIsRefreshing(true);
    await refetchReports();
    setIsRefreshing(false);
    addToast('Refreshed', 'Bug reports synced with database.', 'success');
  };

  // Available unique routes
  const availableRoutes = useMemo(() => {
    const set = new Set<string>();
    activeReports.forEach((r) => {
      if (r.route) set.add(r.route.replace(/^\//, '').toLowerCase());
    });
    return Array.from(set).sort();
  }, [activeReports]);

  // Filtered and sorted bug reports
  const filteredReports = useMemo(() => {
    const result = activeReports.filter(r => {
      if (statusFilter !== 'All') {
        const normStatus = String(r.status).toLowerCase();
        const normFilter = statusFilter.toLowerCase();
        if (normFilter === 'open' && normStatus !== 'open') return false;
        if (normFilter === 'in_review' && normStatus !== 'in_review' && (normStatus as string) !== 'in progress') return false;
        if (normFilter === 'fixed_pending_verification' && normStatus !== 'fixed_pending_verification' && (normStatus as string) !== 'pending_verification') return false;
        if (normFilter === 'verified_done' && !isBugResolved(r.status)) return false;
        if (normFilter === 'reopened' && normStatus !== 'reopened') return false;
      }

      if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;

      if (routeFilter !== 'All') {
        const cleanRoute = (r.route || '').replace(/^\//, '').toLowerCase();
        if (cleanRoute !== routeFilter.toLowerCase()) return false;
      }

      if (hasScreenshotFilter === 'with_screenshot' && !r.screenshotData) return false;
      if (hasScreenshotFilter === 'no_screenshot' && !!r.screenshotData) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchRoute = r.route.toLowerCase().includes(q);
        const matchSelector = r.elementInfo?.selector?.toLowerCase().includes(q);
        const matchEmail = (r.userEmail || r.reporter || '').toLowerCase().includes(q);
        const matchId = (r.id || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchRoute && !matchSelector && !matchEmail && !matchId) return false;
      }
      return true;
    });

    const severityOrder: Record<BugReportSeverity, number> = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

    const statusOrder: Record<string, number> = {
      open: 1,
      Open: 1,
      in_review: 2,
      'In Progress': 2,
      fixed_pending_verification: 3,
      verified_done: 4,
      Resolved: 4,
      Closed: 4,
      reopened: 0,
    };

    return result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'severity') {
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      }
      if (sortBy === 'status') {
        return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      }
      return 0;
    });
  }, [activeReports, statusFilter, severityFilter, categoryFilter, routeFilter, hasScreenshotFilter, searchQuery, sortBy]);

  // Bug KPI stats
  const stats = useMemo(() => {
    const total = activeReports.length;
    const open = activeReports.filter(r => r.status === 'open' || r.status === 'Open').length;
    const inReview = activeReports.filter(r => r.status === 'in_review' || r.status === 'In Progress').length;
    const pendingVerification = activeReports.filter(r => r.status === 'fixed_pending_verification').length;
    const verifiedDone = activeReports.filter(r => isBugResolved(r.status)).length;
    const reopened = activeReports.filter(r => r.status === 'reopened').length;
    return { total, open, inReview, pendingVerification, verifiedDone, reopened };
  }, [activeReports]);

  // Quick KPI card filter switch
  const handleKpiFilterChange = (filter: string) => {
    if (filter === 'All') {
      setStatusFilter('All');
      setSeverityFilter('All');
    } else {
      setStatusFilter(filter);
      setSeverityFilter('All');
    }
  };

  // Batch resolve all currently filtered open reports
  const handleBatchResolveFiltered = async () => {
    const openInFilter = filteredReports.filter(r => !isBugResolved(r.status));
    if (openInFilter.length === 0) {
      addToast('No Open Reports', 'All matching reports are already resolved.', 'info');
      return;
    }

    if (window.confirm(`Mark ${openInFilter.length} filtered bug reports as Verified & Done?`)) {
      for (const r of openInFilter) {
        await updateReportStatus(r.id, 'verified_done', {
          verificationNotes: 'Batch verified by administrator.',
          verifiedAt: new Date().toISOString()
        });
      }
      addToast('Batch Complete', `${openInFilter.length} reports marked as Verified & Done.`, 'success');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid File', 'Please select an image file.', 'warning');
      return;
    }

    const isDash = path === 'global/dashboard_illustration.png';
    const isMascot = path === 'global/media_chibi_mascot.png';
    const isBanner = path === 'global/anime_review_banner.png';

    if (isDash) setDashUploading(true);
    else if (isMascot) setMascotUploading(true);
    else if (isBanner) setBannerUploading(true);

    try {
      let optimizedFile: Blob | File = file;
      try {
        const maxWidth = isMascot ? 400 : 1000;
        optimizedFile = await compressAndConvertToWebP(file, maxWidth, 0.82);
      } catch (err) {
        console.warn('[AdminModule] Client-side image compression failed:', err);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, optimizedFile, {
          cacheControl: '0',
          upsert: true,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      let assetName = 'Asset';
      if (isDash) assetName = 'Dashboard illustration';
      else if (isMascot) assetName = 'Chibi mascot';
      else if (isBanner) assetName = 'Anime Review Banner';

      addToast('Upload Success', `${assetName} updated successfully.`, 'success');
      loadAssets(true);
      
      if (isDash) {
        window.dispatchEvent(new CustomEvent('dashboard-illustration-updated'));
      } else if (isMascot) {
        window.dispatchEvent(new CustomEvent('media-mascot-updated'));
      } else if (isBanner) {
        window.dispatchEvent(new CustomEvent('anime-banner-updated'));
      }
    } catch (err: any) {
      let msg = err.message || 'An error occurred during upload.';
      addToast('Upload Failed', msg, 'error');
    } finally {
      if (isDash) setDashUploading(false);
      else if (isMascot) setMascotUploading(false);
      else if (isBanner) setBannerUploading(false);
    }
  };

  const handleReset = async (path: string) => {
    const isDash = path === 'global/dashboard_illustration.png';
    const isMascot = path === 'global/media_chibi_mascot.png';
    const isBanner = path === 'global/anime_review_banner.png';
    
    try {
      const { error: deleteError } = await supabase.storage.from('avatars').remove([path]);
      if (deleteError) throw deleteError;

      let assetName = 'Asset';
      if (isDash) assetName = 'Dashboard illustration';
      else if (isMascot) assetName = 'Chibi mascot';
      else if (isBanner) assetName = 'Anime Review Banner';

      addToast('Reset Success', `${assetName} reset to default.`, 'success');
      loadAssets();
      
      if (isDash) {
        window.dispatchEvent(new CustomEvent('dashboard-illustration-updated'));
      } else if (isMascot) {
        window.dispatchEvent(new CustomEvent('media-mascot-updated'));
      } else if (isBanner) {
        window.dispatchEvent(new CustomEvent('anime-banner-updated'));
      }
    } catch (err: any) {
      addToast('Reset Failed', err.message || 'An error occurred during reset.', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <Card padding="lg" className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center max-w-lg mx-auto mt-16">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/10">
          <IconLock className="w-8 h-8" />
        </div>
        <h2 className="text-[20px] font-semibold text-text-primary">Access Denied</h2>
        <p className="text-[14px] text-text-secondary max-w-sm">This section is restricted to administrators. Only authorized personnel can access these controls.</p>
      </Card>
    );
  }

  return (
    <div data-component="AdminModule" className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-24 px-4 md:px-8 text-left antialiased font-sans">
      
      {/* ── COMMAND HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
            <IconShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight flex items-center gap-2">
              Admin Command Center
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              High-resolution visual telemetry, QA issue resolution ledger & branding hub
            </p>
          </div>
        </div>

        {/* Top-Level Navigation Tabs */}
        <div className="flex items-center bg-surface-alt/70 p-1.5 rounded-2xl border border-border/80 shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('bugs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bugs'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconBug size={16} className={stats.open > 0 ? 'text-amber-500' : ''} />
            QA & Bug Ledger
            {stats.open > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {stats.open}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconPhoto size={16} /> Assets & Branding
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: BUG REPORTS MANAGEMENT */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'bugs' && (
        <div className="space-y-6">
          
          {/* Interactive KPI Bar */}
          <BugReportStats
            stats={stats}
            activeFilter={severityFilter === 'Critical' ? 'Critical' : statusFilter}
            onFilterChange={handleKpiFilterChange}
          />

          {/* Faceted Filter & Action Toolbar */}
          <BugReportToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            severityFilter={severityFilter}
            onSeverityFilterChange={setSeverityFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            routeFilter={routeFilter}
            onRouteChange={setRouteFilter}
            hasScreenshotFilter={hasScreenshotFilter}
            onHasScreenshotChange={setHasScreenshotFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            availableRoutes={availableRoutes}
            isRefreshing={isRefreshing}
            onRefresh={handleRefreshReports}
            onDownloadMarkdown={() => downloadMarkdownFile(filteredReports.length > 0 ? filteredReports : activeReports)}
            onCopyMarkdown={() => copyMarkdownToClipboard(filteredReports.length > 0 ? filteredReports : activeReports)}
            onCopyFixCommand={() => copyFixCommandToClipboard(filteredReports.length > 0 ? filteredReports : activeReports)}
            filteredCount={filteredReports.length}
            totalCount={activeReports.length}
            onBatchResolveFiltered={handleBatchResolveFiltered}
          />

          {/* Bug Reports Views */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-20 bg-surface/60 border border-dashed border-border/80 rounded-4xl p-8 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-3xl bg-surface-alt/70 text-text-muted flex items-center justify-center mx-auto mb-3 border border-border/60">
                <IconBug size={28} className="opacity-60" />
              </div>
              <h3 className="text-base font-extrabold text-text-primary">No Bug Reports Found</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                No reports match your current filter parameters. Try clearing your search query or selecting a different status.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* 🎴 View 1: Visual Cards Matrix */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <BugReportCard
                  key={report.id}
                  report={report}
                  onSelect={setSelectedReport}
                  onZoomScreenshot={(r) => setSelectedReport(r)}
                  onUpdateStatus={updateReportStatus}
                  onDelete={deleteReport}
                />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            /* 📋 View 2: Compact Audit List */
            <div className="flex flex-col gap-2.5">
              {filteredReports.map((report) => (
                <BugReportListItem
                  key={report.id}
                  report={report}
                  onSelect={setSelectedReport}
                  onZoomScreenshot={(r) => setSelectedReport(r)}
                  onUpdateStatus={updateReportStatus}
                  onDelete={deleteReport}
                />
              ))}
            </div>
          ) : viewMode === 'kanban' ? (
            /* 📊 View 3: Kanban Pipeline Triage */
            <BugReportKanban
              reports={filteredReports}
              onSelect={setSelectedReport}
              onZoomScreenshot={(r) => setSelectedReport(r)}
              onUpdateStatus={updateReportStatus}
            />
          ) : (
            /* 🗺️ View 4: Organized by App Subsystem / Module */
            <BugReportModuleMap
              reports={filteredReports}
              onSelect={setSelectedReport}
              onZoomScreenshot={(r) => setSelectedReport(r)}
            />
          )}

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: ASSETS & BRANDING */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'assets' && (
        <div className="flex flex-col gap-8 w-full">
          {/* Section 1: Dashboard Illustration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full border-b border-border-hairline pb-8">
            <Card padding="lg" className="flex flex-col gap-5">
              <div>
                <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
                  <IconPhoto className="w-4 h-4 text-primary" /> Dashboard Illustration
                </h3>
                <p className="text-[13px] text-text-secondary mt-1">Upload an image file to replace the hero illustration on the dashboard.</p>
              </div>

              <label className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-surface-alt/20 hover:bg-surface-alt/40 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleUpload(e, 'global/dashboard_illustration.png')} 
                  className="hidden" 
                  disabled={dashUploading} 
                />
                {dashUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-xs font-bold text-text-secondary animate-pulse">Uploading asset...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <IconUpload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-text-primary block">Click to select image</span>
                      <span className="text-[10px] text-text-muted mt-1 block">Supports PNG, JPG, WebP, SVG</span>
                    </div>
                  </>
                )}
              </label>

              {dashPreview && (
                <button
                  onClick={() => handleReset('global/dashboard_illustration.png')}
                  className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 w-full mt-2"
                >
                  <IconTrash className="w-4 h-4" /> Reset to Default Illustration
                </button>
              )}
            </Card>

            <Card padding="lg" className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-text-primary">Current Illustration Preview</h3>
              <div className="flex-grow bg-surface-alt/30 border border-border-alt/40 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
                {dashPreview ? (
                  <img 
                    src={dashPreview} 
                    alt="Dashboard Preview" 
                    className="max-h-48 object-contain filter drop-shadow-lg"
                    onError={() => setDashPreview('')}
                  />
                ) : (
                  <div className="text-center text-text-muted">
                    <span className="text-xs font-medium italic">No custom illustration uploaded.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Section 2: Media Log Review Mascot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full border-b border-border-hairline pb-8">
            <Card padding="lg" className="flex flex-col gap-5">
              <div>
                <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
                  <IconDeviceGamepad2 className="w-4 h-4 text-primary" /> Media Review Mascot
                </h3>
                <p className="text-[13px] text-text-secondary mt-1">Upload a custom chibi mascot image for the Media Log.</p>
              </div>

              <label className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-surface-alt/20 hover:bg-surface-alt/40 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleUpload(e, 'global/media_chibi_mascot.png')} 
                  className="hidden" 
                  disabled={mascotUploading} 
                />
                {mascotUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-xs font-bold text-text-secondary animate-pulse">Uploading mascot...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <IconUpload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-text-primary block">Click to select image</span>
                      <span className="text-[10px] text-text-muted mt-1 block">Supports PNG, JPG, WebP, SVG</span>
                    </div>
                  </>
                )}
              </label>

              {mascotPreview && (
                <button
                  onClick={() => handleReset('global/media_chibi_mascot.png')}
                  className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 w-full mt-2"
                >
                  <IconTrash className="w-4 h-4" /> Reset to Default Mascot
                </button>
              )}
            </Card>

            <Card padding="lg" className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-text-primary">Current Mascot Preview</h3>
              <div className="flex-grow bg-surface-alt/30 border border-border-alt/40 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
                {mascotPreview ? (
                  <img 
                    src={mascotPreview} 
                    alt="Mascot Preview" 
                    className="max-h-48 object-contain filter drop-shadow-lg"
                    onError={() => setMascotPreview('')}
                  />
                ) : (
                  <div className="text-center text-text-muted">
                    <span className="text-xs font-medium italic">No custom mascot uploaded.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Section 3: Anime Review Center Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-8">
            <Card padding="lg" className="flex flex-col gap-5">
              <div>
                <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
                  <IconMovie className="w-4 h-4 text-primary" /> Anime Review Banner
                </h3>
                <p className="text-[13px] text-text-secondary mt-1">Upload a widescreen banner image for the Anime Review header.</p>
              </div>

              <label className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-surface-alt/20 hover:bg-surface-alt/40 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleUpload(e, 'global/anime_review_banner.png')} 
                  className="hidden" 
                  disabled={bannerUploading} 
                />
                {bannerUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-xs font-bold text-text-secondary animate-pulse">Uploading banner...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <IconUpload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-text-primary block">Click to select banner</span>
                      <span className="text-[10px] text-text-muted mt-1 block">Supports PNG, JPG, WebP, SVG</span>
                    </div>
                  </>
                )}
              </label>

              {bannerPreview && (
                <button
                  onClick={() => handleReset('global/anime_review_banner.png')}
                  className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 w-full mt-2"
                >
                  <IconTrash className="w-4 h-4" /> Reset to Default Banner
                </button>
              )}
            </Card>

            <Card padding="lg" className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-text-primary">Current Banner Preview</h3>
              <div className="flex-grow bg-surface-alt/30 border border-border-alt/40 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
                {bannerPreview ? (
                  <img 
                    src={bannerPreview} 
                    alt="Anime Review Banner Preview" 
                    className="max-w-full max-h-48 object-cover rounded-2xl border border-border/30 shadow-md"
                    onError={() => setBannerPreview('')}
                  />
                ) : (
                  <div className="text-center text-text-muted">
                    <span className="text-xs font-medium italic">No custom banner uploaded.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── BUG REPORT DETAIL INSPECTION MODAL ── */}
      <BugReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={updateReportStatus}
        onDelete={deleteReport}
      />
    </div>
  );
}
