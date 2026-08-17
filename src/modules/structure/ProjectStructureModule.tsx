import { useState, useMemo } from 'react';
import {
  IconFolder,
  IconPlus,
  IconCode,
  IconDownload,
  IconTrash,
  IconSparkles,
  IconHelp
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { type ProjectStructure } from '../../store/types';
import { ProjectTreeExplorer } from './components/ProjectTreeExplorer';
import { CommandTerminal } from './components/CommandTerminal';
import { FileInspector } from './components/FileInspector';
import { BatchScriptModal } from './components/BatchScriptModal';
import { ExportModal } from './components/ExportModal';
import { StructureDocsView } from './components/StructureDocsView';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ARCHITECTURE_PRESETS, type ArchitecturePreset } from './utils/presets';

export default function ProjectStructureModule() {
  const {
    projectStructures,
    activeProjectId,
    setActiveProjectId,
    addProjectStructure,
    updateProjectStructure,
    deleteProjectStructure,
    addNodeToProject,
    updateNodeInProject,
    deleteNodeFromProject,
    setProjectNodes,
    showConfirm,
  } = useAppStore(
    useShallow((state) => ({
      projectStructures: state.projectStructures,
      activeProjectId: state.activeProjectId,
      setActiveProjectId: state.setActiveProjectId,
      addProjectStructure: state.addProjectStructure,
      updateProjectStructure: state.updateProjectStructure,
      deleteProjectStructure: state.deleteProjectStructure,
      addNodeToProject: state.addNodeToProject,
      updateNodeInProject: state.updateNodeInProject,
      deleteNodeFromProject: state.deleteNodeFromProject,
      setProjectNodes: state.setProjectNodes,
      showConfirm: state.showConfirm,
    }))
  );

  const { addToast } = useToastStore();

  // Active project selection
  const activeProject = useMemo(() => {
    return (
      projectStructures.find((p) => p.id === activeProjectId) ||
      projectStructures[0] ||
      null
    );
  }, [projectStructures, activeProjectId]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  // New Project form states
  const [newProjName, setNewProjName] = useState('');
  const [newProjRoot, setNewProjRoot] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const selectedNode = useMemo(() => {
    if (!activeProject || !selectedNodeId) return null;
    return activeProject.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [activeProject, selectedNodeId]);

  const handleCreateNewProject = async () => {
    const name = newProjName.trim() || 'Untitled Project';
    const rootName = newProjRoot.trim() || name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const newProject: ProjectStructure = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      rootName,
      description: newProjDesc.trim(),
      nodes: [
        {
          id: `node-init-${Date.now()}`,
          name: 'src',
          type: 'folder',
          path: 'src',
          parentId: null,
          isExpanded: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: `node-readme-${Date.now()}`,
          name: 'README.md',
          type: 'file',
          path: 'README.md',
          extension: 'md',
          parentId: null,
          content: `# ${name}\n\nCreated with Personal HQ Project Structure Maintainer.`,
          createdAt: new Date().toISOString(),
        },
      ],
      tags: ['custom'],
      templateType: 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addProjectStructure(newProject);
    setIsNewProjectModalOpen(false);
    setNewProjName('');
    setNewProjRoot('');
    setNewProjDesc('');
    addToast('Project Created', `Created "${name}" workspace.`, 'success');
  };

  const handleApplyPreset = (preset: ArchitecturePreset) => {
    if (!activeProject) return;
    showConfirm(
      'Apply Architecture Blueprint?',
      `This will replace the current structure of "${activeProject.name}" with the "${preset.name}" blueprint.`,
      () => {
        setProjectNodes(activeProject.id, preset.nodes);
        updateProjectStructure(activeProject.id, {
          templateType: preset.key,
          rootName: preset.rootName,
        });
        setIsPresetsModalOpen(false);
        addToast('Preset Applied', `Loaded "${preset.name}" blueprint.`, 'success');
      }
    );
  };

  const handleDeleteActiveProject = () => {
    if (!activeProject) return;
    if (projectStructures.length <= 1) {
      addToast('Cannot Delete', 'You must maintain at least one project structure.', 'warning');
      return;
    }
    showConfirm(
      'Delete Project Structure?',
      `Are you sure you want to delete "${activeProject.name}"? This action cannot be undone.`,
      () => {
        deleteProjectStructure(activeProject.id);
        addToast('Project Deleted', `Deleted "${activeProject.name}".`, 'info');
      }
    );
  };

  if (showDocs) {
    return <StructureDocsView onBack={() => setShowDocs(false)} />;
  }

  if (!activeProject) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center text-zinc-400 gap-4">
        <IconFolder size={48} stroke={1.5} className="opacity-40" />
        <h2 className="text-lg font-bold text-zinc-200">No Projects Found</h2>
        <p className="text-xs text-zinc-500 max-w-sm">
          Initialize your first project architecture to start building with commands and tree visualizers.
        </p>
        <Button variant="primary" onClick={() => setIsNewProjectModalOpen(true)}>
          <IconPlus size={16} className="mr-1.5" />
          Create New Project
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 p-3 sm:p-5 text-zinc-100 animate-fadeIn">
      {/* Top Header & Project Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Dropdown Selector */}
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 p-1.5 rounded-xl shadow-xs">
            <IconFolder size={17} className="text-primary ml-1.5 flex-shrink-0" />
            <select
              value={activeProject.id}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-100 outline-hidden cursor-pointer pr-4"
            >
              {projectStructures.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">
                  {p.name} ({p.rootName})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Project Management Buttons */}
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
            title="Create New Project Structure"
          >
            <IconPlus size={14} className="text-primary" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
            title="Choose from Architecture Starter Blueprints"
          >
            <IconSparkles size={14} className="text-amber-400" />
            <span>Blueprints</span>
          </button>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <IconCode size={14} />
            <span>Batch Script</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <IconDownload size={14} />
            <span>Export & ZIP</span>
          </button>

          <button
            onClick={() => setShowDocs(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <IconHelp size={14} />
            <span>CLI Docs</span>
          </button>

          <button
            onClick={handleDeleteActiveProject}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 border border-zinc-800/80 transition-colors"
            title="Delete Active Project"
          >
            <IconTrash size={15} />
          </button>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: VS Code Style Tree Explorer (5 cols) */}
        <div className="lg:col-span-5 h-[620px]">
          <ProjectTreeExplorer
            project={activeProject}
            selectedNodeId={selectedNodeId}
            onSelectNode={(node) => setSelectedNodeId(node ? node.id : null)}
            onAddNode={(node) => addNodeToProject(activeProject.id, node)}
            onUpdateNode={(nodeId, updates) => updateNodeInProject(activeProject.id, nodeId, updates)}
            onDeleteNode={(nodeId) => deleteNodeFromProject(activeProject.id, nodeId)}
            onBatchUpdateNodes={(nodes) => setProjectNodes(activeProject.id, nodes)}
          />
        </div>

        {/* Right Column: Terminal + Inspector Split (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-[620px]">
          {/* Top Half: Command Terminal */}
          <div className="h-[320px]">
            <CommandTerminal
              project={activeProject}
              onUpdateNodes={(nodes) => setProjectNodes(activeProject.id, nodes)}
              onRenameProject={(name) => updateProjectStructure(activeProject.id, { name, rootName: name })}
              onOpenBatchScript={() => setIsBatchModalOpen(true)}
              onOpenDocs={() => setShowDocs(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          </div>

          {/* Bottom Half: File Inspector & Code Boilerplates */}
          <div className="flex-1 min-h-[280px]">
            <FileInspector
              node={selectedNode}
              allNodes={activeProject.nodes}
              onClose={() => setSelectedNodeId(null)}
              onUpdateContent={(nodeId, content) => updateNodeInProject(activeProject.id, nodeId, { content })}
              onAddChildNode={(parentId, type) => {
                const parent = activeProject.nodes.find((n) => n.id === parentId);
                const parentPath = parent ? parent.path : '';
                const defaultName = type === 'file' ? 'new-file.ts' : 'new-folder';
                addNodeToProject(activeProject.id, {
                  name: defaultName,
                  type,
                  path: `${parentPath}/${defaultName}`,
                  parentId,
                  content: '',
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* Batch Script & Tree DSL Modal */}
      {isBatchModalOpen && (
        <BatchScriptModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          currentNodes={activeProject.nodes}
          onApplyNodes={(nodes) => setProjectNodes(activeProject.id, nodes)}
        />
      )}

      {/* Export & ZIP Modal */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          project={activeProject}
        />
      )}

      {/* Architecture Blueprints / Presets Modal */}
      {isPresetsModalOpen && (
        <Modal
          isOpen={isPresetsModalOpen}
          onClose={() => setIsPresetsModalOpen(false)}
          title="Architecture Starter Blueprints"
          maxWidthClassName="max-w-2xl"
        >
          <div className="flex flex-col gap-3.5">
            <p className="text-xs text-zinc-400">
              Select a curated architectural blueprint to instantly populate your project tree with industry best practices:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto custom-scrollbar p-1">
              {ARCHITECTURE_PRESETS.map((preset) => (
                <div
                  key={preset.key}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-primary/60 hover:bg-zinc-800/60 cursor-pointer transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-100 group-hover:text-primary transition-colors">
                        {preset.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase font-mono">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
                    <span>{preset.nodes.length} nodes</span>
                    <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                      Apply →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <Modal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          title="Create New Project Structure"
          maxWidthClassName="max-w-md"
        >
          <div className="flex flex-col gap-3.5 text-zinc-200">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Project Name</label>
              <input
                type="text"
                placeholder="e.g. Next.js SaaS Platform"
                value={newProjName}
                onChange={(e) => {
                  setNewProjName(e.target.value);
                  if (!newProjRoot) {
                    setNewProjRoot(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'));
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Root Folder Name</label>
              <input
                type="text"
                placeholder="e.g. next-saas-platform"
                value={newProjRoot}
                onChange={(e) => setNewProjRoot(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Description (Optional)</label>
              <textarea
                placeholder="Short notes or architecture goals..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="ghost" onClick={() => setIsNewProjectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateNewProject} disabled={!newProjName.trim()}>
                Create Project
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
