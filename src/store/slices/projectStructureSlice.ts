import { type StateCreator } from 'zustand';
import { type AppStore, type ProjectStructure, type ProjectNode } from '../types';
import { projectStructureService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { safeSetItem } from '../../utils/storage';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface ProjectStructureSlice {
  projectStructures: ProjectStructure[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  addProjectStructure: (project: ProjectStructure, userId?: string) => Promise<void>;
  updateProjectStructure: (id: string, data: Partial<ProjectStructure>) => Promise<void>;
  deleteProjectStructure: (id: string) => Promise<void>;
  addNodeToProject: (projectId: string, node: Partial<ProjectNode>) => void;
  updateNodeInProject: (projectId: string, nodeId: string, updates: Partial<ProjectNode>) => void;
  deleteNodeFromProject: (projectId: string, nodeId: string) => void;
  setProjectNodes: (projectId: string, nodes: ProjectNode[]) => void;
  applyTemplateToProject: (projectId: string, templateKey: string) => void;
}

const DEFAULT_SAMPLE_NODES: ProjectNode[] = [
  { id: 'node-1', name: 'src', type: 'folder', path: 'src', parentId: null, isExpanded: true, createdAt: new Date().toISOString() },
  { id: 'node-2', name: 'components', type: 'folder', path: 'src/components', parentId: 'node-1', isExpanded: true, createdAt: new Date().toISOString() },
  { id: 'node-3', name: 'ui', type: 'folder', path: 'src/components/ui', parentId: 'node-2', isExpanded: true, createdAt: new Date().toISOString() },
  { id: 'node-4', name: 'Button.tsx', type: 'file', path: 'src/components/ui/Button.tsx', extension: 'tsx', parentId: 'node-3', content: `import React from 'react';\n\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary' | 'ghost';\n}\n\nexport const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {\n  return (\n    <button className={\`btn btn-\${variant}\`} {...props}>\n      {children}\n    </button>\n  );\n};`, createdAt: new Date().toISOString() },
  { id: 'node-5', name: 'Card.tsx', type: 'file', path: 'src/components/ui/Card.tsx', extension: 'tsx', parentId: 'node-3', content: `import React from 'react';\n\nexport const Card: React.FC<React.PropsWithChildren> = ({ children }) => {\n  return <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900">{children}</div>;\n};`, createdAt: new Date().toISOString() },
  { id: 'node-6', name: 'hooks', type: 'folder', path: 'src/hooks', parentId: 'node-1', isExpanded: true, createdAt: new Date().toISOString() },
  { id: 'node-7', name: 'useDebounce.ts', type: 'file', path: 'src/hooks/useDebounce.ts', extension: 'ts', parentId: 'node-6', content: `import { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debounced;\n}`, createdAt: new Date().toISOString() },
  { id: 'node-8', name: 'App.tsx', type: 'file', path: 'src/App.tsx', extension: 'tsx', parentId: 'node-1', content: `export default function App() {\n  return (\n    <main className="min-h-screen bg-black text-white p-8">\n      <h1 className="text-3xl font-bold">Hello World</h1>\n    </main>\n  );\n}`, createdAt: new Date().toISOString() },
  { id: 'node-9', name: 'main.tsx', type: 'file', path: 'src/main.tsx', extension: 'tsx', parentId: 'node-1', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`, createdAt: new Date().toISOString() },
  { id: 'node-10', name: 'index.css', type: 'file', path: 'src/index.css', extension: 'css', parentId: 'node-1', content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;`, createdAt: new Date().toISOString() },
  { id: 'node-11', name: 'public', type: 'folder', path: 'public', parentId: null, isExpanded: false, createdAt: new Date().toISOString() },
  { id: 'node-12', name: 'favicon.svg', type: 'file', path: 'public/favicon.svg', extension: 'svg', parentId: 'node-11', content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#3b82f6"/></svg>`, createdAt: new Date().toISOString() },
  { id: 'node-13', name: 'package.json', type: 'file', path: 'package.json', extension: 'json', parentId: null, content: `{\n  "name": "vite-react-app",\n  "private": true,\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc -b && vite build"\n  }\n}`, createdAt: new Date().toISOString() },
  { id: 'node-14', name: 'tsconfig.json', type: 'file', path: 'tsconfig.json', extension: 'json', parentId: null, content: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "jsx": "react-jsx",\n    "strict": true\n  }\n}`, createdAt: new Date().toISOString() },
  { id: 'node-15', name: '.env.example', type: 'file', path: '.env.example', extension: 'env', parentId: null, content: `VITE_API_URL=http://localhost:3000\nVITE_APP_ENV=development`, createdAt: new Date().toISOString() },
  { id: 'node-16', name: 'README.md', type: 'file', path: 'README.md', extension: 'md', parentId: null, content: `# Vite React TypeScript Starter\n\nCreated and maintained with Personal HQ Project Structure Architect.`, createdAt: new Date().toISOString() },
];

const DEFAULT_INITIAL_PROJECT: ProjectStructure = {
  id: 'default-project-1',
  name: 'Vite React TypeScript',
  description: 'Production-ready modern React 19 + TypeScript + Tailwind architecture',
  rootName: 'vite-react-starter',
  nodes: DEFAULT_SAMPLE_NODES,
  tags: ['react', 'typescript', 'frontend'],
  templateType: 'react-vite',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const loadInitialProjects = (): ProjectStructure[] => {
  if (typeof window === 'undefined') return [DEFAULT_INITIAL_PROJECT];
  try {
    const raw = localStorage.getItem('phq_project_structures');
    if (!raw) return [DEFAULT_INITIAL_PROJECT];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_INITIAL_PROJECT];
  } catch {
    return [DEFAULT_INITIAL_PROJECT];
  }
};

export const createProjectStructureSlice: StateCreator<
  AppStore,
  [],
  [],
  ProjectStructureSlice
> = (set, get) => {
  const initialProjects = loadInitialProjects();

  return {
    projectStructures: initialProjects,
    activeProjectId: initialProjects[0]?.id ?? null,

    setActiveProjectId: (id) => {
      set({ activeProjectId: id });
    },

    addProjectStructure: async (project, userId) => {
      const current = get().projectStructures;
      const updated = [project, ...current];
      set({ projectStructures: updated, activeProjectId: project.id });
      safeSetItem('phq_project_structures', JSON.stringify(updated));

      const uid = userId || useAuthStore.getState().user?.id;
      if (uid) {
        try {
          await projectStructureService.create(uid, project);
          queryClient.invalidateQueries({ queryKey: queryKeys.projectStructure.all(uid) });
        } catch (e) {
          console.error('Failed to sync new project to Supabase:', e);
        }
      }
    },

    updateProjectStructure: async (id, data) => {
      const current = get().projectStructures;
      const updated = current.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      );
      set({ projectStructures: updated });
      safeSetItem('phq_project_structures', JSON.stringify(updated));

      const uid = useAuthStore.getState().user?.id;
      if (uid) {
        try {
          await projectStructureService.update(id, data);
          queryClient.invalidateQueries({ queryKey: queryKeys.projectStructure.all(uid) });
        } catch (e) {
          console.error('Failed to update project in Supabase:', e);
        }
      }
    },

    deleteProjectStructure: async (id) => {
      const current = get().projectStructures;
      const updated = current.filter((p) => p.id !== id);
      const nextActive = get().activeProjectId === id ? (updated[0]?.id ?? null) : get().activeProjectId;
      set({ projectStructures: updated, activeProjectId: nextActive });
      safeSetItem('phq_project_structures', JSON.stringify(updated));

      const uid = useAuthStore.getState().user?.id;
      if (uid) {
        try {
          await projectStructureService.delete(id);
          queryClient.invalidateQueries({ queryKey: queryKeys.projectStructure.all(uid) });
        } catch (e) {
          console.error('Failed to delete project in Supabase:', e);
        }
      }
    },


    addNodeToProject: (projectId, nodeData) => {
      const project = get().projectStructures.find((p) => p.id === projectId);
      if (!project) return;

      const rawPath = (nodeData.path || nodeData.name || '').replace(/^[\\/]+|[\\/]+$/g, '');
      const pathSegments = rawPath.split('/').filter(Boolean);
      const nodeName = nodeData.name || pathSegments[pathSegments.length - 1] || 'unnamed';
      const ext = nodeData.type === 'file' ? (nodeName.includes('.') ? nodeName.split('.').pop() : '') : undefined;

      const newNode: ProjectNode = {
        id: nodeData.id || `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: nodeName,
        type: nodeData.type || 'file',
        path: rawPath,
        parentId: nodeData.parentId ?? null,
        content: nodeData.content ?? '',
        extension: ext,
        isExpanded: nodeData.type === 'folder' ? true : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedNodes = [...project.nodes, newNode];
      get().updateProjectStructure(projectId, { nodes: updatedNodes });
    },

    updateNodeInProject: (projectId, nodeId, updates) => {
      const project = get().projectStructures.find((p) => p.id === projectId);
      if (!project) return;

      const updatedNodes = project.nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedName = updates.name !== undefined ? updates.name : node.name;
          const ext = node.type === 'file' ? (updatedName.includes('.') ? updatedName.split('.').pop() : '') : undefined;
          return {
            ...node,
            ...updates,
            name: updatedName,
            extension: ext,
            updatedAt: new Date().toISOString(),
          };
        }
        return node;
      });

      get().updateProjectStructure(projectId, { nodes: updatedNodes });
    },

    deleteNodeFromProject: (projectId, nodeId) => {
      const project = get().projectStructures.find((p) => p.id === projectId);
      if (!project) return;

      // Recursively gather all descendant IDs
      const targetNode = project.nodes.find((n) => n.id === nodeId);
      if (!targetNode) return;

      const idsToDelete = new Set<string>([nodeId]);
      let addedMore = true;
      while (addedMore) {
        addedMore = false;
        project.nodes.forEach((n) => {
          if (n.parentId && idsToDelete.has(n.parentId) && !idsToDelete.has(n.id)) {
            idsToDelete.add(n.id);
            addedMore = true;
          }
        });
      }

      const updatedNodes = project.nodes.filter((n) => !idsToDelete.has(n.id));
      get().updateProjectStructure(projectId, { nodes: updatedNodes });
    },

    setProjectNodes: (projectId, nodes) => {
      get().updateProjectStructure(projectId, { nodes });
    },

    applyTemplateToProject: (_projectId, _templateKey) => {
      // Handled via presets in component or utility
    },
  };
};
