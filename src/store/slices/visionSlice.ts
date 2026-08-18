import { type StateCreator } from 'zustand';
import type { AppStore } from '../useAppStore';
import type { Vision, VisionTask, VisionBoard, VisionNode } from '../types';
import { visionService, visionBoardService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface VisionSlice {
  // Boards & Nodes
  visionBoards: VisionBoard[];
  activeBoardId: string;
  selectedNodeId: string | null;
  focusMode: boolean;
  canvasTheme: 'dots' | 'grid' | 'blank';
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  activeTool: 'select' | 'pan' | 'create';

  // Board actions
  createBoard: (board: Partial<VisionBoard>) => Promise<string>;
  updateBoard: (id: string, updates: Partial<VisionBoard>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setActiveBoard: (id: string) => void;
  toggleFavoriteBoard: (id: string) => void;

  // Node actions
  addVisionNode: (node: Partial<VisionNode>) => Promise<string>;
  updateVisionNode: (id: string, updates: Partial<VisionNode>) => Promise<void>;
  deleteVisionNode: (id: string) => Promise<void>;
  duplicateVisionNode: (id: string) => Promise<void>;
  updateVisionNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateVisionNodeSize: (id: string, size: { width: number; height: number }) => void;
  setSelectedNodeId: (id: string | null) => void;

  // Canvas View Controls
  setFocusMode: (enabled: boolean) => void;
  setCanvasTheme: (theme: 'dots' | 'grid' | 'blank') => void;
  setCanvasZoom: (zoom: number | ((prev: number) => number)) => void;
  setCanvasPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setActiveTool: (tool: 'select' | 'pan' | 'create') => void;
  resetCanvasView: () => void;

  // Legacy compatibility
  visions: Vision[];
  addVision: (vision: Vision, userId?: string) => Promise<void>;
  updateVision: (id: string, updates: Partial<Vision>) => Promise<void>;
  deleteVision: (id: string) => Promise<void>;
  updateVisionPosition: (id: string, position: { x: number; y: number }, rotation?: number) => Promise<void>;
  assignTaskToVision: (visionId: string, taskId: string) => Promise<void>;
  unassignTaskFromVision: (visionId: string, taskId: string) => Promise<void>;
  addVisionTask: (visionId: string, taskTitle: string, dueDate?: string, priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent') => Promise<void>;
  toggleVisionTask: (visionId: string, taskId: string) => Promise<void>;
  deleteVisionTask: (visionId: string, taskId: string) => Promise<void>;
}

// Compact, balanced 2-row layout that fits within one screen viewport (height <= 560px)
export const DEFAULT_SEEDED_BOARDS: VisionBoard[] = [
  {
    id: 'board-aesthetic-life',
    title: 'AESTHETIC LIFE',
    subtitle: '2025 Vision',
    category: 'FAVORITES',
    icon: '✨',
    isFavorite: true,
    theme: 'dots',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'node-maldives',
        boardId: 'board-aesthetic-life',
        type: 'image',
        title: 'Maldives',
        subtitle: 'Maldives Trip',
        imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop',
        position: { x: 60, y: 40 },
        size: { width: 300, height: 220 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: false,
        tags: ['Maldives trip', 'Travel', 'Ocean'],
        accentColor: '#38bdf8',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'node-design-studio',
        boardId: 'board-aesthetic-life',
        type: 'text',
        title: 'DESIGN STUDIO',
        subtitle: 'Text Node',
        content: 'Curate elevated digital products and spatial environments.',
        position: { x: 380, y: 40 },
        size: { width: 280, height: 180 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: true,
        accentColor: '#111111',
        bgStyle: 'solid',
        textColor: '#FFFFFF',
        fontFamily: 'syne',
        fontSize: 22,
        fontWeight: 'black',
        isUppercase: true,
        letterSpacing: 'wide',
        textAlign: 'center',
        tags: ['Design', 'Studio', 'Aesthetics'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'node-affirmation-becoming',
        boardId: 'board-aesthetic-life',
        type: 'quote',
        title: 'Affirmation',
        content: 'I am becoming everything I choose to be.',
        quoteAuthor: 'Self',
        position: { x: 680, y: 40 },
        size: { width: 250, height: 180 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: false,
        accentColor: '#f472b6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'node-forest-lofi',
        boardId: 'board-aesthetic-life',
        type: 'audio',
        title: 'Forest Lo-Fi',
        subtitle: 'Ambient focus track',
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
        audioDuration: '02:45',
        position: { x: 950, y: 40 },
        size: { width: 200, height: 200 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: false,
        accentColor: '#10b981',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'node-travel-map',
        boardId: 'board-aesthetic-life',
        type: 'map',
        title: 'TRAVEL MAP',
        subtitle: 'Global Wanderlust',
        position: { x: 60, y: 280 },
        size: { width: 320, height: 240 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: false,
        accentColor: '#0ea5e9',
        tags: ['Travel', 'Expeditions'],
        mapPins: [
          { id: 'pin-1', title: 'New York', lat: 40.7128, lng: -74.006, note: 'The city of dreams and endless possibilities.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=400&auto=format&fit=crop' },
          { id: 'pin-2', title: 'Maldives', lat: 3.2028, lng: 73.2207, note: 'Overwater villa retreat.' },
          { id: 'pin-3', title: 'Tokyo', lat: 35.6762, lng: 139.6503, note: 'Design studios & neon.' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'node-books-goal',
        boardId: 'board-aesthetic-life',
        type: 'goal',
        title: 'READ 50 BOOKS',
        subtitle: 'Annual Reading Journey',
        goalTarget: 50,
        goalCurrent: 32,
        goalUnit: 'books',
        progress: 64,
        position: { x: 400, y: 240 },
        size: { width: 290, height: 150 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: false,
        tags: ['Discipline', 'Growth'],
        accentColor: '#3b82f6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'node-quote-discipline',
        boardId: 'board-aesthetic-life',
        type: 'quote',
        title: '“',
        content: 'Discipline today freedom tomorrow.',
        quoteAuthor: 'Unknown',
        position: { x: 710, y: 240 },
        size: { width: 210, height: 150 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: false,
        accentColor: '#fef08a',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'node-learn-flutter',
        boardId: 'board-aesthetic-life',
        type: 'skill',
        title: 'LEARN FLUTTER',
        subtitle: 'Spring animation',
        content: 'Master fluid physics-based gestures and cross-platform UI systems.',
        position: { x: 940, y: 260 },
        size: { width: 260, height: 200 },
        cornerRadius: 20,
        hasShadow: true,
        hasBorder: false,
        tags: ['Flutter', 'Animation'],
        accentColor: '#60a5fa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'board-dream-career',
    title: 'Dream Career',
    subtitle: 'Creative Leadership & Architecture',
    category: 'FAVORITES',
    icon: '🎯',
    isFavorite: true,
    theme: 'dots',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
  },
  {
    id: 'board-health-wellness',
    title: 'Health & Wellness',
    subtitle: 'Daily Vitality & Mindful Living',
    category: 'PERSONAL',
    icon: '🌿',
    isFavorite: false,
    theme: 'dots',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
  },
];

// Helper to load initial boards with safe schema recovery
function loadInitialBoards(): VisionBoard[] {
  try {
    const raw = localStorage.getItem('phq_vision_boards');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.nodes) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not parse phq_vision_boards:', e);
  }
  return DEFAULT_SEEDED_BOARDS;
}

export const createVisionSlice: StateCreator<AppStore, [], [], VisionSlice> = (set, get) => ({
  visionBoards: loadInitialBoards(),
  activeBoardId: (() => {
    const boards = loadInitialBoards();
    return boards[0]?.id || 'board-aesthetic-life';
  })(),
  selectedNodeId: null,
  focusMode: false,
  canvasTheme: 'dots',
  canvasZoom: 1.0,
  canvasPan: { x: 60, y: 30 },
  activeTool: 'select',

  // Board CRUD
  createBoard: async (boardData) => {
    const id = crypto.randomUUID();
    const newBoard: VisionBoard = {
      id,
      title: boardData.title || 'Untitled Vision',
      subtitle: boardData.subtitle || 'New Board',
      category: boardData.category || 'PERSONAL',
      icon: boardData.icon || '✨',
      isFavorite: !!boardData.isFavorite,
      theme: boardData.theme || 'dots',
      nodes: boardData.nodes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextBoards = [newBoard, ...get().visionBoards];
    set({ visionBoards: nextBoards, activeBoardId: id, selectedNodeId: null });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      visionBoardService.upsertBoard(uid, newBoard)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to sync vision board to Supabase:', e));
    }
    return id;
  },

  updateBoard: async (id, updates) => {
    const nextBoards = get().visionBoards.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    set({ visionBoards: nextBoards });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    const updatedBoard = nextBoards.find((b) => b.id === id);
    if (uid && updatedBoard) {
      visionBoardService.upsertBoard(uid, updatedBoard)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to sync vision board update:', e));
    }
  },

  deleteBoard: async (id) => {
    const remaining = get().visionBoards.filter((b) => b.id !== id);
    const nextBoards = remaining.length > 0 ? remaining : DEFAULT_SEEDED_BOARDS;
    const nextActiveId =
      get().activeBoardId === id ? nextBoards[0].id : get().activeBoardId;

    set({
      visionBoards: nextBoards,
      activeBoardId: nextActiveId,
      selectedNodeId: null,
    });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      visionBoardService.deleteBoard(id)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to delete vision board from db:', e));
    }
  },

  setActiveBoard: (id) => {
    set({ activeBoardId: id, selectedNodeId: null });
  },

  toggleFavoriteBoard: (id) => {
    const nextBoards = get().visionBoards.map((b) =>
      b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
    );
    set({ visionBoards: nextBoards });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    const updatedBoard = nextBoards.find((b) => b.id === id);
    if (uid && updatedBoard) {
      visionBoardService.upsertBoard(uid, updatedBoard)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to toggle board favorite in db:', e));
    }
  },

  // Node CRUD
  addVisionNode: async (nodeData) => {
    let boards = get().visionBoards;
    if (!boards || boards.length === 0) {
      boards = DEFAULT_SEEDED_BOARDS;
    }

    let activeId = get().activeBoardId;
    if (!boards.some((b) => b.id === activeId)) {
      activeId = boards[0].id;
    }

    const id = crypto.randomUUID();
    const newNode: VisionNode = {
      id,
      boardId: activeId,
      type: nodeData.type || 'text',
      title: nodeData.title || 'New Node',
      subtitle: nodeData.subtitle || '',
      content: nodeData.content || '',
      imageUrl: nodeData.imageUrl || '',
      accentColor: nodeData.accentColor || 'var(--accent-primary, #111111)',
      tags: nodeData.tags || [],
      position: nodeData.position || { x: 200, y: 150 },
      size: nodeData.size || { width: 300, height: 200 },
      cornerRadius: nodeData.cornerRadius !== undefined ? nodeData.cornerRadius : 20,
      hasShadow: nodeData.hasShadow !== undefined ? nodeData.hasShadow : true,
      hasBorder: !!nodeData.hasBorder,
      linkUrl: nodeData.linkUrl || '',
      progress: nodeData.progress || 0,
      goalTarget: nodeData.goalTarget,
      goalCurrent: nodeData.goalCurrent,
      goalUnit: nodeData.goalUnit || '',
      mapPins: nodeData.mapPins,
      audioUrl: nodeData.audioUrl,
      audioDuration: nodeData.audioDuration,
      quoteAuthor: nodeData.quoteAuthor,
      fontFamily: nodeData.fontFamily || 'sans',
      fontSize: nodeData.fontSize || 20,
      fontWeight: nodeData.fontWeight || 'bold',
      fontStyle: nodeData.fontStyle || 'normal',
      isUppercase: nodeData.isUppercase !== false,
      letterSpacing: nodeData.letterSpacing || 'tight',
      textAlign: nodeData.textAlign || 'left',
      bgStyle: nodeData.bgStyle || 'solid',
      textColor: nodeData.textColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextBoards = boards.map((b) => {
      if (b.id === activeId) {
        return {
          ...b,
          nodes: [...b.nodes, newNode],
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    set({
      visionBoards: nextBoards,
      activeBoardId: activeId,
      selectedNodeId: id,
    });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      visionBoardService.upsertNode(uid, newNode)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to sync vision node:', e));
    }
    return id;
  },

  updateVisionNode: async (id, updates) => {
    const activeId = get().activeBoardId;
    let targetNode: VisionNode | null = null;
    const nextBoards = get().visionBoards.map((b) => {
      if (b.id === activeId) {
        return {
          ...b,
          nodes: b.nodes.map((n) => {
            if (n.id === id) {
              targetNode = { ...n, ...updates, updatedAt: new Date().toISOString() };
              return targetNode;
            }
            return n;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    set({ visionBoards: nextBoards });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid && targetNode) {
      visionBoardService.upsertNode(uid, targetNode)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to sync vision node update:', e));
    }
  },

  deleteVisionNode: async (id) => {
    const activeId = get().activeBoardId;
    const nextBoards = get().visionBoards.map((b) => {
      if (b.id === activeId) {
        return {
          ...b,
          nodes: b.nodes.filter((n) => n.id !== id),
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    set({
      visionBoards: nextBoards,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      visionBoardService.deleteNode(id)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to delete vision node in db:', e));
    }
  },

  duplicateVisionNode: async (id) => {
    const activeBoard = get().visionBoards.find((b) => b.id === get().activeBoardId);
    if (!activeBoard) return;
    const targetNode = activeBoard.nodes.find((n) => n.id === id);
    if (!targetNode) return;

    const newId = crypto.randomUUID();
    const duplicated: VisionNode = {
      ...targetNode,
      id: newId,
      title: `${targetNode.title} (Copy)`,
      position: {
        x: targetNode.position.x + 30,
        y: targetNode.position.y + 30,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextBoards = get().visionBoards.map((b) => {
      if (b.id === activeBoard.id) {
        return {
          ...b,
          nodes: [...b.nodes, duplicated],
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    set({ visionBoards: nextBoards, selectedNodeId: newId });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      visionBoardService.upsertNode(uid, duplicated)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to sync duplicated vision node:', e));
    }
  },


  updateVisionNodePosition: (id, position) => {
    const activeId = get().activeBoardId;
    const nextBoards = get().visionBoards.map((b) => {
      if (b.id === activeId) {
        return {
          ...b,
          nodes: b.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
        };
      }
      return b;
    });
    set({ visionBoards: nextBoards });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));
  },

  updateVisionNodeSize: (id, size) => {
    const activeId = get().activeBoardId;
    const nextBoards = get().visionBoards.map((b) => {
      if (b.id === activeId) {
        return {
          ...b,
          nodes: b.nodes.map((n) => (n.id === id ? { ...n, size } : n)),
        };
      }
      return b;
    });
    set({ visionBoards: nextBoards });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  // View state actions
  setFocusMode: (enabled) => set({ focusMode: enabled }),
  setCanvasTheme: (theme) => set({ canvasTheme: theme }),
  setCanvasZoom: (zoom) => {
    if (typeof zoom === 'function') {
      set((state) => ({ canvasZoom: Math.min(Math.max(zoom(state.canvasZoom), 0.25), 2.5) }));
    } else {
      set({ canvasZoom: Math.min(Math.max(zoom, 0.25), 2.5) });
    }
  },
  setCanvasPan: (pan) => {
    if (typeof pan === 'function') {
      set((state) => ({ canvasPan: pan(state.canvasPan) }));
    } else {
      set({ canvasPan: pan });
    }
  },
  setActiveTool: (tool) => set({ activeTool: tool }),
  resetCanvasView: () => set({ canvasZoom: 1.0, canvasPan: { x: 60, y: 30 } }),

  // Legacy compatibility implementations
  visions: (() => {
    try {
      const raw = localStorage.getItem('phq_visions');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addVision: async (vision, userId) => {
    const activeUserId = userId || useAuthStore.getState().user?.id;
    const next = [vision, ...get().visions];
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));

    await get().addVisionNode({
      type: vision.imageUrl ? 'image' : 'goal',
      title: vision.title,
      subtitle: vision.category,
      imageUrl: vision.imageUrl,
      progress: vision.progress,
      content: vision.whyText,
      tags: [vision.category],
    });

    if (activeUserId) {
      await visionService.create(activeUserId, vision).catch((err) => {
        console.error('Failed to create vision in db', err);
      });
    }
  },

  updateVision: async (id, updates) => {
    const prev = get().visions;
    const next = prev.map((v) => (v.id === id ? { ...v, ...updates } : v));
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));
    const user = useAuthStore.getState().user;
    if (user) {
      await visionService.update(id, updates).catch((err) => {
        console.error('Failed to update vision in db', err);
      });
    }
  },

  deleteVision: async (id) => {
    const prev = get().visions;
    const next = prev.filter((v) => v.id !== id);
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));
    const user = useAuthStore.getState().user;
    if (user) {
      await visionService.delete(id).catch((err) => {
        console.error('Failed to delete vision in db', err);
      });
    }
  },

  updateVisionPosition: async (id, position, rotation) => {
    const prev = get().visions;
    const next = prev.map((v) =>
      v.id === id ? { ...v, position, ...(rotation !== undefined ? { rotation } : {}) } : v
    );
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));
  },

  assignTaskToVision: async (visionId, taskId) => {
    const vision = get().visions.find((v) => v.id === visionId);
    if (!vision) return;
    const currentLinked = vision.linkedTaskIds || [];
    if (currentLinked.includes(taskId)) return;
    await get().updateVision(visionId, { linkedTaskIds: [...currentLinked, taskId] });
  },

  unassignTaskFromVision: async (visionId, taskId) => {
    const vision = get().visions.find((v) => v.id === visionId);
    if (!vision) return;
    const currentLinked = vision.linkedTaskIds || [];
    await get().updateVision(visionId, { linkedTaskIds: currentLinked.filter((id) => id !== taskId) });
  },

  addVisionTask: async (visionId, taskTitle, dueDate, priority = 'medium') => {
    const vision = get().visions.find((v) => v.id === visionId);
    if (!vision) return;
    const newTask: VisionTask = {
      id: crypto.randomUUID(),
      title: taskTitle.trim(),
      completed: false,
      dueDate: dueDate || null,
      priority,
    };
    const currentTasks = vision.tasks || [];
    const updatedTasks = [...currentTasks, newTask];
    const total = updatedTasks.length;
    const completed = updatedTasks.filter((t) => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : vision.progress;

    await get().updateVision(visionId, {
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'Achieved' : progress > 0 ? 'In Progress' : vision.status,
    });
  },

  toggleVisionTask: async (visionId, taskId) => {
    const vision = get().visions.find((v) => v.id === visionId);
    if (!vision) return;
    const currentTasks = vision.tasks || [];
    const updatedTasks = currentTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const total = updatedTasks.length;
    const completed = updatedTasks.filter((t) => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : vision.progress;

    await get().updateVision(visionId, {
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'Achieved' : progress > 0 ? 'In Progress' : vision.status,
    });
  },

  deleteVisionTask: async (visionId, taskId) => {
    const vision = get().visions.find((v) => v.id === visionId);
    if (!vision) return;
    const currentTasks = vision.tasks || [];
    const updatedTasks = currentTasks.filter((t) => t.id !== taskId);
    const total = updatedTasks.length;
    const completed = updatedTasks.filter((t) => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    await get().updateVision(visionId, {
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'Achieved' : progress > 0 ? 'In Progress' : 'Not Started',
    });
  },
});
