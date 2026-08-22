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

import { DEFAULT_SEEDED_BOARDS, loadInitialBoards } from './visionSeedData';
export { DEFAULT_SEEDED_BOARDS, loadInitialBoards };

export const createVisionSlice: StateCreator<AppStore, [], [], VisionSlice> = (set, get) => ({
  visionBoards: loadInitialBoards(),
  activeBoardId: (() => {
    try {
      const stored = localStorage.getItem('phq_active_vision_board');
      const boards = loadInitialBoards();
      if (stored && boards.some((b) => b.id === stored)) return stored;
      return boards[0]?.id || 'board-aesthetic-life';
    } catch {
      return 'board-aesthetic-life';
    }
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
    localStorage.setItem('phq_active_vision_board', id);

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
    localStorage.setItem('phq_active_vision_board', nextActiveId);

    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      visionBoardService.deleteBoard(id)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to delete vision board from db:', e));
    }
  },

  setActiveBoard: (id) => {
    try {
      localStorage.setItem('phq_active_vision_board', id);
    } catch {}
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
      activeId = boards[0]?.id || 'board-aesthetic-life';
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
      hasShadow: nodeData.hasShadow !== false,
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

    let boardFound = false;
    const nextBoards = boards.map((b) => {
      if (b.id === activeId) {
        boardFound = true;
        return {
          ...b,
          nodes: [...b.nodes, newNode],
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    if (!boardFound && nextBoards.length > 0) {
      nextBoards[0] = {
        ...nextBoards[0],
        nodes: [...nextBoards[0].nodes, newNode],
        updatedAt: new Date().toISOString(),
      };
      activeId = nextBoards[0].id;
    }

    set({
      visionBoards: nextBoards,
      activeBoardId: activeId,
      selectedNodeId: id,
    });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));
    localStorage.setItem('phq_active_vision_board', activeId);

    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      visionBoardService.upsertNode(uid, newNode)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(uid) }))
        .catch((e) => console.error('Failed to sync vision node:', e));
    }
    return id;
  },

  updateVisionNode: async (id, updates) => {
    let targetNode: VisionNode | null = null;
    const nextBoards = get().visionBoards.map((b) => {
      const hasNode = b.nodes.some((n) => n.id === id);
      if (hasNode) {
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
    const nextBoards = get().visionBoards.map((b) => {
      const hasNode = b.nodes.some((n) => n.id === id);
      if (hasNode) {
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
    let sourceNode: VisionNode | null = null;
    let targetBoardId: string | null = null;

    for (const b of get().visionBoards) {
      const found = b.nodes.find((n) => n.id === id);
      if (found) {
        sourceNode = found;
        targetBoardId = b.id;
        break;
      }
    }

    if (!sourceNode || !targetBoardId) return;

    const newId = crypto.randomUUID();
    const duplicated: VisionNode = {
      ...sourceNode,
      id: newId,
      boardId: targetBoardId,
      title: `${sourceNode.title} (Copy)`,
      position: {
        x: sourceNode.position.x + 30,
        y: sourceNode.position.y + 30,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextBoards = get().visionBoards.map((b) => {
      if (b.id === targetBoardId) {
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
    let targetNode: VisionNode | null = null;
    const nextBoards = get().visionBoards.map((b) => {
      const hasNode = b.nodes.some((n) => n.id === id);
      if (hasNode) {
        return {
          ...b,
          nodes: b.nodes.map((n) => {
            if (n.id === id) {
              targetNode = { ...n, position };
              return targetNode;
            }
            return n;
          }),
        };
      }
      return b;
    });
    set({ visionBoards: nextBoards });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid && targetNode) {
      visionBoardService.upsertNode(uid, targetNode).catch((e) =>
        console.error('Failed to sync node position:', e)
      );
    }
  },

  updateVisionNodeSize: (id, size) => {
    let targetNode: VisionNode | null = null;
    const nextBoards = get().visionBoards.map((b) => {
      const hasNode = b.nodes.some((n) => n.id === id);
      if (hasNode) {
        return {
          ...b,
          nodes: b.nodes.map((n) => {
            if (n.id === id) {
              targetNode = { ...n, size };
              return targetNode;
            }
            return n;
          }),
        };
      }
      return b;
    });
    set({ visionBoards: nextBoards });
    localStorage.setItem('phq_vision_boards', JSON.stringify(nextBoards));

    const uid = useAuthStore.getState().user?.id;
    if (uid && targetNode) {
      visionBoardService.upsertNode(uid, targetNode).catch((e) =>
        console.error('Failed to sync node size:', e)
      );
    }
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
