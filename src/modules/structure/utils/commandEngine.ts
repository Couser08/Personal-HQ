import { type ProjectNode } from '../../../store/types';

export interface CommandResult {
  success: boolean;
  message: string;
  output?: string;
  asciiTree?: string;
  nodes?: ProjectNode[];
  newProjectName?: string;
}

export interface CommandHelpItem {
  command: string;
  syntax: string;
  description: string;
  example: string;
  category: 'Structure' | 'Project' | 'Inspection' | 'Utility';
}

export const COMMAND_DOCS: CommandHelpItem[] = [
  {
    command: 'mkdir',
    syntax: 'mkdir <path> or folder <path>',
    description: 'Creates a new folder or nested directory path automatically.',
    example: 'mkdir src/components/ui/modals',
    category: 'Structure'
  },
  {
    command: 'touch',
    syntax: 'touch <path> [content] or file <path> [content]',
    description: 'Creates a new file with optional starter code/content and creates missing parent folders.',
    example: 'touch src/components/Button.tsx "export const Button = () => <button>Click</button>;"',
    category: 'Structure'
  },
  {
    command: 'rm',
    syntax: 'rm <path> or delete <path>',
    description: 'Removes a file or directory along with all nested children.',
    example: 'rm src/legacy-utils',
    category: 'Structure'
  },
  {
    command: 'mv',
    syntax: 'mv <source_path> <target_path> or move <source> <target>',
    description: 'Moves a file or folder to a new path in the project tree.',
    example: 'mv src/Button.tsx src/components/ui/Button.tsx',
    category: 'Structure'
  },
  {
    command: 'rename',
    syntax: 'rename <path> <new_name>',
    description: 'Renames a specific file or folder.',
    example: 'rename src/OldApp.tsx App.tsx',
    category: 'Structure'
  },
  {
    command: 'content',
    syntax: 'content <path> "<code or text>"',
    description: 'Sets or updates the code boilerplate/notes for a file.',
    example: 'content src/types.ts "export interface User { id: string; }"',
    category: 'Structure'
  },
  {
    command: 'tree',
    syntax: 'tree or ls',
    description: 'Renders the entire visual ASCII folder/file tree directly in the console.',
    example: 'tree',
    category: 'Inspection'
  },
  {
    command: 'stats',
    syntax: 'stats or info',
    description: 'Displays comprehensive architecture metrics (total files, folders, depth, extensions breakdown).',
    example: 'stats',
    category: 'Inspection'
  },
  {
    command: 'find',
    syntax: 'find <query> or search <query>',
    description: 'Searches for files or directories matching the query string.',
    example: 'find .tsx',
    category: 'Inspection'
  },
  {
    command: 'init',
    syntax: 'init <project_name> or project new <name>',
    description: 'Initializes a new project workspace with the given name.',
    example: 'init nextjs-ecommerce',
    category: 'Project'
  },
  {
    command: 'template',
    syntax: 'template <preset_name>',
    description: 'Instantly applies an industry-standard architecture blueprint (react-vite, nextjs-app, fastapi, express-clean, rust-workspace, monorepo, go-gin).',
    example: 'template react-vite',
    category: 'Project'
  },
  {
    command: 'export',
    syntax: 'export <bash | powershell | tree | markdown | json | zip>',
    description: 'Exports the project structure into the specified format.',
    example: 'export bash',
    category: 'Utility'
  },
  {
    command: 'clear',
    syntax: 'clear',
    description: 'Clears the terminal output history.',
    example: 'clear',
    category: 'Utility'
  },
  {
    command: 'help',
    syntax: 'help [command]',
    description: 'Displays the command reference cheatsheet or detailed help for a command.',
    example: 'help touch',
    category: 'Utility'
  },
];

// Helper: Normalize path string
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/').trim();
}

