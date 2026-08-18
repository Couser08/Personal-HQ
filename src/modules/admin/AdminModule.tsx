import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { 
  IconUpload, IconPhoto, IconTrash, IconLock, 
  IconShieldCheck, IconDeviceGamepad2, IconMovie,
  IconBug, IconDownload, IconClipboardCopy, IconRefresh,
  IconSearch, IconX, IconZoomIn, IconClock, IconCode
} from '@tabler/icons-react';
import { useToastStore } from '../../store/useToastStore';
import { useBugReportStore } from '../../store/useBugReportStore';
import { compressAndConvertToWebP } from '../../utils/imageOptimizer';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { type BugReport, type BugReportStatus } from '../../store/types';
import { useBugReportsQuery } from '../../hooks/queries/useAdminBugReportsQuery';

export default function AdminModule() {
  const { user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const { 
    reports, 
    updateReportStatus, 
    deleteReport, 
    downloadMarkdownFile, 
    copyMarkdownToClipboard 
  } = useBugReportStore();

  const [activeTab, setActiveTab] = useState<'assets' | 'bugs'>('bugs');
  const [dashPreview, setDashPreview] = useState<string>('');
  const [mascotPreview, setMascotPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [dashUploading, setDashUploading] = useState(false);
  const [mascotUploading, setMascotUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Bug reports filter state
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
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
    addToast('Refreshed', 'Bug reports updated.', 'success');
  };


  // Filtered bug reports
  const filteredReports = useMemo(() => {
    return activeReports.filter(r => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchRoute = r.route.toLowerCase().includes(q);
        const matchSelector = r.elementInfo?.selector?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchRoute && !matchSelector) return false;
      }
      return true;
    });
  }, [activeReports, statusFilter, severityFilter, searchQuery]);

  // Bug KPI stats
  const stats = useMemo(() => {
    const total = activeReports.length;
    const open = activeReports.filter(r => r.status === 'Open').length;
    const inProgress = activeReports.filter(r => r.status === 'In Progress').length;
    const resolved = activeReports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
    const critical = activeReports.filter(r => r.severity === 'Critical' && r.status === 'Open').length;
    return { total, open, inProgress, resolved, critical };
  }, [activeReports]);

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
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-24 px-4 md:px-8 text-left antialiased font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15">
            <IconShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">Admin Control Center</h1>
            <p className="text-xs text-text-secondary">Bug reporting management, visual inspection logs & global assets</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-surface-alt/60 p-1 rounded-2xl border border-border shrink-0">
          <button
            onClick={() => setActiveTab('bugs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bugs'
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconBug size={16} className={stats.open > 0 ? 'text-rose-500' : ''} />
            Bug Reports
            {stats.open > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {stats.open}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-surface text-text-primary shadow-sm'
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
          
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Reports</span>
              <p className="text-2xl font-black text-text-primary mt-1">{stats.total}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Open / Active</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{stats.open}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">In Progress</span>
              <p className="text-2xl font-black text-blue-500 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Resolved</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">{stats.resolved}</p>
            </div>
          </div>

          {/* Filter & Toolbar */}
          <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Search by title, description, selector, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="All">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <button
                onClick={handleRefreshReports}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-surface hover:bg-surface-alt border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Refresh Reports"
              >
                <IconRefresh size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={downloadMarkdownFile}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary hover:opacity-90 text-text-on-accent text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <IconDownload size={14} /> reports.md
              </button>

              <button
                onClick={copyMarkdownToClipboard}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface hover:bg-surface-alt border border-border text-text-primary text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <IconClipboardCopy size={14} /> Copy MD
              </button>
            </div>
          </Card>

          {/* Reports Table / List */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-16 bg-surface/50 border border-dashed border-border rounded-3xl p-8">
              <IconBug size={40} className="mx-auto text-text-muted mb-2 opacity-50" />
              <h3 className="text-base font-bold text-text-primary">No Bug Reports Found</h3>
              <p className="text-xs text-text-secondary mt-1">No reports match the current filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-surface hover:bg-surface-alt/60 border border-border rounded-2xl p-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 overflow-hidden">
                    {/* Thumbnail */}
                    {report.screenshotData ? (
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-background border border-border shrink-0 flex items-center justify-center">
                        <img src={report.screenshotData} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-12 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-text-muted shrink-0">
                        <IconCode size={18} />
                      </div>
                    )}

                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          report.severity === 'Critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                          report.severity === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          report.severity === 'Medium' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {report.severity}
                        </span>

                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface-alt text-text-secondary border border-border">
                          {report.category}
                        </span>

                        <span className="text-[11px] font-mono text-text-muted">
                          in <code className="text-text-primary font-bold">/{report.route}</code>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                        {report.title}
                      </h4>

                      {report.elementInfo?.selector && (
                        <p className="text-[11px] font-mono text-text-muted truncate">
                          Target: {report.elementInfo.selector}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trailing Info & Status */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <IconClock size={12} />
                      {new Date(report.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      report.status === 'Resolved' || report.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-500' :
                      report.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* BUG REPORT DETAIL INSPECTION MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {selectedReport && (
        <Modal 
          isOpen={!!selectedReport} 
          onClose={() => setSelectedReport(null)} 
          title="Bug Report Diagnostics"
          maxWidthClassName="max-w-3xl"
        >
          <div className="space-y-6 pt-2 font-sans">
            
            {/* Header & Status Controller */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-alt/40 p-4 rounded-2xl border border-border">
              <div>
                <span className="text-[11px] font-mono text-text-muted">
                  Report ID: <span className="text-text-secondary">{selectedReport.id}</span>
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-0.5">{selectedReport.title}</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Reported by {selectedReport.userEmail || 'Anonymous'} on {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-text-secondary">Status:</span>
                <select
                  value={selectedReport.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as BugReportStatus;
                    updateReportStatus(selectedReport.id, nextStatus);
                    setSelectedReport(prev => prev ? { ...prev, status: nextStatus } : null);
                  }}
                  className="bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Visual Screenshot (if available) */}
            {selectedReport.screenshotData && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">High-Res Visual Snapshot</h4>
                  <button 
                    onClick={() => setIsZoomModalOpen(true)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <IconZoomIn size={14} /> Enlarge View
                  </button>
                </div>
                <div 
                  onClick={() => setIsZoomModalOpen(true)}
                  className="bg-surface rounded-2xl border border-border p-2 max-h-72 overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-inner"
                >
                  <img 
                    src={selectedReport.screenshotData} 
                    alt="Captured Element" 
                    className="max-h-64 object-contain rounded-xl group-hover:scale-102 transition-transform" 
                  />
                </div>
              </div>
            )}

            {/* Target Element Diagnostics */}
            {selectedReport.elementInfo && (
              <div className="bg-surface p-4 rounded-2xl border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">DOM Target & Geometry</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-surface-alt/60 p-2.5 rounded-xl border border-border/60">
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Element Tag & ID</span>
                    <span className="text-text-primary font-bold">
                      &lt;{selectedReport.elementInfo.tag}&gt; {selectedReport.elementInfo.id ? `#${selectedReport.elementInfo.id}` : ''}
                    </span>
                  </div>

                  <div className="bg-surface-alt/60 p-2.5 rounded-xl border border-border/60">
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Dimensions & Position</span>
                    <span className="text-text-primary">
                      {selectedReport.elementInfo.boundingRect.width}×{selectedReport.elementInfo.boundingRect.height}px (x: {selectedReport.elementInfo.boundingRect.x}, y: {selectedReport.elementInfo.boundingRect.y})
                    </span>
                  </div>
                </div>

                <div className="bg-surface-alt/60 p-2.5 rounded-xl border border-border/60 text-xs font-mono">
                  <span className="text-text-muted block text-[10px] uppercase font-bold mb-1">CSS Selector Path</span>
                  <span className="text-text-primary break-all">{selectedReport.elementInfo.selector}</span>
                </div>

                {selectedReport.elementInfo.classes && selectedReport.elementInfo.classes.length > 0 && (
                  <div className="bg-surface-alt/60 p-2.5 rounded-xl border border-border/60 text-xs font-mono">
                    <span className="text-text-muted block text-[10px] uppercase font-bold mb-1">Classes</span>
                    <span className="text-text-secondary break-all">{selectedReport.elementInfo.classes.join(' ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-surface p-4 rounded-2xl border border-border space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Explanation</h4>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                {selectedReport.description || 'No description provided.'}
              </p>
            </div>

            {/* Environment & Metadata */}
            <div className="bg-surface p-4 rounded-2xl border border-border text-xs text-text-secondary space-y-1">
              <p><strong className="text-text-primary">Active Route:</strong> /{selectedReport.route}</p>
              {selectedReport.userAgent && (
                <p className="truncate"><strong className="text-text-primary">User Agent:</strong> {selectedReport.userAgent}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => {
                  deleteReport(selectedReport.id);
                  setSelectedReport(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <IconTrash size={16} /> Delete Report
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    const text = selectedReport.markdownContent || `# Bug Report: ${selectedReport.title}\n\n${selectedReport.description}`;
                    await navigator.clipboard.writeText(text);
                    addToast('Copied', 'Report markdown copied.', 'success');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-text-primary bg-surface hover:bg-surface-alt border border-border px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <IconClipboardCopy size={16} /> Copy Report Markdown
                </button>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="bg-primary hover:opacity-90 text-text-on-accent text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* Enlarge Image Modal */}
      {isZoomModalOpen && selectedReport?.screenshotData && (
        <div 
          onClick={() => setIsZoomModalOpen(false)}
          className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-surface rounded-2xl overflow-hidden border border-border p-2 shadow-2xl">
            <img 
              src={selectedReport.screenshotData} 
              alt="Zoomed" 
              className="max-h-[80vh] w-auto object-contain rounded-xl" 
            />
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
