import { useState, useRef, useEffect, useMemo } from 'react';
import { IconPlus, IconSitemap } from '@tabler/icons-react';
import { useAppStore, type Mindmap } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { MindmapSidebar } from './components/MindmapSidebar';
import { MindmapCanvas } from './components/MindmapCanvas';
import { MindmapHeader } from './components/MindmapHeader';
import { sanitizeMindmapNodes } from './utils/mindmapUtils';
import { createDefaultMindmapData } from './utils/mindmapDefaultTemplate';
import { parseMindmapJsonImport } from './utils/mindmapImporter';

export default function MindmapModule() {
  const { mindmaps, addMindmap, updateMindmap, deleteMindmap, showConfirm } = useAppStore(
    useShallow((state) => ({
      mindmaps: state.mindmaps,
      addMindmap: state.addMindmap,
      updateMindmap: state.updateMindmap,
      deleteMindmap: state.deleteMindmap,
      showConfirm: state.showConfirm,
    })),
  );

  const [activeMindmapId, setActiveMindmapId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  // Layout states
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const importedMaps = parseMindmapJsonImport(rawContent, file.name);

        if (importedMaps.length > 0) {
          let lastId = '';
          for (const map of importedMaps) {
            const newId = crypto.randomUUID();
            await addMindmap({
              ...map,
              id: newId,
              title: map.title || 'Imported Mindmap',
              nodes: map.nodes || [],
              links: map.links || [],
              createdAt: new Date().toISOString(),
            } as Mindmap);
            lastId = newId;
          }
          if (lastId) {
            setActiveMindmapId(lastId);
          }
        } else {
          alert('Could not parse JSON file. Please check the file format.');
        }
      } catch (err) {
        alert('Invalid JSON format. Please check the file and try again.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeMindmap = useMemo(() => {
    return mindmaps.find((m) => m.id === activeMindmapId) || null;
  }, [mindmaps, activeMindmapId]);

  useEffect(() => {
    const pending = localStorage.getItem('pendingMindmapId');
    if (pending && mindmaps.some((m) => m.id === pending)) {
      setActiveMindmapId(pending);
      localStorage.removeItem('pendingMindmapId');
    } else if (mindmaps.length > 0 && !activeMindmapId) {
      setActiveMindmapId(mindmaps[0].id);
    }
  }, [mindmaps, activeMindmapId]);

  const handleCreateMindmap = (customTitle?: string) => {
    const newId = crypto.randomUUID();
    const { nodes, links } = createDefaultMindmapData();

    const newMap: Mindmap = {
      id: newId,
      title: customTitle || (mindmaps.length === 0 ? 'Productivity Mind Map' : 'New Mindmap'),
      nodes,
      links,
      createdAt: new Date().toISOString(),
    };

    addMindmap(newMap);
    setActiveMindmapId(newId);
  };

  const handleResetToDefault = () => {
    if (!activeMindmap) return;
    showConfirm('Reset Mindmap', 'Reset all nodes & connections to default Outline?', () => {
      const { nodes, links } = createDefaultMindmapData();
      updateMindmap(activeMindmap.id, {
        nodes,
        links,
      });
    });
  };

  const handleOpenRename = () => {
    if (activeMindmap) {
      setTitleInput(activeMindmap.title);
      setIsRenameModalOpen(true);
    }
  };

  const filteredMindmaps = useMemo(() => {
    return mindmaps.filter((m) => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (selectedTagFilter) {
        const tagQuery = selectedTagFilter.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(tagQuery);
        const matchNodes = m.nodes.some((n) => n.text.toLowerCase().includes(tagQuery));
        return matchTitle || matchNodes;
      }
      return true;
    });
  }, [mindmaps, search, selectedTagFilter]);

  return (
    <div
      className={`flex gap-0 overflow-hidden bg-background text-text-primary transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-0 w-screen h-screen z-[150] rounded-none border-none'
          : 'h-[calc(100vh-130px)] md:h-[calc(100vh-130px)] rounded-[32px] border border-border/60'
      }`}
    >
      <MindmapSidebar
        filteredMindmaps={filteredMindmaps}
        search={search}
        setSearch={setSearch}
        selectedTagFilter={selectedTagFilter}
        setSelectedTagFilter={setSelectedTagFilter}
        activeMindmapId={activeMindmapId}
        setActiveMindmapId={setActiveMindmapId}
        handleCreateMindmap={handleCreateMindmap}
        handleOpenRename={handleOpenRename}
        deleteMindmap={deleteMindmap}
        showConfirm={showConfirm}
        isLeftSidebarOpen={isLeftSidebarOpen}
        setIsLeftSidebarOpen={setIsLeftSidebarOpen}
      />

      <div
        className={`flex-1 h-full relative bg-surface-alt/25 overflow-hidden flex flex-col ${
          activeMindmap ? 'flex w-full' : 'hidden md:flex'
        }`}
      >
        {activeMindmap ? (
          <>
            <MindmapHeader
              activeMindmap={activeMindmap}
              onBack={() => setActiveMindmapId(null)}
              onResetToDefault={handleResetToDefault}
              fileInputRef={fileInputRef}
              handleImportJson={handleImportJson}
            />

            <MindmapCanvas
              mindmap={activeMindmap}
              onUpdate={(updatedData) => {
                let finalNodes = updatedData.nodes || activeMindmap.nodes;
                const finalLinks = updatedData.links || activeMindmap.links;

                if (updatedData.nodes || updatedData.links) {
                  finalNodes = sanitizeMindmapNodes(finalNodes, finalLinks);
                }

                updateMindmap(activeMindmap.id, {
                  ...updatedData,
                  nodes: finalNodes,
                });
              }}
              isLeftSidebarOpen={isLeftSidebarOpen}
              setIsLeftSidebarOpen={setIsLeftSidebarOpen}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              isRenameModalOpen={isRenameModalOpen}
              setIsRenameModalOpen={setIsRenameModalOpen}
              titleInput={titleInput}
              setTitleInput={setTitleInput}
            />
          </>
        ) : (
          <EmptyState
            icon={<IconSitemap className="w-9 h-9 text-text-muted" />}
            title="Create a Mindmap"
            description="Replicate the mockup layouts by creating a default productivity mindmap."
            action={
              <Button onClick={() => handleCreateMindmap()} variant="primary" className="rounded-full px-5">
                <IconPlus className="w-4 h-4" /> Load Productivity Mindmap
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