// Generate ASCII Tree from nodes
export function generateAsciiTree(rootName: string, nodes: ProjectNode[]): string {
  const rootNode = {
    name: rootName || 'root',
    children: buildTreeHierarchy(nodes)
  };

  const lines: string[] = [rootNode.name + '/'];

  function renderChildren(items: any[], prefix: string = '') {
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const childPrefix = isLast ? '    ' : '│   ';
      const suffix = item.type === 'folder' ? '/' : '';
      lines.push(`${prefix}${connector}${item.name}${suffix}`);

      if (item.children && item.children.length > 0) {
        renderChildren(item.children, prefix + childPrefix);
      }
    });
  }

  renderChildren(rootNode.children);
  return lines.join('\n');
}

// Build hierarchical structure for rendering
export function buildTreeHierarchy(nodes: ProjectNode[]): any[] {
  const nodeMap = new Map<string, any>();
  const rootItems: any[] = [];

  // Sort nodes so folders come before files, then alphabetical
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  sortedNodes.forEach((node) => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  sortedNodes.forEach((node) => {
    const item = nodeMap.get(node.id);
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId).children.push(item);
    } else {
      rootItems.push(item);
    }
  });

  return rootItems;
}

// Parse indented tree DSL or command script
export function parseTreeOrScript(input: string, currentNodes: ProjectNode[] = []): ProjectNode[] {
  const lines = input.split('\n').filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'));
  if (lines.length === 0) return currentNodes;

  const isCommandScript = lines.some((l) => {
    const cmd = l.trim().split(' ')[0].toLowerCase();
    return ['mkdir', 'touch', 'file', 'folder', 'rm', 'delete', 'mv', 'move', 'rename'].includes(cmd);
  });

  if (isCommandScript) {
    let workingNodes = [...currentNodes];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;
      const res = executeCommand(trimmed, 'temp-project', workingNodes);
      if (res.nodes) {
        workingNodes = res.nodes;
      }
    }
    return workingNodes;
  }

  // Parse indented text structure
  const resultNodes: ProjectNode[] = [];
  const stack: { id: string; name: string; path: string; indent: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const indentMatch = rawLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const text = rawLine.trim();

    if (!text || text === '.' || text.startsWith('│') || text.startsWith('├') || text.startsWith('└')) {
      // Clean tree drawing symbols if user pasted raw tree output
      const cleaned = text.replace(/^[│├└─\s\t]+/, '').trim();
      if (!cleaned) continue;
    }

    const cleanText = text.replace(/^[│├└─\s\t]+/, '').trim();
    const isFolder = cleanText.endsWith('/') || !cleanText.includes('.');
    const cleanName = cleanText.replace(/\/+$/, '').trim();

    if (!cleanName) continue;

    // Pop items from stack with greater or equal indent
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack.length > 0 ? stack[stack.length - 1] : null;
    const currentPath = parent ? `${parent.path}/${cleanName}` : cleanName;
    const ext = !isFolder && cleanName.includes('.') ? cleanName.split('.').pop() : undefined;
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${i}`;

    const newNode: ProjectNode = {
      id: nodeId,
      name: cleanName,
      type: isFolder ? 'folder' : 'file',
      path: currentPath,
      parentId: parent ? parent.id : null,
      extension: ext,
      isExpanded: true,
      createdAt: new Date().toISOString(),
    };

    resultNodes.push(newNode);

    if (isFolder) {
      stack.push({
        id: nodeId,
        name: cleanName,
        path: currentPath,
        indent: indent,
      });
    }
  }

  return resultNodes;
}

// Ensure parent folders exist and return updated nodes + parentId
export function ensureParentFolders(
  targetPath: string,
  nodes: ProjectNode[]
): { updatedNodes: ProjectNode[]; parentId: string | null } {
  const segments = normalizePath(targetPath).split('/').filter(Boolean);
  if (segments.length <= 1) {
    return { updatedNodes: nodes, parentId: null };
  }

  const folderSegments = segments.slice(0, -1);
  let currentNodes = [...nodes];
  let currentParentId: string | null = null;
  let accumulatedPath = '';

  for (const seg of folderSegments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${seg}` : seg;
    let existingFolder = currentNodes.find(
      (n) => n.type === 'folder' && normalizePath(n.path) === accumulatedPath
    );

    if (!existingFolder) {
      const newFolderId = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      existingFolder = {
        id: newFolderId,
        name: seg,
        type: 'folder',
        path: accumulatedPath,
        parentId: currentParentId,
        isExpanded: true,
        createdAt: new Date().toISOString(),
      };
      currentNodes.push(existingFolder);
    }
    currentParentId = existingFolder.id;
  }

  return { updatedNodes: currentNodes, parentId: currentParentId };
}

