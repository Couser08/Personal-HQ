import { type ProjectNode } from '../../../store/types';
import { COMMAND_DOCS, type CommandHelpItem } from './commandDocs';
import { normalizePath, buildTreeHierarchy, generateAsciiTree } from './treeHierarchy';
import { ensureParentFolders, parseTreeOrScript } from './treeParser';

export {
  COMMAND_DOCS,
  type CommandHelpItem,
  normalizePath,
  buildTreeHierarchy,
  generateAsciiTree,
  ensureParentFolders,
  parseTreeOrScript,
};

export interface CommandResult {
  success: boolean;
  message: string;
  output?: string;
  asciiTree?: string;
  nodes?: ProjectNode[];
  newProjectName?: string;
}

// Main Command Execution Engine
export function executeCommand(
  rawInput: string,
  projectName: string,
  nodes: ProjectNode[],
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
        message:
          `Available App Commands:\n` +
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
        return {
          success: false,
          message: 'Error: Path argument required. Example: mkdir src/components/ui',
          nodes,
        };
      }

      const normalized = normalizePath(pathArg);
      const segments = normalized.split('/').filter(Boolean);
      let currentNodes = [...nodes];
      let currentParentId: string | null = null;
      let accumulated = '';

      for (const seg of segments) {
        accumulated = accumulated ? `${accumulated}/${seg}` : seg;
        let existing = currentNodes.find(
          (n) => n.type === 'folder' && normalizePath(n.path) === accumulated,
        );
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
        return {
          success: false,
          message:
            'Error: Path argument required. Example: touch src/App.tsx "export default function App() {}"',
          nodes,
        };
      }

      const normalized = normalizePath(pathArg);
      const content = args.slice(2).join(' ') || '';
      const segments = normalized.split('/').filter(Boolean);
      const fileName = segments[segments.length - 1];
      const ext = fileName.includes('.') ? fileName.split('.').pop() : undefined;

      const existingIdx = nodes.findIndex(
        (n) => n.type === 'file' && normalizePath(n.path) === normalized,
      );
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
        return {
          success: false,
          message:
            'Error: Target path required. Example: content src/index.ts "console.log(1);"',
          nodes,
        };
      }

      const normalized = normalizePath(pathArg);
      const target = nodes.find(
        (n) => n.type === 'file' && normalizePath(n.path) === normalized,
      );
      if (!target) {
        return {
          success: false,
          message: `Error: File not found at path "${pathArg}"`,
          nodes,
        };
      }

      const updated = nodes.map((n) =>
        n.id === target.id
          ? { ...n, content: contentArg, updatedAt: new Date().toISOString() }
          : n,
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
        return {
          success: false,
          message: 'Error: Target path required. Example: rm src/components/Old.tsx',
          nodes,
        };
      }

      const normalized = normalizePath(pathArg);
      const target = nodes.find((n) => normalizePath(n.path) === normalized);
      if (!target) {
        return {
          success: false,
          message: `Error: Node not found at path "${pathArg}"`,
          nodes,
        };
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
        return {
          success: false,
          message:
            'Error: Source and destination required. Example: mv src/Old.tsx src/components/New.tsx',
          nodes,
        };
      }

      const srcNorm = normalizePath(srcArg);
      const destNorm = normalizePath(destArg);
      const target = nodes.find((n) => normalizePath(n.path) === srcNorm);
      if (!target) {
        return {
          success: false,
          message: `Error: Source not found: "${srcArg}"`,
          nodes,
        };
      }

      const { updatedNodes, parentId } = ensureParentFolders(destNorm, nodes);
      const destSegments = destNorm.split('/').filter(Boolean);
      const newName = destSegments[destSegments.length - 1];
      const ext =
        target.type === 'file'
          ? newName.includes('.')
            ? newName.split('.').pop()
            : ''
          : undefined;

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
        return {
          success: false,
          message: 'Error: Path and new name required. Example: rename src/App.js App.tsx',
          nodes,
        };
      }

      const normalized = normalizePath(pathArg);
      const target = nodes.find((n) => normalizePath(n.path) === normalized);
      if (!target) {
        return {
          success: false,
          message: `Error: Node not found at path "${pathArg}"`,
          nodes,
        };
      }

      const parentPath = normalized.includes('/')
        ? normalized.substring(0, normalized.lastIndexOf('/'))
        : '';
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;
      const ext =
        target.type === 'file'
          ? newName.includes('.')
            ? newName.split('.').pop()
            : ''
          : undefined;

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

      const statsText =
        `Architecture Statistics for "${projectName}":\n` +
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
        return {
          success: false,
          message: 'Error: Query string required. Example: find .tsx',
          nodes,
        };
      }

      const matches = nodes.filter(
        (n) => n.name.toLowerCase().includes(query) || n.path.toLowerCase().includes(query),
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