// Main Command Execution Engine
export function executeCommand(
  rawInput: string,
  projectName: string,
  nodes: ProjectNode[]
): CommandResult {
  const input = rawInput.trim();
  if (!input) {
    return { success: true, message: '', nodes };
  }

  const parts = input.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  const args = parts.map((p) => p.replace(/^["']|["']$/g, ''));
  const cmd = args[0]?.toLowerCase();

  switch (cmd) {
    case 'help':
    case 'man': {
      const target = args[1]?.toLowerCase();
      if (target) {
        const found = COMMAND_DOCS.find((d) => d.command === target);
        if (found) {
          return {
            success: true,
            message: `Command: ${found.command}\nSyntax: ${found.syntax}\nDescription: ${found.description}\nExample: ${found.example}`,
            nodes,
          };
        }
      }
      return {
        success: true,
        message: `Available App Commands:\n` +
          `  mkdir <path>           Create folder or deep nested path\n` +
          `  touch <path> [content] Create file with optional boilerplate code\n` +
          `  rm <path>              Delete file or directory and children\n` +
          `  mv <src> <dest>        Move file or directory to new path\n` +
          `  rename <path> <name>   Rename file or directory\n` +
          `  content <path> "..."   Set file boilerplate content\n` +
          `  tree / ls              Render ASCII tree diagram\n` +
          `  stats / info           Display architecture analytics\n` +
          `  find <query>           Search files and folders\n` +
          `  init <name>            Create new project workspace\n` +
          `  template <preset>      Apply architecture blueprint\n` +
          `  export <type>          Export project (bash, ps1, tree, md, json, zip)\n` +
          `  clear                  Clear terminal history`,
        nodes,
      };
    }

    case 'init':
    case 'create-project': {
      const name = args[1] || 'untitled-project';
      return {
        success: true,
        message: `Initialized new project: "${name}"`,
        newProjectName: name,
        nodes: [],
      };
    }

    case 'mkdir':
    case 'folder': {
      const pathArg = args[1];
      if (!pathArg) {
        return { success: false, message: 'Error: Path argument required. Example: mkdir src/components/ui', nodes };
      }

      const normalized = normalizePath(pathArg);
      const segments = normalized.split('/').filter(Boolean);
      let currentNodes = [...nodes];
      let currentParentId: string | null = null;
      let accumulated = '';

      for (const seg of segments) {
        accumulated = accumulated ? `${accumulated}/${seg}` : seg;
        let existing = currentNodes.find((n) => n.type === 'folder' && normalizePath(n.path) === accumulated);
        if (!existing) {
          const newFolder: ProjectNode = {
            id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: seg,
            type: 'folder',
            path: accumulated,
            parentId: currentParentId,
            isExpanded: true,
            createdAt: new Date().toISOString(),
          };
          currentNodes.push(newFolder);
          existing = newFolder;
        }
        currentParentId = existing.id;
      }

      return {
        success: true,
        message: `Created directory: ${normalized}/`,
        nodes: currentNodes,
      };
    }

    case 'touch':
    case 'file': {
      const pathArg = args[1];
      if (!pathArg) {
        return { success: false, message: 'Error: Path argument required. Example: touch src/App.tsx "export default function App() {}"', nodes };
      }

      const normalized = normalizePath(pathArg);
      const content = args.slice(2).join(' ') || '';
      const segments = normalized.split('/').filter(Boolean);
      const fileName = segments[segments.length - 1];
      const ext = fileName.includes('.') ? fileName.split('.').pop() : undefined;

      // Check if file already exists
      const existingIdx = nodes.findIndex((n) => n.type === 'file' && normalizePath(n.path) === normalized);
      if (existingIdx !== -1) {
        const updated = [...nodes];
        updated[existingIdx] = {
          ...updated[existingIdx],
          content: content || updated[existingIdx].content,
          updatedAt: new Date().toISOString(),
        };
        return {
          success: true,
          message: `Updated existing file: ${normalized}`,
          nodes: updated,
        };
      }

      const { updatedNodes, parentId } = ensureParentFolders(normalized, nodes);
      const newFileNode: ProjectNode = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: fileName,
        type: 'file',
        path: normalized,
        parentId: parentId,
        content: content,
        extension: ext,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: `Created file: ${normalized}`,
        nodes: [...updatedNodes, newFileNode],
      };
    }

    case 'content':
    case 'set': {
      const pathArg = args[1];
      const contentArg = args.slice(2).join(' ');
      if (!pathArg) {
        return { success: false, message: 'Error: Target path required. Example: content src/index.ts "console.log(1);"', nodes };
      }

      const normalized = normalizePath(pathArg);
      const target = nodes.find((n) => n.type === 'file' && normalizePath(n.path) === normalized);
      if (!target) {
        return { success: false, message: `Error: File not found at path "${pathArg}"`, nodes };
      }

      const updated = nodes.map((n) =>
        n.id === target.id ? { ...n, content: contentArg, updatedAt: new Date().toISOString() } : n
      );

      return {
        success: true,
        message: `Updated boilerplate content for: ${normalized}`,
        nodes: updated,
      };
    }

    case 'rm':
    case 'delete':
    case 'remove': {
      const pathArg = args[1];
      if (!pathArg) {
        return { success: false, message: 'Error: Target path required. Example: rm src/components/Old.tsx', nodes };
      }

      const normalized = normalizePath(pathArg);
      const target = nodes.find((n) => normalizePath(n.path) === normalized);
      if (!target) {
        return { success: false, message: `Error: Node not found at path "${pathArg}"`, nodes };
      }

      const idsToDelete = new Set<string>([target.id]);
      let addedMore = true;
      while (addedMore) {
        addedMore = false;
        nodes.forEach((n) => {
          if (n.parentId && idsToDelete.has(n.parentId) && !idsToDelete.has(n.id)) {
            idsToDelete.add(n.id);
            addedMore = true;
          }
        });
      }

      const updated = nodes.filter((n) => !idsToDelete.has(n.id));
      return {
        success: true,
        message: `Removed "${normalized}" and ${idsToDelete.size - 1} nested items.`,
        nodes: updated,
      };
    }

    case 'mv':
    case 'move': {
      const srcArg = args[1];
      const destArg = args[2];
      if (!srcArg || !destArg) {
        return { success: false, message: 'Error: Source and destination required. Example: mv src/Old.tsx src/components/New.tsx', nodes };
      }

      const srcNorm = normalizePath(srcArg);
      const destNorm = normalizePath(destArg);
      const target = nodes.find((n) => normalizePath(n.path) === srcNorm);
      if (!target) {
        return { success: false, message: `Error: Source not found: "${srcArg}"`, nodes };
      }

      const { updatedNodes, parentId } = ensureParentFolders(destNorm, nodes);
      const destSegments = destNorm.split('/').filter(Boolean);
      const newName = destSegments[destSegments.length - 1];
      const ext = target.type === 'file' ? (newName.includes('.') ? newName.split('.').pop() : '') : undefined;

      const updated = updatedNodes.map((n) => {
        if (n.id === target.id) {
          return {
            ...n,
            name: newName,
            path: destNorm,
            parentId: parentId,
            extension: ext,
            updatedAt: new Date().toISOString(),
          };
        }
        // Update child paths if folder was moved
        if (target.type === 'folder' && n.path.startsWith(srcNorm + '/')) {
          const relativeSub = n.path.slice(srcNorm.length);
          return {
            ...n,
            path: `${destNorm}${relativeSub}`,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });

      return {
        success: true,
        message: `Moved "${srcNorm}" -> "${destNorm}"`,
        nodes: updated,
      };
    }

    case 'rename': {
      const pathArg = args[1];
      const newName = args[2];
      if (!pathArg || !newName) {
        return { success: false, message: 'Error: Path and new name required. Example: rename src/App.js App.tsx', nodes };
      }

      const normalized = normalizePath(pathArg);
      const target = nodes.find((n) => normalizePath(n.path) === normalized);
      if (!target) {
        return { success: false, message: `Error: Node not found at path "${pathArg}"`, nodes };
      }

      const parentPath = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '';
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;
      const ext = target.type === 'file' ? (newName.includes('.') ? newName.split('.').pop() : '') : undefined;

      const updated = nodes.map((n) => {
        if (n.id === target.id) {
          return {
            ...n,
            name: newName,
            path: newPath,
            extension: ext,
            updatedAt: new Date().toISOString(),
          };
        }
        if (target.type === 'folder' && n.path.startsWith(normalized + '/')) {
          const relativeSub = n.path.slice(normalized.length);
          return {
            ...n,
            path: `${newPath}${relativeSub}`,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });

      return {
        success: true,
        message: `Renamed "${target.name}" -> "${newName}"`,
        nodes: updated,
      };
    }

    case 'tree':
    case 'ls':
    case 'dir': {
      const ascii = generateAsciiTree(projectName, nodes);
      return {
        success: true,
        message: `Project Tree for "${projectName}":`,
        output: ascii,
        asciiTree: ascii,
        nodes,
      };
    }

    case 'stats':
    case 'info': {
      const folders = nodes.filter((n) => n.type === 'folder').length;
      const files = nodes.filter((n) => n.type === 'file').length;
      const extCounts: Record<string, number> = {};

      let maxDepth = 0;
      nodes.forEach((n) => {
        const depth = n.path.split('/').length;
        if (depth > maxDepth) maxDepth = depth;
        if (n.type === 'file') {
          const ext = n.extension || 'no-ext';
          extCounts[ext] = (extCounts[ext] || 0) + 1;
        }
      });

      const extFormatted = Object.entries(extCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `    .${k}: ${v}`)
        .join('\n');

      const statsText = `Architecture Statistics for "${projectName}":\n` +
        `  Total Folders: ${folders}\n` +
        `  Total Files:   ${files}\n` +
        `  Total Nodes:   ${nodes.length}\n` +
        `  Max Depth:     ${maxDepth} levels\n` +
        `  File Types Breakdown:\n${extFormatted || '    None'}`;

      return {
        success: true,
        message: statsText,
        nodes,
      };
    }

    case 'find':
    case 'search': {
      const query = args[1]?.toLowerCase();
      if (!query) {
        return { success: false, message: 'Error: Query string required. Example: find .tsx', nodes };
      }

      const matches = nodes.filter(
        (n) => n.name.toLowerCase().includes(query) || n.path.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        return { success: true, message: `No files or folders matching "${query}"`, nodes };
      }

      const lines = matches.map((m) => `  ${m.type === 'folder' ? '📁' : '📄'} ${m.path}`);
      return {
        success: true,
        message: `Found ${matches.length} matches for "${query}":\n${lines.join('\n')}`,
        nodes,
      };
    }

    case 'clear':
    case 'cls': {
      return {
        success: true,
        message: 'CLEAR_SIGNAL',
        nodes,
      };
    }

    default: {
      return {
        success: false,
        message: `Unknown command: "${cmd}". Type "help" for command list and examples.`,
        nodes,
      };
    }
  }
}
